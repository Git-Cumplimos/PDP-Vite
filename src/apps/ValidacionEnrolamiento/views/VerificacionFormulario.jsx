import React, { Fragment } from "react";
import { useParams } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import classes from "../../ValidacionEnrolamiento/views/VerificacionFormulario.module.css";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import Form from "../../../components/Base/Form/Form";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Base/Input/Input";
/* import ToggleInput from "../../../components/Base/ToggleInput/ToggleInput"; */
import TextArea from "../../../components/Base/TextArea/TextArea";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Select from "../../../components/Base/Select/Select";
import { notify } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
/* import file from ".././certificado_movimiento.pdf";
import file2 from ".././ced.pdf";
import file3 from ".././rut.pdf"; */
// import file from ".././certificado_movimiento.pdf";
// import file2 from ".././ced.pdf";
// import file3 from ".././rut.pdf";
/* import { Document, Page } from "react-pdf"; */
// import Sample from "./Sample";

const VerificacionFormulario = () => {
  const navigate = useNavigate();
  const {
    contenedorPrincipal,
    contenedorSecundario,
    contenedorTercero,
    tituloPrincipal,
    titulosSecundarios,
    autorizacionMensajes,
    contenedorBotones,
    contenedorPrincipalBotones,
    contenedorCausalRechazo,
    contenedorImagenPDP,
    textTarea,
  } = classes;
  const [datosParams, setDatosParams] = useState(0);
  const [personaResponsable, setPersonaResponsable] = useState("");
  const [unidadNegocio, setUnidadNegocio] = useState("");
  const [asesorComercialLocalidad, setAsesorComercialLocalidad] = useState("");
  const [codigoLocalidad, setCodigoLocalidad] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const [urlPdfs, setUrlPdfs] = useState({});
  const [causal, setCausal] = useState(false);
  const [mensajeCausal, setMensajeCausal] = useState("");

  const [datosAsesor, SetDatosAsesor] = useState(0);

  const params = useParams();
  useEffect(() => {
    /* const updateWidth = () => { */

    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?id_proceso=${params.id}`,
      "GET"
      /* `http://127.0.0.1:5000/actualizacionestado?id_proceso=${params.id}`  */
    )
      /* .then((response) => response.json()) */
      .then((respuesta) => setDatosParams(respuesta.obj.results));
    /*  }; */

    // actualizaremos el width al montar el componente
    /*   updateWidth(); */

    // nos suscribimos al evento resize de window
    /*   window.addEventListener("resize", updateWidth); */
  }, []);

  useEffect(() => {
    if (datosParams?.length > 0) {
      /* console.log(typeof  datosParams[0]["id_proceso"].toString()); */
      const datos = {
        id_proceso: datosParams[0]["id_proceso"].toString(),
      };
      fetchData(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/urlfile?id_proceso=${datos["id_proceso"]}`,
        "GET"
      )
        /* .then((res) => res.json()) */
        .then((respuesta) => {
          console.log(respuesta.obj["rut"]);
          setUrlPdfs(respuesta.obj);
        });
    }
  }, [datosParams]);
  const aprobacionFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "101",
      responsable: personaResponsable,
      unidad_negocio: unidadNegocio,
      asesor_comercial_localidad: asesorComercialLocalidad,
      cod_localidad: codigoLocalidad,
      tipozona: tipoZona,
      causal_rechazo: mensajeCausal,
    };
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?id_proceso=${params.id}`,
      /* `http://127.0.0.1:5000/actualizacionestado?id_proceso=${params.id}` */ {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta.obj.data));
    notify("El Usuario ha sido Aprobado para ReconoserID");
    setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      2500
    );
  };
  const rechazarFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "102",
      responsable: personaResponsable,
      unidad_negocio: unidadNegocio,
      asesor_comercial_localidad: asesorComercialLocalidad,
      cod_localidad: codigoLocalidad,
      tipozona: tipoZona,
      causal_rechazo: mensajeCausal,
    };
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?id_proceso=${params.id}`,
      /* `http://127.0.0.1:5000/actualizacionestado?id_proceso=${params.id}` */ {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta.obj.data));
    notify("El Usuario ha sido Rechazado para ReconoserID");
    setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      2500
    );
  };

  useEffect(() => {
    if (datosParams?.length > 0) {
      console.log(datosParams[0]["asesor"]);
      const datos = {
        asesor: datosParams[0]["asesor"],
      };
      fetchData(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/asesores?nom_asesor=${datos["asesor"]}`,
        "GET"
      )
        /* .then((res) => res.json()) */
        .then((respuesta) => {
          SetDatosAsesor(respuesta.obj.results);
        });
    }
  }, [datosParams]);

  const fCausalRechazo = (e) => {
    e.preventDefault();
    setCausal(true);
  };
  return (
    <div>
      {datosParams && datosAsesor ? (
        <Form
        /*   flex={false} */
        /*  grid */
        >
          <Input
            label={"Nombre Comercio"}
            placeholder={datosParams[0]["nombre_comercio"]}
            disabled
          ></Input>
          <Fieldset
            legend="Asesor"
            className="lg:col-span-3
 "
          >
            <Input
              label={"Nombre Asesor"}
              placeholder={datosParams[0]["asesor"]}
              disabled
            ></Input>

            {datosParams[0]["asesor_comercial_localidad"].length != "" ? (
              <Input
                label={"Asesor Comercial Localidad"}
                placeholder={datosParams[0]["asesor_comercial_localidad"]}
                disabled
              ></Input>
            ) : (
              <Select
                onChange={(event) =>
                  setAsesorComercialLocalidad(event.target.value)
                }
                id="comissionType"
                name="comissionType"
                label={`Asesor Comercial Localidad`}
                options={{
                  "": "",
                  "01 Asesor Kennedy": "01 Asesor Kennedy",
                  "02 Asesor Engativa": "02 Asesor Engativa",
                  "03 Asesor Bosa": "03 Asesor Bosa",
                }}
              ></Select>
            )}

            {datosParams[0]["cod_localidad"].length != "" ? (
              <Input
                label={"Cod Localidad"}
                placeholder={datosParams[0]["cod_localidad"]}
                disabled
              ></Input>
            ) : (
              <Select
                onChange={(event) => setCodigoLocalidad(event.target.value)}
                id="comissionType"
                name="comissionType"
                label={`Cod Localidad`}
                options={{
                  "No Aplica": "No Aplica",
                  "01 Kennedy": "01 Kennedy",
                  "02 Engativa": "02 Engativa",
                  "03 Bosa": "03 Bosa",
                  "04 Ciudad Bolivar": "04 Ciudad Bolivar",
                  "05 Suba": "05 Suba",
                  "06 Usaquen": "06 Usaquen",
                  "07 Usme": "07 Usme",
                  "08 Rafael Uribe Uribe": "08 Rafael Uribe Uribe",
                  "09 Puente Aranda": "09 Puente Aranda",
                  "10 Fontibon": "10 Fontibon",
                  "11 San Cristobal": "11 San Cristobal",
                  "11 San Cristobal": "11 San Cristobal",
                }}
              ></Select>
            )}

            {datosAsesor[0].length != "" ? (
              <Input
                label={"Responsable"}
                placeholder={datosAsesor[0].responsable["nombre"]}
                disabled
              ></Input>
            ) : (
              ""
            )}

            {datosAsesor[0]["unidades_de_negocio"].length != "" ? (
              <Select
                onChange={(event) => setUnidadNegocio(event.target.value)}
                id="comissionType"
                name="comissionType"
                value={unidadNegocio}
                label={`Unidad De Negocio`}
                options={
                  Object.fromEntries([
                    ["", ""],
                    ...datosAsesor[0].unidades_de_negocio.map(
                      ({ nom_unidad_neg }) => {
                        return [nom_unidad_neg];
                      }
                    ),
                  ]) || { "": "" }
                }
              ></Select>
            ) : (
              ""
            )}

            {/* {datosParams[0]["tipozona"] != null */}
            {datosAsesor[0]["responsable"].length != "" ? (
              <Input
                label={"Tipo Zona"}
                placeholder={datosAsesor[0].responsable["zona"]}
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
              placeholder={datosParams[0]["nombre"]}
              disabled
            ></Input>

            <Input
              label={"Apellido"}
              placeholder={datosParams[0]["apellido"]}
            ></Input>
            <Input
              label={"N° Documento"}
              placeholder={datosParams[0]["numdoc"]}
              disabled
            ></Input>
            <Input
              label="Tipo de Identificación"
              placeholder={datosParams[0]["tipodoc"]}
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
              placeholder={datosParams[0]["numnit"]}
              disabled
            ></Input>
            <Input
              label={"N° Camara & Comercio"}
              placeholder={datosParams[0]["numcamycom"]}
              disabled
            ></Input>
            <Input
              label={"N° RUT"}
              placeholder={datosParams[0]["numrut"]}
              disabled
            ></Input>

            <Input
              label={"Actividad Economica"}
              placeholder={datosParams[0]["actividad_economica"]}
              disabled
            ></Input>

            <Input
              label={"Responsable del iva"}
              placeholder={datosParams[0]["responsableiva"]}
              disabled
            ></Input>
            {/*   <Input
              label={"Tipo de Establecimiento"}
              placeholder={datosParams[0]["tipo_establecimiento"]}
              disabled
            ></Input> */}
          </Fieldset>

          <Fieldset legend="Contacto" className="lg:col-span-3">
            <Input
              label={"Celular"}
              placeholder={datosParams[0]["celular"]}
              disabled
            />

            <Input
              label={"Email"}
              placeholder={datosParams[0]["email"]}
              disabled
            />
            <Input
              label={"Autoriza a Soluciones en Red de Enviar Mensajes"}
              placeholder={datosParams[0]["autosms"]}
              disabled
            />
          </Fieldset>
          <Fieldset legend="Ubicación Comercio" className="lg:col-span-3">
            <Input
              label={"Municipio"}
              placeholder={datosParams[0]["municipio"]}
              disabled
            />

            <Input
              label={"Departamento"}
              placeholder={datosParams[0]["departamento"]}
              disabled
            />
            <Input
              label={"Barrio"}
              placeholder={datosParams[0]["barrio"]}
              disabled
            />
            {datosParams[0]["localidad_bogota"].length > 0 ? (
              <Input
                label={"Localidad"}
                placeholder={datosParams[0]["localidad_bogota"]}
                disabled
              />
            ) : (
              ""
            )}

            <Input
              label={"Direccion"}
              placeholder={datosParams[0]["direccion_comercio"]}
              disabled
            />
          </Fieldset>
          <Fieldset
            legend="Ubicación Correspondencia"
            className="lg:col-span-3"
          >
            <Input
              label={"Municipio"}
              placeholder={datosParams[0]["municipio_correspondencia"]}
              disabled
            />

            <Input
              label={"Departamento"}
              placeholder={datosParams[0]["departamento_correspondencia"]}
              disabled
            />
            <Input
              label={"Barrio"}
              placeholder={datosParams[0]["barrio_correspondencia"]}
              disabled
            />
            {datosParams[0]["localidad_correspondencia"].length > 0 ? (
              <Input
                label={"Localidad"}
                placeholder={datosParams[0]["localidad_correspondencia"]}
                disabled
              />
            ) : (
              ""
            )}
            <Input
              label={"Direccion"}
              placeholder={datosParams[0]["direccion_correspondencia"]}
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
          {/*  <Fieldset>
            <div className={contenedorCausalRechazo}>
              <h2>
                Si el Comercio no cumple con los requisitos, por favor agrege un
                causal de rechazo.
              </h2>
              <textarea
                className={"flex lg:row-span-0"}
                type="input"
                minLength="1"
                maxLength="160"
                autoComplete="off"
                value={causal}
                onInput={(e) => {
                  setCausal(e.target.value);
                }}
              ></textarea>
            </div>
          </Fieldset> */}

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
                    fCausalRechazo(e);
                  }}
                >
                  Rechazar Comercio
                </Button>
              </div>
            </div>
            {/* {guardarDatosAsesor ? (
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
                      rechazarFormulario(e);
                      setCausal(true);
                    }}
                  >
                    Rechazar Comercio
                  </Button>
                </div>
              </div>
            ) : datosParams[0]["tipozona"] &&
              datosParams[0]["unidad_negocio"] &&
              datosParams[0]["responsable"] &&
              datosParams[0]["cod_localidad"] &&
              datosParams[0]["asesor_comercial_localidad"] &&
              datosParams[0]["asesor_comercial_localidad"] &&
              datosParams[0]["asesor"] ? (
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
                      rechazarFormulario(e);
                      setCausal(true);
                    }}
                  >
                    Rechazar Comercio
                  </Button>
                </div>
              </div>
            ) : (
              <div className={contenedorBotones}>
                <Button
                  type="submit"
                  onClick={(e) => {
                    guardarDatos(e);
                  }}
                >
                  Guardar Datos
                </Button>
              </div>
            )} */}
            {causal ? (
              <Modal show>
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
      ) : (
        ""
      )}
    </div>
  );
};

export default VerificacionFormulario;
