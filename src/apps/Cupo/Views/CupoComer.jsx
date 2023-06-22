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
import {getConsultaComercios}  from "../utils/fetchFunctions";

const CupoComer = () => {
  const [cupoComer, setCupoComer] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [loadDocument, crearData] = useFetch(PeticionDescargar);
  const [idComercio, setIdComercio] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const { roleInfo } = useAuth();

  const searchCupoComercio = useCallback(
    (comercioId) => {
      getConsultaComercios({'pk_id_comercio':comercioId, 'page':page, 'limit':limit})
      .then((res) => {
        setCupoComer(res?.obj?.results?.results ?? []);
        setMaxPages(res?.obj?.results?.maxPages ?? 0);
      })
      .catch((reason) => {
        console.error(reason.message);
        notifyError("Error al cargar Datos ");
      });
    },
    [page, limit]
    );
    
    useEffect(() => {
      setIdComercio(roleInfo?.id_comercio ?? "");
      searchCupoComercio(roleInfo?.id_comercio ?? "");
    }, [roleInfo?.id_comercio, searchCupoComercio]);

  const onChangeId = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
  }, []);

  const onSubmitDownload = useCallback(
    (e) => {
      e.preventDefault();
      if (cupoComer?.length > 0) {
        // if (idComercio === "") {
        //   notifyError("No se puede descargar reporte falta ID comercio");
        // } else {
        crearData(idComercio ?`?pk_id_comercio=${idComercio}`:"");
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
      {roleInfo?.id_comercio ? (
        ""
      ) : cupoComer === [] ? (
        <Form grid>
          <Input
            id="idCliente"
            name="Id comercio"
            label="Id comercio"
            type="text"
            autoComplete="off"
            minLength={"0"}
            maxLength={"10"}
            value={idComercio ?? ""}
            onChange={onChangeId}
            onLazyInput={{
              callback: (ev) => searchCupoComercio(ev.target.value),
              timeOut: 500,
            }}
            required
          />
          <ButtonBar></ButtonBar>
        </Form>
      ):("")}

      <TableEnterprise
        title="Cupo comercios"
        headers={["Id comercio", "Sobregiro", "Base caja",]}
        data={
          cupoComer?.map(
            ({ 
              pk_id_comercio,
              limite_cupo,
              base_caja,
            }) => ({
              pk_id_comercio,
              limite_cupo: formatMoney.format(limite_cupo),
              base_caja
            }) 
          ) ?? []
        }
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={maxPages}
      ></TableEnterprise>
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
