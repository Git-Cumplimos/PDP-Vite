import { Fragment, useCallback, useEffect, useState } from "react";
import DataTable from "../../../../components/Base/DataTable";
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../../hooks/useFetchDispatchDebounce";
import { notifyError } from "../../../../utils/notify";
import { onChangeNumber } from "../../../../utils/functions";
import useMap from "../../../../hooks/useMap";
import Input from "../../../../components/Base/Input";
import { getListPermissions, getListTypeOperations } from "../../utils/fecthBrokerComercios";

const initialSearchFilters = new Map([
  ["pk_permiso_broker", ""],
  ["nombre_grupo", ""],
  ["id_tipo_op", ""],
  ["nombre_operacion", ""],
  ["page", 1],
  ["limit", 10],
]);


const SearchTables = ({ onSelectItem = () => { }, type_search = 'groups' }) => {
  const [isNextPage, setIsNextPage] = useState(false);
  const [typeSearch, setTypeSearch] = useState(false);
  const [title, setTitle] = useState(null);
  const [headers, setHeaders] = useState([]);

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [listPermissions, setListPermissions] = useState([]);

  useEffect(() => {
    setTypeSearch(type_search);
    if (type_search !== "groups") {
      setHeaders(["Id", "Nombre operación"])
      setTitle("Buscar Tipos Operaciones")
    }
    else {
      setHeaders(["Id del grupo", "Nombre del grupo", "Tipo"])
      setTitle("Buscar grupos")
    }
  }, [type_search]);

  const [fetchCommerce] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setListPermissions(data?.obj?.results ?? []);
      setIsNextPage(data?.obj?.next_exist ?? false);
    }, []),
    onError: useCallback((error) => {
      if (error instanceof ErrorPDPFetch) {
        notifyError(error?.message ?? "Error");
      }
      else if (!(error instanceof DOMException)) {
        notifyError("Error al cargar Datos ");
      }
    }, []),
  });


  const searchPermisions = useCallback(() => {
    const url = typeSearch === 'groups' ? getListPermissions() : getListTypeOperations();
    const tempMap = new Map(searchFilters);
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchCommerce(`${url}?${queries}`);

  }, [searchFilters, fetchCommerce, typeSearch]);

  useEffect(() => {
    searchPermisions();
  }, [searchPermisions]);


  return (
    <Fragment>
      <DataTable
        title={title}
        headers={headers}
        data={listPermissions.map(
          typeSearch === 'groups' ?
            ({
              pk_permiso_broker, nombre_grupo, tipo_grupo,
            }) => ({
              pk_permiso_broker, nombre_grupo, tipo_grupo,
            }) :
            ({
              id_tipo_op, nombre_operacion
            }) => ({
              id_tipo_op, nombre_operacion
            })
        )}
        onClickRow={(_, index) => {
          onSelectItem(listPermissions[index])
        }}
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={10}
              onChangeLimit={(limit) => {
                setSingleFilter("limit", limit);
                setSingleFilter("page", 1)
              }}
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setSingleFilter("page", (oldPage) =>
                  isNextPage ? oldPage + 1 : oldPage
                )
              }
              onClickPrev={(_) =>
                setSingleFilter("page", (oldPage) =>
                  oldPage > 1 ? oldPage - 1 : oldPage
                )
              }
            />
          </Fragment>
        }
        onChange={(ev) => {
          setSearchFilters((old) => {
            const copy = new Map(old)
              .set(
                ev.target.name, ev.target.value
              )
              .set("page", 1);
            return copy;
          })
        }}
      >
        <Fragment>
          {type_search === "groups" ?
            (
              <>
                <Input
                  id="pk_permiso_broker"
                  name="pk_permiso_broker"
                  label={"Id de grupo"}
                  type="tel"
                  onChange={(ev) => { ev.target.value = onChangeNumber(ev); }}
                  maxLength={10}
                  autoComplete="off"
                />
                <Input
                  id="nombre_grupo"
                  name="nombre_grupo"
                  label={"Nombre del grupo"}
                  type="text"
                  maxLength={60}
                  autoComplete="off"
                />
              </>
            ) : (
              <>
                <Input
                  id="id_tipo_op"
                  name="id_tipo_op"
                  label={"Id"}
                  type="tel"
                  onChange={(ev) => { ev.target.value = onChangeNumber(ev); }}
                  maxLength={10}
                  autoComplete="off"
                />
                <Input
                  id="nombre_operacion"
                  name="nombre_operacion"
                  label={"Nombre de operación"}
                  type="text"
                  maxLength={60}
                  autoComplete="off"
                />
              </>
            )}
        </Fragment>
      </DataTable>
    </Fragment>
  );
};

export default SearchTables;
