import React, { Fragment, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { ErrorCustom } from "../utils/fetchMovistarGeneral";
import { useFetchMovistar } from "../hook/useFetchMovistar";
import { toPhoneNumber } from "../../../../utils/functions";
import usePermissionTrx from "../hook/usePermissionTrx";

const minValor = 1000;
const maxValor = 100000;
const tipo_operacion = 77;
const url_recargas_movistar = `${process.env.REACT_APP_URL_MOVISTAR}/recargasmovistar/metodo1/prepago`;

const RecargasMovistar = () => {
  //Variables
  const printDiv = useRef();
  const { roleInfo, infoTicket } = useAuth();
  const statePermissionTrx = usePermissionTrx(
    "No se podra realizar recargas a movistar porque el usuario no es un comercio, ni oficina propia o kiosko."
  );
  const validNavigate = useNavigate();
  const [inputCelular, setInputCelular] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [infTicket, setInfTicket] = useState(null);
  const [typeInfo, setTypeInfo] = useState("Ninguno");

  const [loadingPeticionRecarga, peticionRecarga] = useFetchMovistar(
    url_recargas_movistar,
    "recargas movistar"
  );

  const onMoneyChange = (e, valor) => {
    setInputValor(valor);
  };

  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && inputCelular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setInputCelular(valueInput);
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();
    //Validar si es un comercio, oficina propia o kiosko
    if (statePermissionTrx === false) {
      notify(
        "No se puede realizar la recarga a movistar porque el usuario no es un comercio, ni oficina propia o kiosko."
      );
      return;
    }
    //Realizar recarga
    setShowModal(true);
    setTypeInfo("ResumenRecarga");
  };

  const recargaMovistar = () => {
    const tipo__comerio = roleInfo.tipo_comercio.toLowerCase();
    const data = {
      celular: inputCelular,
      valor: inputValor,
      codigo_comercio: roleInfo.id_comercio,
      tipo_comercio:
        tipo__comerio.search("kiosco") >= 0
          ? "OFICINAS PROPIAS"
          : roleInfo.tipo_comercio,
      id_dispositivo: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
      direccion: roleInfo.direccion,
      ciudad: roleInfo.ciudad,
      codigo_dane: roleInfo.codigo_dane,
    };

    peticionRecarga(data)
      .then((response) => {
        if (response?.status === true) {
          notify("Recarga exitosa");
          RecargaExitosa(response?.obj?.result);
        }
      })
      .catch((error) => {
        handleCloseError();
        let msg = "Recarga no exitosa";
        if (error instanceof ErrorCustom) {
          switch (error.name) {
            case "ErrorCustomBackend":
              msg = `${msg}: ${error.message}`;
              const error_msg_key = Object.keys(error.error_msg);
              const find = error_msg_key.find(
                (keyInd) => keyInd === "ErrorTrxRefuse"
              );
              msg = find !== undefined ? error.message : msg;
              notifyError(msg);
              break;
            default:
              if (error.notificacion == null) {
                notifyError(`${msg}: ${error.message}`);
              }
              break;
          }
        } else {
          notifyError(msg);
        }
      });
  };

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInputValor("");
    setInfTicket(null);
    validNavigate("/movistar");
  }, [validNavigate]);

  const handleCloseError = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Recarga cancelada");
    setInputCelular("");
    setInputValor("");
    setInfTicket(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (typeInfo === "ResumenRecarga" && !loadingPeticionRecarga) {
      handleCloseCancelada();
    } else if (typeInfo === "RecargaExitosa") {
      handleCloseRecarga();
    } else if (loadingPeticionRecarga) {
      notify("Se está procesando la transacción, por favor esperar");
    }
  }, [
    typeInfo,
    loadingPeticionRecarga,
    handleCloseCancelada,
    handleCloseRecarga,
  ]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const RecargaExitosa = (result_) => {
    const voucher = {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de venta": result_.fecha_final_ptopago,
        Hora: result_.hora_final_ptopago,
      },
      commerceInfo: [
        ["Id Transacción", result_.transaccion_ptopago],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Id Movistar", result_.pk_trx],
        ["Id Comercio", roleInfo.id_comercio],
        ["Comercio", roleInfo["nombre comercio"]],
        ["", ""],
        ["Municipio", roleInfo.ciudad],
        ["", ""],
        ["Dirección", roleInfo.direccion],
        ["", ""],
      ],
      commerceName: "RECARGAS MOVISTAR",
      trxInfo: [
        ["Número celular", toPhoneNumber(inputCelular)],
        ["", ""],
        ["Valor recarga", formatMoney.format(inputValor)],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };
    setTypeInfo("RecargaExitosa");
    setInfTicket(voucher);
    infoTicket(result_.transaccion_ptopago, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log(resTicket);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  };

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recargas Movistar</h1>
      <Form onSubmit={onSubmitCheck} grid>
        <Input
          name="celular"
          label="Número de celular"
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular}
          onChange={onCelChange}
          required
        />

        <MoneyInput
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={minValor}
          max={maxValor}
          minLength={"4"}
          maxLength={"9"}
          value={inputValor}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Recarga</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleCloseModal}>
        {/**************** Resumen de la recarga **********************/}
        {typeInfo === "ResumenRecarga" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputCelular),
              Valor: formatMoney.format(inputValor),
            }}
          >
            {!loadingPeticionRecarga ? (
              <>
                <ButtonBar>
                  <Button type="submit" onClick={recargaMovistar}>
                    Aceptar
                  </Button>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        )}
        {/**************** Resumen de la recarga **********************/}

        {/**************** Recarga Exitosa **********************/}
        {infTicket && typeInfo === "RecargaExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
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

export default RecargasMovistar;
