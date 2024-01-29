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
import Input from "../../../../../../components/Base/Input/Input";
import { initialSearchObj, reducerFilters } from "./state";
import useFetchDebounce from "../../../../../../hooks/useFetchDebounce";
import { onChangeNumber } from "../../../../../../utils/functions";
import DataTable from "../../../../../../components/Base/DataTable";
import Select from "../../../../../../components/Base/Select";

type DataConveniosPDP = {
  pk_id_convenio: number;
  nombre_convenio: string;
  estado: boolean;
};

type Props = {
  onSelect: (selectedConvGroup: DataConveniosPDP) => void;
  setReloadFunction?: Dispatch<SetStateAction<() => void>>;
};

const urlConveniosPdp =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
// const urlConveniosPdp = "http://localhost:5000";

const TablaConveniosPDP = ({ onSelect, setReloadFunction }: Props) => {
  const [conveniosPdp, setConveniosPdp] = useState<
    Array<DataConveniosPDP>
  >([]);
  const [autorizadoresRecaudo, setAutorizadoresRecaudo] = useState([]);
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
            ({
              pk_id_convenio,
              nombre_convenio,
              estado,
            }: DataConveniosPDP) => ({
              pk_id_convenio,
              nombre_convenio,
              estado: estado ? "Activo" : "Inactivo",
            })
          )
        );
        setNextPageGDC(res?.obj?.next_exist ?? false);
        setAutorizadoresRecaudo(res?.obj?.autorizadores_disponibles ?? []);
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
      title="Convenios de recaudo"
      headers={["Código convenio", "Nombre convenio", "Estado"]}
      data={conveniosPdp}
      onClickRow={(_, index) => onSelect(conveniosPdp[index])}
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
            [ev.target.name]: [
              "pk_id_convenio",
              "id_convenio_autorizador",
            ].includes(ev.target.name)
              ? onChangeNumber(ev)
              : ev.target.value,
            page: 1,
          }),
        })
      }
    >
      <Input
        id={"pk_id_convenio"}
        label={"Código de convenio PDP"}
        name={"pk_id_convenio"}
        type="tel"
        autoComplete="off"
        maxLength={10}
      />
      <Input
        id={"nombre_convenio"}
        label={"Nombre del convenio"}
        name={"nombre_convenio"}
        type="text"
        autoComplete="off"
        maxLength={30}
      />
      <Input
        id={"ean"}
        label={"Ean"}
        name={"ean"}
        type="text"
        autoComplete="off"
        maxLength={30}
      />
      <Select
        id={"estado"}
        label={"Estado"}
        name={"estado"}
        options={[
          { value: "", label: "" },
          { value: "true", label: "Activo" },
          { value: "false", label: "Inactivo" },
        ]}
      />
      <Select
        id={"pk_fk_id_autorizador"}
        label={"Id autorizador"}
        name={"pk_fk_id_autorizador"}
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
      <Input
        id={"id_convenio_autorizador"}
        label={"Código de convenio (autorizador)"}
        name={"id_convenio_autorizador"}
        type="tel"
        autoComplete="off"
        maxLength={15}
      />
    </DataTable>
  );
};

export default TablaConveniosPDP;
