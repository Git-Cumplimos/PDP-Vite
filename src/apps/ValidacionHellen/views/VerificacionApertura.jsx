import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import classes from "../../ValidacionHellen/views/VerificacionApertura.module.css";
import { notify } from "../../../utils/notify";

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
  } = classes;
  const [datosParams, setDatosParams] = useState(0);
  const [personaResponsable, setPersonaResponsable] = useState("");
  const [unidadNegocio, setUnidadNegocio] = useState("");
  const [asesorComercialLocalidad, setAsesorComercialLocalidad] = useState("");
  const [codigoLocalidad, setCodigoLocalidad] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const [datosReconoserID, setDatosReconoserID] = useState([]);
  const [urlPdfs, setUrlPdfs] = useState({});
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
            placeholder={datosParams[0]["nombre_comercio"]}
            disabled
          ></Input>
          <Fieldset legend="ReconoserID" className="lg:col-span-3">
            <Input
              label={"Nombre"}
              placeholder={`${datosReconoserID["primerNombre"]} ${datosReconoserID["segundoNombre"]}`}
              disabled
            ></Input>

            <Input
              label={"Apellido"}
              placeholder={`${datosReconoserID["primerApellido"]} ${datosReconoserID["segundoApellido"]}`}
              disabled
            ></Input>
            <Input
              label={"N° Documento"}
              placeholder={datosReconoserID["numDoc"]}
              disabled
            ></Input>
            <Input
              label={"Score Rostro Doc"}
              placeholder={`${datosReconoserID["scoreRostroDocumento"]}`}
              disabled
            ></Input>
            <Input
              label={"Score Proceso"}
              placeholder={`${datosReconoserID["scoreProceso"]}`}
              disabled
            ></Input>
            {/*    <Input
              label="Tipo de Identificación"
              placeholder={datosReconoserID["tipoDoc"]}
              disabled
            ></Input> */}
          </Fieldset>

          <Fieldset legend="Representante legal" className="lg:col-span-3">
            <Input
              label={"Nombre"}
              placeholder={datosParams[0]["nombre"]}
              disabled
            ></Input>

            <Input
              label={"Apellido"}
              placeholder={datosParams[0]["apellido"]}
              disabled
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
          <Fieldset legend="Asesor" className="lg:col-span-3">
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

            {datosParams[0]["unidad_negocio"].length != "" ? (
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
            {/* {datosParams[0]["tipozona"] != null */}
            {datosParams[0]["tipozona"].length != "" ? (
              <Input
                label={"Tipo Zona"}
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
      <div className={contenedorPrincipalBotones}>
        <div className={contenedorBotones}>
          <Button
            type="submit"
            onClick={(e) => {
              aprobacionFormulario(e);
            }}
          >
            Aprobar ReconoserID
          </Button>
        </div>
        <div className={contenedorBotones}>
          <Button
            type="submit"
            onClick={(e) => {
              rechazarFormulario(e);
            }}
          >
            Rechazar ReconoserID
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificacionApertura;
