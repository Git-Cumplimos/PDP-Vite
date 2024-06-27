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
import Input from "../../../../components/Base/Input";
import { initialSearchObj, reducerFilters } from "./state";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import { onChangeNumber } from "../../../../utils/functions";
import DataTable from "../../../../components/Base/DataTable";

type DataConveniosPDP = {
  pk_id_convenio: number;
  nombre_convenio: string;
};

type Props = {
  setReloadFunction?: Dispatch<SetStateAction<() => void>>;
};

const urlConveniosPdp =
  import.meta.env.VITE_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
// const urlConveniosPdp = "http://localhost:5000";

const ConveniosBCS = ({ setReloadFunction }: Props) => {
  const [conveniosPdp, setConveniosPdp] = useState<Array<DataConveniosPDP>>([]);
  const [nextPageGDC, setNextPageGDC] = useState(false);

  const [searchFilters, dispatch] = useReducer(
    reducerFilters,
    initialSearchObj
  );

  const [searchCurrentConvs] = useFetchDebounce(
    {
      url: useMemo(() => {
        const baseUrl = `${urlConveniosPdp}/convenios-pdp/administrar`;
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
        setConveniosPdp(
          (res?.obj?.results ?? []).map(
            ({ pk_id_convenio, nombre_convenio }: DataConveniosPDP) => ({
              pk_id_convenio,
              nombre_convenio,
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
    setReloadFunction?.(searchCurrentConvs);
  }, [setReloadFunction, searchCurrentConvs]);

  return (
    <DataTable
      title="Tabla de Convenios Banco Caja Social"
      headers={["Código convenio", "Nombre convenio"]}
      data={conveniosPdp}
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
            [ev.target.name]: ["pk_id_convenio", "ean"].includes(ev.target.name)
              ? onChangeNumber(ev)
              : ev.target.value,
            page: 1,
          }),
        })
      }
    >
      <Input
        id={"nombre_convenio"}
        label={"Nombre convenio"}
        name={"nombre_convenio"}
        type="text"
        autoComplete="off"
        maxLength={30}
      />
      <Input
        id={"pk_id_convenio"}
        label={"Código convenio"}
        name={"pk_id_convenio"}
        type="tel"
        autoComplete="off"
        maxLength={13}
      />
      <Input
        id={"ean"}
        label={"EAN"}
        name={"ean"}
        type="tel"
        autoComplete="off"
        maxLength={13}
      />
    </DataTable>
  );
};

export default ConveniosBCS;

