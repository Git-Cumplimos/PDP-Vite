import React, {
  Fragment,
  MouseEvent,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import DataTable from "../../../../../components/Base/DataTable/DataTable";
import { onChangeNumber } from "../../../../../utils/functions";
import { initialSearchObj, reducerCommerceFilters } from "./state";
import Input from "../../../../../components/Base/Input/Input";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";

type Props = {
  onSelectComerce: (
    comerce_data: any,
    ev: MouseEvent<HTMLTableRowElement>
  ) => void;
};

const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;

const CommerceTable = ({ onSelectComerce }: Props) => {
  const [comercios, setComercios] = useState<any[]>([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [searchFilters, dispatch] = useReducer(
    reducerCommerceFilters,
    initialSearchObj
  );

  const tableComercios = useMemo(
    () =>
      comercios.map(
        ({
          comercio_padre,
          nombre_comercio,
          numero_identificacion,
          pk_comercio,
        }: {
          comercio_padre: string;
          nombre_comercio: string;
          numero_identificacion: number;
          pk_comercio: number;
        }) => ({
          Id: pk_comercio,
          Comercio: nombre_comercio,
          Documento: numero_identificacion,
          "Comercio padre": comercio_padre ?? "Sin comercio padre",
        })
      ),
    [comercios]
  );

  const onSelectComercios = useCallback(
    (e, i) => onSelectComerce(comercios[i], e),
    [comercios, onSelectComerce]
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlComercios}/comercios/consultar?${new URLSearchParams(
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
        setComercios(res?.obj?.results ?? []);
      }, []),
      onError: useCallback((error) => console.error(error), []),
    }
  );

  return (
    <Fragment>
      <DataTable
        title="Comercios"
        headers={["Id", "Comercio", "Documento", "Comercio padre"]}
        data={tableComercios}
        onClickRow={onSelectComercios}
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
              [ev.currentTarget.name]: ["pk_comercio"].includes(
                ev.currentTarget.name
              )
                ? onChangeNumber(ev)
                : ev.currentTarget.value,
              page: 1,
            }),
          })
        }
      >
        <Input
          id="pk_comercio"
          name="pk_comercio"
          label={"Id comercio"}
          type="tel"
          autoComplete="off"
          defaultValue={searchFilters.pk_comercio}
        />
        <Input
          id="nombre_comercio"
          name="nombre_comercio"
          label={"Nombre comercio"}
          type="text"
          autoComplete="off"
          defaultValue={searchFilters.nombre_comercio}
        />
      </DataTable>
    </Fragment>
  );
};

export default CommerceTable;
