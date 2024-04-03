import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import Input from "../../../../../../../components/Base/Input/Input";
import { initialSearchObj, reducerFilters } from "./state";
import useFetchDebounce from "../../../../../../../hooks/useFetchDebounce";
import { onChangeNumber } from "../../../../../../../utils/functions";
import DataTable from "../../../../../../../components/Base/DataTable";

type DataGrupoConvenios = {
  pk_tbl_grupo_convenios: number;
  nombre_grupo_convenios: string;
  data_extra: any;
  fecha_creacion: string;
  fecha_modificacion: string;
  convenios: number;
};

type Props = {
  onSelect: (selectedConvGroup: DataGrupoConvenios) => void;
  setReloadFunction?: Dispatch<SetStateAction<() => void>>;
};

const urlGruposConvenios = process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const TablaGruposConvenios = ({ onSelect, setReloadFunction }: Props) => {
  const [gruposDeConvenios, setGruposDeConvenios] = useState<
    Array<DataGrupoConvenios>
  >([]);
  const [nextPageGDC, setNextPageGDC] = useState(false);

  const [searchFilters, dispatch] = useReducer(
    reducerFilters,
    initialSearchObj
  );

  const [searchCurrentConvs] = useFetchDebounce(
    {
      url: useMemo(() => {
        const baseUrl = `${urlGruposConvenios}/servicio-grupo-convenios/consultar-grupo-convenios`;
        const urlParams = new URLSearchParams();
        for (const filterVal of Object.entries(searchFilters)) {
          if (filterVal[1]) {
            urlParams.append(filterVal[0], `${filterVal[1]}`);
          }
        }
        return `${baseUrl}?${urlParams.toString()}`;
      }, [searchFilters]),
    },
    {
      onSuccess: useCallback((res) => {
        setGruposDeConvenios(
          (res?.obj?.results ?? []).map(
            ({
              pk_tbl_grupo_convenios,
              nombre_grupo_convenios,
              data_extra,
              fecha_creacion,
              fecha_modificacion,
              convenios,
            }: DataGrupoConvenios) => ({
              pk_tbl_grupo_convenios,
              nombre_grupo_convenios,
              data_extra,
              fecha_creacion,
              fecha_modificacion,
              convenios,
            })
          )
        );
        setNextPageGDC(res?.obj?.next_exist ?? false);
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

  useEffect(() => {
    setReloadFunction?.(() => searchCurrentConvs);
  }, [setReloadFunction, searchCurrentConvs]);

  return (
    <DataTable
      title="Grupos de convenios"
      headers={["Id", "Nombre Grupo", "Cant. convenios"]}
      data={gruposDeConvenios.map(
        ({ pk_tbl_grupo_convenios, nombre_grupo_convenios, convenios }) => ({
          pk_tbl_grupo_convenios,
          nombre_grupo_convenios,
          convenios,
        })
      )}
      onClickRow={(_, index) => onSelect(gruposDeConvenios[index])}
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
                value: (oldPage) => (nextPageGDC ? oldPage + 1 : oldPage),
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
            [ev.target.name]: ["pk_tbl_grupo_convenios"].includes(
              ev.target.name
            )
              ? onChangeNumber(ev)
              : ev.target.value,
            page: 1,
          }),
        })
      }
    >
      <Input
        id="pk_tbl_grupo_convenios"
        name="pk_tbl_grupo_convenios"
        label="Id grupo convenios"
        type="tel"
        maxLength={10}
        defaultValue={searchFilters.pk_tbl_grupo_convenios}
      />
      <Input
        id="nombre_grupo_convenios"
        name="nombre_grupo_convenios"
        label="Nombre grupo convenio"
        type="text"
        maxLength={30}
        defaultValue={searchFilters.nombre_grupo_convenios}
      />
    </DataTable>
  );
};

export default TablaGruposConvenios;
