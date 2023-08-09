import React, {
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import DataTable from "../../../../../components/Base/DataTable/DataTable";
import { onChangeNumber } from "../../../../../utils/functions";
import { initialSearchObj, reducerContractsFilters } from "./state";
import Input from "../../../../../components/Base/Input/Input";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import useFetchDispatchDebounce from "../../../../../hooks/useFetchDispatchDebounce";

type Props = {
  onSelectContract: (
    comerce_data: any,
    ev: MouseEvent<HTMLTableRowElement>
  ) => void;
  setReloadCallback?: React.Dispatch<React.SetStateAction<() => void>>;
};

const urlContratos = `${process.env.REACT_APP_URL_COMISIONES}`;

const TiposContratosTable = ({
  onSelectContract,
  setReloadCallback,
}: Props) => {
  const [contratos, setContratos] = useState<any[]>([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [searchFilters, dispatch] = useReducer(
    reducerContractsFilters,
    initialSearchObj
  );

  const tableContratos = useMemo(
    () =>
      contratos.map(
        ({
          id_tipo_contrato,
          nombre_contrato,
          iva,
          rete_fuente,
          rete_ica,
        }: // created_at,
        // estado,
        {
          id_tipo_contrato: number;
          nombre_contrato: string;
          iva: number;
          rete_fuente: number;
          rete_ica: number;
          created_at: string;
          estado: string;
        }) => ({
          Id: id_tipo_contrato,
          Comercio: nombre_contrato,
          iva,
          rete_fuente,
          rete_ica,
          // created_at,
          // estado: estado ? "Activo": "Inactivo",
        })
      ),
    [contratos]
  );

  const onSelectContratos = useCallback(
    (e, i) => onSelectContract(contratos[i], e),
    [contratos, onSelectContract]
  );

  const [fetchContratos] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      setIsNextPage(res?.obj?.next_exist ?? false);
      setContratos(res?.obj?.results ?? []);
    }, []),
    onError: useCallback((error) => console.error(error), []),
  });

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlContratos}/contrato_comision/consultar?${new URLSearchParams(
            Object.entries(searchFilters)
              .filter(([_, val]) => val)
              .map(([key, val]) => [key, `${val}`])
          )}`,
        [searchFilters]
      ),
    },
    {
      onSuccess: useCallback((res) => {
        setIsNextPage(res?.obj?.next_exist ?? false);
        setContratos(res?.obj?.results ?? []);
      }, []),
      onError: useCallback((error) => console.error(error), []),
    }
  );

  const searchContratos = useCallback(() => {
    fetchContratos(
      `${urlContratos}/contrato_comision/consultar?${new URLSearchParams(
        Object.entries(searchFilters)
          .filter(([_, val]) => val)
          .map(([key, val]) => [key, `${val}`])
      )}`
    );
  }, [searchFilters, fetchContratos])

  useEffect(() => {
    setReloadCallback?.(() => searchContratos);
  }, [setReloadCallback, searchContratos]);

  useEffect(() => {
    searchContratos();
  }, [searchContratos]);

  return (
    <Fragment>
      <DataTable
        title="Contratos"
        headers={[
          "Id contrato",
          "Nombre contrato",
          "IVA",
          "Rete Fuente",
          "Rete ICA",
          // "Estado"
        ]}
        data={tableContratos}
        onClickRow={onSelectContratos}
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
                  value: (oldPage) => (isNextPage ? oldPage + 1 : oldPage),
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
              [ev.target.name]: ["id_tipo_contrato"].includes(ev.target.name)
                ? onChangeNumber(ev)
                : ev.target.value,
              page: 1,
            }),
          })
        }
      >
        <Input
          id="id_tipo_contrato"
          name="id_tipo_contrato"
          label={"Id contrato"}
          type="tel"
          maxLength={10}
          autoComplete="off"
          defaultValue={searchFilters.id_tipo_contrato}
        />
        <Input
          id="nombre_contrato"
          name="nombre_contrato"
          label={"Nombre contrato"}
          type="text"
          maxLength={60}
          autoComplete="off"
          defaultValue={searchFilters.nombre_contrato}
        />
      </DataTable>
    </Fragment>
  );
};

export default TiposContratosTable;
