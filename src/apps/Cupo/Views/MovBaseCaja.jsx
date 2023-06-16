import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput from "../../../components/Base/MoneyInput";
import PaymentSummary from "../../../components/Compound/PaymentSummary";

import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import {
  getConsultaAsignacionCupoLimite,
  getConsultaCupoComercio,
  postDtlCambioLimiteCanje,
} from "../utils/fetchCupo";

const ModifiLimiteCanje = () => {
  const [cupoComer, setCupoComer] = useState(null);
  const [valor, setValor] = useState(null);
  const [idComercio, setIdComercio] = useState(null);
  const [, setAsigLimite] = useState(null);
  const [limit] = useState(10);
  const [page] = useState(1);
  const [inputId, setinputId] = useState(false);
  const [submitName, setSubmitName] = useState("");
  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };
  const { roleInfo } = useAuth();
  const navegateValid = useNavigate();

  useEffect(() => {
    if (cupoComer?.results.length === 0) {
      notifyError("ID de comercio incorrecto");
      setinputId(false);
    }
  }, [cupoComer]);

  const tablalimitecupo = (idComercio, page, limit) => {
    getConsultaAsignacionCupoLimite(idComercio, page, limit)
      .then((objUdusrio) => {
        setAsigLimite(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
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

  const onSubmitDeposit = useCallback(
    (e) => {
      if (
        submitName === "AsignarLimiteCupo" &&
        valor !== null &&
        valor !== ""
      ) {
        if (valor === cupoComer?.results[0].limite_cupo) {
          notifyError("No se detectaron cambios");
          return;
        }
        const body = {
          fk_id_comercio: idComercio,
          valor_afectacion: valor,
          usuario: roleInfo.id_usuario,
        };
        postDtlCambioLimiteCanje(body)
          .then((res) => {
            if (!res?.status) {
              notifyError("Error al asignar el sobregiro");
              return;
            }
            notify("Modificacion exitosa");
            tablalimitecupo(idComercio, page, limit);
            navegateValid(`/cupo`);
          })
          .catch((r) => {
            console.error(r.message);
            notifyError("Error al modificar cupo");
          });
      } else {
        notifyError("El campo sobregiro no puede estar vacío");
      }
    },
    [
      idComercio,
      valor,
      limit,
      roleInfo.id_usuario,
      page,
      navegateValid,
      cupoComer,
      submitName,
    ]
  );
  const onMoneyChange = useCallback((e, valor) => {
    setValor(valor);
  }, []);
  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      if (e.nativeEvent.submitter.name === "buscarComercio") {
        setinputId(true);
        getConsultaCupoComercio(idComercio)
          .then((objUdusrio) => {
            if (!objUdusrio?.maxElems) {
              notifyError("No se encontraron comercios con ese id");
              return;
            }
            setCupoComer(objUdusrio);
            setValor(objUdusrio?.results[0].limite_cupo);
            tablalimitecupo(idComercio, page, limit);
          })
          .catch((reason) => {
            notifyError("Error al cargar Datos ");
          });
      }
    },
    [idComercio, page, limit]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Modificación sobregiro</h1>
      <Form onSubmit={onSubmitComercio} grid>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="text"
          minLength={"1"}
          maxLength={"10"}
          autoComplete="off"
          value={idComercio ?? ""}
          onChange={onChangeId}
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
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitName(e.nativeEvent.submitter.name);
            }}
            grid
          >
            <MoneyInput
              id="sobregiro"
              name="sobregiro"
              label="Límite de cupo" // Cambio pendiente
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={valor ?? parseInt(cupoComer?.results?.[0]?.limite_cupo)}
              onInput={onMoneyChange}
              disabled={true}
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
              value={parseInt(cupoComer?.results[0].cupo_en_canje)}
              disabled={true}
              required
            />
            <MoneyInput
              id="base_caja"
              name="base_caja"
              label="Base caja"
              autoComplete="off"
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={parseInt(cupoComer?.results[0].base_caja)}
              required
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"} name="AsignarLimiteCupo">
                Asignar base de caja
              </Button>
            </ButtonBar>
          </Form>
          <Modal show={submitName} handleClose={() => setSubmitName("")}>
            <PaymentSummary
              title="Esta seguro de modificar el limite de cupo del comercio?"
              subtitle=""
            >
              <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} onClick={onSubmitDeposit}>
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

export default ModifiLimiteCanje;
