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
import {
  getComisionesPlanes,
  getComisionesPlanesUnique,
  putComisionesPlanes,
} from "../../utils/fetchComisionesPlanes";
import {
  getComisionesPlanesCampanas,
  getComisionesPlanesCampanaUnique,
  postComisionesPlanCampanas,
  putComisionesPlanesCampanas,
} from "../../utils/fetchComisionesPlanesCampanas";
import ActiveSelect from "../../../../components/Base/ActiveSelect";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const EditComission = () => {
  const navigate = useNavigate();

  const [
    {
      id_comision_pagada,
      id_comision_cobrada,
      id_plan_comision,
      id_plan_comision_campana,
    },
    setQuery,
  ] = useQuery();

  const [editedComission, setEditedComission] = useState(null);
  const [campaignStatus, setCampaignStatus] = useState(null);
  const [comissions, setComissions] = useState({
    nombre_comision: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      if (id_plan_comision) {
        putComisionesPlanes({
          pk_planes_comisiones: id_plan_comision,
          nombre_plan_comision: editedComission?.nombre_plan_comision,
          tipo_comision: editedComission?.["tipo_comision"],
          comisiones: {
            type: editedComission?.["type"],
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
        })
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              navigate(-1, { replace: true });
            } else {
              notifyError(res?.msg);
            }
            setIsUploading(false);
          })
          .catch((err) => {
            notifyError(err);
            setIsUploading(false);
            console.error(err);
          });
      } else if (id_plan_comision_campana) {
        if (campaignStatus) {
          console.log("edit campaign");
          putComisionesPlanesCampanas({
            id_plan_comision_campana: id_plan_comision_campana,
            nombre_plan_comision_campana:
              editedComission?.["nombre_plan_comision_campana"],
            fecha_inicio: editedComission?.["fecha_inicio"],
            fecha_final: editedComission?.["fecha_final"],
            pk_planes_comisiones_campanas: id_plan_comision_campana,
            comisiones_campanas: {
              // ...editedComission,
              type: comissions?.comisiones?.type,
              ranges: comissions?.comisiones?.ranges?.map(
                ({ Fija, Maximo, Minimo, Porcentaje }) => {
                  return {
                    Minimo: Minimo,
                    Maximo: Maximo === -1 ? "" : Maximo,
                    Porcentaje: parseFloat(Porcentaje * 100),
                    Fija: parseFloat(Fija),
                  };
                }
              ),
            },
          })
            .then((res) => {
              console.log(res);
              if (res?.status) {
                notify(res?.msg);
                navigate(-1, { replace: true });
              } else {
                notifyError(res?.msg);
              }
              setIsUploading(false);
            })
            .catch((err) => {
              notifyError(err);
              setIsUploading(false);
              console.error(err);
            });
        } else {
          postComisionesPlanCampanas({
            nombre_plan_comision_campana:
              editedComission?.["nombre_plan_comision_campana"],
            fecha_inicio: editedComission?.["fecha_inicio"],
            fecha_final: editedComission?.["fecha_final"],
            fk_planes_comisiones: id_plan_comision_campana,
            comisiones_campanas: {
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
          })
            .then((res) => {
              console.log(res);
              if (res?.status) {
                notify(res?.msg);
                navigate(-1, { replace: true });
              } else {
                notifyError(res?.msg);
              }
              setIsUploading(false);
            })
            .catch((err) => {
              notifyError(err);
              setIsUploading(false);
              console.error(err);
            });
        }
      }
    },
    [
      editedComission,
      navigate,
      id_plan_comision,
      id_plan_comision_campana,
      comissions,
    ]
  );

  const onChangeDates = (ev) => {
    const key = ev.target.name;
    const value = ev.target.value;
    setEditedComission((old) => ({
      ...old,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (id_plan_comision) {
      fetchPlanesComisiones();
    } else if (id_plan_comision_campana) {
      fetchPlanesComisionesCampana();
    }
  }, []);

  const onClickDelete = () => {
    console.log("delete", id_plan_comision);
  };

  const fetchPlanesComisiones = () => {
    getComisionesPlanesUnique({ id_plan_comision })
      .then((res) => {
        setComissions(res?.results?.[0]);
        setEditedComission({
          nombre_plan_comision: res?.results[0]?.nombre_plan_comision,
          tipo_comision: res?.results[0]?.tipo_comision,
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

  const fetchPlanesComisionesCampana = () => {
    getComisionesPlanesCampanaUnique({ id_plan_comision_campana })
      .then((res) => {
        setComissions(res?.results?.[0]);
        setEditedComission({
          nombre_plan_comision: res?.results?.[0]?.nombre_plan_comision,
          nombre_plan_comision_campana:
            res?.results?.[0]?.nombre_plan_comision_campana,
          fecha_inicio: res?.results?.[0]?.fecha_inicio,
          fecha_final: res?.results?.[0]?.fecha_final,
          type: res?.results[0]?.comisiones?.type
            ? res?.results[0]?.comisiones?.type
            : "",
          ranges:
            res?.results?.[0]?.comisiones?.ranges?.length > 0
              ? res?.results?.[0]?.comisiones?.ranges?.map(
                  ({ Fija, Maximo, Minimo, Porcentaje }) => {
                    return {
                      "Rango minimo": Minimo,
                      "Rango maximo": Maximo === -1 ? "" : Maximo,
                      "Comision porcentual": parseFloat(Porcentaje * 100),
                      "Comision fija": parseFloat(Fija),
                    };
                  }
                )
              : [],
        });
        if (res?.results?.[0]?.comisiones?.ranges?.length > 0) {
          console.log("edition");
          setCampaignStatus(true);
        } else {
          console.log("creation");
          setCampaignStatus(false);
        }
      })
      .catch((err) => console.error(err));
  };
  function dateIsValid(date) {
    return !Number.isNaN(new Date(date).getTime());
  }

  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>
        {id_comision_cobrada && "Editar comisión a cobrar"}
        {id_comision_pagada && "Editar comisión a pagar"}
        {id_plan_comision
          ? "Editar plan de comisión"
          : id_plan_comision_campana && !campaignStatus
          ? "Crear campaña"
          : id_plan_comision_campana && campaignStatus
          ? "Editar campaña"
          : ""}
      </h1>
      <Form grid>
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
        {id_plan_comision && (
          <>
            <Input
              id='id_plan_comision'
              name='id_plan_comision'
              label={"ID plan de comisión"}
              type={"text"}
              autoComplete='off'
              value={id_plan_comision}
              onChange={() => {}}
              readOnly
              disabled
            />
            <Input
              id='nombre_plan_comision'
              name='nombre_plan_comision'
              label={"Nombre plan de comisión"}
              type={"text"}
              autoComplete='off'
              value={editedComission?.nombre_plan_comision}
              onInput={(e) =>
                setEditedComission((old) => {
                  return { ...old, nombre_plan_comision: e.target.value };
                })
              }
            />
            <Select
              id='tipo_comision'
              name='tipo_comision'
              label='Tipo de comisión'
              options={{
                Cobrar: "COBRAR",
                Pagar: "PAGAR",
              }}
              value={editedComission?.tipo_comision}
              onInput={(e) =>
                setEditedComission((old) => {
                  return { ...old, tipo_comision: e.target.value };
                })
              }
              required
            />
            <Input
              id='fecha_creacion'
              name='fecha_creacion'
              label={"Fecha de creación"}
              type={"text"}
              autoComplete='off'
              value={
                dateIsValid(comissions?.["fecha_creacion"])
                  ? Intl.DateTimeFormat("es-CO", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }).format(
                      new Date(comissions?.["fecha_creacion"]).setHours(
                        new Date(
                          comissions?.["fecha_creacion"] + "-5"
                        ).getHours()
                      )
                    )
                  : "Sin fecha"
              }
              readOnly
              disabled
            />
            {/* <ButtonBar className="lg:col-span-2">
              <Button type="submit" onClick={onSubmitComission}>
                Actualizar comisión
              </Button>
            </ButtonBar> */}
          </>
        )}
        {id_plan_comision_campana && (
          <>
            <Input
              id='id_plan_comision'
              name='id_plan_comision'
              label={"ID plan de comisión"}
              type={"text"}
              autoComplete='off'
              value={id_plan_comision_campana}
              readOnly
              disabled
            />
            <Input
              id='nombre_plan_comision'
              name='nombre_plan_comision'
              label={"Nombre plan de comisión"}
              type={"text"}
              autoComplete='off'
              value={editedComission?.nombre_plan_comision}
              readOnly
              disabled
            />
            <Input
              id='nombre_plan_comision_campana'
              name='nombre_plan_comision_campana'
              label={"Nombre campaña"}
              type={"text"}
              autoComplete='off'
              value={editedComission?.nombre_plan_comision_campana}
            />
            <Input
              id='fecha_inicio'
              name='fecha_inicio'
              label={"Fecha de inicio"}
              type={"datetime-local"}
              autoComplete='off'
              onChange={onChangeDates}
              min='2022-01-01T00:00'
              max='2025-01-01T00:00'
              value={
                // to ISO string
                dateIsValid(editedComission?.["fecha_inicio"])
                  ? new Date(editedComission?.["fecha_inicio"])
                      .toISOString()
                      .split(".")[0]
                  : ""
              }
            />
            <Input
              id='fecha_final'
              name='fecha_final'
              label={"Fecha de fin"}
              type={"datetime-local"}
              autoComplete='off'
              onChange={onChangeDates}
              min='2022-01-01T00:00'
              max='2025-01-01T00:00'
              value={
                // to ISO string
                dateIsValid(editedComission?.["fecha_final"])
                  ? new Date(editedComission?.["fecha_final"])
                      .toISOString()
                      .split(".")[0]
                  : ""
              }
            />
          </>
        )}
      </Form>
      <h1 className='text-3xl'>Comisión</h1>
      <FormComission
        outerState={[editedComission, setEditedComission]}
        onSubmit={onSubmit}>
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>
            {id_comision_cobrada && "Actualizar comisión"}
            {id_comision_pagada && "Actualizar comisión"}
            {id_plan_comision
              ? "Actualizar plan de comisión"
              : id_plan_comision_campana && !campaignStatus
              ? "Crear campaña"
              : id_plan_comision_campana && !campaignStatus
              ? "Actualizar campaña"
              : ""}
          </Button>
        </ButtonBar>
      </FormComission>
    </Fragment>
  );
};

export default EditComission;
