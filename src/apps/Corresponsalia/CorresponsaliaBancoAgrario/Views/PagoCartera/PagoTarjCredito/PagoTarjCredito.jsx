import { useState, useCallback, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Form from "../../../../../../components/Base/Form";
import Modal from "../../../../../../components/Base/Modal";
import { useAuth } from "../../../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../../../utils/notify";
import { ErrorCustom } from "../../../utils/fetchCarteraCredito";
import { ComponentsModalSummaryTrxTarjCredito } from "./components/ComponentsModalSummaryTrxTarjCredito";
import TicketsAgrario from "../../../components/TicketsBancoAgrario/TicketsAgrario/TicketsAgrario";
import { v4 } from "uuid";
import { useFetchPagoCartera } from "../../../hooks/hookPagoCartera";
import SimpleLoading from "../../../../../../components/Base/SimpleLoading/SimpleLoading";
import Input from "../../../../../../components/Base/Input/Input";
import { makeMoneyFormatter } from "../../../../../../utils/functions";
import MoneyInput from "../../../../../../components/Base/MoneyInput";
import { enumParametrosBancoAgrario } from "../../../utils/enumParametrosBancoAgrario";
const url_pago_cartera_tarjcredito = `${import.meta.env.VITE_URL_BANCO_AGRARIO}/banco-agrario/pago_cartera_tarjCredito`;
const urlreintentos = `${import.meta.env.VITE_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario/reintento-runt`;
const PagoTarjCredito = () => {
  const uniqueId = v4();
  const [datosTarjCredito, setDatosTarjCredito] = useState({
    inputNumTarCredi: "",
    inputValorTarCredi: "",
    numeroPagoCartera: "",
    confirmacionDatos: false,
    confirmacionTicket: "",
  });

  const [showModalGeneric, setShowModalGeneric] = useState({
    showModal: false,
    showModalTicket: false,
  });

  const [infTicket, setInfTicket] = useState({});
  const printDiv = useRef();
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [loadingPeticionPayCarteraTarjCredito, peticionPayCarteraTarjCredito] =
    useFetchPagoCartera(
      url_pago_cartera_tarjcredito,
      urlreintentos,
      "PagoCartera"
    );

  const CallErrorPeticion = useCallback((error) => {
    let msg = "Pago Cartera tarjeta crédito no exitosa";
    if (error instanceof ErrorCustom) {
      switch (error.name) {
        case "ErrorCustomBackend":
          notifyError(error.message);
          break;
        case "msgCustomBackend":
          notify(error.message);
          break;
        default:
          if (error.notificacion == null) {
            notifyError(`${msg}: ${error.message}`);
          }
          break;
      }
    } else {
      if (
        error.message ===
        "Error respuesta Front-end PDP: Timeout al consumir el servicio (PagoCartera) [0010002]"
      ) {
      } else {
        notifyError(msg);
      }
    }
    setDatosTarjCredito((old) => {
      return { ...old, numeroPagoCartera: "" };
    });
    setShowModalGeneric((old) => {
      return { ...old, showModal: false };
    });
    setDatosTarjCredito((old) => {
      return { ...old, inputValorTarCredi: "" };
    });
    setDatosTarjCredito((old) => {
      return { ...old, inputNumTarCredi: "" };
    });
  }, []);

  const onSubmitPayCarteraTarjCredito = useCallback(
    (e, numero_tarjcredito, valor_pagar) => {
      e.preventDefault();
      if (isNaN(valor_pagar)) {
        return notifyError("El valor no es un numero");
      } else if (
        valor_pagar > enumParametrosBancoAgrario.MAX_PAGO_CARTERA_AGRARIO
      ) {
        return notifyError(
          `Supera el valor máximo de ${makeMoneyFormatter(0).format(
            enumParametrosBancoAgrario.MAX_PAGO_CARTERA_AGRARIO
          )} para pago tarjeta.`
        );
      } else if (
        valor_pagar < enumParametrosBancoAgrario.MIN_PAGO_CARTERA_AGRARIO
      ) {
        return notifyError(
          `El valor mínimo para pago tarjeta es de ${makeMoneyFormatter(
            0
          ).format(enumParametrosBancoAgrario.MIN_PAGO_CARTERA_AGRARIO)}.`
        );
      }
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: parseInt(valor_pagar !== "" ? valor_pagar : 0),
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo.id_comercio,
          id_terminal: roleInfo.id_dispositivo,
          id_usuario: roleInfo.id_usuario,
        },
        PagoCarteraTarjCredito: {
          numeroTarjCredito: parseInt(numero_tarjcredito),
          location: {
            address: roleInfo?.["direccion"],
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.["ciudad"],
          },
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      peticionPayCarteraTarjCredito(data, dataAditional)
        .then((response) => {
          if (response?.status === true) {
            const voucher = response?.obj?.result?.ticket
              ? response?.obj?.result?.ticket
              : response?.obj?.ticket
              ? response?.obj?.ticket
              : {};
            setInfTicket(voucher);
            setDatosTarjCredito((old) => {
              return { ...old, confirmacionTicket: "TransaccionExitosa" };
            });
            notify("Pago Tarjeta de Crédito exitoso");
            setShowModalGeneric((old) => {
              return { ...old, showModal: false };
            });
            setShowModalGeneric((old) => {
              return { ...old, showModalTicket: true };
            });
          } else if (response?.status === false) {
            HandleCloseTrxExitosa();
            if (response?.msg) {
              notifyError(response?.msg);
            } else {
              notifyError(
                "Error respuesta PDP: Transacción Pago Cartera no exitosa"
              );
            }
          } else if (response === undefined) {
            HandleCloseTrxExitosa();
            notifyError(
              "Error respuesta PDP: Transacción Pago Cartera no exitosa"
            );
          }
        })
        .catch((error) => {
          CallErrorPeticion(error);
        });
    },
    [
      datosTarjCredito?.numeroPagoCartera,
      pdpUser,
      roleInfo,
      peticionPayCarteraTarjCredito,
      CallErrorPeticion,
      uniqueId,
    ]
  );

  const validacionDatos = (e) => {
    e.preventDefault();
    setDatosTarjCredito((old) => {
      return { ...old, confirmacionDatos: true };
    });
    setShowModalGeneric((old) => {
      return { ...old, showModal: true };
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const HandleCloseTrx = useCallback(() => {
    setDatosTarjCredito((old) => {
      return { ...old, inputValorTarCredi: "" };
    });
    setDatosTarjCredito((old) => {
      return { ...old, confirmacionDatos: false };
    });
    setDatosTarjCredito((old) => {
      return { ...old, inputNumTarCredi: "" };
    });
    setShowModalGeneric((old) => {
      return { ...old, showModal: false };
    });
    notifyError("Transacción cancelada por el usuario");
    setDatosTarjCredito((old) => {
      return { ...old, numeroPagoCartera: "" };
    });
    validNavigate(-1);
  }, [validNavigate]);

  const HandleCloseTrxExitosa = useCallback(() => {
    setShowModalGeneric((old) => {
      return { ...old, showModal: false };
    });
    setDatosTarjCredito((old) => {
      return { ...old, numeroPagoCartera: "" };
    });
    setDatosTarjCredito((old) => {
      return { ...old, showModalTicket: false };
    });
    setInfTicket(null);
    validNavigate(-1);
  }, [validNavigate]);

  function onChangeInput(e) {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 16);
    const num = numericValue.replace(/[\s\.\-+eE]/g, "");
    setDatosTarjCredito((old) => {
      return { ...old, inputNumTarCredi: num };
    });
    if (value === "") {
      setDatosTarjCredito((old) => {
        return { ...old, inputNumTarCredi: "" };
      });
    }
  }

  return (
    <Fragment>
      <SimpleLoading
        show={loadingPeticionPayCarteraTarjCredito}
      ></SimpleLoading>
      <h1 className="text-3xl mt-6">Pago Tarjeta Crédito</h1>
      <Form onSubmit={validacionDatos}>
        <Input
          name="credito"
          label="Número tarjeta crédito"
          type="text"
          minLength="5"
          maxLength="16"
          autoComplete="off"
          value={datosTarjCredito?.inputNumTarCredi}
          onChange={onChangeInput}
          required
        ></Input>
        <MoneyInput
          id="valCashOut"
          name="ValorPagar"
          label="Valor a pagar"
          autoComplete="off"
          type="text"
          maxLength={"9"}
          equalError={false}
          equalErrorMin={false}
          min={enumParametrosBancoAgrario.MIN_PAGO_TARJETA_CREDITO_AGRARIO}
          max={enumParametrosBancoAgrario.MAX_PAGO_TARJETA_CREDITO_AGRARIO}
          value={datosTarjCredito?.inputValorTarCredi}
          onInput={(ev, val) =>
            setDatosTarjCredito((old) => {
              return { ...old, inputValorTarCredi: val };
            })
          }
          required
        />
        <ButtonBar className="flex justify-center py-6">
          <Button
            type={"reset"}
            onClick={HandleCloseTrx}
            disabled={
              datosTarjCredito?.inputNumTarCredi === "" ||
              datosTarjCredito?.inputValorTarCredi === "" ||
              datosTarjCredito?.inputNumTarCredi.length > 16 ||
              datosTarjCredito?.inputValorTarCredi.length > 8
            }
          >
            Cancelar
          </Button>
          <Button
            type={"submit"}
            disabled={
              datosTarjCredito?.inputNumTarCredi === "" ||
              datosTarjCredito?.inputValorTarCredi === "" ||
              datosTarjCredito?.inputNumTarCredi.length > 16 ||
              datosTarjCredito?.inputValorTarCredi.length > 8
            }
          >
            Realizar Pago
          </Button>
        </ButtonBar>
      </Form>

      {datosTarjCredito?.confirmacionDatos === true && (
        <Modal show={showModalGeneric?.showModal}>
          <ComponentsModalSummaryTrxTarjCredito
            numero_tarjcredito={datosTarjCredito?.inputNumTarCredi}
            valor_pagar={datosTarjCredito?.inputValorTarCredi}
            loadingPeticion={loadingPeticionPayCarteraTarjCredito}
            peticion={onSubmitPayCarteraTarjCredito}
            handleClose={HandleCloseTrx}
          />
        </Modal>
      )}
      {infTicket &&
        datosTarjCredito?.confirmacionTicket === "TransaccionExitosa" && (
          <Modal show={showModalGeneric?.showModalTicket}>
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <TicketsAgrario refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={HandleCloseTrxExitosa}>Cerrar</Button>
              </ButtonBar>
            </div>
          </Modal>
        )}
    </Fragment>
  );
};

export default PagoTarjCredito;
