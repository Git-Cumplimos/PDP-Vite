import { Fragment, useCallback, useEffect, useState } from "react";
import Input from "../../../components/Base/Input";
import { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import { getConsultaAsignacionCupoLimite } from "../utils/fetchFunctions";
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../hooks/useMap";
import Select from "../../../components/Base/Select/Select";

const initialSearchFilters = new Map([
  ["fk_id_comercio", ""],
  ["nombre_comercio", ""],
  ["page", 1],
  ["limit", 10],
  ["sortDir", "DESC"],
]);

const options_select = [
  { value: "DESC", label: "Descendente" },
  { value: "ASC", label: "Ascendente" },
];

const DtlMovLimite = () => {
  const { roleInfo } = useAuth();
  const [idComercio, setIdComercio] = useState(null);
  const [nombreComercio, setNombreComercio] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [asigLimite, setAsigLimite] = useState(null);
  const [searchFilters, { set: setSingleFilter }] = useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      if (res?.obj?.results?.maxElems === 0) {
        notifyError("No se encontraron registros");
        return;
      }
      setAsigLimite(res?.obj ?? []);
    }, []),
    onError: useCallback((error) => {
      if (error instanceof ErrorPDPFetch) {
        notifyError(error.message);
      }
      else if (!(error instanceof DOMException)) {
        notifyError("Error al cargar Datos ");
      }
    }, []),
  }, { delay: 2000 });

  const searchDetallesMovimientos = useCallback(() => {
    setSingleFilter("fk_id_comercio", roleInfo?.id_comercio ?? idComercio ?? "");
    setSingleFilter("nombre_comercio", nombreComercio ?? "")
    setSingleFilter("page", (old) => page ?? old);
    setSingleFilter("limit", (old) => limit ?? old)
    const tempMap = new Map(searchFilters);
    const url = getConsultaAsignacionCupoLimite()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  }, [
    roleInfo?.id_comercio,
    idComercio,
    nombreComercio,
    limit,
    page,
    searchFilters,
    setSingleFilter,
    fetchTrxs
  ]);

  useEffect(() => {
    setIdComercio(roleInfo?.id_comercio ?? "");
  }, [roleInfo?.id_comercio]);

  useEffect(() => {
    searchDetallesMovimientos();
  }, [searchDetallesMovimientos]);

  const onChangeId = useCallback((ev, id_input) => {
    const formData = new FormData(ev.target.form);

    const onChangeInput = formData.get(id_input) ?? ""
    if (id_input === "id_comercio") {
      setIdComercio((onChangeInput.match(/\d/g) ?? []).join(""))
    }
    if (id_input === "nombre_comercio") setNombreComercio(onChangeInput);
    if (id_input === "orden") setSingleFilter("sortDir", (old) => onChangeInput ?? old)

  }, [setSingleFilter]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Detalle modificación cupo comercio</h1>
      <TableEnterprise
        title="Historial modificación cupo del comercio"
        headers={[
          "Id comercio",
          "Nombre comercio",
          "Usuario",
          "Sobregiro",
          "Base de caja",
          "Dias máximos sobregiro",
          "Fecha afectación",
        ]}
        data={
          asigLimite?.results.map(
            ({
              fk_id_comercio,
              nombre_comercio,
              usuario,
              sobregiro,
              base_caja,
              dias_max_sobregiro,
              fecha,
            }) => ({
              fk_id_comercio,
              nombre_comercio: nombre_comercio ?? "",
              usuario,
              sobregiro: formatMoney.format(sobregiro),
              base_caja: formatMoney.format(base_caja),
              dias_max_sobregiro: dias_max_sobregiro ?? 0,
              fecha,
            })
          ) ?? []
        }
        onSelectRow={(e, i) => { }}
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={asigLimite?.maxPages ?? 0}
      >
        {!roleInfo?.id_comercio && (
          <>
            <Input
              id="id_comercio"
              name="id_comercio"
              label="Id comercio"
              type="text"
              autoComplete="off"
              value={idComercio ?? ""}
              minLength={"0"}
              maxLength={"10"}
              onChange={(ev) => onChangeId(ev, "id_comercio")}
            />
            <Input
              id="nombre_comercio"
              name="nombre_comercio"
              label="Nombre comercio"
              type="text"
              autoComplete="off"
              value={nombreComercio ?? ""}
              minLength={"0"}
              maxLength={"30"}
              onChange={(ev) => onChangeId(ev, "nombre_comercio")}
            />
            <Select
              id="orden"
              name="orden"
              label="Orden"
              options={options_select}
              onChange={(ev) => onChangeId(ev, "orden")}
              value={searchFilters?.sortDir}
            />
          </>
        )
        }

      </TableEnterprise>
    </Fragment>
  );
};

export default DtlMovLimite;
