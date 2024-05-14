import React, { Fragment, useCallback, useEffect, useState, useMemo } from "react";
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
import { notify, notifyError, notifyPending } from "../../../utils/notify";
import { putAjusteCupo } from "../utils/fetchCupo";
import { getConsultaCupoComercio } from "../utils/fetchFunctions";
import { cargarArchivoAjusteCupoMasivo } from "../utils/fetchFunctions";
import { descargarArchivo, descargarFormato } from "../utils/functions";
import { PermissionsCupo } from "../permissions";

const AjusteCupoComer = ({ subRoutes }) => {
  const navegate = useNavigate();
  const [cupoComer, setCupoComer] = useState([]);
  const [idComercio, setIdComercio] = useState(null);
  const [valor, setValor] = useState("");
  const [razonAjuste, setRazonAjuste] = useState("");
  const [inputId, setinputId] = useState(false);
  const [submitName, setSubmitName] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);

  const [showModalCargaMasiva, setShowModalCargaMasiva] = useState(false);
  const [cargarArchivo, setCargarArchivo] = useState(false);
  const [file, setFile] = useState(null);
  const typoArchivos = ["text/csv"]

  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };

  const formatoAjusteCupoMasivo = [
    ["pk_comercio", "monto", "tipo_trx", "razon_ajuste"],
    [1, 1500, 1 ,"ajuste debito"],
    [2, 2500, 2 ,"ajuste credito"],
    [3, 3500, 3 ,"ajuste contingencia"],
]

  const { roleInfo, pdpUser, userPermissions } = useAuth();
  // useEffect(() => {
  //   if (cupoComer.length === 0) {
  //     notifyError("ID de comercio incorrecto");
  //     setinputId(false);
  //   }
  // }, [cupoComer]);
  const listaPermisos = useMemo(
    () =>
      userPermissions
        .map(({ id_permission }) => id_permission)
        .filter((id_permission) => [
          PermissionsCupo.ajuste_contingencia,
          PermissionsCupo.ajuste_credito,
          PermissionsCupo.ajuste_debito,
        ].includes(id_permission)),
    [userPermissions]
  );

  const consultaCupoComercios = useCallback((id_comercio) => {
    getConsultaCupoComercio({ 'pk_id_comercio': id_comercio ?? idComercio })
      .then((res) => {
        if (!res?.obj || res?.obj?.length === 0) {
          setinputId(false);
          notifyError("No se encontraron comercios con ese id");
          return;
        }
        setCupoComer(res?.obj ?? []);
      })
      .catch((reason) => {
        let msg = (reason?.message ?? "").replace("Exception","Error")
        notifyError( msg ?? "Error al cargar Datos ");
      });
  }, [idComercio]);

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

  const handleCloseCargaMasiva = useCallback(() => {
    setShowModalCargaMasiva(false);
    setCargarArchivo(false);
  }, []);

  const onSubmitAjuste = useCallback(
    (e) => {
      if (valor !== null && valor !== "") {
        setDisabledBtn(true)
        const args = { pk_id_comercio: idComercio };
        let body = {
          valor_afectacion: valor,
          fk_id_comercio: idComercio,
          usuario: roleInfo.id_usuario ?? pdpUser?.uuid ?? -1,
          fk_tipo_de_movimiento: 2,
          motivo_afectacion: razonAjuste,
        }
        if (submitName === "contigencia") body.ajustes_deuda = true
        if (submitName === "Débito") {
          body.valor_afectacion = "-" + valor
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
            setDisabledBtn(false)
          })
          .catch((err) => {
            console.error(err)
            setDisabledBtn(false)
          });
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
      pdpUser,
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
    [idComercio, consultaCupoComercios]
  );

  const CargarArchivo = useCallback(
    async (e) => {
      e.preventDefault();
      setDisabledBtn(true)
      if (!typoArchivos.includes(file.type)) {
        notifyError('Tipo de archivo incorrecto')
        return;
      }

      notifyPending(
        cargarArchivoAjusteCupoMasivo(
          file,
          roleInfo?.id_usuario ?? pdpUser?.uuid,
          roleInfo?.id_comercio ?? 0,
          roleInfo?.id_dispositivo ?? 0,
        ),
        {
          render() {
            return "Enviando solicitud";
          },
        },
        {
          render({ data: res }) {
            setDisabledBtn(false)
            handleCloseCargaMasiva();
            return res?.msg;
          },
        },
        {
          render({ data: err }) {
            setDisabledBtn(false)
            if (err?.obj?.url && err.obj?.url !== "") {
              descargarArchivo("Error-del-archivo.csv", err.obj?.url)
            }
            handleCloseCargaMasiva()
            if (!err.msg || err.msg === "") {
              return `Archivo erróneo`;
            }
            return err.msg
          },
        }
      );

    }, [handleCloseCargaMasiva, file, typoArchivos, roleInfo, pdpUser]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Ajuste cartera cupo</h1>
      <Form onSubmit={onSubmitBusqueda} grid>
        <ButtonBar className={"lg  col-span-2"}>
          <Button
            type="button"
            onClick={() => { setShowModalCargaMasiva(true) }}
          >
            Ajuste masiva de cupos
          </Button>
        </ButtonBar>
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
          <Input
            id="nombre_comercio"
            name="Nombre comercio"
            label="Nombre comercio"
            type="text"
            value={cupoComer[0]?.nombre_comercio ?? ""}
            autoComplete="off"
            disabled={true}
            required
          />
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
                value={parseInt(cupoComer[0]?.sobregiro)}
                disabled={true}
                required
              />
              {/* <MoneyInput
                id="deuda" // cartera
                name="deuda" // cartera
                label={parseInt(cupoComer[0]?.deuda) >= 1 ? "Cartera al comercio" : "Cartera del comercio"}
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer[0]?.deuda)}
                disabled={true}
                required
              /> */}
              <Input
                id="deuda" // cartera
                name="deuda" // cartera
                label={parseInt(cupoComer[0]?.deuda) >= 1 ? "Cartera al comercio" : "Cartera del comercio"}
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
                label="Deuda" // Cupo en canje
                autoComplete="off"
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                value={parseInt(cupoComer[0]?.cupo_en_canje)}
                disabled={true}
                required
              />
            </Fieldset>
            {listaPermisos.length ? (
            <>
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
                {listaPermisos.includes(PermissionsCupo.ajuste_debito) && (
                  <Button type={"submit"} name={"Débito"}>
                    Ajuste débito
                  </Button>
                )}
                {listaPermisos.includes(PermissionsCupo.ajuste_credito) && (
                  <Button type={"submit"} name={"Crédito"}>
                    Ajuste crédito
                  </Button>
                )}
                {listaPermisos.includes(PermissionsCupo.ajuste_contingencia) && (
                  <Button type={"submit"} name={"contigencia"}>
                    Ajuste crédito tipo contingencia
                  </Button>
                )}
              </ButtonBar>
            </>
            ):("")}
          </Form>
          <Modal show={submitName} handleClose={() => setSubmitName("")}>
            <PaymentSummary
              title="Esta seguro de realizar el ajuste de cupo del comercio?"
              subtitle=""
            >
              <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} onClick={onSubmitAjuste} disabled={disabledBtn}>
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
      <Modal
        show={showModalCargaMasiva}
        handleClose={handleCloseCargaMasiva}
      >
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestión de archivos carga masiva ajuste de cupo
        </h2>
        <Form onSubmit={CargarArchivo}>
          {!cargarArchivo ?
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  setCargarArchivo(true);
                }}
              >
                Cargar Archivo
              </Button>
              <Button
                type="button"
                onClick={() => {
                  descargarFormato("Ejemplo_ajuste_masivo",formatoAjusteCupoMasivo)
                  handleCloseCargaMasiva()
                }}
              >
                Formato del archivo
              </Button>
            </ButtonBar>
            : <>
              <Input
                type="file"
                autoComplete="off"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                }}
                accept=".csv,.xlsx"
                required
              />
              <ButtonBar>
                <Button type="submit" disabled={disabledBtn}>
                  Cargar Archivo
                </Button>
              </ButtonBar>
            </>
          }
        </Form>
      </Modal>
    </Fragment>
  );
};

export default AjusteCupoComer;
