import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosNequi } from "../../utils/enumParametrosNequi";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useFetchTuLlave } from "../../hooks/fetchNequi";

const URL_REALIZAR_RETIRO_NEQUI = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/nequi/pagonotificacionpush`;
const URL_CONSULTAR_RETIRO_NEQUI = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/tu-llave/consulta-recarga-tarjeta`;

const TransaccionRetiroNequiNotificacion = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [dataUsuario, setDataUsuario] = useState({
    numeroNequi: "",
    valorRecarga: 0,
  });
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(-1);
  }, []);
  const makeRecharge = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataUsuario?.valorRecarga,
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
        recarga_tarjeta: {
          numero_tarjeta: dataUsuario?.NTargeta,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionRetiroNequi(data, dataAditional),
        {
          render: () => {
            return "Procesando retiro";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(1);
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
    [dataUsuario, navigate, roleInfo, pdpUser]
  );
  const [loadingPeticionRetiroNequi, peticionRetiroNequi] = useFetchTuLlave(
    URL_REALIZAR_RETIRO_NEQUI,
    URL_CONSULTAR_RETIRO_NEQUI,
    "Realizar retiro nequi"
  );
  const handleShow = useCallback((ev) => {
    ev.preventDefault();
    // if (dataUsuario.valorRecarga % 50 !== 0) {
    //   return notifyError("El valor de la recarga debe ser múltiplo de 50");
    // }
    setEstadoPeticion(0);
    setShowModal(true);
  }, []);
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback(
    (ev) => {
      const valor = ev.target.value;
      const num = valor.replace(/[\s\.\-+eE]/g, "");
      if (!isNaN(num)) {
        if (ev.target.name === "numeroNequi") {
          if (dataUsuario.numeroNequi.length === 0 && num !== "3") {
            return notifyError("El número de teléfono debe comenzar por 3");
          }
        }
        setDataUsuario((old) => {
          return { ...old, [ev.target.name]: num };
        });
      }
    },
    [dataUsuario.numeroNequi]
  );
  return (
    <>
      <h1 className="text-3xl">Retiro Nequi</h1>
      <Form onSubmit={handleShow} grid>
        <Input
          id="numeroNequi"
          name="numeroNequi"
          label={"Número Nequi"}
          type="text"
          autoComplete="off"
          value={dataUsuario?.["numeroNequi"]}
          maxLength={10}
          minLength={10}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingPeticionRetiroNequi}
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor a retirar"
          type="text"
          min={enumParametrosNequi.MIN_RETIRO_NEQUI}
          max={enumParametrosNequi.MAX_RETIRO_NEQUI}
          autoComplete="off"
          maxLength={"10"}
          value={parseInt(dataUsuario?.valorRetiro)}
          required
          disabled={loadingPeticionRetiroNequi}
          onInput={(e, monto) => {
            if (!isNaN(monto)) {
              setDataUsuario((old) => {
                return { ...old, valorRetiro: monto };
              });
            }
          }}
          equalError={false}
          equalErrorMin={false}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={loadingPeticionRetiroNequi}>
            Realizar recarga
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className="flex align-middle"
      >
        <>
          {estadoPeticion === 0 ? (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
              <h1 className="text-2xl text-center mb-5 font-semibold">
                ¿Está seguro de realizar el retiro?
              </h1>
              <h2>{`Número nequi: ${dataUsuario?.numeroNequi}`}</h2>
              <h2 className="text-base">
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
                    disabled={loadingPeticionRetiroNequi}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    onClick={makeRecharge}
                    disabled={loadingPeticionRetiroNequi}
                  >
                    Realizar retiro
                  </Button>
                </ButtonBar>
              </>
            </div>
          ) : estadoPeticion === 1 ? (
            <div className="flex flex-col justify-center items-center">
              <Tickets ticket={objTicketActual} refPrint={printDiv} />
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      handleClose();
                    }}
                  >
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

export default TransaccionRetiroNequiNotificacion;
