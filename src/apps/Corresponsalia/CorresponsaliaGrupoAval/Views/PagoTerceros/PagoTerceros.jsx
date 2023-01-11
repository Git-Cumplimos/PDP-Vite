import React, { Fragment, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import HideInput from "../../../../../components/Base/HideInput";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useFetch } from "../../../../../hooks/useFetch";
import { toPhoneNumber } from "../../../../../utils/functions";
import { notify, notifyError } from "../../../../../utils/notify";
import InfInicial from "../../components/PagoTerceros-PagoSubsidio/InfInicial";
import InfRecibo from "../../components/PagoTerceros-PagoSubsidio/InfRecibo";
import { pinBlock } from "../../utils/pinBlock";
import {
  fetchCustomPost,
  ErrorCustom,
  ErrorCustomBackend,
  msgCustomBackend,
} from "../../utils/fetchPagoSubsidios_PagoTerceros";

const minValor = 1000;
const maxValor = 300001;
const dataInputInitial = {
  documento: "",
  numeroCelular: "",
  otp: "",
  valor_total_trx: "",
};
const tipo_operacion = 96;

const url_pago_terceros = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_pago_terceros/pago-terceros`;

const PagoTerceros = () => {
  const [inputData, setInputData] = useState(dataInputInitial);
  const [infTicket, setInfTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const navigateValid = useNavigate();
  const { roleInfo, infoTicket: guardarTicket } = useAuth();
  const [loadingPeticionPagoTerceros, PeticionPagoTerceros] =
    useFetch(fetchCustomPost);

  function onChangeInput(e) {
    let valueInput = "";
    if (e.target.name === "valor_total_trx" || e.target.name === "otp") {
      return;
    }
    if (e.target.name === "documento") {
      valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    }
    if (e.target.name === "numeroCelular") {
      let valueInputCel = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

      if (valueInputCel[0] != 3) {
        if (valueInputCel != "") {
          notifyError(
            "Número inválido, el No. de celular debe comenzar con el número 3"
          );
          valueInput = "";
        }
      } else {
        valueInput = valueInputCel;
      }
    }
    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  function onChangeInputSecond(e, value) {
    let valueInput = "";
    if (e.target.name === "otp") {
      valueInput = ((value ?? "").match(/\d/g) ?? []).join("");
    }
    if (e.target.name === "valor_total_trx") {
      valueInput = value;
    }
    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  function onSubmitCheck(e) {
    e.preventDefault();

    // validar datos
    if (inputData.numeroCelular[0] != "3") {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      return;
    }

    if (inputData.otp.length < 4) {
      notifyError(
        "La cantidad de dígitos de la OTP debe ser mayor o igual a 4"
      );
      return;
    }

    setShowModal(true);
    setTypeInfo("Inicial");
  }

  function PagoTerceros() {
    let oficinaPropia_ = false;
    if (
      roleInfo.tipo_comercio === "OFICINAS PROPIAS" ||
      roleInfo.tipo_comercio === "KIOSCO"
    ) {
      oficinaPropia_ = true;
    }
    const dataTerceros = {
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
      },
      nombre_comercio: roleInfo["nombre comercio"],
      oficina_propia: oficinaPropia_,
      valor_total_trx: inputData.valor_total_trx,
      numeroCelular: inputData.numeroCelular,
      documento: inputData.documento,
      otp: pinBlock(
        inputData.otp,
        process.env.REACT_APP_PAN_AVAL_PAGO_TERCEROS
      ),
      location: {
        address: roleInfo.direccion,
        city: roleInfo.ciudad,
        dane_code: roleInfo.codigo_dane,
      },
    };

    PeticionPagoTerceros(
      url_pago_terceros,
      "/grupo-aval/pago-terceros",
      dataTerceros
    )
      .then((response) => {
        if (response?.status === true) {
          PagoTercerosExitoso(response?.obj?.result);
        }
      })
      .catch((error) => {
        if (error instanceof ErrorCustom) {
        } else if (error instanceof ErrorCustomBackend) {
          notifyError(`Pago de terceros no exitoso: ${error.message}`);
        } else if (error instanceof msgCustomBackend) {
          notify(`${error.message}`);
        } else {
          notifyError("Pago de terceros no exitoso");
        }
        HandleCloseSecond();
      });
  }

  function PagoTercerosExitoso(result_) {
    const voucher = {
      title: "Recibo de pago de terceros ",
      timeInfo: {
        "Fecha de venta": result_.fecha,
        Hora: result_.hora,
      },
      commerceInfo: [
        ["No. terminal", roleInfo.id_dispositivo],
        ["Teléfono", 4567890],
        ["Id Trx", result_.id_trx],
        ["Teléfono", 987654],
        ["Comercio", roleInfo["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo.direccion],
        ["", ""],
      ],
      commerceName: "PAGO DE TERCEROS",
      trxInfo: [
        ["Documento", inputData.documento],
        ["", ""],
        ["Celular", toPhoneNumber(inputData.numeroCelular)],
        ["", ""],
        ["Valor", formatMoney.format(inputData.valor_total_trx)],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };

    notify("Pago de terceros exitoso");
    setInfTicket(voucher);
    setTypeInfo("InfRecibo");
    guardarTicket(result_.id_trx, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log("Ticket guardado exitosamente");
      })
      .catch((err) => {
        console.error("Error guardando el ticket");
      });
  }
  const HandleCloseInicial = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    notify("Transacción cancelada");
    setInputData(dataInputInitial);
  }, []);

  const HandleCloseSecond = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
  }, []);

  const HandleCloseResRecibo = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    navigateValid("/corresponsalia/CorresponsaliaGrupoAval");
  }, [navigateValid]);

  const handleCloseModal = useCallback(() => {
    if (typeInfo === "Inicial" && !loadingPeticionPagoTerceros) {
      HandleCloseInicial();
    } else if (typeInfo === "InfRecibo") {
      HandleCloseResRecibo();
    } else if (loadingPeticionPagoTerceros) {
      notify("Se está procesando la transacción, por favor esperar");
    }
  }, [
    typeInfo,
    loadingPeticionPagoTerceros,
    HandleCloseInicial,
    HandleCloseResRecibo,
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Pago de terceros</h1>
      <Form onChange={onChangeInput} onSubmit={onSubmitCheck} grid>
        <Input
          name="documento"
          label="Número de identificación"
          type="text"
          minLength="5"
          maxLength="10"
          autoComplete="off"
          value={inputData.documento}
          required
        ></Input>
        <Input
          name="numeroCelular"
          label="Número celular"
          type="text"
          minLength="10"
          maxLength="10"
          autoComplete="off"
          value={inputData.numeroCelular}
          required
        ></Input>
        <HideInput
          name="otp"
          label="Número de OTP"
          type="text"
          minLength="4"
          maxLength="12"
          autoComplete="off"
          value={inputData.otp}
          onInput={onChangeInputSecond}
          required
        ></HideInput>
        <MoneyInput
          name="valor_total_trx"
          label="Valor del pago"
          autoComplete="off"
          min={minValor}
          max={maxValor}
          minLength={"5"}
          maxLength={"10"}
          value={inputData.valor_total_trx}
          onInput={onChangeInputSecond}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Continuar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {typeInfo === "Inicial" && (
          <InfInicial
            summaryInitial={{
              Documento: inputData.documento,
              Celular: toPhoneNumber(inputData.numeroCelular),
              Valor: formatMoney.format(inputData.valor_total_trx),
            }}
            loadingPeticion={loadingPeticionPagoTerceros}
            Peticion={PagoTerceros}
            HandleClose={HandleCloseInicial}
          ></InfInicial>
        )}

        {typeInfo === "InfRecibo" && (
          <InfRecibo
            infTicket={infTicket}
            HandleClose={HandleCloseResRecibo}
          ></InfRecibo>
        )}
      </Modal>
    </Fragment>
  );
};

export default PagoTerceros;
