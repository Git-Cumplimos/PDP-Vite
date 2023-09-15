import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import useMoney from "../../../../hooks/useMoney";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyPending } from "../../../../utils/notify";
import { v4 } from "uuid";
import { enumLimiteApuestas } from "../enumLimiteApuestas";
import { useFetchPractisistemas } from "../../hooks/fetchPractisistemasHook";

const minValor = enumLimiteApuestas.minApuestas;
const maxValor = enumLimiteApuestas.maxApuestas;

const URL_APUESTA = `${process.env.REACT_APP_PRACTISISTEMAS}/apuestas-deportivas/recarga`;
const URL_CONSULTA_APUESTA = `${process.env.REACT_APP_PRACTISISTEMAS}/apuestas-deportivas/consulta-estado-trx`;

const RecargarApuestas = () => {
  //Variables
  const [inputValor, setInputValor] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [respuesta, setRespuesta] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { roleInfo, userInfo, pdpUser } = useAuth();
  const { state } = useLocation();
  const printDiv = useRef();
  const validNavigate = useNavigate();
  const id_uuid = v4();

  const [datosCuenta, setDatosCuenta] = useState({
    documento: "",
    tipoDocumento: "1",
  });
  const [infTicket, setInfTicket] = useState({});

  const onSubmitCheck = (e) => {
    e.preventDefault();
    if (inputValor != 0) {
      setShowModal(true);
      setTypeInfo("ResumenRecarga");
    } else {
      notify(
        `El valor de la recarga de la cuenta debe ser mayor o igual a ${formatMoney.format(
          minValor
        )}`
      );
    }
  };
  const fecthEnvioTransaccion = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo.id_comercio,
          id_terminal: roleInfo.id_dispositivo,
          id_usuario: roleInfo.id_usuario,
          id_uuid_trx: id_uuid,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        nombre_comercio: roleInfo["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        valor_total_trx: inputValor,
        datos_recargas: {
          celular: datosCuenta?.documento,
          operador: state?.producto,
          casa_apuesta: state?.casaApuesta,
        },
        address: roleInfo?.["direccion"],
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
      };
      const dataAditional = {
        id_uuid_trx: id_uuid,
      };
      notifyPending(
        peticionApuesta(data, dataAditional),
        {
          render: () => {
            return "Procesando recarga";
          },
        },
        {
          render: ({ data: res }) => {
            setInfTicket(res?.obj?.ticket);
            setTypeInfo("RecargaExitosa");
            return "Recarga satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate("/apuestas-deportivas");
            return error?.message ?? "Recarga fallida";
          },
        }
      );
    },
    [roleInfo, pdpUser, state, datosCuenta, id_uuid, inputValor, validNavigate]
  );
  const [loadingPeticionApuesta, peticionApuesta] = useFetchPractisistemas(
    URL_APUESTA,
    URL_CONSULTA_APUESTA,
    "Realizar apuesta practisistemas"
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setDatosCuenta((old) => {
      return {
        ...old,
        documento: "",
        tipoDocumento: "1",
      };
    });
    setInputValor("");
    setInfTicket({});
    validNavigate("/apuestas-deportivas");
  }, []);

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    validNavigate("/apuestas-deportivas");
    handleClose();
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Recarga cancelada");
    validNavigate("/apuestas-deportivas");
    handleClose();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    if (!state?.casaApuesta) {
      validNavigate("/apuestas-deportivas");
    }
  }, [state?.casaApuesta]);

  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    const num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDatosCuenta((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  return (
    <Fragment>
      <h1 className='text-3xl mt-6'>
        Recarga Cuenta Apuesta Deportiva {state?.casaApuesta}
      </h1>
      <Form onSubmit={onSubmitCheck} grid>
        <Input
          id='documento'
          name='documento'
          label='Número de Documento'
          type='text'
          required
          minLength='5'
          maxLength='12'
          autoComplete='off'
          value={datosCuenta?.documento}
          onInput={onChangeFormatNumber}
          disabled={loadingPeticionApuesta}
        />
        <MoneyInput
          name='valor'
          label='Valor Recarga Cuenta'
          autoComplete='off'
          min={minValor}
          max={maxValor}
          minLength={"4"}
          maxLength={"10"}
          value={inputValor}
          onInput={(ev, val) => setInputValor(val)}
          disabled={loadingPeticionApuesta}
          equalError={false}
          equalErrorMin={false}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Continuar</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal}>
        {/**************** Resumen de la recarga **********************/}
        {typeInfo === "ResumenRecarga" && (
          <PaymentSummary
            title='¿Está seguro de realizar la recarga a la cuenta?'
            subtitle='Resumen de transacción'
            summaryTrx={{
              Documento: datosCuenta?.documento,
              Producto: state?.casaApuesta,
              Valor: formatMoney.format(inputValor),
              // "Valor Recarga Cuenta": formatMoney.format(inputValor),
            }}>
            <>
              <ButtonBar>
                <Button
                  type={"submit"}
                  onClick={fecthEnvioTransaccion}
                  disabled={loadingPeticionApuesta}>
                  Aceptar
                </Button>
                <Button
                  onClick={handleCloseCancelada}
                  disabled={loadingPeticionApuesta}>
                  Cancelar
                </Button>
              </ButtonBar>
            </>
            <SimpleLoading show={respuesta} />
          </PaymentSummary>
        )}
        {/**************** Recarga Exitosa **********************/}
        {infTicket && typeInfo === "RecargaExitosa" && (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
            <Tickets refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleCloseRecarga}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default RecargarApuestas;
