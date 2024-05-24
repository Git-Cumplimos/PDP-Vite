import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notifyError } from "../../../utils/notify";
import { PeticionDescargar } from "../utils/fetchCupo";
import { getConsultaComercios } from "../utils/fetchFunctions";
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../hooks/useMap";

const initialSearchFilters = new Map([
  ["pk_id_comercio", ""],
  ["nombre_comercio", ""],
  ["page", 1],
  ["limit", 10],
]);

const CupoComer = () => {
  const [cupoComer, setCupoComer] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [loadDocument, crearData] = useFetch(PeticionDescargar);
  const [idComercio, setIdComercio] = useState(null);
  const [nombreComercio, setNombreComercio] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const { roleInfo } = useAuth();

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      if (res?.obj?.results?.maxElems === 0) {
        notifyError("No se encontraron registros");
        return;
      }
      setCupoComer(res?.obj?.results?.results ?? []);
      setMaxPages(res?.obj?.results?.maxPages ?? 0);
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

  const searchCupoComercio = useCallback(() => {
    setSingleFilter("pk_id_comercio", idComercio ?? "");
    setSingleFilter("nombre_comercio", nombreComercio ?? "")
    setSingleFilter("page", (old) => page ?? old);
    setSingleFilter("limit", (old) => limit ?? old)
    const tempMap = new Map(searchFilters);
    const url = getConsultaComercios()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  },
    [
      page,
      limit,
      idComercio,
      nombreComercio,
      searchFilters,
      setSingleFilter,
      fetchTrxs,
    ]
  );

  useEffect(() => {
    setIdComercio(roleInfo?.id_comercio ?? "");
    // setNombreComercio(roleInfo?.["nombre comercio"] ?? "");
  }, [roleInfo]);

  useEffect(() => {
    searchCupoComercio();
  }, [searchCupoComercio]);

  const onChangeId = useCallback((ev, id_input) => {
    const formData = new FormData(ev.target.form);

    const onChangeInput = formData.get(id_input) ?? ""
    if (id_input === "Id comercio") setIdComercio((onChangeInput.match(/\d/g) ?? []).join(""))
    if (id_input === "nombre_comercio") setNombreComercio(onChangeInput);
  }, []);

  const onSubmitDownload = useCallback(
    (e) => {
      e.preventDefault();
      if (cupoComer?.length > 0) {
        // if (idComercio === "") {
        //   notifyError("No se puede descargar reporte falta ID comercio");
        // } else {
        crearData(idComercio ? `?pk_id_comercio=${idComercio}` : "");
        // }
      } else {
        notifyError("Id de comercio no existe");
      }
    },
    [idComercio, cupoComer, crearData]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta cupo comercio</h1>
      <TableEnterprise
        title="Cupo comercios"
        headers={["Id comercio", "Nombre comercio", "Sobregiro", "Base caja", "Dias sobregiro"]}
        data={
          cupoComer?.map(
            ({
              pk_id_comercio,
              nombre_comercio,
              sobregiro,
              base_caja,
              dias_transcurridos,
            }) => ({
              pk_id_comercio,
              nombre_comercio: nombre_comercio ?? "",
              sobregiro: formatMoney.format(sobregiro),
              base_caja: formatMoney.format(base_caja),
              dias_transcurridos
            })
          ) ?? []
        }
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        children={null}
        maxPage={maxPages}
      >
        {roleInfo?.id_comercio ? (
          ""
        ) : (
          <>
            <Input
              id="idCliente"
              name="Id comercio"
              label="Id comercio"
              type="text"
              autoComplete="off"
              minLength={"0"}
              maxLength={"10"}
              value={idComercio ?? ""}
              onChange={(ev) => onChangeId(ev, "Id comercio")}
              required
            />
            <Input
              id="nombre_comercio"
              name="nombre_comercio"
              label="Nombre comercio"
              type="text"
              value={nombreComercio ?? ""}
              autoComplete="off"
              minLength={"0"}
              maxLength={"30"}
              onChange={(ev) => onChangeId(ev, "nombre_comercio")}
              required
            />
          </>
        )}
      </TableEnterprise>
      <Form>
        <ButtonBar className={"lg col-span-2"}>
          <Button
            type={"submit"}
            disabled={loadDocument}
            onClick={onSubmitDownload}
          >
            Descargar reporte
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default CupoComer;
