import React, {
  Fragment,
  MouseEvent,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import { initialSearchObj, reducerCommerceFilters } from "./state";
import type { DaneCity } from "./state";
import useFetchDebounce from "../../../hooks/useFetchDebounce";
import DataTable from "../../Base/DataTable";
import { onChangeNumber } from "../../../utils/functions";
import Input from "../../Base/Input";
import { notifyError } from "../../../utils/notify";

type Props = {
  onSelectCity: (
    city_data: DaneCity,
    ev: MouseEvent<HTMLTableRowElement>
  ) => void;
};

const urlDaneMunicipios = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;

const CitySearchTable = ({ onSelectCity }: Props) => {
  const [cities, setCities] = useState<DaneCity[]>([]);

  const [searchFilters, dispatch] = useReducer(
    reducerCommerceFilters,
    initialSearchObj
  );

  const tableCities = useMemo(
    () =>
      cities.map(
        ({
          c_digo_dane_del_municipio,
          municipio,
          c_digo_dane_del_departamento,
          departamento,
        }) => ({
          c_digo_dane_del_municipio,
          municipio,
          c_digo_dane_del_departamento,
          departamento,
        })
      ),
    [cities]
  );

  useFetchDebounce(
    {
      url: useMemo(() => {
        const limit = searchFilters.limit ?? 10;
        const currentFilters = structuredClone(searchFilters);

        const params = new URLSearchParams();
        params.append("$order", "c_digo_dane_del_municipio");
        params.append("$limit", `${limit}`);
        params.append(
          "$where",
          Object.entries(currentFilters)
            .filter(([key, val]) =>
              [
                "municipio",
                "departamento",
                "c_digo_dane_del_departamento",
                "c_digo_dane_del_municipio",
              ].includes(key)
                ? val
                : ["limit"].includes(key)
                ? false
                : !(val == null)
            )
            .map(
              ([key, val]) =>
                `UNACCENT(UPPER(${key}::text)) LIKE UPPER('%${val}%')`
            )
            .join(" AND ")
        );

        const url = `${urlDaneMunicipios}?${params.toString()}`;
        return url;
        // return encodeURI(url);
      }, [searchFilters]),
      fetchIf: useMemo(() => {
        const currentFilters = structuredClone(searchFilters);

        return Object.entries(currentFilters)
          .map(([key, val]) =>
            [
              "municipio",
              "departamento",
              "c_digo_dane_del_departamento",
              "c_digo_dane_del_municipio",
            ].includes(key)
              ? Boolean(val)
              : ["limit"].includes(key)
              ? false
              : !(val == null)
          )
          .some((x) => x);
      }, [searchFilters]),
    },
    {
      onSuccess: useCallback((response) => {
        if (!response.ok) {
          notifyError("Error consultando municipios dane");
          return;
        }
        response
          .json()
          .then((res: any) => setCities(res ?? []))
          .catch((error: any) => {
            notifyError("Error consultando municipios dane");
            console.error(error)
          });
      }, []),
      onError: useCallback((error) => console.error(error), []),
    },
    { isSecure: false, checkStatus: false }
  );

  return (
    <DataTable
      title="Busqueda municipios dane"
      headers={[
        "Cod dane municipio",
        "Municipio",
        "Cod dane departamento",
        "Departamento",
      ]}
      data={tableCities}
      onClickRow={(e, i) => onSelectCity(cities[i], e)}
      tblFooter={
        <Fragment>
          <DataTable.LimitSelector
            defaultValue={searchFilters.limit}
            onChangeLimit={(limit) =>
              dispatch({ type: "SET_LIMIT", value: limit })
            }
          />
          {/* <DataTable.PaginationButtons
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
          /> */}
        </Fragment>
      }
      onChange={(ev) =>
        dispatch({
          type: "SET_ALL",
          value: (old) => ({
            ...old,
            [ev.target.name]: [
              "c_digo_dane_del_departamento",
              "c_digo_dane_del_municipio",
            ].includes(ev.target.name)
              ? onChangeNumber(ev)
              : ev.target.value,
          }),
        })
      }
    >
      <Input
        id="municipio"
        name="municipio"
        label={"Municipio"}
        type="text"
        maxLength={10}
        autoComplete="off"
        defaultValue={searchFilters.municipio}
      />
      <Input
        id="departamento"
        name="departamento"
        label={"Departamento"}
        type="text"
        maxLength={10}
        autoComplete="off"
        defaultValue={searchFilters.departamento}
      />
      <Input
        id="c_digo_dane_del_departamento"
        name="c_digo_dane_del_departamento"
        label={"Codigo dane del departamento"}
        type="tel"
        maxLength={10}
        autoComplete="off"
        defaultValue={searchFilters.c_digo_dane_del_departamento}
      />
      <Input
        id="c_digo_dane_del_municipio"
        name="c_digo_dane_del_municipio"
        label={"Codigo dane del municipio"}
        type="tel"
        maxLength={10}
        autoComplete="off"
        defaultValue={searchFilters.c_digo_dane_del_municipio}
      />
    </DataTable>
  );
};

export default CitySearchTable;
