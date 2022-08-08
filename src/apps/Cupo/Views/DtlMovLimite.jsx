import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import { getConsultaAsignacionCupoLimite } from "../utils/fetchCupo";

const DtlMovLimite = () => {
  const { roleInfo } = useAuth();
  const [idComercio, setIdComercio] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [asigLimite, setAsigLimite] = useState(null);

  const onChangeId = useCallback((ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
  }, []);
  useEffect(() => {
    getConsultaAsignacionCupoLimite(roleInfo?.id_comercio ?? idComercio, page, limit)
      .then((objUdusrio) => {
        setAsigLimite(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
        notifyError("Error al cargar Datos ");
      });
  }, [roleInfo?.id_comercio, idComercio, limit, page]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Detalle límite cupo comercio</h1>
      {!roleInfo?.id_comercio ? (
        <Form grid onSubmit={onChangeId}>
          <Input
            id="idCliente"
            name="Id comercio"
            label="Id comercio"
            type="text"
            autoComplete="off"
            minLength={"0"}
            maxLength={"10"}
          />
          <ButtonBar>
            <Button type={"submit"} name="buscarComercio">
              Buscar comercio
            </Button>
          </ButtonBar>
        </Form>
      ) : (
        ""
      )}
      <TableEnterprise
        title="Historial cupo límite del comercio"
        headers={[
          "Id comercio",
          "Valor afectación",
          "Fecha afectación",
          "Límite de Cupo",
          "Usuario",
        ]}
        data={
          asigLimite?.results.map(
            ({
              fk_id_comercio,
              valor_afectacion,
              fecha,
              limite_cupo_dsp_afectacion,
              usuario,
            }) => ({
              fk_id_comercio,
              valor_afectacion: formatMoney.format(valor_afectacion),
              fecha,
              limite_cupo_dsp_afectacion: formatMoney.format(
                limite_cupo_dsp_afectacion
              ),
              usuario,
            })
          ) ?? []
        }
        onSelectRow={(e, i) => {}}
        onSetPageData={(pagedata) => {
          setPage(pagedata.page);
          setLimit(pagedata.limit);
        }}
        maxPage={asigLimite?.maxPages ?? 0}
      ></TableEnterprise>
    </Fragment>
  );
};

export default DtlMovLimite;
