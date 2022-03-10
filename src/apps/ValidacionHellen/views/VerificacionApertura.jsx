import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/Base/Button";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import classes from "../../ValidacionHellen/views/VerificacionApertura.module.css";
import { notify } from "../../../utils/notify";
import Modal from "../../../components/Base/Modal";
import LogoPDP from "../../../components/Base/LogoPDP";

const VerificacionApertura = () => {
  const navigate = useNavigate();
  const {
    contenedorPrincipal,
    contenedorSecundario,
    contenedorTercero,
    tituloPrincipal,
    titulosSecundarios,
    valores,
    contenedorBotones,
    contenedorPrincipalBotones,
    contenedorCausalRechazo,
    autorizacionMensajes,
    textTarea,
  } = classes;
  const [datosParams, setDatosParams] = useState(0);
  const [personaResponsable, setPersonaResponsable] = useState("");
  const [unidadNegocio, setUnidadNegocio] = useState("");
  const [asesorComercialLocalidad, setAsesorComercialLocalidad] = useState("");
  const [codigoLocalidad, setCodigoLocalidad] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const [datosReconoserID, setDatosReconoserID] = useState([]);
  const [urlPdfs, setUrlPdfs] = useState({});

  const [causal, setCausal] = useState(false);
  const [mensajeCausal, setMensajeCausal] = useState("");
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  useEffect(() => {
    if (datosParams?.length > 0) {
      console.log(datosParams[0]["id_reconocer"]);
      const datos = {
        procesoConvenioGuid: datosParams[0]["id_reconocer"],
      };
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/consulta-validacion-reconoserid`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      )
        .then((response) => response.json())
        .then((respuesta) => setDatosReconoserID(respuesta.obj.data));
    }
  }, [datosParams]);
  /* console.log(datosReconoserID); */

  useEffect(() => {
    /* const updateWidth = () => { */

    fetch(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?id_proceso=${params.id}`
      /* `http://127.0.0.1:5000/actualizacionestado?id_proceso=${params.id}`  */
    )
      .then((response) => response.json())
      .then((respuesta) => setDatosParams(respuesta.obj.results));
    /*  }; */

    // actualizaremos el width al montar el componente
    /*   updateWidth(); */

    // nos suscribimos al evento resize de window
    /*   window.addEventListener("resize", updateWidth); */
  }, []);

  /*   console.log(datosParams); */

  useEffect(() => {
    if (datosParams?.length > 0) {
      /* console.log(typeof  datosParams[0]["id_proceso"].toString()); */
      const datos = {
        id_proceso: datosParams[0]["id_proceso"].toString(),
      };
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/urlfile?id_proceso=${datos["id_proceso"]}`
      )
        .then((res) => res.json())
        .then((respuesta /* console.log(respuesta) */) =>
          setUrlPdfs(respuesta.obj)
        );
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

  const aprobacionFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "201",
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
      () => navigate("/Solicitud-enrolamiento/validarformularioreconoserid"),
      3000
    );
  };
  const rechazarFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "202",
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
      () => navigate("/Solicitud-enrolamiento/validarformularioreconoserid"),
      3000
    );
  };

  return (
    <div>
      {datosParams ? (
        <Form
        /* gird={false} */
        /* grid */
        >
          <Input
            label={"Nombre Comercio"}
            value={datosParams[0]["nombre_comercio"]}
            disabled
          ></Input>
          <Fieldset legend="ReconoserID" className="lg:col-span-3">
            <Input
              label={"Nombre"}
              value={`${datosReconoserID["primerNombre"]} ${datosReconoserID["segundoNombre"]}`}
              disabled
            ></Input>

            <Input
              label={"Apellido"}
              value={`${datosReconoserID["primerApellido"]} ${datosReconoserID["segundoApellido"]}`}
              disabled
            ></Input>
            <Input
              label={"N° Documento"}
              value={datosReconoserID["numDoc"]}
              disabled
            ></Input>
            <Input
              label={"Score Rostro Doc"}
              value={`${datosReconoserID["scoreRostroDocumento"]}`}
              disabled
            ></Input>
            <Input
              label={"Score Proceso"}
              value={`${datosReconoserID["scoreProceso"]}`}
              disabled
            ></Input>
            {/*    <Input
              label="Tipo de Identificación"
              value={datosReconoserID["tipoDoc"]}
              disabled
            ></Input> */}
          </Fieldset>

          <Fieldset legend="Representante legal" className="lg:col-span-3">
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
            {/*    <Input
              label={"Tipo de Establecimiento"}
              value={datosParams[0]["tipo_establecimiento"]}
              disabled
            ></Input> */}
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
            <Input label={"Barrio"} value={datosParams[0]["barrio"]} disabled />
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
            <Input
              label={"Direccion"}
              value={datosParams[0]["direccion_correspondencia"]}
              disabled
            />
          </Fieldset>
          <Fieldset legend="Asesor" className="lg:col-span-3">
            <Input
              label={"Nombre Asesor"}
              value={datosParams[0]["asesor"]}
              disabled
            ></Input>

            {/* {datosParams[0]["asesor_comercial_localidad"].length != "" ? (
              <Input
                label={"Asesor Comercial Localidad"}
                value={datosParams[0]["asesor_comercial_localidad"]}
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
            )} */}

            {datosParams[0]["cod_localidad"].length != "" ? (
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
                options={{
                  "": "",
                  "01 Kennedy": "01 Kennedy",
                  "02 Engativa": "02 Engativa",
                  "03 Bosa": "03 Bosa",
                }}
              ></Select>
            )}

            {datosParams[0]["responsable"].length != "" ? (
              <Input
                label={"Responsable"}
                value={datosParams[0]["responsable"]}
                disabled
              ></Input>
            ) : (
              /*  <Select
                onChange={(event) => setPersonaResponsable(event.target.value)}
                id="comissionType"
                name="comissionType"
                label={`Seleccione Responsable`}
                options={{
                  "": "",
                  "Isabel Perez": "Isabel Perez",
                  "Alejandra Suarez": "Alejandra Suarez",
                }}
              ></Select> */
              ""
            )}

            {datosParams[0]["unidad_negocio"].length != "" ? (
              <Input
                label={"Unidad De Negocio"}
                value={datosParams[0]["unidad_negocio"]}
                disabled
              ></Input>
            ) : (
              <Select
                onChange={(event) => setUnidadNegocio(event.target.value)}
                id="comissionType"
                name="comissionType"
                label={`Unidad De Negocio`}
                options={{
                  "": ``,
                  Comercios: "Comercios",
                  Mayoristas: "Mayoristas",
                  CEAS: "CEAS",
                }}
              ></Select>
            )}
            {/* {datosParams[0]["tipozona"] != null */}
            {datosParams[0]["tipozona"] != "" ? (
              <Input
                label={"Tipo Zona"}
                value={
                  datosParams[0]["tipozona"] == 1
                    ? "Centro"
                    : datosParams[0]["tipozona"] == 2
                    ? "Norte"
                    : datosParams[0]["tipozona"] == 3
                    ? "Occidente"
                    : datosParams[0]["tipozona"]
                }
                disabled
              ></Input>
            ) : (
              <Select
                onChange={(event) => setTipoZona(event.target.value)}
                id="comissionType" /* para que es esto */
                name="comissionType"
                label={`Tipo De Zona`}
                options={{
                  "": "",
                  Centro: "Centro",
                  Norte: "Norte",
                  Occidente: "Occidente",
                  Oriente: "Oriente",
                }}
              ></Select>
            )}
          </Fieldset>
          <Fieldset className={"lg:col-span-2"}>
            <div
              className="w-full h-120" /* style={{ width: "100%", height: "100%" }} */
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
              className="w-full h-120" /* style={{ width: "100%", height: "100%" }} */
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
        </Form>
      ) : (
        ""
      )}
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
                  Si el Comercio no cumple con los requisitos, por favor agrege
                  un causal de rechazo.
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
    </div>
  );
};

export default VerificacionApertura;
