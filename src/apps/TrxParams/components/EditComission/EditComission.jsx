import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import FormComission from "../FormComission/FormComission";
import Button from "../../../../components/Base/Button";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import {
  fetchComisionesPagar,
  putComisionesPagar,
} from "../../utils/fetchComisionesPagar";
import {
  fetchComisionesCobrar,
  putComisionesCobrada,
} from "../../utils/fetchComisionesCobrar";
import ActiveSelect from "../../../../components/Base/ActiveSelect";

const EditComission = () => {
  const navigate = useNavigate();

  const [{ id_comision_pagada, id_comision_cobrada }, setQuery] = useQuery();

  const [editedComission, setEditedComission] = useState(null);
  const [comissions, setComissions] = useState({
    nombre_comision: "",
  });

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = editedComission?.ranges?.length === 0;

      if (errRang) {
        notifyError("Se debe agregar al menos una comision");
        return;
      }

      editedComission?.ranges.reduce((prev, curr, indexR) => {
        console.log(prev?.["Rango maximo"], curr?.["Rango minimo"]);
        if (prev?.["Rango maximo"] !== curr?.["Rango minimo"]) {
          notifyError(`El rango maximo debe ser igual al rango minimo siguiente 
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
            nombre_comision: comissions?.["nombre_comision"],
            estado: comissions?.["estado"],
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
            nombre_comision: comissions?.["nombre_comision"],
            estado: comissions?.["estado"],
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
    [
      editedComission,
      navigate,
      id_comision_pagada,
      id_comision_cobrada,
      comissions,
    ]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["nombre_comision"].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    setComissions((old) => ({
      ...old,
      ...Object.fromEntries(newData),
    }));
  }, []);
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
        setComissions(res?.results?.[0]);
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
      })
      .catch((err) => console.error(err));
  };
  const fecthComisionesCobrarFunc = () => {
    fetchComisionesCobrar({
      id_comision_cobrada,
    })
      .then((res) => {
        setComissions(res?.results?.[0]);
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
      <h1 className='text-3xl'>Editando comisiones a pagar:</h1>
      <Form onChange={onChangeNewComision} grid>
        <Input
          id='nombre_comision'
          name='nombre_comision'
          label={"Nombre comisión"}
          type={"text"}
          autoComplete='off'
          value={comissions?.["nombre_comision"]}
          onChange={() => {}}
        />
        {id_comision_pagada && (
          <Fragment>
            {comissions?.["nombre_convenio"] && (
              <Input
                id='Nombre convenio'
                name='Nombre convenio'
                type={"text"}
                autoComplete='off'
                label={"Nombre convenio"}
                value={comissions?.["nombre_convenio"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["nombre_operacion"] && (
              <Input
                id='Nombre operacion'
                name='Nombre operacion'
                type={"text"}
                label={"Nombre transaccion"}
                autoComplete='off'
                value={comissions?.["nombre_operacion"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["id_comercio"] && (
              <Input
                id='Id comercio'
                name='Id comercio'
                type={"number"}
                label={"Id comercio"}
                autoComplete='off'
                value={comissions?.["id_comercio"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["fecha_inicio"] && (
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
                  new Date(comissions?.["fecha_inicio"]).setHours(
                    new Date(comissions?.["fecha_inicio"] + "-5").getHours()
                  )
                )}
                readOnly
                disabled
              />
            )}
            {comissions?.["fecha_fin"] && (
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
                  new Date(comissions?.["fecha_fin"]).setHours(
                    new Date(comissions?.["fecha_fin"] + "-5").getHours()
                  )
                )}
                readOnly
                disabled
              />
            )}
            <ActiveSelect
              label='Estado comisión'
              value={comissions?.["estado"] ?? false}
              onChange={(e) => {
                setComissions((old) => ({
                  ...old,
                  estado: e,
                }));
              }}
            />
          </Fragment>
        )}
        {id_comision_cobrada && (
          <Fragment>
            {comissions?.["nombre_autorizador"] && (
              <Input
                id='Autorizador'
                name='Autorizador'
                type={"text"}
                label={"Autorizador"}
                autoComplete='off'
                value={comissions?.["nombre_autorizador"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["nombre_convenio"] && (
              <Input
                id='Nombre convenio'
                name='Nombre convenio'
                type={"text"}
                autoComplete='off'
                label={"Nombre convenio"}
                value={comissions?.["nombre_convenio"]}
                readOnly
                disabled
              />
            )}

            {comissions?.["nombre_operacion"] && (
              <Input
                id='Nombre operacion'
                name='Nombre operacion'
                type={"text"}
                label={"Nombre transaccion"}
                autoComplete='off'
                value={comissions?.["nombre_operacion"]}
                readOnly
                disabled
              />
            )}
            <ActiveSelect
              label='Estado comisión'
              value={comissions?.["estado"] ?? false}
              onChange={(e) => {
                setComissions((old) => ({
                  ...old,
                  estado: e,
                }));
              }}
            />
          </Fragment>
        )}
      </Form>
      <h1 className='text-3xl'>Comision</h1>
      <FormComission
        outerState={[editedComission, setEditedComission]}
        onSubmit={onSubmit}>
        <Button type='submit'>Actualizar comisión</Button>
      </FormComission>
    </Fragment>
  );
};

export default EditComission;
