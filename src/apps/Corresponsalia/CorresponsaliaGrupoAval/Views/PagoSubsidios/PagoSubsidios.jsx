import React, { Fragment, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import HideInput from "../../../../../components/Base/HideInput";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useFetch } from "../../../../../hooks/useFetch";
import { toPhoneNumber } from "../../../../../utils/functions";
import { notify, notifyError } from "../../../../../utils/notify";
import InfInicial from "../../components/PagoTerceros-PagoSubsidio/InfInicial";
import InfRecibo from "../../components/PagoTerceros-PagoSubsidio/InfRecibo";
import InfResConsulta from "../../components/PagoTerceros-PagoSubsidio/InfResConsulta";
import { pinBlock } from "../../utils/pinBlock";
import {
  fetchCustomPost,
  ErrorCustom,
} from "../../utils/fetchPagoSubsidios_PagoTerceros";

// ************ constantes *******************
const dataInputInitial = {
  documento: "",
  numeroCelular: "",
  otp: "",
  valor_total_trx: "",
};

const url_consulta_subsidio = `${import.meta.env.VITE_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_pago_subsidios/consulta-pago-subsidios`;
const url_pago_subsidio = `${import.meta.env.VITE_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_pago_subsidios/pago-subsidios`;
// ********************************************

// >>>>>>>>>>>>>>>>>>> componente <<<<<<<<<<<<<<<<<<<<<
const PagoSubsidios = () => {
  const [inputData, setInputData] = useState(dataInputInitial);
  const [value, setValue] = useState(0);
  const [idTrx, setIdTrx] = useState(null);
  const [infTicket, setInfTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const navigateValid = useNavigate();
  const [loadingPeticionConsultaSubsidio, PeticionConsultaSubsidio] =
    useFetch(fetchCustomPost);
  const [loadingPeticionRetirarSubsidio, PeticionRetirarSubsidio] =
    useFetch(fetchCustomPost);
  const { roleInfo, pdpUser } = useAuth();

  // ***************************** on Change **********************************
  function onChangeInput(e) {
    let valueInput = "";
    if (e.target.name === "otp") {
      return;
    }
    if (e.target.name === "documento") {
      valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    }
    if (e.target.name === "numeroCelular") {
      const valueInputCel = ((e.target.value ?? "").match(/\d/g) ?? []).join(
        ""
      );
      if (valueInputCel[0] != 3) {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
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
    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  function onSubmitContinue(e) {
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

  // ************************************* onSubmit *****************************************
  function ConsultarSubsidio() {
    const dataConsult = {
      documento: inputData.documento,
      otp: inputData.otp,
      nombre_usuario: pdpUser["uname"],
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
      },
    };

    PeticionConsultaSubsidio(
      url_consulta_subsidio,
      "Consulta de subsidios",
      dataConsult
    )
      .then((response) => {
        if (response?.status === true) {
          notify("Consulta exitosa");
          setValue(response?.obj?.result?.valor);
          setIdTrx(response?.obj?.result?.id_trx);
          setTypeInfo("resConsulta");
        }
      })
      .catch((error) => {
        if (!error instanceof ErrorCustom) {
          notifyError("Consulta de subsidio no exitosa");
        }
        HandleCloseSecond();
      });
  }

  function RetirarSubsidio() {
    let oficinaPropia_ = false;
    if (
      roleInfo.tipo_comercio === "OFICINAS PROPIAS" ||
      roleInfo.tipo_comercio === "KIOSCO"
    ) {
      oficinaPropia_ = true;
    }
    let dataSubsidio = {
      comercio: {
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
      },
      nombre_comercio: roleInfo["nombre comercio"],
      nombre_usuario: pdpUser["uname"],
      oficina_propia: oficinaPropia_,
      valor_total_trx: value,
      numeroCelular: inputData.numeroCelular,
      documento: inputData.documento,
      otp: pinBlock(
        inputData.otp,
        import.meta.env.VITE_PAN_AVAL_PAGO_TERCEROS
      ),
      location: {
        address: roleInfo.direccion,
        city: roleInfo.ciudad,
        dane_code: roleInfo.codigo_dane,
      },
      bool_ticket: true,
    };
    if (idTrx == null) {
      dataSubsidio["id_trx"] = idTrx;
    }

    PeticionRetirarSubsidio(url_pago_subsidio, "Pago Subsidio", dataSubsidio)
      .then((response) => {
        if (response?.status === true) {
          if (response?.obj?.result?.ticket) {
            const voucher = response.obj.result.ticket;
            setInfTicket(JSON.parse(voucher));
          }
          notify("Pago de subsidio exitoso");
          setTypeInfo("InfRecibo");
        }
      })
      .catch((error) => {
        if (!error instanceof ErrorCustom) {
          notifyError("Pago de subsidio no exitoso");
        }
        HandleCloseSecond();
      });
  }

  // ********************** Funciones para cerrar el modal ******************************
  const HandleCloseSecond = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    setValue(0);
  }, []);

  const HandleCloseSecondCancelada = useCallback((msg) => {
    notify(`${msg} cancelada`);
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    setValue(0);
  }, []);

  const HandleCloseResRecibo = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    setValue(0);
    navigateValid("/corresponsalia/CorresponsaliaGrupoAval");
  }, [navigateValid]);

  const handleCloseModal = useCallback(() => {
    if (typeInfo === "Inicial" && !loadingPeticionConsultaSubsidio) {
      HandleCloseSecondCancelada("Consulta pago subsidios");
    } else if (typeInfo === "resConsulta" && !loadingPeticionRetirarSubsidio) {
      if (value > 0) {
        HandleCloseSecondCancelada("Pago subsidios");
      } else {
        HandleCloseSecond();
      }
    } else if (typeInfo === "InfRecibo") {
      HandleCloseResRecibo();
    } else if (loadingPeticionConsultaSubsidio) {
      notify("Se está procesando consulta, por favor esperar");
    } else if (loadingPeticionRetirarSubsidio) {
      notify("Se está procesando transacción, por favor esperar");
    }
  }, [
    value,
    typeInfo,
    loadingPeticionConsultaSubsidio,
    loadingPeticionRetirarSubsidio,
    HandleCloseSecond,
    HandleCloseSecondCancelada,
    HandleCloseResRecibo,
  ]);

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
          value={inputData.numeroCelular}
          required
        ></Input>
        <HideInput
          name="otp"
          label="Número de OTP"
          type="text"
          minLength="4"
          maxLength="8"
          autoComplete="off"
          value={inputData.otp}
          onInput={onChangeInputSecond}
          required
        ></HideInput>
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Continuar</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleCloseModal}>
        {/******************************Resumen de consulta*******************************************************/}
        {typeInfo === "Inicial" && (
          <InfInicial
            summaryInitial={{
              Documento: inputData.documento,
              Celular: toPhoneNumber(inputData.numeroCelular),
            }}
            loadingPeticion={loadingPeticionConsultaSubsidio}
            Peticion={ConsultarSubsidio}
            HandleClose={() =>
              HandleCloseSecondCancelada("Consulta pago subsidios")
            }
            title="¿Está seguro de realizar consulta?"
            subtitle="Resumen de la consulta"
          ></InfInicial>
        )}
        {/******************************Resumen de consulta*******************************************************/}

        {/******************************resConsulta*******************************************************/}
        {typeInfo === "resConsulta" && (
          <InfResConsulta
            value={value}
            summaryResConsulta={{
              "Valor del subsidio": formatMoney.format(value),
            }}
            loadingPeticion={loadingPeticionRetirarSubsidio}
            Peticion={RetirarSubsidio}
            HandleClose1={() => HandleCloseSecondCancelada("Pago subsidios")}
            HandleClose2={HandleCloseSecond}
          ></InfResConsulta>
        )}
        {/******************************resConsulta*******************************************************/}

        {/************************************ Recibo *******************************************************/}
        {typeInfo === "InfRecibo" && (
          <InfRecibo
            infTicket={infTicket}
            HandleClose={HandleCloseResRecibo}
          ></InfRecibo>
        )}
        {/************************************ Recibo *******************************************************/}
      </Modal>
    </Fragment>
  );
};

export default PagoSubsidios;
