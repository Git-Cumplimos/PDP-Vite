import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import FormComission from "../FormComission/FormComission";
import Button from "../../../../components/Base/Button";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import {
  getComisionesPlanesUnique,
  putComisionesPlanes,
} from "../../utils/fetchComisionesPlanes";
import {
  getComisionesPlanesCampanaUnique,
  postComisionesPlanCampanas,
  putComisionesPlanesCampanas,
} from "../../utils/fetchComisionesPlanesCampanas";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

function dateIsValid(date) {
  return !Number.isNaN(new Date(date).getTime());
}

const EditComission = () => {
  const navigate = useNavigate();

  const [
    {
      id_comision_pagada,
      id_comision_cobrada,
      id_plan_comision,
      id_plan_comision_campana,
    },
  ] = useQuery();

  const [editedComission, setEditedComission] = useState({
    nombre_plan_comision: "",
    tipo_comision: "",
    type: "trx",
    ranges: [
      {
        "Rango minimo": 0,
        "Rango maximo": 0,
        "Comision porcentual": 0,
        "Comision fija": 0,
      },
    ],
    nombre_plan_comision_campana: "",
    fecha_final: "",
    fecha_inicio: "",
  });
  const [disabledState, setDisabledState] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState(null);
  const [comissions, setComissions] = useState({
    nombre_comision: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (id_plan_comision || (id_plan_comision_campana && campaignStatus)) {
      // const date = new Date();
      // setDisabledState(!(date.getDate() <= 5));
      setDisabledState(false);
    }
  }, [id_plan_comision, id_plan_comision_campana, campaignStatus]);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (id_plan_comision) {
        setIsUploading(true);
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
        if (editedComission.nombre_plan_comision_campana === "") {
          return notifyError("Agregue el nombre de la campaña");
        }
        if (editedComission["fecha_final"] !== "") {
          if (editedComission["fecha_inicio"] !== "") {
            if (
              new Date(editedComission["fecha_final"]) <=
              new Date(editedComission["fecha_inicio"])
            ) {
              notifyError("La fecha final debe ser mayor a la inicial");
              return;
            }
          } else {
            notifyError("Debe existir una fecha inicial");
            return;
          }
        } else {
          return notifyError("Debe existir una fecha final");
        }
        setIsUploading(true);
        if (campaignStatus) {
          putComisionesPlanesCampanas({
            id_plan_comision_campana: id_plan_comision_campana,
            nombre_plan_comision_campana:
              editedComission?.["nombre_plan_comision_campana"],
            fecha_inicio: editedComission?.["fecha_inicio"],
            fecha_final: editedComission?.["fecha_final"],
            pk_planes_comisiones_campanas:
              comissions?.pk_planes_comisiones_campanas,
            comisiones_campanas: {
              type: editedComission?.type,
              ranges: editedComission?.ranges?.map(
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
        } else {
          postComisionesPlanCampanas({
            nombre_plan_comision_campana:
              editedComission?.["nombre_plan_comision_campana"],
            fecha_inicio: editedComission?.["fecha_inicio"],
            fecha_final: editedComission?.["fecha_final"],
            fk_planes_comisiones: id_plan_comision_campana,
            comisiones_campanas: {
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
        }
      }
    },
    [
      editedComission,
      comissions,
      navigate,
      id_plan_comision,
      id_plan_comision_campana,
      campaignStatus,
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

  const fetchPlanesComisiones = useCallback(() => {
    getComisionesPlanesUnique({ id_plan_comision })
      .then((res) => {
        setComissions(res?.results?.[0]);
        setEditedComission((old) => ({
          ...old,
          nombre_plan_comision: res?.results[0]?.nombre_plan_comision,
          tipo_comision: res?.results[0]?.tipo_comision,
          type: res?.results[0]?.comisiones?.type,
          ranges: res?.results?.[0]?.comisiones?.ranges?.map(
            ({ Fija, Maximo, Minimo, Porcentaje }) => {
              return {
                "Rango minimo": Minimo,
                "Rango maximo": Maximo === -1 ? "" : Maximo,
                "Comision porcentual":
                  Porcentaje === 0
                    ? 0
                    : parseFloat(Porcentaje * 100).toPrecision(2),
                "Comision fija": parseFloat(Fija),
              };
            }
          ),
        }));
      })
      .catch((err) => console.error(err));
  }, [id_plan_comision]);

  const fetchPlanesComisionesCampana = useCallback(() => {
    getComisionesPlanesCampanaUnique({ id_plan_comision_campana })
      .then((res) => {
        setComissions(res?.results?.[0]);
        setEditedComission((old) => ({
          ...old,
          nombre_plan_comision: res?.results?.[0]?.nombre_plan_comision,
          nombre_plan_comision_campana:
            res?.results?.[0]?.nombre_plan_comision_campana ?? "",
          fecha_inicio: res?.results?.[0]?.fecha_inicio
            ? new Date(res?.results?.[0]?.fecha_inicio)
                .toISOString()
                .substring(0, 16)
            : "",
          fecha_final: res?.results?.[0]?.fecha_final
            ? new Date(res?.results?.[0]?.fecha_final)
                .toISOString()
                .substring(0, 16)
            : "",
          type: res?.results[0]?.comisiones_campanas?.type
            ? res?.results[0]?.comisiones_campanas?.type
            : "trxEsc",
          ranges:
            res?.results?.[0]?.comisiones_campanas?.ranges?.length > 0
              ? res?.results?.[0]?.comisiones_campanas?.ranges?.map(
                  ({ Fija, Maximo, Minimo, Porcentaje }) => {
                    return {
                      "Rango minimo": Minimo,
                      "Rango maximo": Maximo === -1 ? "" : Maximo,
                      "Comision porcentual":
                        Porcentaje === 0
                          ? 0
                          : parseFloat(Porcentaje * 100).toPrecision(2),
                      "Comision fija": parseFloat(Fija),
                    };
                  }
                )
              : [
                  {
                    "Rango minimo": 0,
                    "Rango maximo": 0,
                    "Comision porcentual": 0,
                    "Comision fija": 0,
                  },
                ],
        }));
        if (res?.results?.[0]?.comisiones_campanas?.ranges?.length > 0) {
          setCampaignStatus(true);
        } else {
          setCampaignStatus(false);
        }
      })
      .catch((err) => console.error(err));
  }, [id_plan_comision_campana]);

  useEffect(() => {
    if (id_plan_comision) {
      fetchPlanesComisiones();
    } else if (id_plan_comision_campana) {
      fetchPlanesComisionesCampana();
    }
  }, [fetchPlanesComisiones, fetchPlanesComisionesCampana, id_plan_comision, id_plan_comision_campana]);

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
              value={editedComission?.nombre_plan_comision ?? ""}
              onChange={() => {}}
              readOnly
              disabled
            />
            <Input
              id='nombre_plan_comision_campana'
              name='nombre_plan_comision_campana'
              label={"Nombre campaña"}
              type={"text"}
              autoComplete='off'
              value={editedComission?.nombre_plan_comision_campana ?? ""}
              onInput={(e) =>
                setEditedComission((old) => {
                  return {
                    ...old,
                    nombre_plan_comision_campana: e.target.value,
                  };
                })
              }
              maxLength={50}
            />
            <Input
              id='fecha_inicio'
              name='fecha_inicio'
              label={"Fecha de inicio"}
              type={"datetime-local"}
              autoComplete='off'
              onChange={onChangeDates}
              min={new Date().toISOString().slice(0, -8)}
              max='2031-01-01T00:00'
              value={editedComission?.["fecha_inicio"] ?? ""}
              // value={
              //   // to ISO string
              //   dateIsValid(editedComission?.["fecha_inicio"])
              //     ? new Date(editedComission?.["fecha_inicio"])
              //         .toISOString()
              //         .split(".")[0]
              //     : ""
              // }
            />
            <Input
              id='fecha_final'
              name='fecha_final'
              label={"Fecha de fin"}
              type={"datetime-local"}
              autoComplete='off'
              onChange={onChangeDates}
              min={new Date().toISOString().slice(0, -8)}
              max='2031-01-01T00:00'
              value={editedComission?.["fecha_final"] ?? ""}
              // value={
              //   // to ISO string
              //   dateIsValid(editedComission?.["fecha_final"])
              //     ? new Date(editedComission?.["fecha_final"])
              //         .toISOString()
              //         .split(".")[0]
              //     : ""
              // }
            />
          </>
        )}
      </Form>
      <h1 className='text-3xl'>Comisión</h1>
      <FormComission
        outerState={[editedComission, setEditedComission]}
        onSubmit={onSubmit}
        disabledState={disabledState}>
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>
            {id_comision_cobrada && "Actualizar comisión"}
            {id_comision_pagada && "Actualizar comisión"}
            {id_plan_comision
              ? "Actualizar plan de comisión"
              : id_plan_comision_campana && !campaignStatus
              ? "Crear campaña"
              : id_plan_comision_campana && campaignStatus
              ? "Actualizar campaña"
              : ""}
          </Button>
        </ButtonBar>
      </FormComission>
    </Fragment>
  );
};

export default EditComission;
