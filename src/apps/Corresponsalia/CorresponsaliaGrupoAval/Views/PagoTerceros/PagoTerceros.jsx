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
import Select from "../../../../../components/Base/Select";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useFetch } from "../../../../../hooks/useFetch";
import { notify, notifyError } from "../../../../../utils/notify";
import InfInicial from "../../components/PagoTerceros-PagoSubsidio/InfInicial";
import InfRecibo from "../../components/PagoTerceros-PagoSubsidio/InfRecibo";
import {
  fetchCustomPost,
  ErrorCustom,
  ErrorCustomBackend,
  msgCustomBackend,
} from "../../utils/fetchPagoSubsidios_PagoTerceros";

const minValor = 1000;
const maxValor = 300000;
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
  const [invalidNumeroCelular, setInvalidNumeroCelular] = useState("");
  const [infTicket, setInfTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const navigateValid = useNavigate();
  const { roleInfo, infoTicket: guardarTicket } = useAuth();
  const [loadingPeticionPagoTerceros, PeticionPagoTerceros] =
    useFetch(fetchCustomPost);

  function onChangeInput(e) {
    let valueInput = "";
    if (e.target.name == "valor_total_trx" || e.target.name == "otp") {
      return;
    }
    if (e.target.name == "documento" || e.target.name == "numeroCelular") {
      valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
      if (e.target.name == "numeroCelular") {
        if (valueInput[0] != 3) {
          setInvalidNumeroCelular("Número inválido");
          if (valueInput.length == 1 && inputData.numeroCelular == "") {
            notifyError(
              "Número inválido, el No. de celular debe comenzar con el número 3"
            );
          }
        } else {
          setInvalidNumeroCelular("");
        }
      }
    }
    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  function onChangeInputSecond(e, value) {
    let valueInput = "";
    if (e.target.name == "otp") {
      valueInput = ((value ?? "").match(/\d/g) ?? []).join("");
    }
    if (e.target.name == "valor_total_trx") {
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

    setShowModal(true);
    setTypeInfo("Inicial");
  }

  function PagoTerceros() {
    let oficinaPropia;
    if (roleInfo.tipo_comercio != "OFICINASPROPIAS") {
      oficinaPropia = false;
    }
    const dataTerceros = {
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
      },
      nombre_comercio: "rrr",
      oficina_propia: oficinaPropia,
      valor_total_trx: inputData.valor_total_trx,
      numeroCelular: inputData.numeroCelular,
      documento: inputData.documento,
      otp: inputData.otp,
    };

    PeticionPagoTerceros(
      url_pago_terceros,
      "/grupo-aval/pago-terceros",
      dataTerceros
    )
      .then((response) => {
        if (response?.status == true) {
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
        ["Id Comercio", roleInfo.id_comercio],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Municipio", roleInfo.ciudad],
        ["Dirección", roleInfo.direccion],
        ["Id Trx", result_.id_trx],
        ["Id Transacción", result_.id_trx],
      ],
      commerceName: "PAGO DE TERCEROS",
      trxInfo: [
        ["Documento", inputData.documento],
        ["", ""],
        ["Celular", inputData.numeroCelular],
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
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Pago de terceros</h1>
      <Form onChange={onChangeInput} onSubmit={onSubmitCheck} grid>
        <Input
          name="documento"
          label="Número de identificación"
          type="text"
          minLength="1"
          maxLength="12"
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
          invalid={invalidNumeroCelular}
          value={inputData.numeroCelular}
          required
        ></Input>
        <HideInput
          name="otp"
          label="Número de OTP"
          type="text"
          minLength="1"
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
      <Modal show={showModal} handleClose={() => {}}>
        {typeInfo == "Inicial" && (
          <InfInicial
            summaryInitial={{
              Documento: inputData.documento,
              Celular: inputData.numeroCelular,
              Valor: formatMoney.format(inputData.valor_total_trx),
            }}
            loadingPeticion={loadingPeticionPagoTerceros}
            Peticion={PagoTerceros}
            HandleClose={HandleCloseInicial}
          ></InfInicial>
        )}

        {typeInfo == "InfRecibo" && (
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
