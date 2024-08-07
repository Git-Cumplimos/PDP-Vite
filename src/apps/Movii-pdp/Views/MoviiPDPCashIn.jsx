import { useCallback, useState, useRef, useMemo } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { notifyError, notifyPending } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import { fetchCustom } from "../utils/fetchMoviiRed";
import { v4 } from "uuid";
import MoneyInput from "../../../components/Base/MoneyInput";
import { useNavigate } from "react-router-dom";
import { enumParametrosMovii } from "../utils/enumParametrosMovii";
import { useFetchMovii } from "../hooks/fetchMovii";
import { useFetch } from "../../../hooks/useFetch";
import { useMFA } from "../../../components/Base/MFAScreen";
const URL_CONSULTA_DEPOSITO_MOVII = `${import.meta.env.VITE_URL_MOVII}/corresponsal-movii/check-estado-deposito-movii`;
const URL_CONSULTAR_USUARIO_DEPOSITO_MOVII = `${import.meta.env.VITE_URL_MOVII}/corresponsal-movii/consulta-deposito-movii`;
const URL_REALIZAR_DEPOSITO_MOVII = `${import.meta.env.VITE_URL_MOVII}/corresponsal-movii/deposito-corresponsal-movii`;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const MoviiPDPCashIn = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const { submitEventSetter } = useMFA();
  const [showModal, setShowModal] = useState(false);
  const uniqueId = useMemo(() => v4(), []);
  const [peticion, setPeticion] = useState(0);
  const [datosTrans, setDatosTrans] = useState({
    otp: "",
    numeroTelefono: "",
    valorCashIn: "",
  });
  const [infoUsers, setInfoUsers] = useState({
    nombreUsuario: "",
    ciudad: "",
    genero: "",
    id_trx: "",
  });

  const [objTicketActual, setObjTicketActual] = useState({});

  /*Funcion para habilitar el modal*/
  const habilitarModal = useCallback(() => {
    setShowModal((old) => !old);
  }, []);

  const hideModal = useCallback(() => {
    setShowModal(false);
    setDatosTrans({
      otp: "",
      numeroTelefono: "",
      valorCashIn: "",
    });
    setInfoUsers({
      nombreUsuario: "",
      ciudad: "",
      genero: "",
    });
    setObjTicketActual((old) => {
      return { ...old, trxInfo: [] };
    });
    setPeticion(0);
    navigate(-1);
  }, [navigate]);

  const hideModalUsuario = () => {
    setShowModal(false);
    setDatosTrans({
      otp: "",
      numeroTelefono: "",
      valorCashIn: "",
    });
    setInfoUsers({
      nombreUsuario: "",
      ciudad: "",
      genero: "",
    });
    setObjTicketActual((old) => {
      return { ...old, trxInfo: [] };
    });
    setPeticion(0);
    notifyError("Transacción cancelada por el usuario");
    navigate(-1);
  };
  const hideModalUsuarioInicial = () => {
    setShowModal(false);
    setDatosTrans({
      otp: "",
      numeroTelefono: "",
      valorCashIn: "",
    });
    setInfoUsers({
      nombreUsuario: "",
      ciudad: "",
      genero: "",
    });
    setObjTicketActual((old) => {
      return { ...old, trxInfo: [] };
    });
    setPeticion(0);
    navigate(-1);
  };

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const [loadingPeticionCashinMovii, peticionCashInMovii] = useFetchMovii(
    URL_REALIZAR_DEPOSITO_MOVII,
    URL_CONSULTA_DEPOSITO_MOVII,
    "Realizar depósito Movii"
  );
  const [loadingPeticionConsultaDepositoMovii, peticionConsultaDepositoMovii] =
    useFetch(
      fetchCustom(
        URL_CONSULTAR_USUARIO_DEPOSITO_MOVII,
        "POST",
        "Consultar Deposito"
      )
    );
  const peticionCashIn = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        amount: datosTrans?.valorCashIn,
        valor_total_trx: datosTrans?.valorCashIn,
        issuer_id_dane: roleInfo?.codigo_dane,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        id_uuid_trx: uniqueId,
        // Ticket: objTicket,
        subscriberNum: datosTrans?.numeroTelefono,
        // otp: datosTrans.otp,
        issuerName: infoUsers.nombreUsuario,
        id_trx: parseInt(infoUsers?.id_trx),
        direccion: roleInfo?.direccion,
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionCashInMovii(data, dataAditional),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({ data: res }) => {
            const result = { data: res };
            const msg = result.data.msg;
            if (res?.obj?.ticket) setObjTicketActual(res?.obj?.ticket);
            if (res?.status) {
              setPeticion(2);
              setInfoUsers((old) => {
                return {
                  ...old,
                  nombreUsuario: res?.obj?.userName,
                  ciudad: res?.obj?.city,
                  genero: res?.obj?.gender,
                };
              });
              return `${msg} Exitosa`;
            } else {
              hideModal();
              navigate(-1);
              return `${msg} Fallida`;
            }
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
    [
      datosTrans,
      pdpUser,
      roleInfo,
      uniqueId,
      infoUsers,
      hideModal,
      navigate,
      peticionCashInMovii,
    ]
  );

  const peticionConsulta = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        amount: datosTrans?.valorCashIn,
        valor_total_trx: datosTrans?.valorCashIn,
        issuer_id_dane: roleInfo?.codigo_dane,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        subscriberNum: datosTrans.numeroTelefono,
        direccion: roleInfo?.direccion,
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      };
      notifyPending(
        peticionConsultaDepositoMovii({}, data),
        {
          render() {
            return "Procesando transacción";
          },
        },
        {
          render({ data: res }) {
            const result = { data: res };
            const msg = result.data.msg;
            if (res?.status) {
              setPeticion(1);
              habilitarModal();
              setInfoUsers((old) => {
                return {
                  ...old,
                  nombreUsuario: res?.obj?.userName,
                  ciudad: res?.obj?.city,
                  genero: res?.obj?.gender,
                  id_trx: res?.obj?.id_trx,
                };
              });
            } else {
              navigate(-1);
              hideModal();
            }
            return `${msg} Exitosa`;
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
    [
      datosTrans,
      roleInfo,
      pdpUser,
      navigate,
      habilitarModal,
      hideModal,
      peticionConsultaDepositoMovii,
    ]
  );
  return (
    <>
      <h1 className="text-3xl">Depósito Movii</h1>
      <Form grid onSubmit={peticionConsulta}>
        <Input
          id="numeroTelefono"
          label="Número Movii"
          type="text"
          name="numeroTelefono"
          minLength="10"
          maxLength="10"
          required
          autoComplete="off"
          value={datosTrans.numeroTelefono}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const valor = e.target.value;
              const num = valor.replace(/[\s\.\-+eE]/g, "");
              if (datosTrans.numeroTelefono.length === 0 && num !== "3") {
                return notifyError("El número Movii debe comenzar por 3");
              }
              setDatosTrans((old) => {
                return { ...old, numeroTelefono: num };
              });
            }
          }}
        ></Input>
        <MoneyInput
          id="valCashIn"
          name="valCashIn"
          label="Valor a depositar"
          type="text"
          autoComplete="off"
          maxLength={"12"}
          value={datosTrans.valorCashIn ?? ""}
          onInput={(e, valor) => {
            if (!isNaN(valor)) {
              setDatosTrans((old) => {
                return { ...old, valorCashIn: valor };
              });
            }
          }}
          required
          min={enumParametrosMovii.MINCASHINMOVII}
          max={enumParametrosMovii.MAXCASHINMOVII}
          equalError={false}
          equalErrorMin={false}
        ></MoneyInput>
        <ButtonBar className="lg:col-span-2">
          <Button
            disabled={
              loadingPeticionCashinMovii || loadingPeticionConsultaDepositoMovii
            }
            onClick={hideModalUsuarioInicial}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              loadingPeticionConsultaDepositoMovii || loadingPeticionCashinMovii
            }
          >
            Realizar consulta
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {peticion === 1 ? (
            <>
              <h1 className="text-2xl font-bold">
                Respuesta de consulta Movii
              </h1>
              <h4 className="text-2xl font-semibold">
                Resumen de la transacción
              </h4>
              <h2>{`Nombre usuario: ${infoUsers.nombreUsuario}`}</h2>
              <h2 className="text-base">
                {`Valor a depositar: ${formatMoney.format(
                  datosTrans.valorCashIn
                )} COP`}
              </h2>
              <h2>{`Número Movii: ${datosTrans.numeroTelefono}`}</h2>
              <h2>{`Ciudad: ${
                infoUsers.ciudad.toLowerCase() === "bogota"
                  ? "Bogotá D.C"
                  : infoUsers.ciudad
              }`}</h2>
              <ButtonBar>
                <Button
                  disabled={
                    loadingPeticionCashinMovii ||
                    loadingPeticionConsultaDepositoMovii
                  }
                  onClick={hideModalUsuario}
                >
                  Cancelar
                </Button>
                <Button
                  disabled={
                    loadingPeticionCashinMovii ||
                    loadingPeticionConsultaDepositoMovii
                  }
                  type="submit"
                  onClick={submitEventSetter(peticionCashIn)}
                >
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          ) : peticion === 2 ? (
            <>
              <Tickets refPrint={printDiv} ticket={objTicketActual}></Tickets>
              <h2>
                <ButtonBar>
                  <Button
                    type="submit"
                    disabled={
                      loadingPeticionCashinMovii ||
                      loadingPeticionConsultaDepositoMovii
                    }
                    onClick={() => {
                      hideModal();
                    }}
                  >
                    Aceptar
                  </Button>
                  <Button
                    onClick={handlePrint}
                    disabled={
                      loadingPeticionCashinMovii ||
                      loadingPeticionConsultaDepositoMovii
                    }
                  >
                    Imprimir
                  </Button>
                </ButtonBar>
              </h2>
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MoviiPDPCashIn;
