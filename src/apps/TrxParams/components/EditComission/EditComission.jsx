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

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      // let errRang = editedComission?.ranges?.length === 0;

      // if (errRang) {
      //   notifyError("Se debe agregar al menos una comision");
      //   return;
      // }

      // editedComission?.ranges.reduce((prev, curr, indexR) => {
      //   if (!(prev?.["Rango maximo"] + 1 === curr?.["Rango minimo"])) {
      //     notifyError(`El rango maximo de un rango comision no puede
      //     ser mayor al rango minimo del siguiente
      //       rango de comision (Rango ${indexR} - Rango ${indexR + 1})`);
      //     errRang = true;
      //   }
      //   return curr;
      // });

      // if (errRang) {
      //   return;
      // }
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
      } else if (id_plan_comision) {
        putComisionesPlanes({
          id_plan_comision: id_plan_comision,
          pk_planes_comisiones: id_plan_comision,
          nombre_plan_comision: editedComission?.nombre_plan_comision,
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
        })
          .then((res) => {
            console.log(res);
            if (res?.status) {
              notify(res?.msg);
              navigate(-1, { replace: true });
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else if (id_plan_comision_campana) {
        if (campaignStatus) {
          console.log("edit campaign");
          putComisionesPlanesCampanas({
            id_plan_comision_campana: id_plan_comision_campana,
            nombre_plan_comision_campana:
              editedComission?.["nombre_plan_comision_campana"],
            fecha_inicio: editedComission?.["fecha_inicio"],
            // fecha inicio
            // fecha_inicio: Intl.DateTimeFormat("es-CO", {
            //   year: "numeric",
            //   month: "numeric",
            //   day: "numeric",
            //   hour: "numeric",
            //   minute: "numeric",
            //   second: "numeric",
            // })
            //   .format(
            //     new Date(comissions?.["fecha_inicio"]).setHours(
            //       new Date(comissions?.["fecha_inicio"] + "-5").getHours()
            //     )
            //   )
            //   .split(",")
            //   .join("")
            //   .split("/")
            //   .join("-"),
            // fecha_inicio: editedComission?.["fecha_inicio"],
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
            })
            .catch((err) => console.error(err));
        } else {
          console.log("create campaign");
          postComisionesPlanCampanas({
            nombre_plan_comision_campana:
              editedComission?.["nombre_plan_comision_campana"],
            fecha_inicio: editedComission?.["fecha_inicio"],
            fecha_final: editedComission?.["fecha_final"],
            fk_planes_comisiones: id_plan_comision_campana,
            comisiones_campanas: {
              // ...editedComission,
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
            })
            .catch((err) => console.error(err));
        }
      }
    },
    [
      editedComission,
      navigate,
      id_comision_pagada,
      id_comision_cobrada,
      id_plan_comision,
      id_plan_comision_campana,
      comissions,
    ]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    if (id_plan_comision) {
      ["nombre_plan_comision"].forEach((col) => {
        let data = null;
        data = formData.get(col);
        newData.push([col, data]);
      });
      setEditedComission((old) => ({
        ...old,
        ...Object.fromEntries(newData),
      }));
    }
    if (id_plan_comision_campana) {
      [
        // "nombre_plan_comision",
        "nombre_plan_comision_campana",
      ].forEach((col) => {
        let data = null;
        data = formData.get(col);
        newData.push([col, data]);
      });
      setEditedComission((old) => ({
        ...old,
        ...Object.fromEntries(newData),
      }));
    }
  }, []);

  const onChangeDates = (ev) => {
    const key = ev.target.name;
    const value = ev.target.value;
    setEditedComission((old) => ({
      ...old,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (id_comision_pagada) {
      fecthComisionesPagarFunc();
    } else if (id_comision_cobrada) {
      fecthComisionesCobrarFunc();
    } else if (id_plan_comision) {
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
        console.log("res", res);
        setComissions(res?.results?.[0]);
        setEditedComission({
          nombre_plan_comision: res?.results?.[0]?.nombre_plan_comision,
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
        console.log("res", res);
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

  const onSubmitComission = (ev) => {
    ev.preventDefault();
    console.log(comissions);
    if (id_plan_comision) {
      console.log("plans", editedComission);
      onSubmit(ev);
    }
    if (id_plan_comision_campana) {
      console.log("campana", editedComission);
      onSubmit(ev);
    }
  };

  function dateIsValid(date) {
    return !Number.isNaN(new Date(date).getTime());
  }

  return (
    <Fragment>
      <h1 className="text-3xl">
        {id_comision_cobrada && "Editar comisión a cobrar"}
        {id_comision_pagada && "Editar comisión a pagar"}
        {id_plan_comision && "Editar plan de comisión"}
        {id_plan_comision_campana && !campaignStatus
          ? "Crear campaña"
          : "Editar campaña"}
      </h1>
      <Form onChange={onChangeNewComision} grid>
        {/* <Input
          id="nombre_comision"
          name="nombre_comision"
          label={"Nombre comisión"}
          type={"text"}
          autoComplete="off"
          value={comissions?.["nombre_comision"]}
          onChange={() => {}}
        /> */}

        {id_comision_pagada && (
          <Fragment>
            {comissions?.["nombre_convenio"] && (
              <Input
                id="Nombre convenio"
                name="Nombre convenio"
                type={"text"}
                autoComplete="off"
                label={"Nombre convenio"}
                value={comissions?.["nombre_convenio"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["nombre_operacion"] && (
              <Input
                id="Nombre operacion"
                name="Nombre operacion"
                type={"text"}
                label={"Nombre transaccion"}
                autoComplete="off"
                value={comissions?.["nombre_operacion"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["id_comercio"] && (
              <Input
                id="Id comercio"
                name="Id comercio"
                type={"number"}
                label={"Id comercio"}
                autoComplete="off"
                value={comissions?.["id_comercio"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["fecha_inicio"] && (
              <Input
                id="Fecha inicio"
                name="Fecha inicio"
                type={"text"}
                label={"Fecha inicio"}
                autoComplete="off"
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
                id="Fecha_fin"
                name="Fecha_fin"
                type={"text"}
                label={"Fecha_fin"}
                autoComplete="off"
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
              label="Estado comisión"
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
                id="Autorizador"
                name="Autorizador"
                type={"text"}
                label={"Autorizador"}
                autoComplete="off"
                value={comissions?.["nombre_autorizador"]}
                readOnly
                disabled
              />
            )}
            {comissions?.["nombre_convenio"] && (
              <Input
                id="Nombre convenio"
                name="Nombre convenio"
                type={"text"}
                autoComplete="off"
                label={"Nombre convenio"}
                value={comissions?.["nombre_convenio"]}
                readOnly
                disabled
              />
            )}

            {comissions?.["nombre_operacion"] && (
              <Input
                id="Nombre operacion"
                name="Nombre operacion"
                type={"text"}
                label={"Nombre transaccion"}
                autoComplete="off"
                value={comissions?.["nombre_operacion"]}
                readOnly
                disabled
              />
            )}
            <ActiveSelect
              label="Estado comisión"
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
            {/* {JSON.stringify(comissions)} */}
            {/* {JSON.stringify(editedComission)} */}
            <Input
              id="id_plan_comision"
              name="id_plan_comision"
              label={"ID plan de comisión"}
              type={"text"}
              autoComplete="off"
              value={id_plan_comision}
              readOnly
              disabled
            />
            <Input
              id="nombre_plan_comision"
              name="nombre_plan_comision"
              label={"Nombre plan de comisión"}
              type={"text"}
              autoComplete="off"
              defaultValue={editedComission?.nombre_plan_comision}
            />
            <Input
              id="fecha_creacion"
              name="fecha_creacion"
              label={"Fecha de creación"}
              type={"text"}
              autoComplete="off"
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
            {JSON.stringify(comissions)}
            {/* {JSON.stringify(editedComission)} */}
            <Input
              id="id_plan_comision"
              name="id_plan_comision"
              label={"ID plan de comisión"}
              type={"text"}
              autoComplete="off"
              value={id_plan_comision_campana}
              readOnly
              disabled
            />
            <Input
              id="nombre_plan_comision"
              name="nombre_plan_comision"
              label={"Nombre plan de comisión"}
              type={"text"}
              autoComplete="off"
              value={editedComission?.nombre_plan_comision}
              readOnly
              disabled
            />
            <Input
              id="nombre_plan_comision_campana"
              name="nombre_plan_comision_campana"
              label={"Nombre campaña"}
              type={"text"}
              autoComplete="off"
              value={editedComission?.nombre_plan_comision_campana}
            />
            <Input
              id="fecha_inicio"
              name="fecha_inicio"
              label={"Fecha de inicio"}
              type={"datetime-local"}
              autoComplete="off"
              onChange={onChangeDates}
              min="2022-01-01T00:00"
              max="2025-01-01T00:00"
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
              id="fecha_final"
              name="fecha_final"
              label={"Fecha de fin"}
              type={"datetime-local"}
              autoComplete="off"
              onChange={onChangeDates}
              min="2022-01-01T00:00"
              max="2025-01-01T00:00"
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
      {/* <Button
        onClick={() => {
          onClickDelete();
        }}
      >
        Eliminar comisión
      </Button> */}
      <h1 className="text-3xl">Comision</h1>
      <FormComission
        outerState={[editedComission, setEditedComission]}
        onSubmit={onSubmit}
      >
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">
            {id_comision_cobrada && "Actualizar comisión"}
            {id_comision_pagada && "Actualizar comisión"}
            {id_plan_comision && "Actualizar plan de comisión"}
            {id_plan_comision_campana && !campaignStatus
              ? "Crear campaña"
              : "Actualizar campaña"}
          </Button>
        </ButtonBar>
      </FormComission>
    </Fragment>
  );
};

export default EditComission;
