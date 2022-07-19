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
  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };
  const { roleInfo } = useAuth();

  // useEffect(() => {
  //   tablalimitecupo(idComercio, page, limit);
  // }, [idComercio, page, limit, cupoComer]);

  useEffect(() => {
    if (cupoComer?.results.length === 0) {
      notifyError("ID de comercio incorrecto");
    }
  }, [cupoComer]);

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
      if (e.nativeEvent.submitter.name === "AsignarLimiteCupo") {
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
      }
    },
    [idComercio, valor, limit, roleInfo.id_usuario, page]
  );
  const onMoneyChange = useCallback((e, valor) => {
    setValor(valor);
  }, []);
  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      if (e.nativeEvent.submitter.name === "buscarComercio") {
        getConsultaCupoComercio(idComercio)
          .then((objUdusrio) => {
            setCupoComer(objUdusrio);
            tablalimitecupo(idComercio, page, limit);
          })
          .catch((reason) => {
            notifyError("Error al cargar Datos ");
          });
      }
    },
    [idComercio, cupoComer, page, limit]
  );
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Modificación límite de cupo</h1>
      <Form onChange={onChange} onSubmit={onSubmitComercio} grid>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="number"
          autoComplete="off"
          onInput={() => {}}
          required
        />
        <ButtonBar>
          <Button type={"submit"} name="buscarComercio">
            Buscar comercio
          </Button>
        </ButtonBar>
      </Form>
      {cupoComer?.results.length === 1 ? (
        <Fragment>
          <Form onSubmit={onSubmitDeposit} grid>
            <MoneyInput
              id="cupo_limite"
              name="cupo_limite"
              label="Límite de cupo"
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
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
              <Button type={"submit"} name="AsignarLimiteCupo">
                Asignar límite cupo
              </Button>
            </ButtonBar>
          </Form>
          <TableEnterprise
            title="Cupo Comercios"
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
            maxPage={asigLimite?.maxPages}
          ></TableEnterprise>
        </Fragment>
      ) : (
        // <h1 className="text-3xl mt-6">Ingrese un Id de comercio existente</h1>
        // notifyError("Id de comercio no existe")
        ""
      )}
    </Fragment>
  );
};

export default ModifiLimiteCanje;
