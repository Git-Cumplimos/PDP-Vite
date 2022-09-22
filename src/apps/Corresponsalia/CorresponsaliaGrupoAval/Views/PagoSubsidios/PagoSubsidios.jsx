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
import InfResConsulta from "../../components/PagoTerceros-PagoSubsidio/InfResConsulta";
import {
  fetchCustomPost,
  ErrorCustom,
  ErrorCustomBackend,
  msgCustomBackend,
} from "../../utils/fetchPagoSubsidios_PagoTerceros";

const dataInputInitial = {
  documento: "",
  numeroCelular: "",
  otp: "",
  valor_total_trx: "",
};
const tipo_operacion = 99;
const url_consulta_subsidio = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_pago_subsidios/consulta-pago-subsidio`;
const url_pago_subsidio = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_pago_subsidios/pago-subsidio`;

const PagoSubsidios = () => {
  const [inputData, setInputData] = useState(dataInputInitial);
  const [invalidNumeroCelular, setInvalidNumeroCelular] = useState("");
  const [value, setValue] = useState(0);
  const [infTicket, setInfTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const navigateValid = useNavigate();
  const [loadingPeticionConsultaSubsidio, PeticionConsultaSubsidio] =
    useFetch(fetchCustomPost);
  const [loadingPeticionRetirarSubsidio, PeticionRetirarSubsidio] =
    useFetch(fetchCustomPost);
  const { roleInfo, infoTicket: guardarTicket } = useAuth();

  function onChangeInput(e) {
    let valueInput = "";
    if (e.target.name == "otp") {
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
    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  function onSubmitContinue(e) {
    e.preventDefault();
    if (inputData.numeroCelular[0] != "3") {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      return;
    }
    setShowModal(true);
    setTypeInfo("Inicial");
  }

  function ConsultarSubsidio() {
    const dataConsult = {
      documento: inputData.documento,
      otp: inputData.otp,
    };

    PeticionConsultaSubsidio(
      url_consulta_subsidio,
      "/grupo-aval/consulta-pago-subsidio",
      dataConsult
    )
      .then((response) => {
        if (response?.status == true) {
          notify("Consulta exitosa");
          setValue(response?.obj?.result?.valor);
          setTypeInfo("resConsulta");
        }
      })
      .catch((error) => {
        if (error instanceof ErrorCustom) {
        } else if (error instanceof ErrorCustomBackend) {
          notifyError(`Consulta de subsidio no exitosa: ${error.message}`);
        } else if (error instanceof msgCustomBackend) {
          notify(`${error.message}`);
        } else {
          notifyError("Consulta de subsidio no exitosa");
        }
        HandleCloseSecond();
      });
  }

  function RetirarSubsidio() {
    let oficinaPropia;
    if (roleInfo.tipo_comercio != "OFICINASPROPIAS") {
      oficinaPropia = false;
    }
    const dataSubsidio = {
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
      },
      nombre_comercio: "rrr",
      oficina_propia: oficinaPropia,
      valor_total_trx: value,
      numeroCelular: inputData.numeroCelular,
      documento: inputData.documento,
      otp: inputData.otp,
    };

    PeticionRetirarSubsidio(
      url_pago_subsidio,
      "/grupo-aval/pago-subsidio",
      dataSubsidio
    )
      .then((response) => {
        if (response?.status == true) {
          PagoSubsidioExitoso(response?.obj?.result);
        }
      })
      .catch((error) => {
        if (error instanceof ErrorCustom) {
        } else if (error instanceof ErrorCustomBackend) {
          notifyError(`Pago de subsidio no exitoso: ${error.message}`);
        } else if (error instanceof msgCustomBackend) {
          notify(`${error.message}`);
        } else {
          notifyError("Pago de subsidio no exitoso");
        }
        HandleCloseSecond();
      });
  }

  const PagoSubsidioExitoso = (result_) => {
    const voucher = {
      title: "Recibo de pago subsidio ",
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
      commerceName: "PAGO DE SUBSIDIO",
      trxInfo: [
        ["Documento", inputData.documento],
        ["", ""],
        ["Celular", inputData.numeroCelular],
        ["", ""],
        ["Valor", formatMoney.format(value)],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };

    notify("Pago de subsidio exitoso");
    setInfTicket(voucher);
    setTypeInfo("InfRecibo");
    guardarTicket(result_.id_trx, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log("Ticket guardado exitosamente");
      })
      .catch((err) => {
        console.error("Error guardando el ticket");
      });
  };

  const HandleCloseInicial = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
  }, []);

  const HandleCloseSecond = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    setValue(value);
  }, []);

  const HandleCloseResRecibo = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    setValue(value);
    navigateValid("/corresponsalia/CorresponsaliaGrupoAval");
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Pago de Subsidios</h1>
      <Form onChange={onChangeInput} onSubmit={onSubmitContinue} grid>
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
            }}
            loadingPeticion={loadingPeticionConsultaSubsidio}
            Peticion={ConsultarSubsidio}
            HandleClose={HandleCloseInicial}
          ></InfInicial>
        )}

        {typeInfo == "resConsulta" && (
          <InfResConsulta
            value={value}
            summaryResConsulta={{
              "Valor del subsidio": formatMoney.format(value),
            }}
            loadingPeticion={loadingPeticionRetirarSubsidio}
            Peticion={RetirarSubsidio}
            HandleClose={HandleCloseSecond}
          ></InfResConsulta>
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

export default PagoSubsidios;
