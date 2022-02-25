import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import {
  fetchComissions,
  putComissions,
} from "../../utils/fetchRevalComissions";
import { fetchConveniosUnique } from "../../utils/fetchRevalConvenios";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import FormComission from "../FormComission/FormComission";
import Button from "../../../../components/Base/Button/Button";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import {
  fetchComisionesPagar,
  putComisionesPagar,
} from "../../utils/fetchComisionesPagar";
import {
  fetchComisionesCobrar,
  putComisionesCobrada,
} from "../../utils/fetchComisionesCobrar";

const EditComission = () => {
  const navigate = useNavigate();

  const [
    {
      id_comision_pagada,
      id_comision_cobrada,
      id_tipo_trx,
      comercios_id_comercio,
      convenios_id_convenio,
      autorizador_id_autorizador,
      nombre_autorizador,
    },
    setQuery,
  ] = useQuery();

  const [editedComission, setEditedComission] = useState(null);
  const [labelInputs, setLabelInputs] = useState([]);
  const [comissions, setComissions] = useState([]);

  // const argsCom = useMemo(() => {
  //   let args = {};
  //   if (id_tipo_trx) {
  //     args = { ...args, id_tipo_trx };
  //   }
  //   if (comercios_id_comercio) {
  //     args = { ...args, comercios_id_comercio };
  //   }
  //   if (convenios_id_convenio) {
  //     args = { ...args, convenios_id_convenio };
  //   }
  //   if (autorizador_id_autorizador) {
  //     args = { ...args, autorizador_id_autorizador };
  //   }
  //   return Object.keys(args).length > 0 ? args : null;
  // }, [
  //   id_tipo_trx,
  //   comercios_id_comercio,
  //   convenios_id_convenio,
  //   autorizador_id_autorizador,
  // ]);

  // const consultLabels = useCallback(async () => {
  //   try {
  //     let inputs = [];
  //     if (convenios_id_convenio) {
  //       const resConv = await fetchConveniosUnique(convenios_id_convenio);
  //       inputs.push(["Convenio", resConv?.results?.[0]?.nombre_convenio]);
  //     }
  //     if (comercios_id_comercio) {
  //       inputs.push(["Comercio", comercios_id_comercio]);
  //     }
  //     if (nombre_autorizador) {
  //       inputs.push(["Autorizador", nombre_autorizador]);
  //     }
  //     return inputs;
  //   } catch (err) {
  //     console.error(err);
  //     return [];
  //   }
  // }, [comercios_id_comercio, convenios_id_convenio, nombre_autorizador]);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = editedComission?.ranges?.length === 0;

      if (errRang) {
        notifyError("Se debe agregar al menos una comision");
        return;
      }

      editedComission?.ranges.reduce((prev, curr, indexR) => {
        if (prev?.["Rango maximo"] > curr?.["Rango minimo"]) {
          notifyError(`El rango maximo de un rango comision no puede 
          ser mayor al rango minimo del siguiente 
          rango de comision (Rango ${indexR} - Rango ${indexR + 1})`);
          errRang = true;
        }
        return curr;
      });

      if (errRang) {
        return;
      }
      if (id_comision_pagada) {
        putComisionesPagar(
          { id_comision_pagada },
          {
            comisiones: {
              ...editedComission,
              ranges: editedComission?.ranges.map(
                ({
                  "Rango minimo": Minimo,
                  "Rango maximo": Maximo,
                  "Comision porcentual": Porcentaje,
                  "Comision fija": Fija,
                }) => {
                  return {
                    Minimo,
                    Maximo: !Maximo ? -1 : Maximo,
                    Porcentaje: Porcentaje / 100,
                    Fija,
                  };
                }
              ),
            },
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              navigate(-1, { replace: true });
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else if (id_comision_cobrada) {
        putComisionesCobrada(
          { id_comision_cobrada },
          {
            comisiones: {
              ...editedComission,
              ranges: editedComission?.ranges.map(
                ({
                  "Rango minimo": Minimo,
                  "Rango maximo": Maximo,
                  "Comision porcentual": Porcentaje,
                  "Comision fija": Fija,
                }) => {
                  return {
                    Minimo,
                    Maximo: !Maximo ? -1 : Maximo,
                    Porcentaje: Porcentaje / 100,
                    Fija,
                  };
                }
              ),
            },
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              navigate(-1, { replace: true });
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      }
    },
    [editedComission, navigate, id_comision_pagada, id_comision_cobrada]
  );

  // useEffect(() => {
  //   if (argsCom) {
  //     let args = { ...argsCom };
  //     fetchComissions(args)
  //       .then((res) => {
  //         setEditedComission(res?.results);
  //         if (res?.info === "comisiónXconvenio") {
  //           if (args?.comercios_id_comercio) {
  //             delete args.comercios_id_comercio;
  //             setQuery(args, { replace: true }, ["comercios_id_comercio"]);
  //           }
  //         }
  //       })
  //       .catch((err) => console.error(err));
  //   }
  // }, [argsCom, setQuery]);

  // useEffect(() => {
  //   consultLabels().then((res) => setLabelInputs(res));
  // }, [consultLabels]);
  useEffect(() => {
    if (id_comision_pagada) {
      fecthComisionesPagarFunc();
    } else if (id_comision_cobrada) {
      fecthComisionesCobrarFunc();
    }
  }, []);

  const fecthComisionesPagarFunc = () => {
    fetchComisionesPagar({ id_comision_pagada })
      .then((res) => {
        setComissions(res?.results);
        setEditedComission({
          type: res?.results[0]?.comisiones?.type,
          ranges: res?.results?.[0]?.comisiones?.ranges?.map(
            ({ Fija, Maximo, Minimo, Porcentaje }) => {
              return {
                "Rango minimo": Minimo,
                "Rango maximo": Maximo === -1 ? "" : Maximo,
                "Comision porcentual": parseFloat(Porcentaje * 100),
                "Comision fija": parseFloat(Fija),
              };
            }
          ),
        });
        // setEditedComission(res?.results?.[0].comisiones);
        console.log(res);
      })
      .catch((err) => console.error(err));
  };
  const fecthComisionesCobrarFunc = () => {
    fetchComisionesCobrar({
      id_comision_cobrada,
    })
      .then((res) => {
        setComissions(res?.results);
        setEditedComission({
          type: res?.results[0]?.comisiones?.type,
          ranges: res?.results?.[0]?.comisiones?.ranges?.map(
            ({ Fija, Maximo, Minimo, Porcentaje }) => {
              return {
                "Rango minimo": Minimo,
                "Rango maximo": Maximo === -1 ? "" : Maximo,
                "Comision porcentual": parseFloat(Porcentaje * 100),
                "Comision fija": parseFloat(Fija),
              };
            }
          ),
        });
        // setEditedComission(res?.results?.[0].comisiones);
        console.log(res);
      })
      .catch((err) => console.error(err));
  };
  return (
    <Fragment>
      <Form grid>
        {id_comision_pagada && (
          <Fragment>
            <h1 className='text-3xl'>Editando comisiones a pagar:</h1>
            {comissions?.[0]?.["nombre_convenio"] && (
              <Input
                id='Nombre convenio'
                name='Nombre convenio'
                type={"text"}
                autoComplete='off'
                label={"Nombre convenio"}
                value={comissions?.[0]?.["nombre_convenio"]}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["nombre_operacion"] && (
              <Input
                id='Nombre operacion'
                name='Nombre operacion'
                type={"text"}
                label={"Nombre transaccion"}
                autoComplete='off'
                value={comissions?.[0]?.["nombre_operacion"]}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["id_comercio"] && (
              <Input
                id='Id comercio'
                name='Id comercio'
                type={"number"}
                label={"Id comercio"}
                autoComplete='off'
                value={comissions?.[0]?.["id_comercio"]}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["fecha_inicio"] && (
              <Input
                id='Fecha inicio'
                name='Fecha inicio'
                type={"text"}
                label={"Fecha inicio"}
                autoComplete='off'
                value={Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(
                  new Date(comissions?.[0]?.["fecha_inicio"]).setHours(
                    new Date(comissions?.[0]?.["fecha_inicio"]).getHours()
                  )
                )}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["fecha_fin"] && (
              <Input
                id='Fecha_fin'
                name='Fecha_fin'
                type={"text"}
                label={"Fecha_fin"}
                autoComplete='off'
                value={Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(
                  new Date(comissions?.[0]?.["fecha_fin"]).setHours(
                    new Date(comissions?.[0]?.["fecha_fin"]).getHours()
                  )
                )}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["estado"] && (
              <Input
                id='Estado'
                name='Estado'
                type={"text"}
                label={"Estado"}
                autoComplete='off'
                value={comissions?.[0]?.["estado"] ? "Activo" : "Inactivo"}
                readOnly
                disabled
              />
            )}
          </Fragment>
        )}
        {id_comision_cobrada && (
          <Fragment>
            <h1 className='text-3xl'>Editando comisiones a cobrar:</h1>
            {comissions?.[0]?.["nombre_autorizador"] && (
              <Input
                id='Autorizador'
                name='Autorizador'
                type={"text"}
                label={"Autorizador"}
                autoComplete='off'
                value={comissions?.[0]?.["nombre_autorizador"]}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["nombre_convenio"] && (
              <Input
                id='Nombre convenio'
                name='Nombre convenio'
                type={"text"}
                autoComplete='off'
                label={"Nombre convenio"}
                value={comissions?.[0]?.["nombre_convenio"]}
                readOnly
                disabled
              />
            )}

            {comissions?.[0]?.["nombre_operacion"] && (
              <Input
                id='Nombre operacion'
                name='Nombre operacion'
                type={"text"}
                label={"Nombre transaccion"}
                autoComplete='off'
                value={comissions?.[0]?.["nombre_operacion"]}
                readOnly
                disabled
              />
            )}
            {comissions?.[0]?.["estado"] && (
              <Input
                id='Estado'
                name='Estado'
                type={"text"}
                label={"Estado"}
                autoComplete='off'
                value={comissions?.[0]?.["estado"] ? "Activo" : "Inactivo"}
                readOnly
                disabled
              />
            )}
          </Fragment>
        )}
      </Form>
      <h1 className='text-3xl'>Comision</h1>
      <FormComission
        outerState={[editedComission, setEditedComission]}
        onSubmit={onSubmit}>
        <Button type='submit'>Actualizar rangos</Button>
      </FormComission>
    </Fragment>
  );
};

export default EditComission;
