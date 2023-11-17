import React, {
  Fragment,
  MouseEvent,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import { initialSearchObj, reducerCommerceFilters } from "./state";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import DataTable from "../../../../components/Base/DataTable";
import { onChangeNumber } from "../../../../utils/functions";
import Input from "../../../../components/Base/Input";

type Props =
  | {
      type: "SEARCH_TABLE_STATE";
      onSelectComerce: (
        comerce_data: any,
        ev: MouseEvent<HTMLTableRowElement>
      ) => void;
    }
  | {
      type: "SEARCH_TABLE_SONS";
      onSelectComerce: (
        comerce_data: any,
        ev: MouseEvent<HTMLTableRowElement>
      ) => void;
    };

const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;

const CommerceTableIam = ({ type, onSelectComerce }: Props) => {
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

  useFetchDebounce(
    {
      url: useMemo(() => {
        const currentFilters = structuredClone(searchFilters);
        switch (type) {
          case "SEARCH_TABLE_SONS":
            currentFilters.fk_id_user = "";
            break;
          case "SEARCH_TABLE_STATE":
            currentFilters.estado = true;
            break;

          default:
            throw new Error("Not supported action");
        }
        const url = `${urlComercios}/comercios/usuario-padre?${new URLSearchParams(
          Object.entries(currentFilters)
            .filter(([key, val]) =>
              ["pk_comercio", "nombre_comercio"].includes(key)
                ? val
                : !(val == null)
            )
            .map(([key, val]) => [key, `${val}`])
        )}`;
        return url;
      }, [searchFilters, type]),
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
    <DataTable
      title="Comercios"
      headers={["Id", "Comercio", "Documento", "Comercio padre"]}
      data={tableComercios}
      onClickRow={(e, i) => onSelectComerce(comercios[i], e)}
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
            [ev.target.name]: ["pk_comercio"].includes(ev.target.name)
              ? onChangeNumber(ev)
              : ev.target.value,
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
        maxLength={10}
        autoComplete="off"
        defaultValue={searchFilters.pk_comercio}
      />
      <Input
        id="nombre_comercio"
        name="nombre_comercio"
        label={"Nombre comercio"}
        type="text"
        maxLength={60}
        autoComplete="off"
        defaultValue={searchFilters.nombre_comercio}
      />
    </DataTable>
  );
};

export default CommerceTableIam;
