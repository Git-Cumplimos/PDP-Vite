import { Fragment, useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";
import Input from "../../../../components/Base/Input";
import DataTable from "../../../../components/Base/DataTable";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../../hooks/useMap";
import { getUrlRetirosList } from "../../utils/fetchFunctions"
import { notifyError } from "../../../../utils/notify";
import { onChangeEan13Number } from "../../utils/functions";
import { onChangeNumber } from "../../../../utils/functions";

const initialSearchFilters = new Map([
  ["pk_id_convenio_directo", ""],
  ["ean13", ""],
  ["nombre_convenio", ""],
  ["estado", true],
  ["page", 1],
  ["limit", 10],
]);

const RetiroDirecto = () => {
  const navigate = useNavigate()
  const { roleInfo, pdpUser } = useAuth();

  const [listRetiro, setListRetiro] = useState([])
  const [isNextPage, setIsNextPage] = useState(false);
  const [searchFilters2, { setAll: setSearchFilters2, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setListRetiro(data?.obj?.results ?? []);
      setIsNextPage(data?.obj?.next_exist);
    }, []),
    onError: useCallback((error) => {
      if (!error instanceof DOMException) console.error(error)
    }, []),
  },{delay:2000});

  const searchTrxs = useCallback(() => {
    const tempMap = new Map(searchFilters2);
    const url = getUrlRetirosList()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  }, [fetchTrxs, searchFilters2]);

  const hasData = useMemo(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      return false;
    }
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
      "codigo_dane",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        return false;
      }
    }
    return true;
  },[roleInfo]);

  const validateCommerce = useCallback(() => {  
    if (!hasData) {
      notifyError(
        "El usuario no cuenta con datos de comercio, no se permite la transaccion"
      );
      navigate("/")
    }
  }, [roleInfo, navigate,hasData]);

  useEffect(() => {
    validateCommerce();
  },[validateCommerce])

  useEffect(() => {
    searchTrxs();
  }, [searchTrxs]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Retiros Directos</h1>
      <DataTable
        title="Convenios de Retiros"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
        ]}
        data={listRetiro.map(
          ({
            pk_id_convenio_directo,
            ean13,
            nombre_convenio,
          }) => ({
            pk_id_convenio_directo,
            ean13,
            nombre_convenio,
          })
        )}
        onClickRow={(_, index) => {
          if (listRetiro[index].estado) {
            if (listRetiro[index].fk_id_tipo_convenio !== 2) {
              navigate(`/recaudo-directo/consultar-retiro/retirar/${listRetiro[index].pk_id_convenio_directo}`)
            } else { notifyError("Error, convenio con autorizador esta en desarrollo!") }}
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
          setSearchFilters2((old) => {
            const copy = new Map(old)
              .set(
                ev.target.name, ev.target.value
              )
              .set("page", 1);
            return copy;
          })
        }}
      >
        <Input
          id={"pk_codigo_convenio"}
          label={"Código de convenio"}
          name={"pk_id_convenio_directo"}
          type="tel"
          maxLength={"4"}
          onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
          autoComplete="off"
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código EAN o IAC"}
          name={"ean13"}
          type="tel"
          autoComplete="off"
          maxLength={"13"}
          onInput={(ev) => { ev.target.value = onChangeEan13Number(ev); }}
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
      </DataTable>
    </Fragment>
  )
}

export default RetiroDirecto