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
import { getConsultaCupoComercio, PeticionDescargar } from "../utils/fetchCupo";

const CupoComer = () => {
  const [cupoComer, setCupoComer] = useState(null);
  const [loadDocument, crearData] = useFetch(PeticionDescargar);
  const [idComercio, setIdComercio] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const { roleInfo } = useAuth();

  const searchCupoComercio = useCallback(
    (comercioId) => {
      // const comercioId = idComercio || roleInfo?.id_comercio;
      getConsultaCupoComercio(comercioId, page, limit)
        .then((objUdusrio) => {
          setCupoComer(objUdusrio);
        })
        .catch((reason) => {
          console.log(reason.message);
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
      if (cupoComer?.results.length > 0) {
        if (idComercio === "") {
          notifyError("No se puede descargar reporte falta ID comercio");
        } else {
          // PeticionDescargar("");
          crearData(`?pk_id_comercio=${idComercio}`);
        }
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
      ) : (
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
      )}

      <TableEnterprise
        title="Cupo comercios"
        headers={["Id comercio", "Sobregiro", "Deuda Cupo", "Cupo en Canje","Base caja","Meta diaria"]}
        data={
          cupoComer?.results.map(
            ({ pk_id_comercio, limite_cupo, deuda, cupo_en_canje,base_caja,estado_diario }) => ({
              pk_id_comercio,
              limite_cupo: formatMoney.format(limite_cupo),
              deuda: formatMoney.format(deuda),
              cupo_en_canje: formatMoney.format(cupo_en_canje),
              base_caja,
              estado_diario: estado_diario ? "Realizada":"No realizada"
            })
          ) ?? []
        }
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={cupoComer?.maxPages}
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
