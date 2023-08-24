import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useFetchDale } from "../../hooks/useFetchDale";
import { useReactToPrint } from "react-to-print";
import Form from "../../../../../components/Base/Form/Form";
import Fieldset from "../../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../../components/Base/Input/Input";
import MoneyInput from "../../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosTuLlave } from "../../../../RecargasTuLlave/utils/enumParametrosTuLlave";
import ButtonBar from "../../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../../components/Base/Button/Button";
import Modal from "../../../../../components/Base/Modal/Modal";
import Tickets from "../../../../../components/Base/Tickets/Tickets";
import { notifyError, notifyPending } from "../../../../../utils/notify";
import { formatMoney } from "../../../../../components/Base/MoneyInputDec";
import HideInput from "../../../../../components/Base/HideInput/HideInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchDale";
import { pinBlock } from "../../utils/pinBlock";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";

const URL_REALIZAR_RETIRO_DALE = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/transacciones-dale/retiro-otp-dale`;
const URL_CONSULTAR_COSTO_RETIRO_DALE = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/transacciones-dale/consulta-costo-retiro-dale`;
const URL_CONSULTAR_TRANSACCION_RETIRO_DALE = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/transacciones-dale/check-estado-retiro-dale`;

const TransaccionRetiroDale = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [dataUsuario, setDataUsuario] = useState({
    numeroDocumento: "",
    valorRetiro: 0,
    otpDale: "",
  });
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [resConsulta, setResConsulta] = useState({});
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(-1);
  }, []);
  const makeCashOut = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataUsuario?.valorRetiro,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
        retiro_dale: {
          documento: dataUsuario?.numeroDocumento,
          otp: pinBlock(
            dataUsuario?.otpDale,
            process.env.REACT_APP_PAN_AVAL_RETIRO_OTP
          ),
          id_trx_original: resConsulta?.id_trx,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionRetiroDale(data, dataAditional),
        {
          render: () => {
            return "Procesando retiro";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(2);
            return "Retiro satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Retiro fallido";
          },
        }
      );
    },
    [dataUsuario, navigate, roleInfo, pdpUser, resConsulta, uniqueId]
  );
  const makeConsultCashout = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataUsuario?.valorRetiro,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
        retiro_dale: {
          documento: dataUsuario?.numeroDocumento,
          otp: pinBlock(
            dataUsuario?.otpDale,
            process.env.REACT_APP_PAN_AVAL_RETIRO_OTP
          ),
        },
      };
      notifyPending(
        peticionConsultaRetiro({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setResConsulta(res?.obj);
            setEstadoPeticion(1);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [dataUsuario, navigate, roleInfo, pdpUser]
  );
  const [loadingPeticionRetiroDale, peticionRetiroDale] = useFetchDale(
    URL_REALIZAR_RETIRO_DALE,
    URL_CONSULTAR_TRANSACCION_RETIRO_DALE,
    "Realizar Retiro Dale"
  );
  const [loadingPeticionConsultaRetiro, peticionConsultaRetiro] = useFetch(
    fetchCustom(
      URL_CONSULTAR_COSTO_RETIRO_DALE,
      "POST",
      "Consultar costo retiro"
    )
  );
  const handleShow = useCallback(
    (ev) => {
      ev.preventDefault();
      // if (valor % 50 !== 0) {
      //   return notifyError("El valor de la recarga debe ser multiplo de 50");
      // }
      setEstadoPeticion(0);
      setShowModal(true);
    },
    [dataUsuario]
  );
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    const num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDataUsuario((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataUsuario((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  return (
    <>
      <h1 className='text-3xl'>Retiro OTP Dale</h1>
      <Form onSubmit={handleShow} grid>
        <Input
          id='numeroDocumento'
          name='numeroDocumento'
          label={"Número de documento"}
          type='text'
          autoComplete='off'
          value={dataUsuario?.["numeroDocumento"]}
          maxLength={12}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingPeticionRetiroDale || loadingPeticionConsultaRetiro}
        />
        <HideInput
          id='otpDale'
          label='Número OTP'
          type='text'
          name='otpDale'
          minLength='6'
          maxLength='6'
          autoComplete='off'
          required
          value={dataUsuario.otpDale ?? ""}
          onInput={(e, valor) => {
            let num = valor.replace(/[\s\.\-+eE]/g, "");
            if (!isNaN(valor)) {
              setDataUsuario((old) => {
                return { ...old, otpDale: num };
              });
            }
          }}
        />
        <MoneyInput
          id='valorRetiro'
          name='valorRetiro'
          label='Valor a retirar'
          type='text'
          min={enumParametrosGrupoAval.MIN_RETIRO_OTP_DALE}
          max={enumParametrosGrupoAval.MAX_RETIRO_OTP_DALE}
          autoComplete='off'
          maxLength={"10"}
          value={parseInt(dataUsuario?.valorRetiro)}
          onInput={(ev, val) => {
            setDataUsuario((old) => {
              return { ...old, valorRetiro: val };
            });
          }}
          required
          disabled={loadingPeticionRetiroDale || loadingPeticionConsultaRetiro}
          equalError={false}
          equalErrorMin={false}
        />
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}
            disabled={
              loadingPeticionRetiroDale || loadingPeticionConsultaRetiro
            }>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={
              loadingPeticionRetiroDale || loadingPeticionConsultaRetiro
            }>
            Recargar tarjeta
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        <>
          {estadoPeticion === 0 ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                ¿Está seguro de realizar el retiro?
              </h1>
              <h2>{`Número de documento: ${dataUsuario?.numeroDocumento}`}</h2>
              <h2 className='text-base'>
                {`Valor a retirar: ${formatMoney.format(
                  dataUsuario?.valorRetiro
                )} `}
              </h2>
              <>
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                    disabled={
                      loadingPeticionRetiroDale || loadingPeticionConsultaRetiro
                    }>
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    onClick={makeConsultCashout}
                    disabled={
                      loadingPeticionRetiroDale || loadingPeticionConsultaRetiro
                    }>
                    Realizar retiro
                  </Button>
                </ButtonBar>
              </>
            </div>
          ) : estadoPeticion === 1 ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                Respuesta de consulta Dale
              </h1>
              <h1 className='text-xl text-center mb-5 font-semibold'>
                Resumen de la transacción
              </h1>
              <h2>{`Número de documento: ${dataUsuario?.numeroDocumento}`}</h2>
              <h2 className='text-base'>
                {`Valor a retirar: ${formatMoney.format(
                  dataUsuario?.valorRetiro
                )} `}
              </h2>
              <h2 className='text-base'>
                {`Costo de la transacción: ${formatMoney.format(0)} `}
              </h2>
              <>
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                    disabled={
                      loadingPeticionRetiroDale || loadingPeticionConsultaRetiro
                    }>
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    onClick={makeCashOut}
                    disabled={
                      loadingPeticionRetiroDale || loadingPeticionConsultaRetiro
                    }>
                    Realizar retiro
                  </Button>
                </ButtonBar>
              </>
            </div>
          ) : estadoPeticion === 2 ? (
            <div className='flex flex-col justify-center items-center'>
              <Tickets ticket={objTicketActual} refPrint={printDiv} />
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type='submit'
                    onClick={() => {
                      handleClose();
                    }}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
            </div>
          ) : (
            <></>
          )}
        </>
      </Modal>
    </>
  );
};

export default TransaccionRetiroDale;
