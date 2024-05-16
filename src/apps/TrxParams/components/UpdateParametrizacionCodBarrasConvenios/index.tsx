import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { useNavigate, useParams } from "react-router-dom";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ToggleInput from "../../../../components/Base/ToggleInput";
import TextArea from "../../../../components/Base/TextArea";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import IconSwap from "../../../../pages/BilleteraComisiones/Views/DispersionUsuarioPadre/IconSwap";
import { onChangeNumber } from "../../../../utils/functions";
import Button from "../../../../components/Base/Button";
import Select from "../../../../components/Base/Select";

type StrNumber = `${number}` | number;
type StrNumberOptional = StrNumber | "" | undefined;

type DataParametrizacionCodBarrasConveniosPDP = {
  pk_codigo_convenio: StrNumberOptional;
  pk_id_autorizador: StrNumberOptional;
  cantidad_referencias: number;
  contiene_fecha_maxima: boolean | null;
  contiene_valor_pagar: boolean | null;
  longitud_fecha: StrNumberOptional;
  longitud_referencia_1: StrNumberOptional;
  longitud_referencia_2: StrNumberOptional;
  longitud_referencia_3: StrNumberOptional;
  longitud_valor: StrNumberOptional;
  nombre_autorizador: StrNumberOptional;
  posicion_inicial_fecha: StrNumberOptional;
  posicion_inicial_referencia_1: StrNumberOptional;
  posicion_inicial_referencia_2: StrNumberOptional;
  posicion_inicial_referencia_3: StrNumberOptional;
  posicion_inicial_valor: StrNumberOptional;
};

enum enumEstadoProceso {
  consulta = "CONSULTA",
  creacion = "CREACION",
  actualizacion = "ACTUALIZACION",
}

type Props = {
  dataParametrizacionCodBarras: DataParametrizacionCodBarrasConveniosPDP;
  estadoProceso: enumEstadoProceso;
};
// const urlConveniosPdp =
//   process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
const urlConveniosPdp = "http://localhost:5000";

const UpdateParametrizacionCodBarrasConvenios = ({
  dataParametrizacionCodBarras,
  estadoProceso,
}: Props) => {
  const validNavigate = useNavigate();
  // const { pk_id_conv } = useParams();

  const [autorizadoresDisponibles, setAutorizadoresDisponibles] = useState<
    Array<{
      pk_id_autorizador: number;
      fk_id_tipo_transaccion: number;
      disponible: boolean;
      nombre_autorizador: string;
      nombre_tipo_transaccion: string;
    }>
  >([]);
  const [
    dataParametrizacionCodBarrasTemp,
    setDataParametrizacionCodBarrasTemp,
  ] = useState<DataParametrizacionCodBarrasConveniosPDP>(
    dataParametrizacionCodBarras
  );

  const allAuths = useMemo(
    () =>
      autorizadoresDisponibles.map(
        ({ pk_id_autorizador, nombre_autorizador }) => ({
          value: pk_id_autorizador,
          label: nombre_autorizador,
        })
      ),
    [autorizadoresDisponibles]
  );

  useFetchDebounce(
    {
      url: `${urlConveniosPdp}/convenios-pdp/autorizadores-recaudo?disponible=true&limit=0`,
    },
    {
      onSuccess: useCallback((res) => {
        setAutorizadoresDisponibles(res?.obj?.results ?? []);
      }, []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          // notifyError(error.message);
          console.error(error.message);
        } else {
          console.error(error);
        }
      }, []),
    }
  );

  const [updateConvenio] = useFetchDebounce(
    {
      url:
        estadoProceso === enumEstadoProceso.creacion
          ? `${urlConveniosPdp}/convenios-pdp/parametrizar-codigos-barras-convenios`
          : `${urlConveniosPdp}/convenios-pdp/parametrizar-codigos-barras-convenios?pk_codigo_convenio=${dataParametrizacionCodBarrasTemp.pk_codigo_convenio}&pk_id_autorizador=${dataParametrizacionCodBarrasTemp.pk_id_autorizador}`,
      options: useMemo(
        () =>
          estadoProceso === enumEstadoProceso.creacion
            ? {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  pk_codigo_convenio:
                    dataParametrizacionCodBarrasTemp.pk_codigo_convenio,
                  pk_id_autorizador:
                    dataParametrizacionCodBarrasTemp.pk_id_autorizador,
                  cantidad_referencias:
                    dataParametrizacionCodBarrasTemp.cantidad_referencias,
                  contiene_fecha_maxima:
                    dataParametrizacionCodBarrasTemp.contiene_fecha_maxima,
                  contiene_valor_pagar:
                    dataParametrizacionCodBarrasTemp.contiene_valor_pagar,
                  longitud_fecha:
                    dataParametrizacionCodBarrasTemp.longitud_fecha,
                  longitud_referencia_1:
                    dataParametrizacionCodBarrasTemp.longitud_referencia_1,
                  longitud_referencia_2:
                    dataParametrizacionCodBarrasTemp.longitud_referencia_2,
                  longitud_referencia_3:
                    dataParametrizacionCodBarrasTemp.longitud_referencia_3,
                  longitud_valor:
                    dataParametrizacionCodBarrasTemp.longitud_valor,
                  posicion_inicial_fecha:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_fecha,
                  posicion_inicial_referencia_1:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_referencia_1,
                  posicion_inicial_referencia_2:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_referencia_2,
                  posicion_inicial_referencia_3:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_referencia_3,
                  posicion_inicial_valor:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_valor,
                }),
              }
            : {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  pk_codigo_convenio:
                    dataParametrizacionCodBarrasTemp.pk_codigo_convenio,
                  pk_id_autorizador:
                    dataParametrizacionCodBarrasTemp.pk_id_autorizador,
                  cantidad_referencias:
                    dataParametrizacionCodBarrasTemp.cantidad_referencias,
                  contiene_fecha_maxima:
                    dataParametrizacionCodBarrasTemp.contiene_fecha_maxima,
                  contiene_valor_pagar:
                    dataParametrizacionCodBarrasTemp.contiene_valor_pagar,
                  longitud_fecha:
                    dataParametrizacionCodBarrasTemp.longitud_fecha,
                  longitud_referencia_1:
                    dataParametrizacionCodBarrasTemp.longitud_referencia_1,
                  longitud_referencia_2:
                    dataParametrizacionCodBarrasTemp.longitud_referencia_2,
                  longitud_referencia_3:
                    dataParametrizacionCodBarrasTemp.longitud_referencia_3,
                  longitud_valor:
                    dataParametrizacionCodBarrasTemp.longitud_valor,
                  posicion_inicial_fecha:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_fecha,
                  posicion_inicial_referencia_1:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_referencia_1,
                  posicion_inicial_referencia_2:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_referencia_2,
                  posicion_inicial_referencia_3:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_referencia_3,
                  posicion_inicial_valor:
                    dataParametrizacionCodBarrasTemp.posicion_inicial_valor,
                }),
              },
        [dataParametrizacionCodBarrasTemp, estadoProceso]
      ),
      autoDispatch: false,
    },
    {
      onPending: useCallback(
        () =>
          `${
            estadoProceso === enumEstadoProceso.actualizacion
              ? "Actualizando"
              : "Creando"
          } parametrización`,
        [estadoProceso]
      ),
      onSuccess: useCallback(() => {
        validNavigate(-1);
        return `${
          estadoProceso === enumEstadoProceso.actualizacion
            ? "Actualización"
            : "Creación"
        } de parametrización exitosa`;
      }, [validNavigate, estadoProceso]),
      onError: useCallback(
        (error) => {
          if (error?.cause === "custom") {
            return error.message;
          } else {
            console.error(error);
            return `Error ${
              estadoProceso === enumEstadoProceso.actualizacion
                ? "actualizando"
                : "creando"
            } parametrización`;
          }
        },
        [estadoProceso]
      ),
    },
    { notify: true }
  );

  const submitConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      updateConvenio();
    },
    [updateConvenio]
  );

  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataParametrizacionCodBarrasTemp((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeFormatNumber = useCallback((ev) => {
    let value = ev.target.value;
    if (!isNaN(value)) {
      value = value.replace(/[\s\.\-+eE]/g, "");
      setDataParametrizacionCodBarrasTemp((old) => {
        return { ...old, [ev.target.name]: value };
      });
    }
  }, []);
  return (
    <Fragment>
      <h1 className="text-3xl text-center">
        {estadoProceso === enumEstadoProceso.creacion
          ? "Crear "
          : "Actualizar "}
        parametrización
      </h1>
      <Form onSubmit={submitConvenio} grid>
        <Input
          id="pk_codigo_convenio"
          label="Id convenio"
          name="pk_codigo_convenio"
          type="tel"
          autoComplete="off"
          minLength={1}
          maxLength={8}
          value={dataParametrizacionCodBarrasTemp?.pk_codigo_convenio ?? ""}
          onChange={onChangeFormatNumber}
          disabled={estadoProceso === enumEstadoProceso.actualizacion}
          required
        />
        <Select
          id={"pk_id_autorizador"}
          label={"Autorizador"}
          name={"pk_id_autorizador"}
          onChange={onChangeFormat}
          disabled={estadoProceso === enumEstadoProceso.actualizacion}
          value={dataParametrizacionCodBarrasTemp.pk_id_autorizador}
          options={[{ value: "", label: "" }, ...allAuths]}
          required
        />
        <Fieldset
          legend={
            <div className="flex gap-2 items-center">
              <p>Referencias</p>
              {dataParametrizacionCodBarrasTemp.cantidad_referencias <= 2 && (
                <IconSwap
                  title="Añadir referencia"
                  bootstrapIcon="plus-circle"
                  bootstrapIconHover="plus-circle-fill"
                  colorName="text-primary"
                  onClick={() =>
                    setDataParametrizacionCodBarrasTemp((old) => ({
                      ...old,
                      cantidad_referencias: old.cantidad_referencias + 1,
                    }))
                  }
                />
              )}
            </div>
          }
          className="lg:col-span-2"
        >
          <>
            {[
              ...Array(dataParametrizacionCodBarrasTemp.cantidad_referencias),
            ].map((data, i) => (
              <Fieldset
                // legend={`Referencia ${i + 1}`}
                key={i}
                legend={
                  <div className="flex gap-2 items-center">
                    <p>{`Referencia ${i + 1}`}</p>
                    {i + 1 !== 1 &&
                      i + 1 ===
                        dataParametrizacionCodBarrasTemp.cantidad_referencias && (
                        <IconSwap
                          title={`Referencia ${i + 1}`}
                          bootstrapIcon="dash-circle"
                          bootstrapIconHover="dash-circle-fill"
                          colorName="text-primary"
                          onClick={() =>
                            setDataParametrizacionCodBarrasTemp((old) => ({
                              ...old,
                              cantidad_referencias:
                                old.cantidad_referencias - 1,
                              [`longitud_referencia_${i + 1}`]: null,
                              [`posicion_inicial_referencia_${i + 1}`]: null,
                            }))
                          }
                        />
                      )}
                  </div>
                }
                className="lg:col-span-2"
              >
                <Input
                  id={`longitud_referencia_${i + 1}`}
                  label={`Longitud referencia ${i + 1}`}
                  name={`longitud_referencia_${i + 1}`}
                  type="tel"
                  autoComplete="off"
                  minLength={1}
                  maxLength={2}
                  value={
                    dataParametrizacionCodBarrasTemp?.[
                      `longitud_referencia_${i + 1}`
                    ] ?? ""
                  }
                  required
                  onChange={onChangeFormatNumber}
                  // disabled={estadoProceso === enumEstadoProceso.actualizacion}
                />
                <Input
                  id={`posicion_inicial_referencia_${i + 1}`}
                  label={`Posición inicial referencia ${i + 1}`}
                  name={`posicion_inicial_referencia_${i + 1}`}
                  type="tel"
                  autoComplete="off"
                  minLength={1}
                  maxLength={2}
                  value={
                    dataParametrizacionCodBarrasTemp?.[
                      `posicion_inicial_referencia_${i + 1}`
                    ] ?? ""
                  }
                  required
                  onChange={onChangeFormatNumber}
                  // disabled={estadoProceso === enumEstadoProceso.actualizacion}
                />
              </Fieldset>
            ))}
          </>
        </Fieldset>
        <Fieldset legend="Valor a pagar" className="lg:col-span-2">
          <>
            <Input
              id="longitud_valor"
              label="Longitud valor a pagar"
              name="longitud_valor"
              type="tel"
              autoComplete="off"
              minLength={1}
              maxLength={2}
              value={dataParametrizacionCodBarrasTemp?.longitud_valor ?? ""}
              onChange={onChangeFormatNumber}
              required
              // disabled={estadoProceso === enumEstadoProceso.actualizacion}
            />
            <Input
              id="posicion_inicial_valor"
              label="Posición inicial valor a pagar"
              name="posicion_inicial_valor"
              type="tel"
              autoComplete="off"
              minLength={1}
              maxLength={2}
              value={
                dataParametrizacionCodBarrasTemp?.posicion_inicial_valor ?? ""
              }
              onChange={onChangeFormatNumber}
              required
              // disabled={estadoProceso === enumEstadoProceso.actualizacion}
            />
            <ToggleInput
              id={"contiene_valor_pagar"}
              label={"Contiene valor a pagar"}
              name={"contiene_valor_pagar"}
              title="Activar / desactivar valor a pagar"
              checked={
                dataParametrizacionCodBarrasTemp.contiene_valor_pagar ?? false
              }
              onChange={() =>
                setDataParametrizacionCodBarrasTemp((old) => ({
                  ...old,
                  contiene_valor_pagar: !old.contiene_valor_pagar,
                  longitud_valor: "",
                  posicion_inicial_valor: "",
                }))
              }
            />
          </>
        </Fieldset>
        <Fieldset legend="Fecha de caducidad" className="lg:col-span-2">
          <>
            <Input
              id="longitud_fecha"
              label="Longitud fecha"
              name="longitud_fecha"
              type="tel"
              autoComplete="off"
              minLength={1}
              maxLength={2}
              value={dataParametrizacionCodBarrasTemp?.longitud_fecha ?? ""}
              onChange={onChangeFormatNumber}
              required
              // disabled={estadoProceso === enumEstadoProceso.actualizacion}
            />
            <Input
              id="posicion_inicial_fecha"
              label="Posición inicial fecha"
              name="posicion_inicial_fecha"
              type="tel"
              autoComplete="off"
              minLength={1}
              maxLength={2}
              value={
                dataParametrizacionCodBarrasTemp?.posicion_inicial_fecha ?? ""
              }
              onChange={onChangeFormatNumber}
              required
              // disabled={estadoProceso === enumEstadoProceso.actualizacion}
            />
            <ToggleInput
              id={"contiene_fecha_maxima"}
              label={"Contiene valor a pagar"}
              name={"contiene_fecha_maxima"}
              title="Activar / desactivar fecha caducidad"
              checked={
                dataParametrizacionCodBarrasTemp.contiene_fecha_maxima ?? false
              }
              onChange={() =>
                setDataParametrizacionCodBarrasTemp((old) => ({
                  ...old,
                  contiene_fecha_maxima: !old.contiene_fecha_maxima,
                  longitud_fecha: "",
                  posicion_inicial_fecha: "",
                }))
              }
            />
          </>
        </Fieldset>
        <ButtonBar children={false} />
        {/* <Fieldset
          legend={
            <div className="flex gap-2 items-center">
              <p>Referencias</p>
              {searchFilters.convenios_autorizador.length !==
                autorizadoresDisponibles.length && (
                <IconSwap
                  title="Añadir autorizador"
                  bootstrapIcon="file-earmark-plus"
                  bootstrapIconHover="file-earmark-plus-fill"
                  colorName="text-primary"
                  onClick={() =>
                    dispatch({ type: "CONVENIOS_AUTORIZADOR_ADD" })
                  }
                />
              )}
            </div>
          }
          className="lg:col-span-2"
        >
          {searchFilters.convenios_autorizador.map(
            (convenioAuto: ConveniosAutorizador, index: number) => (
              <Fieldset
                legend={
                  <div className="flex gap-4 items-center">
                    <select
                      id={`relaciones_${index}`}
                      className="px-4 py-2 rounded-md bg-secondary-light text-black w-64"
                      value={convenioAuto.pk_fk_id_autorizador}
                      onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
                        dispatch({
                          type: "CONVENIOS_AUTORIZADOR_EDIT_ITEM",
                          index,
                          item: {
                            key: "pk_fk_id_autorizador",
                            value: parseInt(ev.target.value) ?? "",
                          },
                        })
                      }
                      disabled={
                        convenioAuto.pk_fk_id_autorizador !== "" &&
                        existeCurrent(convenioAuto.pk_fk_id_autorizador)
                      }
                      required
                    >
                      {[
                        { value: "", label: "" },
                        ...allAuths.filter(
                          ({ value }) =>
                            !existe(value) ||
                            (existe(value) &&
                              convenioAuto.pk_fk_id_autorizador === value)
                        ),
                      ].map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ToggleInput
                      id={"estado_convenio"}
                      // label={"Estado"}
                      name={"estado_convenio"}
                      title="Activar / desactivar convenio con autorizador"
                      self
                      checked={
                        searchFilters.convenios_autorizador[index]
                          .estado_convenio
                      }
                      onChange={() =>
                        dispatch({
                          type: "CONVENIOS_AUTORIZADOR_EDIT_ITEM",
                          index,
                          item: {
                            key: "estado_convenio",
                            value: (old) => !old,
                          },
                        })
                      }
                    />
                    {(convenioAuto.pk_fk_id_autorizador === "" ||
                      !existeCurrent(convenioAuto.pk_fk_id_autorizador)) && (
                      <IconSwap
                        title="Eliminar autorizador"
                        bootstrapIcon="trash"
                        bootstrapIconHover="trash-fill"
                        colorName="text-red-700"
                        onClick={() =>
                          dispatch({
                            type: "CONVENIOS_AUTORIZADOR_REMOVE",
                            index,
                          })
                        }
                      />
                    )}
                  </div>
                }
                key={index}
              >
                <Input
                  id={`relaciones_${index}`}
                  label="Id convenio"
                  name="r_vals"
                  type="text"
                  autoComplete="off"
                  value={convenioAuto.id_convenio_autorizador}
                  onChange={(ev) =>
                    dispatch({
                      type: "CONVENIOS_AUTORIZADOR_EDIT_ITEM",
                      index,
                      item: {
                        key: "id_convenio_autorizador",
                        value: onChangeNumber(ev),
                      },
                    })
                  }
                  maxLength={15}
                  required
                />
              </Fieldset>
            )
          )}
          {!!searchFilters.convenios_autorizador.length && (
            <ButtonBar children={false} />
          )}
        </Fieldset> */}
        <ButtonBar className="md:col-span-2">
          <Button type="submit">
            {estadoProceso === enumEstadoProceso.creacion
              ? "Crear"
              : "Actualizar"}{" "}
            parametrización
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default UpdateParametrizacionCodBarrasConvenios;
