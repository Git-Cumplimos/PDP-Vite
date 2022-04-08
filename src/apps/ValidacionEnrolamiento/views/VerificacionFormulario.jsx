import React, { Fragment, useCallback } from "react";
import { useParams } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import classes from "../../ValidacionEnrolamiento/views/VerificacionFormulario.module.css";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import Button from "../../../components/Base/Button";
import Modal from "../../../components/Base/Modal";
import Form from "../../../components/Base/Form";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Base/Input";
/* import ToggleInput from "../../../components/Base/ToggleInput"; */
import Fieldset from "../../../components/Base/Fieldset";
import Select from "../../../components/Base/Select";
import { notify, notifyError } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";

const VerificacionFormulario = () => {
  const navigate = useNavigate();
  const {
    titulosSecundarios,
    autorizacionMensajes,
    contenedorBotones,
    contenedorPrincipalBotones,
    contenedorCausalRechazo,
    textTarea,
  } = classes;
  const [datosParams, setDatosParams] = useState(0);
  const [personaResponsable, setPersonaResponsable] = useState("");
  const [unidadNegocio, setUnidadNegocio] = useState("");
  const [asesorComercialLocalidad, setAsesorComercialLocalidad] = useState("");
  const [codigoLocalidad, setCodigoLocalidad] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const [tipoZonaLink, setTipoZonaLink] = useState("");
  const [urlPdfs, setUrlPdfs] = useState({});
  const [causal, setCausal] = useState(false);
  const [mensajeCausal, setMensajeCausal] = useState("");
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);

  const [datosAsesor, SetDatosAsesor] = useState(0);
  const [codigoDane, setCodigoDane] = useState([]);
  const [codigoDaneAutoEnr, setCodigoDaneAutoEnr] = useState([]);
  const [asesores, SetAsesores] = useState(0);
  const [nombreAsesor, SetNombreAsesor] = useState("");
  const [datosNombreAsesor, SetDatosNombreAsesor] = useState("");
  const [datosResponsableTelemarketing, SetDatosResponsableTelemarketing] =
    useState("");
  const [datosAsesorTelemarketing, SetDatosAsesorTelemarketing] = useState("");

  const [nombreLocalidadCorrespondencia, SetNombreLocalidadCorrespondencia] =
    useState("");

  const [nombreLocalidadComercio, SetNombreLocalidadComercio] = useState("");
  const [showModal, setShowModal] = useState(false);

  const params = useParams();

  const [zonas, setZonas] = useState([]);
  /* const url = process.env.REACT_APP_URL_SERVICE_COMMERCE; */
  const url = process.env.REACT_APP_URL_SERVICE_COMMERCE_SS;
  /*  const url2 = process.env.REACT_APP_URL_SERVICE_PUBLIC_SS; */

  //----------------Traer Datos Usuario Con los Parametros---------------------//
  useEffect(() => {
    fetchData(`${url}/actualizacionestado?id_proceso=${params.id}`, "GET")
      .then((respuesta) => {
        setDatosParams(respuesta?.obj?.results);
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Datos Por Parametro");
      });
  }, []);

  //----------------Traer Url Para Traer los PDF ---------------------//
  useEffect(() => {
    if (datosParams?.length > 0) {
      const datos = {
        id_proceso: datosParams[0]["id_proceso"]?.toString(),
      };
      fetchData(
        `${url}/urlfile?id_proceso=${datosParams[0]["id_proceso"]?.toString()}`,
        "GET"
      )
        .then((respuesta) => {
          console.log(respuesta?.obj);
          setUrlPdfs(respuesta?.obj);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar PDF");
        });
    }
  }, [datosParams]);

  //----------------Funcion para Aprobar Formulario link Asesor---------------------//
  const aprobacionFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "101",
      responsable: personaResponsable,
      unidad_negocio: unidadNegocio,
      asesor: datosAsesor[0]["nom_asesor"],
      cod_localidad: codigoLocalidad,
      tipozona: tipoZonaLink.toString(),
      causal_rechazo: mensajeCausal,
    };
    fetchData(
      `${url}/actualizacionestado?id_proceso=${params.id}`,
      /* {method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(datos),
    } */
      "PUT",
      {},
      {
        task_token: datosParams[0]["task_token"],
        validation_state: "101",
        responsable: personaResponsable,
        unidad_negocio: unidadNegocio,
        asesor: datosAsesor[0]["nom_asesor"],
        /* asesor_comercial_localidad: asesorComercialLocalidad, */
        cod_localidad: codigoLocalidad,
        tipozona: tipoZonaLink.toString(),
        causal_rechazo: mensajeCausal,
      },

      {},
      true
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta?.obj?.data))
      .catch((err) => {
        console.log(err);
        notifyError("Error al Aprobar Formulario");
      });
    notify("El Usuario ha sido Aprobado para ReconoserID");

    setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      1000
    );
  };

  //----------------Funcion para Rechazar Formulario---------------------//
  const rechazarFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "102",
      responsable: personaResponsable,
      unidad_negocio: unidadNegocio,
      asesor_comercial_localidad: asesorComercialLocalidad,
      cod_localidad: codigoLocalidad,
      tipozona: tipoZonaLink.toString(),
      causal_rechazo: mensajeCausal,
    };
    fetchData(
      `${url}/actualizacionestado?id_proceso=${params.id}` /* {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(datos), */,
      "PUT",
      {},
      {
        task_token: datosParams[0]["task_token"],
        validation_state: "102",
        responsable: personaResponsable,
        unidad_negocio: unidadNegocio,
        asesor_comercial_localidad: asesorComercialLocalidad,
        cod_localidad: codigoLocalidad,
        tipozona: tipoZonaLink.toString(),
        causal_rechazo: mensajeCausal,
      },

      {},
      true
      /* } */
    )
      /* .then((res) => res.json()) */
      .then((respuesta) => console.log(respuesta?.obj?.data))
      .catch((err) => {
        console.log(err);
        notifyError("Error al Rechazar Formulario");
      });
    notify("El Usuario ha sido Rechazado para ReconoserID");
    navigate("/Solicitud-enrolamiento/validarformulario");
    /* setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      2500
    ); */
  };

  //----------------Funcion para Aprobar Formulario AutoEnrolamiento Asesor---------------------//
  const aprobacionFormularioAuto = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "101",
      responsable: datosResponsableTelemarketing[0]["nombre"],
      unidad_negocio: datosParams[0]["unidad_negocio"],
      asesor: datosAsesorTelemarketing,
      cod_localidad: codigoLocalidad,
      tipozona: datosResponsableTelemarketing[0]?.zona["id_zona"].toString(),
      causal_rechazo: mensajeCausal,
    };
    fetchData(
      `${url}/actualizacionestado?id_proceso=${params.id}` /* {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(datos),
    } */,
      "PUT",
      {},
      {
        task_token: datosParams[0]["task_token"],
        validation_state: "101",
        responsable: datosResponsableTelemarketing[0]["nombre"],
        unidad_negocio: datosParams[0]["unidad_negocio"],
        asesor: datosAsesorTelemarketing,
        cod_localidad: codigoLocalidad,
        tipozona: datosResponsableTelemarketing[0]?.zona["id_zona"].toString(),
        causal_rechazo: mensajeCausal,
      },

      {},
      true
    )
      /* .then((res) => res.json()) */
      .then((respuesta) => console.log(respuesta?.obj?.data))
      .catch((err) => {
        console.log(err);
        notifyError("Error al Aprobar Formulario");
      });
    notify("El Usuario ha sido Aprobado para ReconoserID");
    navigate("/Solicitud-enrolamiento/validarformulario");
    /*  setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      2500
    ); */
  };

  //----------------Funcion para Rechazar Formulario AutoEnrolamiento---------------------//
  const rechazarFormularioAuto = (e) => {
    e.preventDefault();
    /*     const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "102",
      responsable: datosResponsableTelemarketing[0]["nombre"],
      unidad_negocio: datosParams[0]["unidad_negocio"],
      asesor: datosAsesorTelemarketing,
      cod_localidad: codigoLocalidad,
      tipozona: datosResponsableTelemarketing[0]?.zona["id_zona"].toString(),
      causal_rechazo: mensajeCausal,
    }; */
    console.log(datosParams[0]["task_token"]);
    fetchData(
      `${url}/actualizacionestado?id_proceso=${params.id}` /* ,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      } */,
      "PUT",
      {},
      {
        task_token: datosParams[0]["task_token"],
        validation_state: "102",
        responsable: datosResponsableTelemarketing[0]["nombre"],
        unidad_negocio: datosParams[0]["unidad_negocio"],
        asesor: datosAsesorTelemarketing,
        cod_localidad: codigoLocalidad,
        tipozona: datosResponsableTelemarketing[0]?.zona["id_zona"].toString(),
        causal_rechazo: mensajeCausal,
      },

      {},
      true
    )
      /* .then((res) => res.json()) */
      .then((respuesta) => console.log(respuesta?.obj, "res"))
      .catch((err) => {
        console.log(err);
        notifyError("Error al Rechazar Formulario");
      });
    notify("El Usuario ha sido Rechazado para ReconoserID");
    navigate("/Solicitud-enrolamiento/validarformulario");
    /*  setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      2500
    ); */
  };
  //----------------Traer Datos Asesor Cuando los parametros vienen en URL---------------------//
  useEffect(() => {
    if (datosParams?.length > 0 && datosParams[0]["asesor"] != "") {
      console.log(datosParams);
      const datos = {
        asesor: datosParams[0]["asesor"],
      };
      fetchData(`${url}/asesores?nom_asesor=${datos["asesor"]}`, "GET")
        .then((respuesta) => {
          dato: SetDatosAsesor(respuesta?.obj?.results);
          zon: setTipoZonaLink(
            respuesta?.obj?.results[0]["responsable"]["zona_id_zona"]
          );
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Asesor Por URL");
        });
    }
  }, [datosParams]);

  //----------------Traer Todos los Asesores para Seleccionar cuando hay un AutoEnrolamiento---------------------//
  useEffect(() => {
    if (datosParams?.length > 0) {
      fetchData(`${url}/asesores`, "GET")
        .then((respuesta) => {
          SetAsesores(respuesta?.obj?.results);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Asesores");
        });
    }
  }, [datosParams]);

  //----------------Traer Datos Asesor Seleccionado Cuando es por AutoEnrolamiento---------------------//
  useEffect(() => {
    if (nombreAsesor) {
      fetchData(`${url}/asesores?nom_asesor=${nombreAsesor}`, "GET")
        .then((respuesta) => {
          data: SetDatosNombreAsesor(respuesta?.obj?.results);
          respon: setPersonaResponsable(
            respuesta?.obj?.results[0]["responsable"]["nombre"]
          );
          zona: setTipoZona(
            respuesta?.obj?.results[0]["responsable"]["zona_id_zona"]
          );
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos ubicacion Correspondencia");
        });
    }
  }, [nombreAsesor]);

  //----------------Traer Datos responsable  Cuando es por Telemarketing---------------------//
  useEffect(() => {
    if (datosParams) {
      fetchData(`${url}/responsables?nombre=jhon`, "GET")
        .then((respuesta) => {
          SetDatosResponsableTelemarketing(respuesta?.obj?.results);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Responsables Telemarketing");
        });
    }
  }, [datosParams]);
  //----------------Funcion Para Enviar Mensaje de Rechazo---------------------//

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const fConfirmarRechazo = (e) => {
    e.preventDefault();
    setConfirmarRechazo(true);
    setShowModal(true);
  };
  const fCausalRechazo = (e) => {
    e.preventDefault();
    setCausal(true);
  };
  //----------------Traer Zonas Verificar, No se Esta Usando ??---------------------//
  useEffect(() => {
    fetchData(`${url}/zonas`, "GET", {
      limit: 0,
    })
      .then((respuesta) =>
        setZonas(
          Object.fromEntries([
            ["", ""],
            ...respuesta?.obj?.results?.map(({ zona, id_zona }) => [
              zona,
              id_zona,
            ]),
          ])
        )
      )
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Zonas");
      });
  }, []);

  //----------------Obtener Localidades Con El Codigo Dane Del Responsable---------------------//
  useEffect(() => {
    if (datosAsesor) {
      gedCodsDaneResponsable().then((value) =>
        setCodigoDane(value?.map((datosCodLoc) => datosCodLoc))
      );
    }
  }, [datosAsesor]);
  //----------------Traer Codigos Dane Del Responsable---------------------//
  const gedCodsDaneResponsable = async () => {
    try {
      const consultaResponsable = await fetchData(
        `${url}/responsables?nombre=${datosAsesor[0]?.responsable["nombre"]}`
      );
      const codsDaneResponsable = [
        ...consultaResponsable?.obj?.results[0]["zona"]["municipios"].map(
          (codigos) => parseInt(codigos)
        ),
      ];
      const guardarFetch = [];
      for (const codigoIterado of codsDaneResponsable) {
        const respuestaLocalidad = await fetchData(
          `${url}/localidades?cod_dane=${codigoIterado}&limit=${0}`
        );
        guardarFetch.push(...respuestaLocalidad?.obj?.results);
      }

      return guardarFetch;
    } catch (error) {
      console.log(error);
    }
  };

  //----------------Traer Codigos Dane Del Responsable Por AutoEnrolamiento---------------------//
  //----------------Obtener Localidades Con El Codigo Dane Del Responsable---------------------//
  useEffect(() => {
    console.log(nombreAsesor);
    if (nombreAsesor) {
      gedCodsDaneResponsableAutoEnr().then((value) =>
        setCodigoDane(value?.map((datosCodLoc) => datosCodLoc))
      );
    }
  }, [datosNombreAsesor]);
  //----------------Traer Codigos Dane Del Responsable---------------------//
  const gedCodsDaneResponsableAutoEnr = async () => {
    try {
      const consultaResponsableAutoEn = await fetchData(
        `${url}/responsables?nombre=${datosNombreAsesor[0]?.responsable["nombre"]}`
      );
      const codsDaneResponsableAutoEn = [
        ...consultaResponsableAutoEn?.obj?.results[0]["zona"]["municipios"].map(
          (codigos) => parseInt(codigos)
        ),
      ];
      const guardarFetchAutoEn = [];
      for (const codigoIterado of codsDaneResponsableAutoEn) {
        const respuestaLocalidadAutoEn = await fetchData(
          `${url}/localidades?cod_dane=${codigoIterado}&limit=${0}`
        );
        guardarFetchAutoEn.push(...respuestaLocalidadAutoEn?.obj?.results);
      }

      return guardarFetchAutoEn;
    } catch (error) {
      console.log(error);
    }
  };

  //----------------Traer Datos Localidad Correspondencia---------------------//
  useEffect(() => {
    if (datosParams) {
      fetchData(
        `${url}/localidades?id_localidad=${datosParams[0]["localidad_correspondencia"]}`,
        "GET"
      )
        .then((respuesta) =>
          SetNombreLocalidadCorrespondencia(respuesta?.obj?.results)
        )
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Localidad Correspondencia");
        });
    }
  }, [datosParams]);

  //----------------Traer Datos Localidad Comercio---------------------//
  useEffect(() => {
    if (datosParams) {
      fetchData(
        `${url}/localidades?id_localidad=${datosParams[0]["localidad_bogota"]}`,
        "GET"
      )
        .then((respuesta) =>
          SetNombreLocalidadComercio(respuesta?.obj?.results)
        )
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Localidad Comercio");
        });
    }
  }, [datosParams]);
  return (
    <div>
      {datosParams /* != "" */ ? (
        //--------------Enrolamiento Por Link---------------//
        datosParams[0]["asesor"] != "" ? (
          <Form>
            <Input
              label={"Nombre Comercio"}
              value={datosParams[0]["nombre_comercio"]}
              disabled
            ></Input>
            <Fieldset legend="Asesor" className="lg:col-span-3">
              <Input
                label={"Nombre Asesor"}
                value={datosParams[0]["asesor"]}
                disabled
              ></Input>
              {datosParams[0]["cod_localidad"] != "" ? (
                <Input
                  label={"Cod Localidad"}
                  value={datosParams[0]["cod_localidad"]}
                  disabled
                ></Input>
              ) : (
                <Select
                  onChange={(event) => setCodigoLocalidad(event.target.value)}
                  id="comissionType"
                  name="comissionType"
                  label={`Cod Localidad`}
                  options={
                    Object.fromEntries([
                      ["N/A", "N/A"],
                      ...codigoDane.map(({ id_localidad, nom_localidad }) => {
                        return [`${id_localidad}${" "}${nom_localidad}`];
                      }),
                    ]) || { "": "" }
                  }
                ></Select>
              )}
              {datosAsesor[0] && datosAsesor[0]?.responsable["nombre"] != "" ? (
                <Input
                  label={"Responsable"}
                  value={datosAsesor[0]?.responsable["nombre"]}
                  disabled
                ></Input>
              ) : (
                ""
              )}
              {datosAsesor[0] &&
              datosAsesor[0]["unidades_de_negocio"] != "" &&
              datosParams[0]["unidad_negocio"] == "" ? (
                <Select
                  onChange={(event) => setUnidadNegocio(event.target.value)}
                  id="comissionType"
                  name="comissionType"
                  value={unidadNegocio}
                  label={`Unidad De Negocio`}
                  options={
                    Object.fromEntries([
                      ["", ""],
                      ...datosAsesor[0]?.unidades_de_negocio?.map(
                        ({ nom_unidad_neg }) => {
                          return [nom_unidad_neg];
                        }
                      ),
                    ]) || { "": "" }
                  }
                ></Select>
              ) : (
                <Input
                  label={"Unidad De Negocio"}
                  value={datosParams[0]["unidad_negocio"]}
                  disabled
                ></Input>
              )}
              {datosAsesor[0] && datosAsesor[0]["responsable"] != "" ? (
                <Input
                  label={"Tipo Zona"}
                  value={
                    datosAsesor[0].responsable["zona_id_zona"] === 1
                      ? "Centro"
                      : datosAsesor[0].responsable["zona_id_zona"] === 2
                      ? "Norte"
                      : datosAsesor[0].responsable["zona_id_zona"] === 3
                      ? "Occidente"
                      : datosAsesor[0].responsable["zona_id_zona"]
                  }
                  disabled
                ></Input>
              ) : (
                ""
              )}
            </Fieldset>
            <Fieldset
              legend="Representante legal"
              className="lg:col-span-3
 "
            >
              <Input
                label={"Nombre"}
                value={datosParams[0]["nombre"]}
                disabled
              ></Input>

              <Input
                label={"Apellido"}
                value={datosParams[0]["apellido"]}
                disabled
              ></Input>
              <Input
                label={"N° Documento"}
                value={datosParams[0]["numdoc"]}
                disabled
              ></Input>
              <Input
                label="Tipo de Identificación"
                value={datosParams[0]["tipodoc"]}
                disabled
              ></Input>
            </Fieldset>

            <Fieldset
              legend="Empresa"
              className="lg:col-span-3
 "
            >
              <Input
                label={"N° NIT"}
                value={datosParams[0]["numnit"]}
                disabled
              ></Input>
              <Input
                label={"N° Camara & Comercio"}
                value={datosParams[0]["numcamycom"]}
                disabled
              ></Input>
              <Input
                label={"N° RUT"}
                value={datosParams[0]["numrut"]}
                disabled
              ></Input>

              <Input
                label={"Actividad Economica"}
                value={datosParams[0]["actividad_economica"]}
                disabled
              ></Input>

              <Input
                label={"Responsable del iva"}
                value={datosParams[0]["responsableiva"]}
                disabled
              ></Input>
            </Fieldset>

            <Fieldset legend="Contacto" className="lg:col-span-3">
              <Input
                label={"Celular"}
                value={datosParams[0]["celular"]}
                disabled
              />

              <Input label={"Email"} value={datosParams[0]["email"]} disabled />
              <Input
                label={"Autoriza a Soluciones en Red de Enviar Mensajes"}
                value={datosParams[0]["autosms"]}
                disabled
              />
            </Fieldset>
            <Fieldset legend="Ubicación Comercio" className="lg:col-span-3">
              <Input
                label={"Municipio"}
                value={datosParams[0]["municipio"]}
                disabled
              />

              <Input
                label={"Departamento"}
                value={datosParams[0]["departamento"]}
                disabled
              />
              <Input
                label={"Barrio"}
                value={datosParams[0]["barrio"]}
                disabled
              />
              {datosParams[0]["localidad_bogota"]?.length > 0 &&
              nombreLocalidadComercio ? (
                <Input
                  label={"Localidad"}
                  value={nombreLocalidadComercio[0]["nom_localidad"]}
                  disabled
                />
              ) : (
                ""
              )}

              <Input
                label={"Direccion"}
                value={datosParams[0]["direccion_comercio"]}
                disabled
              />
            </Fieldset>
            <Fieldset
              legend="Ubicación Correspondencia"
              className="lg:col-span-3"
            >
              <Input
                label={"Municipio"}
                value={datosParams[0]["municipio_correspondencia"]}
                disabled
              />

              <Input
                label={"Departamento"}
                value={datosParams[0]["departamento_correspondencia"]}
                disabled
              />
              <Input
                label={"Barrio"}
                value={datosParams[0]["barrio_correspondencia"]}
                disabled
              />
              {datosParams[0]["localidad_correspondencia"]?.length > 0 &&
              nombreLocalidadCorrespondencia ? (
                <Input
                  label={"Localidad"}
                  value={nombreLocalidadCorrespondencia[0]["nom_localidad"]}
                  disabled
                />
              ) : (
                ""
              )}
              <Input
                label={"Direccion"}
                value={datosParams[0]["direccion_correspondencia"]}
                disabled
              />
            </Fieldset>

            <Fieldset className={"lg:col-span-2"}>
              <div
                className="w-full h-120 " /* style={{ width: "100%", height: "100%" }} */
              >
                {true ? (
                  <object
                    // data={`data:application/pdf;base64,${urlPdfs["cc"]}`}
                    data={`${urlPdfs["cc"]}`}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  ></object>
                ) : (
                  ""
                )}
              </div>
              <div
                className="w-full h-120  " /* style={{ width: "100%", height: "100%" }} */
              >
                {true ? (
                  <object
                    // data={`data:application/pdf;base64,${archivo}`}
                    data={`${urlPdfs["rut"]}`}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  ></object>
                ) : (
                  ""
                )}
              </div>
              {urlPdfs["camara"] ? (
                <div
                  className="w-full h-120  " /* style={{ width: "100%", height: "100%" }} */
                >
                  {true ? (
                    <object
                      // data={`data:application/pdf;base64,${archivo}`}
                      data={`${urlPdfs["camara"]}`}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                    ></object>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
            </Fieldset>

            <div>
              <div className={contenedorPrincipalBotones}>
                <div className={contenedorBotones}>
                  <Button
                    type="submit"
                    onClick={(e) => {
                      aprobacionFormulario(e);
                    }}
                  >
                    Aprobar Comercio
                  </Button>
                </div>

                <div className={contenedorBotones}>
                  <Button
                    type="submit"
                    onClick={(e) => {
                      fConfirmarRechazo(e);
                    }}
                  >
                    Rechazar Comercio
                  </Button>
                </div>
              </div>
              {confirmarRechazo ? (
                <Modal show={showModal} handleClose={handleClose}>
                  <LogoPDP></LogoPDP>

                  <div className={contenedorCausalRechazo}>
                    <div className={autorizacionMensajes}>
                      <span className={titulosSecundarios}>
                        ¿Esta Seguro de Rechazar Este Comercio?
                      </span>
                    </div>

                    <div className={contenedorBotones}>
                      <Button
                        type="submit"
                        onClick={(e) => {
                          fCausalRechazo(e);
                        }}
                      >
                        Si
                      </Button>
                      {/*      <Button
                        type="submit"
                        onClick={(e) => {
                          rechazarFormulario(e);
                        }}
                      >
                     No
                      </Button> */}
                    </div>
                  </div>
                </Modal>
              ) : (
                ""
              )}

              {causal ? (
                <Modal show={showModal} handleClose={handleClose}>
                  <LogoPDP></LogoPDP>

                  <div className={contenedorCausalRechazo}>
                    <div className={autorizacionMensajes}>
                      <span className={titulosSecundarios}>
                        Si el Comercio no cumple con los requisitos, por favor
                        agrege un causal de rechazo.
                      </span>
                    </div>
                    <textarea
                      className={textTarea}
                      type="input"
                      minLength="1"
                      maxLength="160"
                      autoComplete="off"
                      value={mensajeCausal}
                      onInput={(e) => {
                        setMensajeCausal(e.target.value);
                      }}
                    ></textarea>
                    <div className={contenedorBotones}>
                      <Button
                        type="submit"
                        onClick={(e) => {
                          rechazarFormulario(e);
                        }}
                      >
                        Enviar Mensaje y Rechazar
                      </Button>
                    </div>
                  </div>
                </Modal>
              ) : (
                ""
              )}
            </div>
          </Form>
        ) : //--------------AutoEnrolamiento---------------//
        /* asesores && */
        datosParams[0]["unidad_negocio"] != "" &&
          datosResponsableTelemarketing ? (
          <Form>
            <Input
              label={"Nombre Comercio"}
              value={datosParams[0]["nombre_comercio"]}
              disabled
            ></Input>
            <Fieldset legend="Asesor" className="lg:col-span-3">
              <Select
                onChange={(event) =>
                  SetDatosAsesorTelemarketing(event.target.value)
                }
                id="comissionType"
                name="comissionType"
                label={`Asesor Telemarketing`}
                options={
                  Object.fromEntries([
                    ["N/A", "N/A"],
                    ...datosResponsableTelemarketing[0]?.asesor?.map(
                      ({ nom_asesor }) => {
                        return [nom_asesor];
                      }
                    ),
                  ]) || { "": "" }
                }
              ></Select>
              {datosResponsableTelemarketing && datosAsesorTelemarketing ? (
                <Fragment>
                  <Input
                    label={"Responsable"}
                    value={datosResponsableTelemarketing[0]["nombre"]}
                    disabled
                  ></Input>
                </Fragment>
              ) : (
                ""
              )}

              {datosAsesorTelemarketing ? (
                <Input
                  label={"Unidad de Negocio"}
                  value={datosParams[0]["unidad_negocio"]}
                  disabled
                ></Input>
              ) : (
                ""
              )}
              {datosResponsableTelemarketing && datosAsesorTelemarketing ? (
                <Input
                  label={"Tipo Zona"}
                  value={
                    datosResponsableTelemarketing[0]?.zona["id_zona"] === 1
                      ? "Centro"
                      : datosResponsableTelemarketing[0]?.zona["id_zona"] === 2
                      ? "Norte"
                      : datosResponsableTelemarketing[0]?.zona["id_zona"] === 3
                      ? "Occidente"
                      : datosResponsableTelemarketing[0]?.zona["id_zona"]
                  }
                  disabled
                ></Input>
              ) : (
                ""
              )}
            </Fieldset>
            <Fieldset
              legend="Representante legal"
              className="lg:col-span-3
"
            >
              <Input
                label={"Nombre"}
                value={datosParams[0]["nombre"]}
                disabled
              ></Input>

              <Input
                label={"Apellido"}
                value={datosParams[0]["apellido"]}
              ></Input>
              <Input
                label={"N° Documento"}
                value={datosParams[0]["numdoc"]}
                disabled
              ></Input>
              <Input
                label="Tipo de Identificación"
                value={datosParams[0]["tipodoc"]}
                disabled
              ></Input>
            </Fieldset>

            <Fieldset
              legend="Empresa"
              className="lg:col-span-3
"
            >
              <Input
                label={"N° NIT"}
                value={datosParams[0]["numnit"]}
                disabled
              ></Input>
              <Input
                label={"N° Camara & Comercio"}
                value={datosParams[0]["numcamycom"]}
                disabled
              ></Input>
              <Input
                label={"N° RUT"}
                value={datosParams[0]["numrut"]}
                disabled
              ></Input>

              <Input
                label={"Actividad Economica"}
                value={datosParams[0]["actividad_economica"]}
                disabled
              ></Input>

              <Input
                label={"Responsable del iva"}
                value={datosParams[0]["responsableiva"]}
                disabled
              ></Input>
            </Fieldset>

            <Fieldset legend="Contacto" className="lg:col-span-3">
              <Input
                label={"Celular"}
                value={datosParams[0]["celular"]}
                disabled
              />

              <Input label={"Email"} value={datosParams[0]["email"]} disabled />
              <Input
                label={"Autoriza a Soluciones en Red de Enviar Mensajes"}
                value={datosParams[0]["autosms"]}
                disabled
              />
            </Fieldset>
            <Fieldset legend="Ubicación Comercio" className="lg:col-span-3">
              <Input
                label={"Municipio"}
                value={datosParams[0]["municipio"]}
                disabled
              />

              <Input
                label={"Departamento"}
                value={datosParams[0]["departamento"]}
                disabled
              />
              <Input
                label={"Barrio"}
                value={datosParams[0]["barrio"]}
                disabled
              />
              {datosParams[0]["localidad_bogota"]?.length > 0 &&
              nombreLocalidadComercio ? (
                <Input
                  label={"Localidad"}
                  value={nombreLocalidadComercio[0]["nom_localidad"]}
                  disabled
                />
              ) : (
                ""
              )}

              <Input
                label={"Direccion"}
                value={datosParams[0]["direccion_comercio"]}
                disabled
              />
            </Fieldset>
            <Fieldset
              legend="Ubicación Correspondencia"
              className="lg:col-span-3"
            >
              <Input
                label={"Municipio"}
                value={datosParams[0]["municipio_correspondencia"]}
                disabled
              />

              <Input
                label={"Departamento"}
                value={datosParams[0]["departamento_correspondencia"]}
                disabled
              />
              <Input
                label={"Barrio"}
                value={datosParams[0]["barrio_correspondencia"]}
                disabled
              />
              {datosParams[0]["localidad_correspondencia"]?.length > 0 &&
              nombreLocalidadCorrespondencia ? (
                <Input
                  label={"Localidad"}
                  value={nombreLocalidadCorrespondencia[0]["nom_localidad"]}
                  disabled
                />
              ) : (
                ""
              )}
              <Input
                label={"Direccion"}
                value={datosParams[0]["direccion_correspondencia"]}
                disabled
              />
            </Fieldset>

            <Fieldset className={"lg:col-span-2"}>
              <div
                className="w-full h-120 " /* style={{ width: "100%", height: "100%" }} */
              >
                {true ? (
                  <object
                    // data={`data:application/pdf;base64,${archivo}`}
                    data={`${urlPdfs["cc"]}`}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  ></object>
                ) : (
                  ""
                )}
              </div>
              <div
                className="w-full h-120  " /* style={{ width: "100%", height: "100%" }} */
              >
                {true ? (
                  <object
                    // data={`data:application/pdf;base64,${archivo}`}
                    data={`${urlPdfs["rut"]}`}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  ></object>
                ) : (
                  ""
                )}
              </div>
              {urlPdfs["camara"] ? (
                <div
                  className="w-full h-120  " /* style={{ width: "100%", height: "100%" }} */
                >
                  {true ? (
                    <object
                      // data={`data:application/pdf;base64,${archivo}`}
                      data={`${urlPdfs["camara"]}`}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                    ></object>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
            </Fieldset>

            <div>
              <div className={contenedorPrincipalBotones}>
                <div className={contenedorBotones}>
                  <Button
                    type="submit"
                    onClick={(e) => {
                      aprobacionFormularioAuto(e);
                    }}
                  >
                    Aprobar Comercio
                  </Button>
                </div>

                <div className={contenedorBotones}>
                  <Button
                    type="submit"
                    onClick={(e) => {
                      fConfirmarRechazo(e);
                    }}
                  >
                    Rechazar Comercio
                  </Button>
                </div>
              </div>
              {confirmarRechazo ? (
                <Modal show={showModal} handleClose={handleClose}>
                  <LogoPDP></LogoPDP>

                  <div className={contenedorCausalRechazo}>
                    <div className={autorizacionMensajes}>
                      <span className={titulosSecundarios}>
                        ¿Esta Seguro de Rechazar Este Comercio?
                      </span>
                    </div>

                    <div className={contenedorBotones}>
                      <Button
                        type="submit"
                        onClick={(e) => {
                          fCausalRechazo(e);
                        }}
                      >
                        Si
                      </Button>
                      {/*      <Button
                        type="submit"
                        onClick={(e) => {
                          rechazarFormulario(e);
                        }}
                      >
                     No
                      </Button> */}
                    </div>
                  </div>
                </Modal>
              ) : (
                ""
              )}

              {causal ? (
                <Modal show={showModal} handleClose={handleClose}>
                  <LogoPDP></LogoPDP>

                  <div className={contenedorCausalRechazo}>
                    <div className={autorizacionMensajes}>
                      <span className={titulosSecundarios}>
                        Si el Comercio no cumple con los requisitos, por favor
                        agrege un causal de rechazo.
                      </span>
                    </div>
                    <textarea
                      className={textTarea}
                      type="input"
                      minLength="1"
                      maxLength="160"
                      autoComplete="off"
                      value={mensajeCausal}
                      onInput={(e) => {
                        setMensajeCausal(e.target.value);
                      }}
                    ></textarea>
                    <div className={contenedorBotones}>
                      <Button
                        type="submit"
                        onClick={(e) => {
                          rechazarFormularioAuto(e);
                        }}
                      >
                        Enviar Mensaje y Rechazar
                      </Button>
                    </div>
                  </div>
                </Modal>
              ) : (
                ""
              )}
            </div>
          </Form>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </div>
  );
};

export default VerificacionFormulario;
