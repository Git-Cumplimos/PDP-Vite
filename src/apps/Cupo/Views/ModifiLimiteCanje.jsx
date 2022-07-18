import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import {
  getConsultaAsignacionCupoLimite,
  getConsultaCupoComercio,
  postDtlCambioLimiteCanje,
} from "../utils/fetchCupo";

const ModifiLimiteCanje = () => {
  const [cupoComer, setCupoComer] = useState(null);
  const [valor, setValor] = useState(null);
  const [idComercio, setIdComercio] = useState(null);
  const [asigLimite, setAsigLimite] = useState(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const { roleInfo } = useAuth();

  useEffect(() => {
    getConsultaCupoComercio(idComercio)
      .then((objUdusrio) => {
        setCupoComer(objUdusrio);
      })
      .catch((reason) => {
        notifyError("Error al cargar Datos ");
      });
    tablalimitecupo(idComercio, page, limit);
  }, [idComercio, page, limit]);

  const tablalimitecupo = (idComercio, page, limit) => {
    getConsultaAsignacionCupoLimite(idComercio, page, limit)
      .then((objUdusrio) => {
        setAsigLimite(objUdusrio);
      })
      .catch((reason) => {
        console.log(reason.message);
        notifyError("Error al cargar Datos ");
      });
  };

  const onChange = useCallback((ev) => {
    // if (ev.target.name === "valor") {
    //   setValor(ev.target.value);
    // } else
    if (ev.target.name === "Id comercio") {
      setIdComercio(ev.target.value);
    }
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      const body = {
        fk_id_comercio: idComercio,
        valor_afectacion: valor,
        usuario: roleInfo.id_usuario,
      };
      postDtlCambioLimiteCanje(body)
        .then((res) => {
          if (!res?.status) {
            notifyError("Error al asignar límite de cupo");
            return;
          }
          notify("Modificacion exitosa");
          tablalimitecupo(idComercio, page, limit);
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al modificar cupo");
        });
    },
    [idComercio, valor, limit, roleInfo.id_usuario, page]
  );
  const onMoneyChange = useCallback((e, valor) => {
    setValor(valor);
  }, []);
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Asignación límite cupo</h1>
      <Form onChange={onChange} grid>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="number"
          autoComplete="off"
          // minLength={"10"}
          // maxLength={"10"}
          // value={""}
          onInput={() => {}}
          required
        />
        <ButtonBar></ButtonBar>
      </Form>
      {cupoComer?.results.length === 1 ? (
        <Fragment>
          <Form onSubmit={onSubmitDeposit} grid>
            <MoneyInput
              id="cupo_limite"
              name="cupo_limite"
              label="Límite de cupo"
              autoComplete="off"
              defaultValue={parseInt(cupoComer?.results[0].limite_cupo)}
              onInput={onMoneyChange}
              required
            />
            <MoneyInput
              id="deuda"
              name="deuda"
              label="Deuda del comercio"
              autoComplete="off"
              value={parseInt(cupoComer?.results[0].deuda)}
              required
            />
            <MoneyInput
              id="cupo_en_canje"
              name="cupo_en_canje"
              label="Cupo en canje"
              autoComplete="off"
              value={parseInt(cupoComer?.results[0].cupo_en_canje)}
              required
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"}>Asignar límite cupo</Button>
            </ButtonBar>
          </Form>
          <TableEnterprise
            title="Cupo Comercios"
            headers={[
              "Id comercio",
              "Valor Afectacion",
              "Fecha afectacion",
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
            maxPage={asigLimite?.maxPages}
          ></TableEnterprise>
        </Fragment>
      ) : (
        <h1 className="text-3xl mt-6">Ingrese un Id de comercio existente</h1>
        // notifyError("Id de comercio no existe")
      )}
    </Fragment>
  );
};

export default ModifiLimiteCanje;
