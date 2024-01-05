import React, { Fragment, useCallback, useRef, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import { useAuth } from "../../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import Select from "../../../../../components/Base/Select";
import { notify, notifyError } from "../../../../../utils/notify";
import Modal from "../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import {
  fetchRetiroEfectivo,
  ValidationRetiroEfectivo,
} from "../../utils/fetchRetiro";
import { useFetch } from "../../../../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import TicketsAgrario from "../../components/TicketsBancoAgrario/TicketsAgrario/TicketsAgrario";
import { useReactToPrint } from "react-to-print";
import HideInput from "../../../../../components/Base/HideInput/HideInput";
import { pinBlock } from "../../../CorresponsaliaGrupoAval/utils/pinBlock";
import { enumParametrosBancoAgrario } from "../../utils/enumParametrosBancoAgrario";

const optionsSelect = [
  { value: "Ahorros", label: "Cuenta Ahorros" },
  { value: "Corriente", label: "Cuenta Corriente" },
];
const dataInputInitial = {
  tipoCuenta: "Ahorros",
  cuenta: "",
  OTP: "",
  amount: "0",
};

const RetiroEfectivo = () => {
  const [dataInput, setDataInput] = useState(dataInputInitial);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState("ninguna");
  const [infTicket, setInfTicket] = useState(null);
  const [loadingPeticionRetiroEfectivo, peticionRetiroEfectivo] =
    useFetch(fetchRetiroEfectivo);
  const printDiv = useRef();
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();

  const onSubmitCheck = (e) => {
    e.preventDefault();
    if (dataInput.OTP.length < 4) {
      notifyError(
        "La cantidad de dígitos de la OTP debe ser mayor o igual a 4"
      );
      return;
    }
    setShowModal(true);
    setTipoModal("ResumenTrx");
  };

  const realizarRetiroEfectivo = () => {
    const dataPeticion = {
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
      },
      nombre_comercio: roleInfo["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      oficina_propia:
        roleInfo.tipo_comercio.search("KIOSCO") >= 0 ||
        roleInfo.tipo_comercio.search("OFICINAS PROPIAS") >= 0
          ? true
          : false,
      valor_total_trx: parseInt(dataInput.amount),
      tipoCuenta: dataInput.tipoCuenta,
      cuenta: parseInt(dataInput.cuenta),
      OTP: pinBlock(
        dataInput.OTP,
        process.env.REACT_APP_PAN_BANCO_AGRARIO ?? ""
      ),

      location: {
        address: roleInfo.direccion,
        city: roleInfo.ciudad,
        dane_code: roleInfo.codigo_dane,
      },
    };
    //enviar peticion.
    peticionRetiroEfectivo(dataPeticion)
      .then((resPeticion) => {
        setInfTicket(resPeticion?.obj?.result?.ticket);
        notify("Transacción exitosa");
        setTipoModal("TrxExitosa");
      })
      .catch((error) => {
        if (!(error instanceof ValidationRetiroEfectivo)) {
          console.error({
            "Error PDP":
              "Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]",
            "Error Sequence":
              "RetiroEfectivo - Error con la petición retiro efectivo, directamente en el modulo",
            "Error Console": `${error.message}`,
          });
          notifyError(
            "Error respuesta Frontend PDP: Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]"
          );
        }
        handleCloseTrxRechazada();
      });
  };

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const handleCloseResumen = useCallback(() => {
    setShowModal(false);
    setTipoModal("ninguno");
    setDataInput(dataInputInitial);
    notifyError("Transacción cancelada");
  }, []);

  const handleCloseTrxRechazada = useCallback(() => {
    setShowModal(false);
    setTipoModal("ninguno");
    setDataInput(dataInputInitial);
  }, []);

  const handleCloseTrxExitosa = useCallback(() => {
    setShowModal(false);
    setTipoModal("ninguno");
    setDataInput(dataInputInitial);
    validNavigate("/corresponsalia/corresponsalia-banco-agrario");
  }, [validNavigate]);

  const handleCloseModal = useCallback(() => {
    if (tipoModal === "ResumenTrx" && !loadingPeticionRetiroEfectivo) {
      handleCloseResumen();
    } else if (tipoModal === "ResumenTrx" && loadingPeticionRetiroEfectivo) {
      notify("Se esta procesando transacción");
    } else if (tipoModal === "TrxExitosa") {
      handleCloseTrxExitosa();
    }
  }, [
    tipoModal,
    handleCloseResumen,
    handleCloseTrxExitosa,
    loadingPeticionRetiroEfectivo,
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiro en efectivo</h1>
      <Form grid onSubmit={onSubmitCheck}>
        <Select
          name="tipoCuenta"
          label="Tipo de cuenta"
          options={optionsSelect}
          value={dataInput.tipoCuenta}
          onChange={(e) => {
            setDataInput((anterior) => ({
              ...anterior,
              [e.target.name]: e.target.value,
            }));
          }}
        />
        <Input
          name="cuenta"
          label="Cuenta / Documento"
          type="text"
          minLength="1"
          maxLength="12"
          autoComplete="off"
          value={dataInput.cuenta}
          onChange={(e) =>
            setDataInput((anterior) => ({
              ...anterior,
              [e.target.name]: ((e.target.value ?? "").match(/\d/g) ?? []).join(
                ""
              ),
            }))
          }
          required
        />
        <HideInput
          name="OTP"
          label="Número de OTP"
          type="text"
          minLength="4"
          maxLength="8"
          autoComplete="off"
          value={dataInput.OTP}
          onInput={(e, value) =>
            setDataInput((anterior) => ({
              ...anterior,
              [e.target.name]: ((value ?? "").match(/\d/g) ?? []).join(""),
            }))
          }
          required
        ></HideInput>
        <MoneyInput
          name="amount"
          label="Valor a retirar"
          autoComplete="off"
          min={enumParametrosBancoAgrario?.MIN_RETIRO_CUENTAS_OTP_AGRARIO}
          max={enumParametrosBancoAgrario?.MAX_RETIRO_CUENTAS_OTP_AGRARIO}
          equalError={false}
          equalErrorMin={false}
          maxLength={"9"}
          value={dataInput.amount}
          onInput={(e, value) =>
            setDataInput((anterior) => ({
              ...anterior,
              [e.target.name]: value,
            }))
          }
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button type={"submit"}>Continuar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal}>
        {/******************************Resumen trx*******************************************************/}
        {tipoModal === "ResumenTrx" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              "Tipo de Cuenta": `Cuenta ${dataInput.tipoCuenta}`,
              "Cuenta / Documento": dataInput?.cuenta,
              OTP: "*".repeat(dataInput?.OTP.length),
              Valor: formatMoney.format(dataInput?.amount),
            }}
          >
            {!loadingPeticionRetiroEfectivo ? (
              <>
                <ButtonBar>
                  <Button onClick={handleCloseResumen}>Cancelar</Button>
                  <Button type={"submit"} onClick={realizarRetiroEfectivo}>
                    Realizar Retiro
                  </Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        )}
        {/******************************Resumen trx*******************************************************/}

        {/******************************TrxExitosa*******************************************************/}
        {tipoModal === "TrxExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <TicketsAgrario refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleCloseTrxExitosa}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/******************************TrxExitosa*******************************************************/}
      </Modal>
    </Fragment>
  );
};

export default RetiroEfectivo;
