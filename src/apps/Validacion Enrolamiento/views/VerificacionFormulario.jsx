import React from "react";
import { useParams } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import Card from "../../../components/Base/Card/Card";
import classes from "../../Validacion Enrolamiento/views/VerificacionFormulario.module.css";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import Form from "../../../components/Base/Form/Form";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Base/Input/Input";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Select from "../../../components/Base/Select/Select";
import InputSuggestions from "../../../components/Base/InputSuggestions/InputSuggestions";
import MultipleInput from "../../../components/Base/MultipleInput/MultipleInput";

const VerificacionFormulario = () => {
  const navigate = useNavigate();
  const {
    contenedorPrincipal,
    contenedorSecundario,
    contenedorTercero,
    tituloPrincipal,
    titulosSecundarios,
    valores,
    contenedorBotones,
    contenedorImagenPDP,
  } = classes;
  const [datosParams, setDatosParams] = useState(0);
  const [personaResponsable, setPersonaResponsable] = useState("");
  const [unidadNegocio, setUnidadNegocio] = useState("");
  const [asesorComercialLocalidad, setAsesorComercialLocalidad] = useState("");
  const [codigoLocalidad, setCodigoLocalidad] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const params = useParams();
  /*  useEffect(() => {
    fetch(
      `http://127.0.0.1:5000/actualizacionestado?id_proceso=${params.id}` `http://conexion-reconoserid-dev.us-east-2.elasticbeanstalk.com/actualizacionestado` 
    )
      .then((response) => response.json())
      .then((respuesta) => setDatosParams(respuesta.obj.results));
  }, []); */

  useEffect(() => {
    /* const updateWidth = () => { */
    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/actualizacionestado?id_proceso=${params.id}`
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

  console.log(datosParams);

  const aprobacionFormulario = (e) => {
    e.preventDefault();
    const datos = {
      task_token: datosParams[0]["task_token"],
      validation_state: "101",
    };
    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/actualizacionestado?id_proceso=${params.id}`,
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
    alert("El Usuario ha sido Aprobado para ReconoserID");
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
    };
    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com//actualizacionestado?id_proceso=${params.id}`,
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
    alert("El Usuario ha sido Rechazado para ReconoserID");
    setTimeout(
      () => navigate("/Solicitud-enrolamiento/validarformulario"),
      2500
    );
  };

  const guardarDatos = (e) => {
    e.preventDefault();
    const datos = {
      responsable: personaResponsable,
      unidad_negocio: unidadNegocio,
      asesor_comercial_localidad: asesorComercialLocalidad,
      cod_localidad: codigoLocalidad,
      tipozona: tipoZona,
    };
    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/actualizacionestado?id_proceso=${params.id}`,
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
    alert("Los Datos Del Usuario Han Sido Actualizados");
  };

  return (
    <div>
      {datosParams ? (
        <Form
          /* gird={false} */
          grid
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
            <Input
              label={"Asesor Comercial Localidad"}
              placeholder={datosParams[0]["asesor_comercial_localidad"]}
              onChange={(e) => setAsesorComercialLocalidad(e.target.value)}
            ></Input>
            <Input
              label={"Cod Localidad"}
              placeholder={datosParams[0]["cod_localidad"]}
              onChange={(e) => setCodigoLocalidad(e.target.value)}
            ></Input>

            {datosParams[0]["responsable"] != null ? (
              <Input
                label={"Unidad De Negocio"}
                placeholder={datosParams[0]["responsable"]}
                disabled
              ></Input>
            ) : (
              <Select
                onChange={(event) => setPersonaResponsable(event.target.value)}
                id="comissionType"
                name="comissionType"
                label={`Seleccione Responsable`}
                options={{
                  "": "",
                  "Isabel Perez": "Isabel Perez",
                  "Alejandra Suarez": "Alejandra Suarez",
                }}
              ></Select>
            )}

            {datosParams[0]["unidad_negocio"] != null ? (
              <Input
                label={"Unidad De Negocio"}
                placeholder={datosParams[0]["unidad_negocio"]}
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

            {datosParams[0]["tipozona"] != null ? (
              <Input
                label={"Unidad De Negocio"}
                placeholder={datosParams[0]["tipozona"]}
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
            <Input
              label={"Tipo de Establecimiento"}
              placeholder={datosParams[0]["tipo_establecimiento"]}
              disabled
            ></Input>
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
            <Input
              label={"Direccion"}
              placeholder={datosParams[0]["direccion_correspondencia"]}
              disabled
            />
          </Fieldset>

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
                guardarDatos(e);
              }}
            >
              Guardar Datos
            </Button>
          </div>
          <div className={contenedorBotones}>
            <Button
              type="submit"
              onClick={(e) => {
                rechazarFormulario(e);
              }}
            >
              Rechazar Comercio
            </Button>
          </div>
        </Form>
      ) : (
        /*  <Form>
          <Card>
            <div className={contenedorPrincipal}>
              <span className={tituloPrincipal}>Información del Comercio</span>

              <div className={contenedorTercero}>
                <div>
                  <div className={titulosSecundarios}>
                    <h2>Id Proceso:</h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>Asesor: </h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>Sede: </h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>Tipo Doc: </h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>N° Doc:</h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>Email: </h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>Celular:</h2>
                  </div>
                  <div className={titulosSecundarios}>
                    <h2>Estado :</h2>
                  </div>
                </div>

                <div className={contenedorPrincipal}>
                  <div className={valores}>
                    <span>{params.id}</span>
                  </div>
                  <div className={valores}>
                    <span>{datosParams[0]["asesor"]}</span>
                  </div>
                  <div className={valores}>
                    <span>{datosParams[0]["sede"]}</span>
                  </div>
                  <div className={valores}>
                    <span>{datosParams[0]["tipodoc"]}</span>
                  </div>
                  <div className={valores}>
                    <span> {datosParams[0]["numdoc"]}</span>
                  </div>
                  <div className={valores}>
                    <span>{datosParams[0]["email"]}</span>
                  </div>
                  <div className={valores}>
                    <span> {datosParams[0]["celular"]}</span>
                  </div>
                  <div className={valores}>
                    <span> {datosParams[0]["validation_state"]}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
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
              }}
            >
              Rechazar Comercio
            </Button>
          </div>
        </Form>
      ) : (
        ""
      )} */
        ""
      )}
    </div>
  );
};

export default VerificacionFormulario;
