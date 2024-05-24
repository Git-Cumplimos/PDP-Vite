import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { initialSearchObj, reducerFilters } from "./state";
import DataTable from "../../../../../../../components/Base/DataTable";
import Input from "../../../../../../../components/Base/Input";
import { onChangeNumber } from "../../../../../../../utils/functions";
import useFetchDebounce from "../../../../../../../hooks/useFetchDebounce";
import Select from "../../../../../../../components/Base/Select";
import Fieldset from "../../../../../../../components/Base/Fieldset";
import TagsAlongSide from "../../../../../../../components/Base/TagsAlongSide";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import Button from "../../../../../../../components/Base/Button";

type DataConvenio = {
  pk_fk_id_convenio: number;
  pk_fk_id_autorizador: number;
  nombre_convenio: string;
  nombre_autorizador: string;
  estado_convenio: boolean;
};

type Props = {
  type: "SEARCH_TABLE_DELETE" | "SEARCH_TABLE_ASSIGN";
  id_grupo_convenio: number;
  onSuccesUpdate?: () => void;
  setUpdateCurrentConvs?: Dispatch<SetStateAction<() => void>>;
};

const urlGruposConvenios = process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const titulos = {
  SEARCH_TABLE_DELETE: {
    fieldset: "Convenios a eliminar",
    table: "Convenios asociados al grupo originalmente",
    btn: "Eliminar convenios",
    empty: "No hay convenios por eliminar",
  },
  SEARCH_TABLE_ASSIGN: {
    fieldset: "Convenios a agregar",
    table: "Convenios sin grupo",
    btn: "Agregar convenios",
    empty: "No hay convenios por agregar",
  },
};

const SelectorConvenios = ({
  type,
  id_grupo_convenio,
  onSuccesUpdate,
  setUpdateCurrentConvs,
}: Props) => {
  const [conveniosRelacionados, setConveniosRelacionados] = useState<
    Array<DataConvenio>
  >([]);
  const [conveniosRelNextPage, setConveniosRelNextPage] = useState(false);
  const [autorizadoresDisponibles, setAutorizadoresDisponibles] = useState<
    Array<{
      pk_id_autorizador: number;
      fk_id_tipo_transaccion: number;
      disponible: boolean;
      nombre_autorizador: string;
      nombre_tipo_transaccion: string;
    }>
  >([]);
  const [conveniosSeleccionados, setConveniosSeleccionados] = useState<
    Array<DataConvenio>
  >([]);

  const [searchFilters, dispatch] = useReducer(
    reducerFilters,
    initialSearchObj
  );

  const [searchCurrentConvs] = useFetchDebounce(
    {
      url: useMemo(() => {
        const baseUrl = `${urlGruposConvenios}/servicio-grupo-convenios/consultar-convenios-grupo-convenios`;
        const urlParams = new URLSearchParams();
        for (const filterVal of Object.entries(searchFilters)) {
          if (filterVal[1]) {
            urlParams.append(filterVal[0], `${filterVal[1]}`);
          }
        }
        if (type === "SEARCH_TABLE_DELETE") {
          urlParams.append("fk_tbl_grupo_convenios", `${id_grupo_convenio}`);
        }
        return `${baseUrl}?${urlParams.toString()}`;
      }, [searchFilters, id_grupo_convenio, type]),
    },
    {
      onSuccess: useCallback((res) => {
        setConveniosRelacionados(
          (res?.obj?.results ?? []).map(
            ({
              pk_fk_id_convenio,
              pk_fk_id_autorizador,
              nombre_convenio,
              nombre_autorizador,
              estado_convenio,
            }: DataConvenio) => ({
              pk_fk_id_convenio,
              pk_fk_id_autorizador,
              nombre_convenio,
              nombre_autorizador,
              estado_convenio: estado_convenio ? "Activo" : "Inactivo",
            })
          )
        );
        setConveniosRelNextPage(res?.obj?.next_exist ?? false);
        setAutorizadoresDisponibles(res?.obj?.autorizadores_disponibles ?? []);
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

  const [updateGroupsConvenios, loadingUpdate] = useFetchDebounce(
    {
      url: `${urlGruposConvenios}/convenios-pdp/asignar-grupo-de-convenios`,
      options: useMemo(() => {
        const dataBody: any = {
          convenios: conveniosSeleccionados.map(
            ({ pk_fk_id_convenio, pk_fk_id_autorizador }) => ({
              pk_fk_id_convenio,
              pk_fk_id_autorizador,
            })
          ),
        };
        if (type === "SEARCH_TABLE_ASSIGN") {
          dataBody["grupo_de_convenios"] = id_grupo_convenio;
        }
        return {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataBody),
        };
      }, [conveniosSeleccionados, id_grupo_convenio, type]),
      autoDispatch: false,
    },
    {
      onPending: useCallback(() => "Actualizando convenios de grupo", []),
      onSuccess: useCallback(
        () => {
          onSuccesUpdate?.();
          searchCurrentConvs();
          setConveniosSeleccionados([]);
          return "Actualizacion de convenios exitosa";
        },
        [onSuccesUpdate, searchCurrentConvs]
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          return error.message;
        } else {
          console.error(error);
          return "Error actualizando los convenios del grupo";
        }
      }, []),
    }
  );

  const onSelect = useCallback(
    (conv_data: DataConvenio) =>
      setConveniosSeleccionados((old) => {
        if (
          old.find(
            ({ pk_fk_id_convenio, nombre_autorizador }) =>
              conv_data.pk_fk_id_convenio === pk_fk_id_convenio &&
              conv_data.nombre_autorizador === nombre_autorizador
          )
        ) {
          return old;
        }
        const copy = structuredClone(old);
        copy.push(conv_data);
        return copy;
      }),
    []
  );

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      updateGroupsConvenios();
    },
    [updateGroupsConvenios]
  );

  useEffect(() => {
    setUpdateCurrentConvs?.(() => searchCurrentConvs);
  }, [setUpdateCurrentConvs, searchCurrentConvs])

  return (
    <Fragment>
      <Fieldset legend={titulos[type].fieldset}>
        {conveniosSeleccionados?.length > 0 ? (
          <form onSubmit={onSubmit}>
            <TagsAlongSide
              data={
                conveniosSeleccionados?.map(
                  ({
                    pk_fk_id_convenio,
                    nombre_convenio,
                    nombre_autorizador,
                  }) =>
                    `${pk_fk_id_convenio}) ${nombre_convenio} - ${nombre_autorizador}`
                ) ?? []
              }
              onSelect={(_, ind) =>
                setConveniosSeleccionados((old) => {
                  const copy = structuredClone(old);
                  copy.splice(ind, 1);
                  return copy;
                })
              }
            />
            <ButtonBar>
              <Button type="submit" disabled={loadingUpdate}>
                {titulos[type].btn}
              </Button>
            </ButtonBar>
          </form>
        ) : (
          <h1 className="text-xl text-center">{titulos[type].empty}</h1>
        )}
      </Fieldset>
      <DataTable
        title={titulos[type].table}
        headers={[
          "Id convenio pdp",
          "Nombre convenio",
          "Nombre autorizador",
          "Estado",
        ]}
        data={conveniosRelacionados.map(
          ({ pk_fk_id_autorizador, ...rest }) => rest
        )}
        onClickRow={
          loadingUpdate
            ? undefined
            : (_, index) => onSelect(conveniosRelacionados[index])
        }
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={searchFilters.limit}
              onChangeLimit={(limit) =>
                dispatch({ type: "SET_LIMIT", value: limit })
              }
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) =>
                    conveniosRelNextPage ? oldPage + 1 : oldPage,
                })
              }
              onClickPrev={(_) =>
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) => (oldPage > 1 ? oldPage - 1 : oldPage),
                })
              }
            />
          </Fragment>
        }
        onChange={(ev) =>
          dispatch({
            type: "SET_ALL",
            value: (old) => ({
              ...old,
              [ev.target.name]: ["pk_fk_id_convenio"].includes(ev.target.name)
                ? onChangeNumber(ev)
                : ev.target.value,
              page: 1,
            }),
          })
        }
      >
        <Input
          id="pk_fk_id_convenio"
          name="pk_fk_id_convenio"
          label={"Id convenio"}
          type="tel"
          autoComplete="off"
          defaultValue={searchFilters.pk_fk_id_convenio}
        />
        <Select
          id="pk_fk_id_autorizador"
          name="pk_fk_id_autorizador"
          label={"Autorizador"}
          options={[
            { value: "", label: "" },
            ...autorizadoresDisponibles.map(
              ({ pk_id_autorizador, nombre_autorizador }) => ({
                value: pk_id_autorizador,
                label: nombre_autorizador,
              })
            ),
          ]}
          defaultValue={searchFilters.pk_fk_id_autorizador}
        />
        <Input
          id="nombre_convenio"
          name="nombre_convenio"
          label={"Nombre convenio"}
          type="text"
          autoComplete="off"
          defaultValue={searchFilters.nombre_convenio}
        />
      </DataTable>
    </Fragment>
  );
};

export default SelectorConvenios;
