import { Fragment, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { notifyError } from "../../../utils/notify";
import { getConsultaCupoComercio } from "../utils/fetchCupo";
const CupoComer = () => {
  const [dtlCupo, setDtlCupo] = useState(null);
  const [cupoComer, setCupoComer] = useState(null);
  const [idComercio, setIdComercio] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const navegateValid = useNavigate();
  useEffect(() => {
    getConsultaCupoComercio(idComercio, page)
      .then((objUdusrio) => {
        setCupoComer(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
        notifyError("Error al cargar Datos ");
      });
  }, [idComercio, page]);

  const onChange = useCallback((ev) => {
    if (ev.target.name === "idCliente") {
      setIdComercio(ev.target.value);
    }
  }, []);

  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
  }, []);
  return (
    <div>
      <Fragment>
        <h1 className="text-3xl mt-6">Consulta cupo comercio</h1>
        <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
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
        </Form>

        <TableEnterprise
          title="Cupo Comercios"
          headers={[
            "Id comercio",
            "Cupo Limite",
            "Balance Cupo",
            "Cupo en Canje",
          ]}
          data={
            cupoComer?.results.map(
              ({
                pk_id_comercio,
                limite_cupo,
                balance_cupo,
                cupo_en_canje,
              }) => ({
                pk_id_comercio,
                limite_cupo: formatMoney.format(limite_cupo),
                balance_cupo: formatMoney.format(balance_cupo),
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
      </Fragment>
    </div>
  );
};

export default CupoComer;
