import React, { Fragment, useCallback, useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import TextArea from "../../../components/Base/TextArea";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import { getConsultaCupoComercio, putAjusteCupo } from "../utils/fetchCupo";

const AjusteCupoComer = ({ subRoutes }) => {
  const [cupoComer, setCupoComer] = useState(null);
  const [idComercio, setIdComercio] = useState(null);
  const [valor, setValor] = useState(null);
  const [razonAjuste, setRazonAjuste] = useState(null);
  const [inputId, setinputId] = useState(false);
  const navegateValid = useNavigate();

  const limitesMontos = {
    max: 9999999999,
    min: -9999999999,
  };

  const { roleInfo } = useAuth();
  useEffect(() => {
    if (cupoComer?.results.length === 0) {
      notifyError("ID de comercio incorrecto");
    }
  }, [cupoComer]);

  const consultaCupoComercios = (id_comercio) => {
    getConsultaCupoComercio(id_comercio)
      .then((objUdusrio) => {
        setCupoComer(objUdusrio);
      })
      .catch((reason) => {
        notifyError("Error al cargar Datos ");
      });
  };

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
      e.preventDefault();
      if (valor !== null && valor !== "") {
        if (e.nativeEvent.submitter.name === "Débito") {
          const args = { pk_id_comercio: idComercio };

          const body = {
            valor_afectacion: valor,
            fk_id_comercio: idComercio,
            usuario: roleInfo.id_usuario,
            fk_tipo_de_movimiento: 2,
            ajustes_deuda: true,
            motivo_afectacion: razonAjuste,
          };

          putAjusteCupo(args, body)
            .then((res) => {
              consultaCupoComercios(idComercio);
              if (res?.status) {
                notify(res?.msg);
                // navigate(-1, { replace: true });
              } else {
                notifyError(res?.msg);
              }
            })
            .catch((err) => console.error(err));
          navegateValid(`/cupo`);
        }
        if (e.nativeEvent.submitter.name === "Crédito") {
          const args = { pk_id_comercio: idComercio };
          const afectacion = "-" + valor;
          const body = {
            valor_afectacion: afectacion,
            fk_id_comercio: idComercio,
            usuario: roleInfo.id_usuario,
            fk_tipo_de_movimiento: 2,
            // ajustes_deuda: true,
            motivo_afectacion: razonAjuste,
          };

          putAjusteCupo(args, body)
            .then((res) => {
              consultaCupoComercios(idComercio);
              if (res?.status) {
                notify(res?.msg);
                // navigate(-1, { replace: true });
              } else {
                notifyError(res?.msg);
              }
            })
            .catch((err) => console.error(err));
          navegateValid(`/cupo`);
        }
        if (e.nativeEvent.submitter.name === "contigencia") {
          const args = { pk_id_comercio: idComercio };
          const afectacion = "-" + valor;
          const body = {
            valor_afectacion: afectacion,
            fk_id_comercio: idComercio,
            usuario: roleInfo.id_usuario,
            fk_tipo_de_movimiento: 2,
            ajustes_deuda: true,
            motivo_afectacion: razonAjuste,
          };
          putAjusteCupo(args, body)
            .then((res) => {
              consultaCupoComercios(idComercio);
              if (res?.status) {
                notify(res?.msg);
                // navigate(-1, { replace: true });
              } else {
                notifyError(res?.msg);
              }
            })
            .catch((err) => console.error(err));
          navegateValid(`/cupo`);
        }
      } else {
        notifyError("El campo monto no puede estar vacío");
      }
    },
    [idComercio, valor, razonAjuste, roleInfo.id_usuario, navegateValid]
  );
  const onSubmitBusqueda = useCallback(
    (e) => {
      e.preventDefault();
      if (e.nativeEvent.submitter.name === "buscarComercio") {
        consultaCupoComercios(idComercio);
        setinputId(true);
      }
    },
    [idComercio]
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
        {cupoComer?.results.length !== 1 ? (
          <ButtonBar>
            <Button type={"submit"} name="buscarComercio">
              Buscar comercio
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}
      </Form>
      {cupoComer?.results.length === 1 ? (
        <Fragment>
          <Form onSubmit={onSubmitAjuste} grid>
            <Fieldset legend={"Datos Cupo"} className={"lg:col-span-2"}>
              <MoneyInput
                id="cupo_limite"
                name="cupo_limite"
                label="Límite de cupo"
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer?.results[0].limite_cupo)}
                required
              />
              <MoneyInput
                id="deuda"
                name="deuda"
                label="Deuda del comercio"
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer?.results[0].deuda)}
                required
              />
              <MoneyInput
                id="cupo_en_canje"
                name="cupo_en_canje"
                label="Cupo en canje"
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer?.results[0].cupo_en_canje)}
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
                onInput={(e) => {
                  setRazonAjuste(e.target.value);
                }}
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
                Ajuste credito tipo contingencia
              </Button>
            </ButtonBar>
          </Form>
        </Fragment>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default AjusteCupoComer;
