import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending } from "../../../utils/notify";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import Form from "../../../components/Base/Form/Form";
import { useAuth } from "../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosTranscaribe } from "../utils/enumParametrosTranscaribe";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../components/Base/Tickets/Tickets";
import { useFetchTranscaribe } from "../hooks/fetchTranscaribe";
import PaymentSummary from "../../../components/Compound/PaymentSummary";

const URL_REALIZAR_RECARGA_TARJETA = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/transcaribe/recarga-tarjeta`;
const URL_CONSULTAR_RECARGA_TARJETA = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/transcaribe/consulta-recarga-tarjeta`;

const TransaccionRecargaTarjeta = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [dataUsuario, setDataUsuario] = useState({
    NTargeta: "",
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
        peticionRecargaTarjeta(data, dataAditional),
        {
          render: () => {
            return "Procesando recarga";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(1);
            return "Recarga satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Recarga fallida";
          },
        }
      );
    },
    [dataUsuario, navigate, roleInfo, pdpUser]
  );
  const [loadingPeticionRecargaTarjeta, peticionRecargaTarjeta] =
    useFetchTranscaribe(
      URL_REALIZAR_RECARGA_TARJETA,
      URL_CONSULTAR_RECARGA_TARJETA,
      "Realizar recarga tarjeta"
    );
  const handleShow = useCallback(
    (ev) => {
      ev.preventDefault();
      if (dataUsuario.valorRecarga % 50 !== 0) {
        return notifyError("El valor de la recarga debe ser múltiplo de 50");
      }
      setEstadoPeticion(0);
      setShowModal(true);
    },
    [dataUsuario]
  );
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback(
    (ev) => {
      const valor = ev.target.value;
      const num = valor.replace(/[\s\.\-+eE]/g, "");
      if (!isNaN(num)) {
        if (ev.target.name === "telefonoCliente") {
          if (dataUsuario.telefonoCliente.length === 0 && num !== "3") {
            return notifyError("El número de teléfono debe comenzar por 3");
          }
        }
        setDataUsuario((old) => {
          return { ...old, [ev.target.name]: num };
        });
      }
    },
    [dataUsuario.telefonoCliente]
  );
  return (
    <>
      <h1 className="text-3xl">Recargar Tarjeta Transcaribe</h1>
      <Form onSubmit={handleShow} grid>
        <Input
          id="NTargeta"
          name="NTargeta"
          label={"Número tarjeta"}
          type="text"
          autoComplete="off"
          value={dataUsuario?.["NTargeta"]}
          maxLength={10}
          minLength={10}
          onChange={onChangeFormatNumber}
          required
          disabled={loadingPeticionRecargaTarjeta}
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor a recargar"
          type="text"
          min={enumParametrosTranscaribe.MINRECARGATARJETA}
          max={enumParametrosTranscaribe.MAXRECARGATARJETA}
          autoComplete="off"
          maxLength={"10"}
          value={parseInt(dataUsuario?.valorRecarga)}
          required
          disabled={loadingPeticionRecargaTarjeta}
          onInput={(e, monto) => {
            if (!isNaN(monto)) {
              setDataUsuario((old) => {
                return { ...old, valorRecarga: monto };
              });
            }
          }}
          equalError={false}
          equalErrorMin={false}
        />
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            disabled={loadingPeticionRecargaTarjeta}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loadingPeticionRecargaTarjeta}>
            Realizar recarga
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} className="flex align-middle">
        <>
          {estadoPeticion === 0 ? (
            <PaymentSummary
              title="¿Está seguro de realizar la recarga?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Número tarjeta": dataUsuario?.NTargeta,
                "Valor a recargar": formatMoney.format(
                  dataUsuario?.valorRecarga
                ),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={() => {
                    handleClose();
                    notifyError("Transacción cancelada por el usuario");
                  }}
                  disabled={loadingPeticionRecargaTarjeta}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={makeRecharge}
                  disabled={loadingPeticionRecargaTarjeta}
                >
                  Realizar recarga
                </Button>
              </ButtonBar>
            </PaymentSummary>
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

export default TransaccionRecargaTarjeta;
