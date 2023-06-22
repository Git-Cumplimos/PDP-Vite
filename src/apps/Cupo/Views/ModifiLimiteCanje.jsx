import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput from "../../../components/Base/MoneyInput";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { onChangeNumber } from "../../../utils/functions";

import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import {getConsultaCupoComercio}  from "../utils/fetchFunctions";
import {
  // getConsultaAsignacionCupoLimite,
  postDtlCambioLimiteCanje,
} from "../utils/fetchCupo";

const ModifiLimiteCanje = () => {
  const [cupoComer, setCupoComer] = useState(null);
  const [valor, setValor] = useState(null);
  const [baseCaja, setBaseCaja] = useState(null);
  const [diasMaxSobregiro, setDiasMaxSobregiro] = useState(null);
  const [idComercio, setIdComercio] = useState(null);
  // const [, setAsigLimite] = useState(null);
  // const [limit] = useState(10);
  // const [page] = useState(1);
  const [inputId, setinputId] = useState(false);
  const [submitName, setSubmitName] = useState("");
  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };
  const { roleInfo } = useAuth();
  const navegateValid = useNavigate();

  // useEffect(() => {
  //   if (cupoComer?.length === 0) {
  //     notifyError("ID de comercio incorrecto");
  //     setinputId(false);
  //   }
  // }, [cupoComer]);

  // const tablalimitecupo = (idComercio, page, limit) => {
  //   getConsultaAsignacionCupoLimite(idComercio, page, limit)
  //     .then((objUdusrio) => {
  //       setAsigLimite(objUdusrio);
  //     })
  //     .catch((reason) => {
  //       console.log(reason.message);
  //       notifyError("Error al cargar Datos ");
  //     });
  // };

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
        const datosComercio = { fk_id_comercio: idComercio, usuario: roleInfo.id_usuario,};
        const data = {};
        if (baseCaja && baseCaja !== "") data.base_Caja = baseCaja
        if (diasMaxSobregiro && diasMaxSobregiro !== "") data.dias_max_sobregiro = parseInt(diasMaxSobregiro)
        if (valor !== cupoComer?.limite_cupo) data.sobregiro = valor
        
        if (Object.keys(data).length === 0){
          notifyError("No se detectaron cambios");
          return;
        }
        const body = {...data,...datosComercio}
        
        postDtlCambioLimiteCanje(body)
          .then((res) => {
            if (!res?.status) {
              notifyError("Error al asignar el sobregiro");
              return;
            }
            notify("Modificacion exitosa");
            // tablalimitecupo(idComercio, page, limit);
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
      diasMaxSobregiro,
      baseCaja,
      // limit,
      roleInfo,
      // page,
      navegateValid,
      cupoComer,
      submitName,
    ]
  );
  const onMoneyChange = useCallback((e, valor) => {
    if (e.target.name === "sobregiro") setValor(valor);
    if (e.target.name === "base_de_caja") setBaseCaja(valor);
  }, []);

  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      if (e.nativeEvent.submitter.name === "buscarComercio") {
        setinputId(true);
        getConsultaCupoComercio({'pk_id_comercio':idComercio})
          .then((res) => {
            if (!res?.obj || res?.obj.length === 0) {
              notifyError("No se encontraron comercios con ese id");
              setinputId(false);
              return;
            }
            
            setCupoComer(res?.obj ?? []);
            setValor(res?.limite_cupo);
            
            // tablalimitecupo(idComercio, page, limit);
          })
          .catch((reason) => {
            setinputId(false);
            notifyError("Error al cargar Datos ");
          });
      }
    },
    [
      idComercio,
      // page,
      // limit
    ]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Modificación cupo</h1>
      <Form onSubmit={
        cupoComer?.length !== 1 ?
          onSubmitComercio : (e)=>{
            e.preventDefault();
            setSubmitName(e.nativeEvent.submitter.name)
          } 
      } grid>
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
        {cupoComer?.length !== 1 ? (
          <ButtonBar>
            <Button type={"submit"} name="buscarComercio">
              Buscar comercio
            </Button>
          </ButtonBar>
        ) : (
          <>
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
              value={parseFloat(cupoComer[0]?.cupo_en_canje) ?? 0}
              disabled={true}
              required
            />
            <MoneyInput
              id="sobregiro"
              name="sobregiro"
              label="Sobregiro" 
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={valor ?? parseInt(cupoComer[0]?.limite_cupo)}
              onInput={onMoneyChange}
              required
              />
            <MoneyInput
              id="base_de_caja"
              name="base_de_caja"
              label="Base de caja"
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={baseCaja ?? parseInt(cupoComer[0]?.base_caja)}
              onInput={onMoneyChange}
              required
              />
            <Input
              id="dias_max_sobregiro"
              name="dias_max_sobregiro"
              label="Dias maximos sobregiro"
              type="tel"
              autoComplete="off"
              minLength={0}
              maxLength={2}
              value={diasMaxSobregiro ?? parseInt(cupoComer[0]?.dias_max_sobregiro)}
              onInput={(ev) => { setDiasMaxSobregiro(onChangeNumber(ev))}}
              required
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"} name="AsignarLimiteCupo">
                Asignar sobregiro
              </Button>
            </ButtonBar>
          </>
        )}
      </Form>
      {cupoComer?.length === 1 ? (
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
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default ModifiLimiteCanje;
