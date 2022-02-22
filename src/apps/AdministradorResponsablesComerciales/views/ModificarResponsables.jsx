import React, { Fragment } from "react";

import fetchData from "../../../utils/fetchData";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Form from "../../../components/Base/Form/Form";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { notify } from "../../../utils/notify";
import Table from "../../../components/Base/Table/Table";
import classes from "./ModificarResponsables.module.css";

const ModificarResponsables = () => {
  const {
    contenedorPrincipal,
    contenedorTablas,
    contenedorZonaEstado,
    espaciosFieldset,
  } = classes;
  const params = useParams();
  const navigate = useNavigate();
  const [datosResponsable, SetDatosResponsable] = useState(0);
  const [asesoresACargo, SetAsesoresACargo] = useState(0);
  const [estadoResponsable, setEstadoResponsable] = useState();
  const [asesores, setAsesores] = useState(0);
  const [asignarAsesores, setAsignarAsesores] = useState(0);
  const [zonas, setDatosZonas] = useState(0);
  const [asignarZona, setAsignarZona] = useState();
  const [d, setD] = useState();
  const [f, setF] = useState();
  const [datosUnidadesNegocio, setDatosUnidadesNegocio] = useState(0);
  const [datosUnidadesNegocioResponsable, setDatosUnidadesNegocioResponsable] =
    useState(0);
  const [asignarUnidadNegocio, setAsignarUnidadNegocio] = useState();
  const [unidadesNegocio, setUnidadesNegocio] = useState(0);

  useEffect(
    () => {
      fCargarResponsables();
    },
    [
      /* asignarAsesores */
    ]
  );

  const fCargarResponsables = () => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables?id_responsable=${params.id}`,
      "GET",
      {}
    )
      .then((respuesta) => SetDatosResponsable(respuesta.obj.results))
      .catch(() => {});
  };

  useEffect(() => {
    fCargarResultadosAsesor();
  }, []);

  const fCargarResultadosAsesor = () => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables?id_responsable=${params.id}`,
      "GET",
      {}
    )
      .then((respuesta) => SetAsesoresACargo(respuesta.obj.results[0].asesor))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/zonas`,
      "GET"
    ).then((respuesta) => setDatosZonas(respuesta.obj.results));
  }, []);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/unidades-de-negocio`,
      "GET"
    ).then((respuesta) => setDatosUnidadesNegocio(respuesta.obj.results));
  }, []);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/asesores?limit=${14}`,
      "GET"
    ).then((respuesta) => setAsesores(respuesta.obj.results));
  }, []);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables?id_responsable=${params.id}`,
      "GET"
    ).then((respuesta) =>
      setDatosUnidadesNegocioResponsable(
        respuesta.obj.results[0].unidades_de_negocio
      )
    );
  });

  const ActualizarDatosResponsable = (e) => {
    e.preventDefault();
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables?id_responsable=${params.id}`,
      "PUT",
      {},
      { estado: estadoResponsable, zona: asignarZona },
      { "Content-type": "application/json" }
    ).then((respuesta) => console.log(respuesta /* .obj.data */));
    notify("El Asesor ha sido Actualizado con Exito.");
    setTimeout(() => navigate("/administradorresponsablecomercial"), 2500);
  };
  if (asesoresACargo) {
    asesoresACargo.filter((e) => {
      if (e.estado === true) {
        e.estado = "Activo";
      } else if (e.estado === false) {
        e.estado = "Inactivo";
      }
    });
  }

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/unidades-de-negocio`,
      "GET"
    ).then((respuesta) => setUnidadesNegocio(respuesta.obj.results));
  }, []);

  const asignarAsesor = (e) => {
    e.preventDefault();
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/asesores?id_asesor=${asignarAsesores}`,
      "PUT",
      {},
      { id_responsable: params.id },
      { "Content-type": "application/json" }
    ).then((respuesta) => console.log(respuesta));
    fCargarResultadosAsesor();
    setAsignarAsesores("");
  };

  const fAsignarUnidadNegocio = (e) => {
    e.preventDefault();
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/reponsable-negocio`,
      "POST",
      {},
      {
        responsable_id_responsable: params.id,
        negocio_id_negocio: asignarUnidadNegocio,
      },
      { "Content-type": "application/json" }
    ).then((respuesta) => console.log(respuesta));
    fCargarResponsables();
    setAsignarUnidadNegocio("");
  };
  return (
    <div className={contenedorPrincipal}>
      {datosResponsable && asesores ? (
        <Fragment /* className={contenedorItems} */>
          <Form>
            <Fieldset legend="Modificar Responsable">
              <div /* className={contenedorNombreAsesor} */>
                <Input
                  label={"Nombre y Apellido"}
                  placeholder={datosResponsable[0].nombre}
                  type={"text"}
                  disabled
                ></Input>
                <Input
                  label={"Estado Actual"}
                  placeholder={
                    datosResponsable[0].estado === true ? "Activo" : "Inactivo"
                  }
                  type={"text"}
                  disabled
                ></Input>
                <Input
                  label={"Zona Actual"}
                  placeholder={datosResponsable[0].zona}
                  type={"text"}
                  disabled
                ></Input>
                <div className={contenedorZonaEstado}>
                  <Select
                    onChange={(event) => setAsignarZona(event.target.value)}
                    id="comissionType"
                    name="comissionType"
                    value={asignarZona}
                    label={`Modificar Zona`}
                    options={
                      Object.fromEntries([
                        ["", ""],
                        ...zonas.map(({ zona }) => {
                          return [zona];
                        }),
                      ]) || { "": "" }
                    }
                  ></Select>

                  <Select
                    onChange={(event) =>
                      setEstadoResponsable(
                        event.target.value === "true" ? true : false
                      )
                    }
                    id="comissionType"
                    name="comissionType"
                    value={estadoResponsable}
                    label={`Modificar Estado`}
                    options={{
                      "": "",
                      Activo: "true",
                      Inactivo: "false",
                    }}
                  ></Select>
                </div>

                <div className={contenedorTablas}>
                  <Fieldset legend="Asesores Asignados">
                    <Select
                      onChange={(event) =>
                        setAsignarAsesores(event.target.value)
                      }
                      id="comissionType"
                      name="comissionType"
                      value={asignarAsesores}
                      label={`Asignar Asesor Comercial`}
                      options={
                        Object.fromEntries([
                          ["", ""],
                          ...asesores.map(({ nom_asesor, id_asesor }) => {
                            return [nom_asesor, id_asesor];
                          }),
                        ]) || { "": "" }
                      }
                    ></Select>
                    {asignarAsesores ? (
                      <ButtonBar /* className={"lg:col-span-2"} */>
                        <Button onClick={(e) => asignarAsesor(e)}>
                          Agregar Asesor Comercial
                        </Button>
                      </ButtonBar>
                    ) : (
                      ""
                    )}
                    {asesoresACargo.length > 0 ? (
                      <div>
                        {/* <h2>Asesores Asignados</h2> */}

                        <Table
                          headers={["Id Asesor", "Nombre Asesor", "Estado"]}
                          data={asesoresACargo.map(
                            ({ id_asesor, nom_asesor, estado }) => {
                              return {
                                id_asesor,
                                nom_asesor,
                                estado,
                                /*      responsable: responsable["nombre"], */
                              };
                            }
                          )}
                        ></Table>
                      </div>
                    ) : (
                      ""
                    )}
                  </Fieldset>
                  <Fieldset
                    className={espaciosFieldset}
                    legend="Unidades Negocio Asignado"
                  >
                    <Select
                      onChange={(event) =>
                        setAsignarUnidadNegocio(event.target.value)
                      }
                      id="comissionType"
                      name="comissionType"
                      value={asignarUnidadNegocio}
                      label={`Agregar Unidad Negocio`}
                      options={
                        Object.fromEntries([
                          ["", ""],
                          ...unidadesNegocio.map(
                            ({ nom_unidad_neg, id_negocio }) => {
                              return [nom_unidad_neg, id_negocio];
                            }
                          ),
                        ]) || { "": "" }
                      }
                    ></Select>
                    {asignarUnidadNegocio ? (
                      <ButtonBar /* className={"lg:col-span-2"} */>
                        <Button
                          type=""
                          onClick={(e) => fAsignarUnidadNegocio(e)}
                        >
                          Agregar Unidad De Negocio
                        </Button>
                      </ButtonBar>
                    ) : (
                      ""
                    )}
                    {datosResponsable[0].unidades_de_negocio.length > 0 ? (
                      <div>
                        {/* <h2>Unidades Negocio Asignado</h2> */}

                        <Table
                          headers={[
                            "Id Negocio",
                            "Nombre Unidad Negocio",
                            "Codigo",
                          ]}
                          data={datosResponsable[0].unidades_de_negocio.map(
                            ({
                              id_negocio,
                              nom_unidad_neg,
                              cod_unidad_d_negocio,
                            }) => {
                              return {
                                id_negocio,
                                nom_unidad_neg,
                                cod_unidad_d_negocio,
                              };
                            }
                          )}
                        ></Table>
                      </div>
                    ) : (
                      ""
                    )}
                  </Fieldset>
                </div>
              </div>
            </Fieldset>
          </Form>
          <div>
            <Button type={""} onClick={(e) => ActualizarDatosResponsable(e)}>
              Modificar y Guardar
            </Button>
          </div>
        </Fragment>
      ) : (
        ""
      )}
    </div>
  );
};

export default ModificarResponsables;
