import { useCallback, useState, useRef, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { notifyError, notifyPending } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import MoneyInput from "../../../components/Base/MoneyInput";
import { fetchParametrosAutorizadores } from "../../TrxParams/utils/fetchParametrosAutorizadores";
import { enumParametrosAutorizador } from "../../../utils/enumParametrosAutorizador";
import useMoney from "../../../hooks/useMoney";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useFetchMovii } from "../hooks/fetchMovii";
import { enumParametrosMovii } from "../utils/enumParametrosMovii";

const URL_REALIZAR_RETIRO_MOVII = `${process.env.REACT_APP_URL_MOVII}/corresponsal-movii/retiro-corresponsal-movii`;
const URL_CONSULTAR_RETIRO_MOVII = `${process.env.REACT_APP_URL_MOVII}/corresponsal-movii/check-estado-retiro-movii`;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const MoviiPDPCashOut = () => {
  const { roleInfo, pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const uniqueId = v4();
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: enumParametrosMovii.MAXCASHOUTMOVII,
    inferior: enumParametrosMovii.MINCASHOUTMOVII,
  });
  const [peticion, setPeticion] = useState(false);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [datosTrans, setDatosTrans] = useState({
    otp: "",
    numeroTelefono: "",
    valorCashOut: "",
  });
  useEffect(() => {
    fetchParametrosAutorizadoresFunc();
  }, []);
  const fetchParametrosAutorizadoresFunc = useCallback(() => {
    fetchParametrosAutorizadores({})
      .then((autoArr) => {
        setLimiteRecarga({
          superior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_superior_cash_out_movii
            )[0]?.valor_parametro
          ),
          inferior: parseInt(
            autoArr?.results?.filter(
              (i) =>
                i.id_tabla_general_parametros_autorizadores ===
                enumParametrosAutorizador.limite_inferior_cash_out_movii
            )[0]?.valor_parametro
          ),
        });
      })
      .catch((err) => console.error(err));
  }, []);
  const onSubmit = (e) => {
    e.preventDefault();
    habilitarModal();
  };
  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  const hideModal = useCallback(() => {
    setShowModal(false);
    navigate(-1);
  }, []);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const [loadingPeticionCashoutMovii, peticionCashoutMovii] = useFetchMovii(
    URL_REALIZAR_RETIRO_MOVII,
    URL_CONSULTAR_RETIRO_MOVII,
    "Realizar retiro Movii"
  );
  const peticionCashOut = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: datosTrans.valorCashOut,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        id_uuid_trx: uniqueId,
        address: roleInfo?.["direccion"],
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        otp: datosTrans.otp,
        subscriberNum: datosTrans.numeroTelefono,
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionCashoutMovii(data, dataAditional),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setPeticion(true);
            return "Transacción satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [datosTrans, pdpUser, roleInfo, uniqueId]
  );
  const onChangeFormatNumber = useCallback(
    (ev) => {
      const valor = ev.target.value;
      const num = valor.replace(/[\s\.-]/g, "");
      if (!isNaN(num)) {
        if (ev.target.name === "numeroTelefono") {
          if (datosTrans.numeroTelefono.length === 0 && num !== "3") {
            return notifyError("El número de teléfono debe comenzar por 3");
          }
        }
        setDatosTrans((old) => {
          return { ...old, [ev.target.name]: num };
        });
      }
    },
    [datosTrans]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDatosTrans((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeMoney = useMoney({
    limits: [limiteRecarga.inferior, limiteRecarga.superior],
    equalError: false,
  });
  return (
    <>
      <h1 className='text-3xl'>Retiro MOVII</h1>
      <Form grid onSubmit={onSubmit}>
        <Input
          id='numeroTelefono'
          label='Número de télefono'
          type='text'
          name='numeroTelefono'
          minLength='10'
          maxLength='10'
          required
          autoComplete='off'
          value={datosTrans.numeroTelefono}
          onInput={onChangeFormatNumber}
        />
        <Input
          id='otp'
          label='Número OTP'
          type='text'
          name='otp'
          minLength='2'
          maxLength='6'
          required
          autoComplete='off'
          value={datosTrans.otp}
          onInput={onChangeFormatNumber}
        />
        <MoneyInput
          id='valCashOut'
          name='valCashOut'
          label='Valor'
          type='text'
          autoComplete='off'
          maxLength={"11"}
          min={limiteRecarga.inferior}
          max={limiteRecarga.superior}
          value={datosTrans.valorCashOut ?? ""}
          onInput={(ev) => {
            setDatosTrans((old) => {
              return { ...old, valorCashOut: onChangeMoney(ev) };
            });
          }}
          required></MoneyInput>
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit' disabled={loadingPeticionCashoutMovii}>
            Aceptar
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {!peticion ? (
            <>
              <h1 className='text-2xl font-semibold'>
                ¿Está seguro de realizar el retiro?
              </h1>
              <h2 className='text-base'>
                {`Valor de transacción: ${formatMoney.format(
                  datosTrans.valorCashOut
                )} COP`}
              </h2>
              <h2>{`Número de teléfono: ${datosTrans.numeroTelefono}`}</h2>
              <h2>{`Número de otp: ${datosTrans.otp}`}</h2>
              <ButtonBar>
                <Button
                  disabled={loadingPeticionCashoutMovii}
                  onClick={hideModal}>
                  Cancelar
                </Button>
                <Button
                  disabled={loadingPeticionCashoutMovii}
                  type='submit'
                  onClick={peticionCashOut}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          ) : (
            <>
              <Tickets ticket={objTicketActual} refPrint={printDiv}></Tickets>
              <h2>
                <ButtonBar>
                  <Button type='submit' onClick={hideModal}>
                    Aceptar
                  </Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
                </ButtonBar>
              </h2>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MoviiPDPCashOut;
