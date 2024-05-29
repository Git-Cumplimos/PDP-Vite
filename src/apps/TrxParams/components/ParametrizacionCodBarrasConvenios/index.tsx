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
import Input from "../../../../components/Base/Input/Input";
import { initialSearchObj, reducerFilters } from "./state";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import { onChangeNumber } from "../../../../utils/functions";
import DataTable from "../../../../components/Base/DataTable";
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

type Props = {
  onSelect: (
    selectedConvGroup: DataParametrizacionCodBarrasConveniosPDP
  ) => void;
  setReloadFunction?: Dispatch<SetStateAction<() => void>>;
};

const urlConveniosPdp =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
// const urlConveniosPdp = "http://localhost:5000";

const TablaParametrizacionCodBarrasConvenios = ({
  onSelect,
  setReloadFunction,
}: Props) => {
  const [conveniosPdp, setConveniosPdp] = useState<
    Array<DataParametrizacionCodBarrasConveniosPDP>
  >([]);
  const [autorizadoresRecaudo, setAutorizadoresRecaudo] = useState([]);
  const [nextPageGDC, setNextPageGDC] = useState(false);
  const [waitPage, setWaitPage] = useState(false);

  const [searchFilters, dispatch] = useReducer(
    reducerFilters,
    initialSearchObj
  );
  const dataTableConvenios = useMemo(() => {
    return conveniosPdp.map(
      ({
        pk_codigo_convenio,
        nombre_autorizador,
        cantidad_referencias,
        contiene_fecha_maxima,
        contiene_valor_pagar,
      }: DataParametrizacionCodBarrasConveniosPDP) => ({
        pk_codigo_convenio,
        nombre_autorizador,
        cantidad_referencias,
        contiene_fecha_maxima: contiene_fecha_maxima ? "Si" : "No",
        contiene_valor_pagar: contiene_valor_pagar ? "Si" : "No",
      })
    );
  }, [conveniosPdp]);
  const [searchCurrentConvs, loadingData] = useFetchDebounce(
    {
      url: useMemo(() => {
        const baseUrl = `${urlConveniosPdp}/convenios-pdp/parametrizar-codigos-barras-convenios`;
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
        setWaitPage(false);
        setConveniosPdp(res?.obj?.results ?? []);
        setNextPageGDC(res?.obj?.next_exist ?? false);
        setAutorizadoresRecaudo(res?.obj?.autorizadores_disponibles ?? []);
      }, []),
      onError: useCallback((error) => {
        setWaitPage(false);
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
    setReloadFunction?.(searchCurrentConvs);
  }, [setReloadFunction, searchCurrentConvs]);

  return (
    <DataTable
      title="Convenios parametrizados por código de barras"
      headers={[
        "Código convenio",
        "Nombre autorizador",
        "Num referencias",
        "Contiene fecha",
        "Contiene valor",
      ]}
      data={dataTableConvenios}
      onClickRow={(_, index) => onSelect(conveniosPdp[index])}
      tblFooter={
        <Fragment>
          <DataTable.LimitSelector
            defaultValue={searchFilters.limit}
            onChangeLimit={(limit) => {
              if (!waitPage) {
                dispatch({ type: "SET_LIMIT", value: limit });
                setWaitPage(true);
              }
            }}
          />
          <DataTable.PaginationButtons
            onClickNext={(_) => {
              if (!waitPage) {
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) =>
                    nextPageGDC && !waitPage ? oldPage + 1 : oldPage,
                });
                setWaitPage(true);
              }
            }}
            onClickPrev={(_) => {
              if (!waitPage) {
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) =>
                    oldPage > 1 && !waitPage ? oldPage - 1 : oldPage,
                });
                setWaitPage(true);
              }
            }}
          />
        </Fragment>
      }
      onChange={(ev) =>
        dispatch({
          type: "SET_ALL",
          value: (old) => ({
            ...old,
            [ev.target.name]: ["pk_codigo_convenio"].includes(ev.target.name)
              ? onChangeNumber(ev)
              : ev.target.value,
            page: 1,
          }),
        })
      }
    >
      <Input
        id={"pk_codigo_convenio"}
        label={"Código de convenio"}
        name={"pk_codigo_convenio"}
        type="tel"
        autoComplete="off"
        maxLength={20}
      />
      <Select
        id={"pk_id_autorizador"}
        label={"Autorizador"}
        name={"pk_id_autorizador"}
        options={[
          { value: "", label: "" },
          ...autorizadoresRecaudo.map(
            ({ pk_id_autorizador, nombre_autorizador }) => ({
              value: pk_id_autorizador,
              label: nombre_autorizador,
            })
          ),
        ]}
      />
    </DataTable>
  );
};

export default TablaParametrizacionCodBarrasConvenios;
