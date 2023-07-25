import { Fragment, useCallback, useEffect, useState } from "react";
import DataTable from "../../../../components/Base/DataTable";
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../../hooks/useFetchDispatchDebounce";
import { notifyError } from "../../../../utils/notify";
import useMap from "../../../../hooks/useMap";
import Input from "../../../../components/Base/Input";
import { getListPermissions } from "../../utils/fecthBrokerComercios";

const initialSearchFilters = new Map([
  ["id_grupo", ""],
  ["nombre_grupo", ""],
  ["page", 1],
  ["limit", 10],
]);


const SearchTables = ({ onSelectItem = () => { } }) => {
  const [isNextPage, setIsNextPage] = useState(false);

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [listPermissions, setListPermissions] = useState([]);


  const [fetchCommerce] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      console.log(data?.obj?.results ?? [])
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
    const url = getListPermissions();
    const tempMap = new Map(searchFilters);
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchCommerce(`${url}?${queries}`);

  }, [searchFilters, fetchCommerce]);

  useEffect(() => {
    searchPermisions();
  }, [searchPermisions]);


  return (
    <Fragment>
      <DataTable
        title="Buscar grupos"
        headers={["Id del permiso", "Tipo de transaccion","Nombre del grupo"]}
        data={listPermissions.map(
          ({
            pk_permiso_broker,
            tipo_trx,
            nombre_grupo_broker,
          }) => ({
            pk_permiso_broker,
            tipo_trx,
            nombre_grupo_broker,
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
          <Input
            id="id_group"
            name="id_grupo"
            label={"Id de grupo"}
            type="tel"
            maxLength={10}
            autoComplete="off"
          />
          <Input
            id="name_group"
            name="nombre_grupo"
            label={"Nombre de grupo"}
            type="text"
            maxLength={60}
            autoComplete="off"
          />
        </Fragment>
      </DataTable>
    </Fragment>
  );
};

export default SearchTables;
