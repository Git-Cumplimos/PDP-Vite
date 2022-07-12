import { Fragment, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  const [dtlCupo, setDtlCupo] = useState(null);
  const [cupoComer, setCupoComer] = useState(null);
  const [loadDocument, crearData] = useFetch(PeticionDescargar);
  const [idComercio, setIdComercio] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const navegateValid = useNavigate();
  const { roleInfo } = useAuth();

  useEffect(() => {
    setIdComercio(roleInfo?.id_comercio);
  }, [idComercio]);

  useEffect(() => {
    getConsultaCupoComercio(idComercio, page, limit)
      .then((objUdusrio) => {
        setCupoComer(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
        notifyError("Error al cargar Datos ");
      });
  }, [idComercio, page, limit]);

  const onChange = useCallback((ev) => {
    if (ev.target.name === "idCliente") {
      setIdComercio(ev.target.value);
    }
  }, []);

  const onSubmitDownload = useCallback(
    (e) => {
      e.preventDefault();
      console.log(cupoComer?.results.length);
      console.log(idComercio);
      if (cupoComer?.results.length > 0) {
        console.log(idComercio);
        if (idComercio == "") {
          notifyError("No se puede descargar reporte falta ID comercio");
        } else {
          // PeticionDescargar("");
          crearData(`?pk_id_comercio=${idComercio}`);
        }
      } else {
        notifyError("Id de comercio no existe");
      }
    },
    [idComercio, cupoComer]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta cupo comercio</h1>
      <Form onChange={onChange} grid>
        {roleInfo?.id_comercio ? (
          ""
        ) : (
          <Input
            id="idCliente"
            name="idCliente"
            label="Id cliente"
            type="number"
            autoComplete="off"
            minLength={"10"}
            maxLength={"10"}
            // value={}
            onInput={() => {}}
            required
          />
        )}
      </Form>
      <TableEnterprise
        title="Cupo Comercios"
        headers={["Id comercio", "Cupo Limite", "Deuda Cupo", "Cupo en Canje"]}
        data={
          cupoComer?.results.map(
            ({ pk_id_comercio, limite_cupo, deuda, cupo_en_canje }) => ({
              pk_id_comercio,
              limite_cupo: formatMoney.format(limite_cupo),
              deuda: formatMoney.format(deuda),
              cupo_en_canje: formatMoney.format(cupo_en_canje),
            })
          ) ?? []
        }
        onSelectRow={(e, i) => {
          navegateValid(
            `/cupo/cupo-comercio/detalles-cupo/${cupoComer?.results[i].pk_id_comercio}`
          );
        }}
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={cupoComer?.maxPages}
      ></TableEnterprise>
      <ButtonBar className={"lg col-span-2"}>
        <Button
          type={"submit"}
          disabled={loadDocument}
          onClick={onSubmitDownload}
        >
          Descargar reporte
        </Button>
      </ButtonBar>
    </Fragment>
  );
};

export default CupoComer;
