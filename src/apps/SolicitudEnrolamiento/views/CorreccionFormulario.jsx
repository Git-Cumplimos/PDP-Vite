import React from "react";
import Button from "../../../components/Base/Button";
import Form from "../../../components/Base/Form";
import classes from "../../SolicitudEnrolamiento/views/FormularioEnrolamiento.module.css";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import MultipleInput from "../../../components/Base/MultipleInput";
import FileInput from "../../../components/Base/FileInput/FileInput";
import { useState, useEffect, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../../components/Base/Select";
import Fieldset from "../../../components/Base/Fieldset";
import LocationForm from "../../../components/Compound/LocationForm";
import InputSuggestions from "../../../components/Base/InputSuggestions";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import { useParams } from "react-router";

const CorreccionFormulario = () => {
  const params = useParams();
  const url = `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/actividades-economicas`;
  //Datos Comercio
  const [datosParams, setDatosParams] = useState(0);
  const [nombreComercio, setNombreComercio] = useState("");
  //Datos Responsable
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefonos, setTelefonos] = useState([""]);
  const [correos, setCorreos] = useState([""]);
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState("");
  //Datos Asesor
  const [asignarAsesores, setAsignarAsesores] = useState(0);
  //Datos Empresa
  const [numNit, setNumNit] = useState("");
  const [numCamaraComercio, setNumCamaraComerci] = useState("");
  const [numRut, setNumRut] = useState("");
  //Datos Actividad Economica
  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);
  const [commerceType, setCommerceType] = useState([]);
  //Datos Ubicacion Correspondencia
  const [municipioCorr, setMunicipioCorr] = useState("");
  const [departamentoCorr, setDepartamentoCorr] = useState("");
  const [localidadCorr, setLocalidadCorr] = useState("");
  const [barrioCorr, setBarrioCorr] = useState("");
  const [direccionCorr, setDireccionCorr] = useState("");
  //Datos Ubicacion Comercio
  const [municipioCom, setMunicipioCom] = useState("");
  const [departamentoCom, setDepartamentoCom] = useState("");
  const [localidadCom, setLocalidadCom] = useState("");
  const [barrioCom, setBarrioCom] = useState("");
  const [direccionCom, setDireccionCom] = useState("");

  //Autorizacion
  const [responsableIva, setResponsableIva] = useState("");
  const [autorizacion, setAutorizacion] = useState("");

  // Datos PDF
  const [archivos1, setArchivos1] = useState([]);
  const [archivos2, setArchivos2] = useState([]);
  const [archivos3, setArchivos3] = useState([]);

  // Traer Datos Del Comercio
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/actualizacion-estado?numDoc=${params.numCedula}`
    )
      .then((res) => res.json())
      .then((respuesta) => {
        dat: setDatosParams(respuesta?.obj?.results);
        nomComer: setNombreComercio(
          respuesta?.obj?.results[0]["nombre_comercio"]
        );
        nomAsesor: setAsignarAsesores(respuesta?.obj?.results[0]["asesor"]);
        nomRespo: setNombre(respuesta?.obj?.results[0]["nombre"]);
        apellidoRespo: setApellido(respuesta?.obj?.results[0]["apellido"]);
        numDoc: setNumDocumento(respuesta?.obj?.results[0]["numdoc"]);
        tipoDoc: setTipoIdentificacion(respuesta?.obj?.results[0]["tipodoc"]);
        numNit: setNumNit(respuesta?.obj?.results[0]["numnit"]);
        numCamara: setNumCamaraComerci(
          respuesta?.obj?.results[0]["numcamycom"]
        );
        numRut: setNumRut(respuesta?.obj?.results[0]["numrut"]);
        actividadEcono: setActividad(
          respuesta?.obj?.results[0]["actividad_economica"]
        );
        telefono: setTelefonos(respuesta?.obj?.results[0]["celular"]);
        correo: setCorreos(respuesta?.obj?.results[0]["email"]);
        munCorr: setMunicipioCorr(
          respuesta?.obj.results[0]["municipio_correspondencia"]
        );
        depCorr: setDepartamentoCorr(
          respuesta?.obj?.results[0]["departamento_correspondencia"]
        );
        barCorr: setBarrioCorr(
          respuesta?.obj?.results[0]["barrio_correspondencia"]
        );
        localidadCorr: setLocalidadCorr(
          respuesta?.obj?.results[0]["localidad_correspondencia"]
        );
        dirCorr: setDireccionCorr(
          respuesta?.obj?.results[0]["direccion_correspondencia"]
        );
        dirCom: setMunicipioCom(respuesta?.obj?.results[0]["municipio"]);
        depacom: setDepartamentoCom(respuesta?.obj?.results[0]["departamento"]);
        locacom: setLocalidadCom(
          respuesta?.obj?.results[0]["localidad_bogota"]
        );
        dircom: setDireccionCom(
          respuesta?.obj?.results[0]["direccion_comercio"]
        );
        barrcom: setBarrioCom(respuesta?.obj?.results[0]["barrio"]);
        respoIva: setResponsableIva(
          respuesta?.obj?.results[0]["responsableiva"]
        );
        autosms: setAutorizacion(respuesta?.obj?.results[0]["autosms"]);
      });
  }, []);
  /* console.log(datosParams); */

  const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  //Documentos PDF
  const onFileChange = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      setArchivos1(files);
    }
  }, []);

  const onFileChange2 = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      setArchivos2(files);
    }
  }, []);
  const onFileChange3 = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      setArchivos3(files);
    }
  }, []);

  //Actualizar Y Corregir Datos
  const corregirEnviar = useCallback(
    (e) => {
      e.preventDefault();
      const data = {
        asesor: asignarAsesores,
        nombre: `${nombre}`,
        apellido: `${apellido}`,
        nombre_comercio: nombreComercio,
        numnit: numNit,
        numcamycom: numCamaraComercio,
        numrut: numRut,
        autosms: autorizacion,
        tipozona: "",
        unidad_negocio: "",
        responsableiva: responsableIva,
        cod_localidad: "",
        asesor_comercial_localidad: "",
        actividad_economica: commerceType.toString(),
        tipo_establecimiento: "",
        sede: "Bogotá",
        direccion_comercio: direccionCom,
        departamento: departamentoCom,
        municipio: municipioCom,
        localidad_bogota: localidadCom,
        barrio: barrioCom,
        direccion_correspondencia: direccionCorr,
        departamento_correspondencia: departamentoCorr,
        municipio_correspondencia: municipioCorr,
        localidad_correspondencia: localidadCorr,
        barrio_correspondencia: barrioCorr,
        tipoDoc: tipoIdentificacion,
        numDoc: numDocumento,
        email: correos[0],
        celular: telefonos[0],
        /* task_token: datosParams[0]["task_token"], */
        validation_state: "En Proceso de Validación",
        /* id_name: "id_proceso", */
        responsable: "",
      };
      fetch(
        /* `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/idreconocer?id_proceso=26`, */
        /* `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/idreconocer?id_proceso=${datosParams[0]["id_proceso"]}`, */
        `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/idreconocer?id_proceso=${datosParams[0]["id_proceso"]}`,
        {
          method: "PUT",

          body: data,
        }
      )
        .then((respuesta) => {
          const formData = new FormData();

          formData.set("id_proceso", datosParams[0]["id_proceso"]);

          notify("Se ha comenzado la carga");
          /* console.log(Object.fromEntries(formData.entries())); */
          fetch(
            /* `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/uploadfile`, */
            `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/uploadfile2?id_proceso=${datosParams[0]["id_proceso"]}`,
            /*  "POST",
            {},
            { formData },
            {},
            false */

            {
              method: "GET",

              /* body: formData, */
            }
          )
            .then((res) => res.json())
            .then((respuesta) => {
              console.log(respuesta);
              if (!respuesta?.status) {
                console.log(respuesta);
                notifyError(respuesta?.msg);
              } else {
                /*  console.log(respuesta?.obj); */
                notify("Se han subido los archivos");
                /*  console.log(respuesta?.obj[0]?.fields?.["x-amz-algorithm"]); */
                const formData2 = new FormData();
                const formData3 = new FormData();
                const formData4 = new FormData();

                if (archivos1 && archivos2 && !archivos3) {
                  var cont_rut = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_rut == 0) {
                      for (const property in datosS3.fields) {
                        /*  console.log(datosS3.fields[property]); */
                        formData2.set(
                          `${property}`,
                          `${datosS3.fields[property]}`
                        );
                      }
                    }
                    cont_rut += 1;
                  }
                  formData2.set("file", archivos1[0]);
                  fetch(`${respuesta?.obj[0]?.url}`, {
                    method: "POST",

                    body: formData2,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      {
                      }
                    });

                  //------fetch cc----//
                  var cont_Cc = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_Cc == 1) {
                      for (const property in datosS3.fields) {
                        /* console.log(datosS3.fields[property]); */
                        formData3.set(
                          `${property}`,
                          `${datosS3.fields[property]}`
                        );
                      }
                    }
                    cont_Cc += 1;
                  }
                  formData3.set("file", archivos2[0]);
                  fetch(`${respuesta?.obj[1]?.url}`, {
                    method: "POST",
                    body: formData3,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      {
                      }
                    });
                } else if (archivos1 && archivos2 && archivos3) {
                  var cont_rut = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_rut == 0) {
                      for (const property in datosS3.fields) {
                        /* console.log(datosS3.fields[property]); */
                        formData2.set(
                          `${property}`,
                          `${datosS3.fields[property]}`
                        );
                      }
                    }
                    cont_rut += 1;
                  }
                  formData2.set("file", archivos1[0]);
                  fetch(`${respuesta?.obj[0]?.url}`, {
                    method: "POST",
                    body: formData2,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      {
                      }
                    });

                  //------fetch cc----//
                  var cont_Cc = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_Cc == 1) {
                      for (const property in datosS3.fields) {
                        /*  console.log(datosS3.fields[property]); */
                        formData3.set(
                          `${property}`,
                          `${datosS3.fields[property]}`
                        );
                      }
                    }
                    cont_Cc += 1;
                  }
                  formData3.set("file", archivos2[0]);

                  fetch(`${respuesta?.obj[1]?.url}`, {
                    method: "POST",
                    body: formData3,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      {
                      }
                    });

                  //------fetch Camara y Comercio----//
                  var cont_cam = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_cam == 2) {
                      for (const property in datosS3.fields) {
                        /* console.log(datosS3.fields[property]); */
                        formData4.set(
                          `${property}`,
                          `${datosS3.fields[property]}`
                        );
                      }
                    }
                    cont_cam += 1;
                  }
                  formData4.set("file", archivos3[0]);
                  fetch(`${respuesta?.obj[2]?.url}`, {
                    method: "POST",
                    body: formData4,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      {
                      }
                    });
                }
                /*     setEstadoForm(true); */
                navigate("/public/solicitud-enrolamiento/consultar");
              }
            })
            .catch((err) => {
              notifyError("Error al cargar Datos");
            }); /* notify("Se ha comenzado la carga"); */
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos");
        }); /*  notify("Se ha comenzado la carga"); */
    },
    [archivos1, archivos2, archivos3]
  );
  return (
    <div>
      {datosParams ? (
        <Form>
          <Input
            label={"Nombre Comercio"}
            placeholder={datosParams[0]["nombre_comercio"]}
            value={nombreComercio /* ?? datosParams[0]["nombre_comercio"] */}
            onChange={(e) => setNombreComercio(capitalize(e.target.value))}
            type="text"
          ></Input>

          <Input
            label={"Nombre Asesor"}
            defaultValue={datosParams[0]["asesor"]}
            placeholder={datosParams[0]["asesor"]}
            disabled
          ></Input>

          <Fieldset
            legend="Representante legal"
            className="lg:col-span-3
"
          >
            <Input
              label={"Nombre"}
              placeholder={datosParams[0]["nombre"]}
              value={nombre /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setNombre(capitalize(e.target.value))}
              type="text"
            ></Input>

            <Input
              label={"Apellido"}
              placeholder={datosParams[0]["apellido"]}
              value={apellido /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setApellido(capitalize(e.target.value))}
              type="text"
            ></Input>
            <Input
              label={"N° Documento"}
              placeholder={datosParams[0]["numdoc"]}
              value={numDocumento /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setNumDocumento(capitalize(e.target.value))}
              type="text"
            ></Input>
            <Input
              label="Tipo de Identificación"
              placeholder={datosParams[0]["tipodoc"]}
              value={
                tipoIdentificacion /* ?? datosParams[0]["nombre_comercio"] */
              }
              onChange={(e) =>
                setTipoIdentificacion(capitalize(e.target.value))
              }
              type="text"
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
              value={numNit /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setNumNit(capitalize(e.target.value))}
              type="text"
            ></Input>
            <Input
              label={"N° Camara & Comercio"}
              placeholder={datosParams[0]["numcamycom"]}
              value={
                numCamaraComercio /* ?? datosParams[0]["nombre_comercio"] */
              }
              onChange={(e) => setNumCamaraComerci(capitalize(e.target.value))}
              type="text"
            ></Input>
            <Input
              label={"N° RUT"}
              placeholder={datosParams[0]["numrut"]}
              value={numRut /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setNumRut(capitalize(e.target.value))}
              type="text"
            ></Input>

            <Input
              label={"Responsable del iva"}
              placeholder={datosParams[0]["responsableiva"]}
            ></Input>
            <div className="flex flex-col justify-center items-center text-center my-4 mx-4 gap-4">
              <InputSuggestions
                id="actividades_ec2"
                label={"Buscar tipo de negocio"}
                type={"search"}
                suggestions={
                  foundActivities.map((val) => {
                    const foundIdx = val
                      .toLowerCase()
                      .indexOf(actividad.toLowerCase());
                    if (foundIdx === -1) {
                      return <h1 className="text-xs">{val}</h1>;
                    }
                    const str1 = val.substring(0, foundIdx);
                    const str2 = val.substring(
                      foundIdx,
                      foundIdx + actividad.length
                    );
                    const str3 = val.substring(foundIdx + actividad.length);
                    return (
                      <div className="grid grid-cols-1 place-items-center px-4 py-2">
                        <h1 className="text-xs">
                          {str1}
                          <strong>{str2}</strong>
                          {str3}
                        </h1>
                      </div>
                    );
                  }) || []
                }
                onSelectSuggestion={(index) => {
                  const copy = [...commerceType];
                  copy.push(foundActivities[index]);
                  setActividad("");
                  setFoundActivities([]);
                  setCommerceType([...copy]);
                }}
                minLength="4"
                autoComplete="off"
                value={actividad}
                onInput={(e) => setActividad(e.target.value)}
                onLazyInput={{
                  callback: (e) => {
                    const _actividad = e.target.value;
                    if (_actividad.length > 1) {
                      fetchData(
                        url,
                        "GET",
                        {
                          q: _actividad,
                          limit: 3,
                        },
                        {},
                        {},
                        false
                      )
                        .then((res) => {
                          console.log("respuesta Positiva");
                          if (res?.status) {
                            setFoundActivities(
                              res?.obj.map(
                                ({ id_actividad, nombre_actividad }) => {
                                  return `${id_actividad} - ${nombre_actividad}`;
                                }
                              )
                            );
                          }
                        })
                        .catch(() => {});
                    } else {
                      setFoundActivities([]);
                    }
                  },
                  timeOut: 500,
                }}
              />
              {commerceType.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {commerceType.map((el, idx) => {
                    return (
                      <li key={idx} className="grid grid-cols-8">
                        <span className="bi bi-card-list" />
                        <h1 className="col-span-6">{el}</h1>
                        <span
                          onClick={() => {
                            const copy = [...commerceType];
                            copy.splice(idx, 1);
                            setCommerceType([...copy]);
                          }}
                          className="bi bi-x text-3xl"
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ""
              )}
            </div>
          </Fieldset>

          <Fieldset legend="Contacto" className="lg:col-span-3">
            <Input
              label={"Celular"}
              placeholder={datosParams[0]["celular"]}
              value={telefonos /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setTelefonos(capitalize(e.target.value))}
              type="text"
            />

            <Input
              label={"Email"}
              placeholder={datosParams[0]["email"]}
              value={correos /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setCorreos(capitalize(e.target.value))}
              type="text"
            />
          </Fieldset>
          <Fieldset legend="Ubicación Comercio" className="lg:col-span-3">
            <Input
              label={"Municipio"}
              placeholder={datosParams[0]["municipio"]}
              value={municipioCom /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setMunicipioCom(capitalize(e.target.value))}
              type="text"
            />

            <Input
              label={"Departamento"}
              placeholder={datosParams[0]["departamento"]}
              value={departamentoCom /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setDepartamentoCom(capitalize(e.target.value))}
              type="text"
            />
            <Input
              label={"Barrio"}
              placeholder={datosParams[0]["barrio"]}
              value={barrioCom /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setBarrioCom(capitalize(e.target.value))}
              type="text"
            />

            {datosParams[0]["localidad_bogota"].length > 0 ? (
              <Input
                label={"Localidad"}
                placeholder={datosParams[0]["localidad_bogota"]}
                value={localidadCom /* ?? datosParams[0]["nombre_comercio"] */}
                onChange={(e) => setLocalidadCom(capitalize(e.target.value))}
                type="text"
              />
            ) : (
              ""
            )}

            <Input
              label={"Direccion"}
              placeholder={datosParams[0]["direccion_comercio"]}
              value={direccionCom /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setDireccionCom(capitalize(e.target.value))}
              type="text"
            />
          </Fieldset>
          <Fieldset
            legend="Ubicación Correspondencia"
            className="lg:col-span-3"
          >
            <Input
              label={"Municipio"}
              placeholder={datosParams[0]["municipio_correspondencia"]}
              value={municipioCorr /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setMunicipioCorr(capitalize(e.target.value))}
              type="text"
            />

            <Input
              label={"Departamento"}
              placeholder={datosParams[0]["departamento_correspondencia"]}
              value={
                departamentoCorr /* ?? datosParams[0]["nombre_comercio"] */
              }
              onChange={(e) => setDepartamentoCorr(capitalize(e.target.value))}
              type="text"
            />
            <Input
              label={"Barrio"}
              placeholder={datosParams[0]["barrio_correspondencia"]}
              value={barrioCorr /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setBarrioCorr(capitalize(e.target.value))}
              type="text"
            />
            {datosParams[0]["localidad_correspondencia"]?.length > 0 ? (
              <Input
                label={"Localidad"}
                placeholder={datosParams[0]["localidad_correspondencia"]}
                value={localidadCorr /* ?? datosParams[0]["nombre_comercio"] */}
                onChange={(e) => setLocalidadCorr(capitalize(e.target.value))}
                type="text"
              />
            ) : (
              ""
            )}
            <Input
              label={"Direccion"}
              placeholder={datosParams[0]["direccion_correspondencia"]}
              value={direccionCorr /* ?? datosParams[0]["nombre_comercio"] */}
              onChange={(e) => setDireccionCorr(capitalize(e.target.value))}
              type="text"
            />
          </Fieldset>
          <FileInput
            label={"Elige el archivo del Rut"}
            onGetFile={onFileChange}
            accept=".pdf"
            allowDrop={false}
          />
          <FileInput
            label={"Elige el archivo de la CC"}
            onGetFile={onFileChange2}
            accept=".pdf"
            allowDrop={false}
          />
          <FileInput
            label={"Elige el archivo de la Camara & Comercio"}
            onGetFile={onFileChange3}
            accept=".pdf"
            allowDrop={false}
          />
          <ButtonBar className={"lg:col-span-2"} type="">
            <Button
              type="submit"
              onClick={(e) => {
                corregirEnviar(e);
              }}
            >
              Guardar y Enviar
            </Button>
          </ButtonBar>
        </Form>
      ) : (
        ""
      )}
    </div>
  );
};

export default CorreccionFormulario;
