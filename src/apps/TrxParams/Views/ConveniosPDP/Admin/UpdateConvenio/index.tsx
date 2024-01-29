import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import Form from "../../../../../../components/Base/Form";
import Input from "../../../../../../components/Base/Input";
import TextArea from "../../../../../../components/Base/TextArea";
import ToggleInput from "../../../../../../components/Base/ToggleInput";
import Fieldset from "../../../../../../components/Base/Fieldset";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Button from "../../../../../../components/Base/Button";
import useFetchDebounce from "../../../../../../hooks/useFetchDebounce";
import { useNavigate, useParams } from "react-router-dom";
import {
  initialSearchObj,
  reducerFilters,
  ConveniosAutorizador,
  SearchFilters,
} from "./state";
import { onChangeNumber } from "../../../../../../utils/functions";
import IconSwap from "../../../../../../pages/BilleteraComisiones/Views/DispersionUsuarioPadre/IconSwap";
import NitInput from "../../components/NitInput";

const urlConveniosPdp =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
// const urlConveniosPdp = "http://localhost:5000";

const UpdateConvenio = () => {
  const navigate = useNavigate();
  const { pk_id_conv } = useParams();

  const [searchFilters, dispatch] = useReducer(
    reducerFilters,
    initialSearchObj
  );
  const [currentConvenio, setCurrentConvenio] = useState<SearchFilters>();

  const [autorizadoresDisponibles, setAutorizadoresDisponibles] = useState<
    Array<{
      pk_id_autorizador: number;
      fk_id_tipo_transaccion: number;
      disponible: boolean;
      nombre_autorizador: string;
      nombre_tipo_transaccion: string;
    }>
  >([]);

  const pk_id_convenio = useMemo(
    () => (pk_id_conv === "crear" ? undefined : pk_id_conv),
    [pk_id_conv]
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

  const existe = useCallback(
    (value: number) =>
      searchFilters.convenios_autorizador
        .map(
          ({ pk_fk_id_autorizador }: ConveniosAutorizador) =>
            pk_fk_id_autorizador
        )
        .includes(value),
    [searchFilters.convenios_autorizador]
  );

  const existeCurrent = useCallback(
    (value: number) =>
      currentConvenio?.convenios_autorizador
        .map(
          ({ pk_fk_id_autorizador }: ConveniosAutorizador) =>
            pk_fk_id_autorizador
        )
        .includes(value),
    [currentConvenio?.convenios_autorizador]
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlConveniosPdp}/convenios-pdp/unique?pk_id_convenio=${pk_id_convenio}`,
        [pk_id_convenio]
      ),
      fetchIf: !!pk_id_convenio,
    },
    {
      onSuccess: useCallback((res) => {
        dispatch({
          type: "SET_ALL",
          value: res?.obj?.results ?? {},
        });
        setCurrentConvenio(res?.obj?.results);
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
      url: `${urlConveniosPdp}/convenios-pdp/administrar`,
      options: useMemo(
        () => ({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchFilters),
        }),
        [searchFilters]
      ),
      autoDispatch: false,
    },
    {
      onPending: useCallback(
        () => `${!!pk_id_convenio ? "Actualizando" : "Creando"} convenio`,
        [pk_id_convenio]
      ),
      onSuccess: useCallback(() => {
        navigate(`/params-operations/convenios-recaudo/administrar`);
        return `${
          !!pk_id_convenio ? "Actualizacion" : "Creacion"
        } de convenio exitosa`;
      }, [navigate, pk_id_convenio]),
      onError: useCallback(
        (error) => {
          if (error?.cause === "custom") {
            return error.message;
          } else {
            console.error(error);
            return `Error ${
              !!pk_id_convenio ? "actualizando" : "creando"
            } el grupo de convenio`;
          }
        },
        [pk_id_convenio]
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

  useEffect(() => {
    if (!pk_id_convenio && !searchFilters.tags.length) {
      dispatch({ type: "TAGS_ADD" });
    }
  }, [pk_id_convenio, searchFilters.tags.length]);

  return (
    <Fragment>
      <h1 className="text-3xl text-center">
        {!pk_id_convenio ? "Crear" : "Actualizar"} convenio
      </h1>
      <Form onSubmit={submitConvenio} grid>
        {!!pk_id_convenio && (
          <Fragment>
            <Input
              id="pk_id_convenio"
              label="Id convenio"
              name="pk_id_convenio"
              type="tel"
              autoComplete="off"
              minLength={1}
              maxLength={8}
              defaultValue={searchFilters?.pk_id_convenio}
              disabled
            />
            <ToggleInput
              id={"estado"}
              label={"Estado"}
              name={"estado"}
              title="Activar / desactivar convenio"
              checked={searchFilters.estado}
              onChange={() =>
                dispatch({ type: "ESTADO", value: (old) => !old })
              }
            />
          </Fragment>
        )}
        <Input
          id="nombre_convenio"
          name={"nombre_convenio"}
          label="Nombre de convenio"
          type="text"
          autoComplete="off"
          value={searchFilters.nombre_convenio}
          onChange={(ev) =>
            dispatch({ type: "NOMBRE_CONVENIO", value: ev.target.value })
          }
          maxLength={30}
          required
        />
        <TextArea
          id="descripcion_convenio"
          label="Descripcion del convenio"
          name={"descripcion_convenio"}
          autoComplete="off"
          value={searchFilters.descripcion_convenio}
          onChange={(ev) =>
            dispatch({ type: "DESCRIPCION_CONVENIO", value: ev.target.value })
          }
          maxLength={120}
          required
        />
        <NitInput
          label="Nit"
          value={searchFilters.nit ?? ""}
          onChange={(_, nit) => dispatch({ type: "NIT", value: nit })}
          // required
        />
        {/* ButtonBar as spacer */}
        <ButtonBar children={false} />
        <Fieldset
          legend={
            <div className="flex gap-2 items-center">
              <p>Tags</p>
              <IconSwap
                title="Añadir tag"
                bootstrapIcon="file-earmark-plus"
                bootstrapIconHover="file-earmark-plus-fill"
                colorName="text-primary"
                onClick={() => dispatch({ type: "TAGS_ADD" })}
              />
            </div>
          }
          className="place-content-start"
        >
          {searchFilters.tags.map((val: string, index: number) => (
            <Input
              key={index}
              id={`tagsConvenio_${index}`}
              name="tags"
              type="text"
              autoComplete="off"
              value={val}
              maxLength={20}
              onChange={(ev) =>
                dispatch({ type: "TAGS_EDIT", index, value: ev.target.value })
              }
              required
              actionBtn={
                searchFilters.tags.length > 1
                  ? {
                      label: "Eliminar",
                      callback: () => {
                        if (searchFilters.tags.length < 2) {
                          return;
                        }
                        dispatch({ type: "TAGS_REMOVE", index });
                      },
                    }
                  : undefined
              }
            />
          ))}
          {!searchFilters.tags.length && (
            // ButtonBar as spacer
            <ButtonBar children={false} />
          )}
        </Fieldset>
        <Fieldset
          legend={
            <div className="flex gap-2 items-center">
              <p>Ean</p>
              <IconSwap
                title="Añadir ean"
                bootstrapIcon="file-earmark-plus"
                bootstrapIconHover="file-earmark-plus-fill"
                colorName="text-primary"
                onClick={() => dispatch({ type: "EAN_ADD" })}
              />
            </div>
          }
          className="place-content-start"
        >
          {searchFilters.ean.map((val: string, index: number) => (
            <Input
              key={index}
              id={`eanConvenio_${index}`}
              name="ean"
              type="text"
              autoComplete="off"
              value={val}
              minLength={13}
              maxLength={13}
              onChange={(ev) =>
                dispatch({ type: "EAN_EDIT", index, value: ev.target.value })
              }
              required
              actionBtn={{
                label: "Eliminar",
                callback: () => dispatch({ type: "EAN_REMOVE", index }),
              }}
            />
          ))}
          {!searchFilters.ean.length && (
            // ButtonBar as spacer
            <ButtonBar children={false} />
          )}
        </Fieldset>

        <Fieldset
          legend={
            <div className="flex gap-2 items-center">
              <p>Convenios Autorizador</p>
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
        </Fieldset>
        <ButtonBar className="md:col-span-2">
          <Button type="submit">
            {!pk_id_convenio ? "Crear" : "Actualizar"} convenio
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default UpdateConvenio;
