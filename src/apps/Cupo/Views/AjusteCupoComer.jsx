import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput from "../../../components/Base/MoneyInput";
import TextArea from "../../../components/Base/TextArea";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import { putAjusteCupo } from "../utils/fetchCupo";
import {getConsultaCupoComercio}  from "../utils/fetchFunctions";

const AjusteCupoComer = ({ subRoutes }) => {
  const navegate = useNavigate();
  const [cupoComer, setCupoComer] = useState([]);
  const [idComercio, setIdComercio] = useState(null);
  const [valor, setValor] = useState("");
  const [razonAjuste, setRazonAjuste] = useState("");
  const [inputId, setinputId] = useState(false);
  const [submitName, setSubmitName] = useState("");

  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };

  const { roleInfo } = useAuth();
  // useEffect(() => {
  //   if (cupoComer.length === 0) {
  //     notifyError("ID de comercio incorrecto");
  //     setinputId(false);
  //   }
  // }, [cupoComer]);

  const consultaCupoComercios = useCallback((id_comercio) => {
    getConsultaCupoComercio({'pk_id_comercio':id_comercio ?? idComercio})
      .then((res) => {
        if (!res?.obj || res?.obj?.length === 0) {
          setinputId(false);
          notifyError("No se encontraron comercios con ese id");
          return;
        } 
        setCupoComer(res?.obj ?? []);
      })
      .catch((reason) => {
        notifyError("Error al cargar Datos ");
      });
  },[idComercio]);

  const onChangeId = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
  }, []);

  const onMoneyChange = useCallback((e, monto) => {
    setValor(monto);
  }, []);

  const onSubmitAjuste = useCallback(
    (e) => {
      if (valor !== null && valor !== "") {
        const args = { pk_id_comercio: idComercio };
        let body = {
          valor_afectacion : valor,
          fk_id_comercio: idComercio,
          usuario: roleInfo.id_usuario,
          fk_tipo_de_movimiento: 2,
          motivo_afectacion: razonAjuste,
        }
        if (submitName === "contigencia") body.ajustes_deuda = true
        if (submitName === "Débito") {
          body.valor_afectacion = "-" +  valor
          body.ajustes_deuda = true
        }
        putAjusteCupo(args, body)
        .then((res) => {
          consultaCupoComercios(idComercio);
          if (res?.status) {
            navegate(`/cupo`);
            notify(res?.msg);
            // navigate(-1, { replace: true });
          } else {
            notifyError(res?.msg);
          }
        })
        .catch((err) => console.error(err));
      } else {
        notifyError("El campo monto no puede estar vacío");
      }
    },
    [
      idComercio,
      valor,
      razonAjuste,
      roleInfo?.id_usuario,
      submitName,
      navegate,
      consultaCupoComercios
    ]
  );
  const onSubmitBusqueda = useCallback(
    (e) => {
      e.preventDefault();
      if (e.nativeEvent.submitter.name === "buscarComercio") {
        consultaCupoComercios(idComercio);
        setinputId(true);
      }
    },
    [idComercio,consultaCupoComercios]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Ajuste deuda cupo</h1>
      <Form onSubmit={onSubmitBusqueda} grid>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="text"
          value={idComercio ?? ""}
          autoComplete="off"
          minLength={"0"}
          maxLength={"10"}
          onInput={onChangeId}
          disabled={inputId}
          required
        />
        {cupoComer.length !== 1 ? (
          <ButtonBar>
            <Button type={"submit"} name="buscarComercio">
              Buscar comercio
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}
      </Form>
      {cupoComer.length === 1 ? (
        <Fragment>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitName(e.nativeEvent.submitter.name);
            }}
            grid
          >
            <Fieldset legend={"Datos Cupo"} className={"lg:col-span-2"}>
              <MoneyInput
                id="sobregiro"
                name="sobregiro"
                label="Sobregiro"
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer[0]?.limite_cupo)}
                disabled={true}
                required
              />
              <Input
                id="deuda"
                name="deuda"
                label="Deuda del comercio"
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={`$ ${parseInt(cupoComer[0]?.deuda).toLocaleString() ?? 0}`}
                disabled={true}
                required
              />
              <MoneyInput
                id="cupo_en_canje"
                name="cupo_en_canje"
                label="Cupo en canje"
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer[0]?.cupo_en_canje)}
                disabled={true}
                required
              />
            </Fieldset>
            <Fieldset legend={"Datos Cupo"}>
              <MoneyInput
                id="monto"
                name="monto"
                label="Monto"
                autoComplete="off"
                maxLength={"14"}
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                onInput={onMoneyChange}
                required
              />
              <TextArea
                required
                id="razon_ajuste"
                name="razon_ajuste"
                label="Razón de ajuste"
                autoComplete="off"
                maxLength={"100"}
                value={razonAjuste}
                onInput={(e) => setRazonAjuste(e.target.value.trimLeft())}
                info={`Maximo 100 caracteres: (${razonAjuste.length}/100)`}
              />
            </Fieldset>
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"} name={"Débito"}>
                Ajuste débito
              </Button>
              <Button type={"submit"} name={"Crédito"}>
                Ajuste crédito
              </Button>
              <Button type={"submit"} name={"contigencia"}>
                Ajuste crédito tipo contingencia
              </Button>
            </ButtonBar>
          </Form>
          <Modal show={submitName} handleClose={() => setSubmitName("")}>
            <PaymentSummary
              title="Esta seguro de realizar el ajuste de cupo del comercio?"
              subtitle=""
            >
              <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} onClick={onSubmitAjuste}>
                  Aceptar
                </Button>
                <Button type={"button"} onClick={() => setSubmitName("")}>
                  Cancelar
                </Button>
              </ButtonBar>
            </PaymentSummary>
          </Modal>
        </Fragment>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default AjusteCupoComer;
