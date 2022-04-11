import Button from "../../../components/Base/Button";
import Form from "../../../components/Base/Form";
import classes from "../../SolicitudEnrolamiento/views/FormularioEnrolamiento.module.css";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import MultipleInput from "../../../components/Base/MultipleInput";
import FileInput from "../../../components/Base/FileInput/FileInput";
import { useState, useEffect, useCallback, Fragment } from "react";
import Select from "../../../components/Base/Select";
import Fieldset from "../../../components/Base/Fieldset";
import LocationForm from "../../../components/Compound/LocationForm";
import InputSuggestions from "../../../components/Base/InputSuggestions";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Base/Modal";
/* const url = `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/actividades-economicas`; */
const url = `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/actividades-economicas`;

const capitalize = (word) => {
  return word.toUpperCase();
  /*  return word.replace(/\b[a-n]/g || /\b[o-z]/g, (c) => c.toUpperCase()); */
};

const FormularioAutoEnrolamiento = () => {
  const navigate = useNavigate();

  //------------------Constantes para Dar Estilos---------------------//
  const {
    tituloFormularioInscripcion,
    mensajeAutorizacion,
    textoMensajeAutorizacion,
  } = classes;
  //------------------Estados Del Formulario---------------------//
  const [nombreComercio, setNombreComercio] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefonos, setTelefonos] = useState([""]);
  const [correos, setCorreos] = useState([""]);
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState("");
  const [tipoComercio, setTipoComercio] = useState("");
  const [numNit, setNumNit] = useState("");
  const [numCamaraComercio, setNumCamaraComerci] = useState("");
  const [numRut, setNumRut] = useState("");
  const [estadoFormulario, setEstadoForm] = useState(false);
  const [autorizacion, setAutorizacion] = useState("");
  const [tratamientoDatos, setTratamientoDatos] = useState("");
  const [responsableIva, setResponsableIva] = useState("");

  //------------------Estados Usuarios Vinculados---------------------//
  const [usuario, setUsuario] = useState(false);
  const [numconsultaProceso, setNumConsultaProceso] = useState("");
  const [respuestaProceso, setRespuestaProceso] = useState("");
  const [verificarCedProceso, setVerificarCedProceso] = useState(false);
  //------------------Estados Asesores---------------------//
  const [asesores, setAsesores] = useState(0);

  //------------------Estados Actividad Economica---------------------//
  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);

  const [commerceType, setCommerceType] = useState([]);

  //------------------Estados Archivos PDF---------------------//
  const [archivos1, setArchivos1] = useState([]);
  const [archivos2, setArchivos2] = useState([]);
  const [archivos3, setArchivos3] = useState([]);

  //------------------Estados Codigos Dane---------------------//
  const [codDaneMunicipioComercio, setCodDaneMunicipioComercio] = useState("");
  const [codDaneMunicipioCorrespondencia, setCodDaneMunicipioCorrespondencia] =
    useState("");

  //------------------Estados Modal---------------------//
  const [showModal, setShowModal] = useState(false);
  //------------------Estados Ubicacion Comercio---------------------//
  const commerceLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };
  //------------------Estados Ubicacion Correspondencia---------------------//
  const homeLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };

  //------------------Estados Localidad Comercio y Correspondencia---------------------//
  const [LocalidadUbComercio, setLocalidadUbComercio] = useState(0);
  const [LocalidadUbCorrespondencia, setLocalidadUbCorrespondencia] =
    useState(0);

  //------------------Traer localidades Con codigo dane de la ubicacion del comercio---------------------//
  useEffect(() => {
    fetchData(
      `${
        process.env.REACT_APP_URL_SERVICE_COMMERCE_SS
      }/localidades?cod_dane=${codDaneMunicipioComercio}&limit=${0}`,
      "GET",
      {},
      {},
      {},
      false
    )
      .then((respuesta) =>
        setLocalidadUbComercio(respuesta?.obj?.results)
      ) /* arreglar para todos OJO */
      .catch((err) => {
        console.log(err);
        /* notifyError("Error al cargar Datos localidad ubicacion del comercio"); */
      });
  }, [codDaneMunicipioComercio]);

  //------------------Traer localidades Con codigo dane de la ubicacion Correspondencia---------------------//
  useEffect(() => {
    fetchData(
      `${
        process.env.REACT_APP_URL_SERVICE_COMMERCE_SS
      }/localidades?cod_dane=${codDaneMunicipioCorrespondencia}&limit=${0}`,
      "GET",
      {},
      {},
      {},
      false
    )
      .then((respuesta) =>
        setLocalidadUbCorrespondencia(respuesta?.obj?.results)
      )
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Datos ubicacion Correspondencia");
      });
  }, [codDaneMunicipioCorrespondencia]);

  //------------------Traer Asesores---------------------//
  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE_SS}/asesores?limit=${14}`,
      "GET",
      {},
      {},
      {},
      false
    )
      .then((respuesta) => setAsesores(respuesta?.obj?.results))
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Datos Traer Asesores");
      });
  }, []);

  //------------------Guardar Archivos PDF---------------------//
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

  //------------------Funcion Para Subir El Formulario---------------------//
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      fetchData(
        `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/iniciar-proceso-enrolamiento`,
        "POST",
        {},
        {
          asesor: "" /* asignarAsesores.toString() */,
          nombre: `${nombre}`,
          apellido: `${apellido}`,
          nombre_comercio: nombreComercio,
          numnit: numNit,
          numcamycom: numCamaraComercio,
          numrut: numRut,
          autosms: autorizacion,
          tipozona: "",
          unidad_negocio: "Telemarketing",
          responsableiva: responsableIva,
          cod_localidad: "",
          asesor_comercial_localidad: "",
          actividad_economica: commerceType.toString(),
          tipo_establecimiento: tipoComercio,
          sede: "Bogotá",
          direccion_comercio: `${commerceLocation.direccion[0]}`,
          departamento: `${commerceLocation.departamento[0]}`,
          municipio: `${commerceLocation.municipio[0]}`,
          localidad_bogota: `${commerceLocation.localidad[0]}`,
          barrio: `${commerceLocation.barrio[0]}`,
          direccion_correspondencia: `${homeLocation.direccion[0]}`,
          departamento_correspondencia: `${homeLocation.departamento[0]}`,
          municipio_correspondencia: `${homeLocation.municipio[0]}`,
          localidad_correspondencia: `${homeLocation.localidad[0]}`,
          barrio_correspondencia: `${homeLocation.barrio[0]}`,
          tipoDoc: tipoIdentificacion,
          numDoc: numDocumento,
          email: correos[0],
          celular: telefonos[0],
          task_token: "token",
          validation_state: "En Proceso de Validación",
          id_name: "id_proceso",
          responsable: "",
        },

        {},
        false
      )
        .then((respuesta) => {
          console.log(respuesta);
          console.log(respuesta.body.id_proceso);
          const formData = new FormData();

          formData.set("id_proceso", respuesta.body.id_proceso);

          notify("Se ha comenzado la carga");
          /* console.log(Object.fromEntries(formData.entries())); */
          fetch(
            /* `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/uploadfile`, */
            `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/uploadfile2?id_proceso=${respuesta.body.id_proceso}`,
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
                /*   for (const datosS3 of respuesta?.obj) {
                  console.log(datosS3.fields);
                  for (const property in datosS3.fields) {
                    console.log(`${property}: ${datosS3.fields[property]}`);
                    formData2.set(`${property}`, `${datosS3.fields[property]}`);
                  }
                }
                for (const datosS3 of respuesta?.obj) {
                  console.log(datosS3.fields);
                  for (const property in datosS3.fields) {
                    console.log(`${property}: ${datosS3.fields[property]}`);
                    formData3.set(`${property}`, `${datosS3.fields[property]}`);
                  }
                }
                for (const datosS3 of respuesta?.obj) {
                  console.log(datosS3.fields);
                  for (const property in datosS3.fields) {
                    console.log(`${property}: ${datosS3.fields[property]}`);
                    formData4.set(`${property}`, `${datosS3.fields[property]}`);
                  }
                } */

                if (archivos1 && archivos2 && !archivos3) {
                  formData2.set("file", archivos1[0]);
                  fetch(`${respuesta?.obj[0]?.url}`, {
                    method: "POST",

                    body: formData2,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      console.log(err);
                    });

                  //------fetch cc----//

                  formData3.set("file", archivos2[0]);
                  fetch(`${respuesta?.obj[1]?.url}`, {
                    method: "POST",
                    body: formData3,
                  })
                    .then((res) => res?.status)
                    .catch((err) => {
                      console.log(err);
                    });
                } else if (archivos1 && archivos2 && archivos3) {
                  console.log("3 archivos");

                  var cont_rut = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_rut == 0) {
                      for (const property in datosS3.fields) {
                        console.log(datosS3.fields[property]);
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
                      console.log(err);
                    });

                  //------fetch cc----//
                  var cont_Cc = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_Cc == 1) {
                      for (const property in datosS3.fields) {
                        console.log(datosS3.fields[property]);
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
                      console.log(err);
                    });

                  //------fetch Camara y Comercio----//
                  var cont_cam = 0;
                  for (const datosS3 of respuesta?.obj) {
                    if (cont_cam == 2) {
                      for (const property in datosS3.fields) {
                        console.log(datosS3.fields[property]);
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
                      console.log(err);
                    });
                }
                setEstadoForm(true);
                navigate("/public/solicitud-enrolamiento/consultar");
              }
            })
            .catch((err) => {
              console.log(err);
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

  useEffect(() => {
    if (commerceLocation.municipio[0] != "") {
      setCodDaneMunicipioComercio(
        parseInt(
          commerceLocation.foundMunicipios[0][0]["c_digo_dane_del_municipio"]
        )
      );
    }
  }, [commerceLocation]);
  useEffect(() => {
    if (homeLocation.municipio[0] != "") {
      setCodDaneMunicipioCorrespondencia(
        parseInt(
          homeLocation.foundMunicipios[0][0]["c_digo_dane_del_municipio"]
        )
      );
    }
  }, [homeLocation]);

  //------------------Funcion Para Modal--------------------//
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  //------------------Funcion Para Consultar Proceso--------------------//
  const funConsultaProceso = (e) => {
    e.preventDefault();
    setShowModal(true);

    if (numconsultaProceso) {
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_PUBLIC_SS}/actualizacionestado?numDoc=${numconsultaProceso}`
        /*  `http://127.0.0.1:5000/actualizacionestado?numDoc=${numconsultaProceso}` */
      )
        .then((res) => res.json())
        .then((respuesta) => {
          setRespuestaProceso(respuesta?.obj?.results);
          console.log(respuesta.obj.results[0]);
          if (respuesta?.obj?.results[0]?.validation_state === "201") {
            console.log(true, "348"); //setear estado
            setVerificarCedProceso(true);
          } else {
            console.log("error");

            setVerificarCedProceso(false);
          }
        })
        .catch((e) => console.log(e));
    } else {
      /*    else   OJOOOOO */
      notifyError("Ingrese Valores");
    }
    setUsuario(true); /* REVISARRR */
  };
  /*  console.log(respuestaProceso); */
  return (
    <div className=" flex flex-col justify-center items-center text-justify my-8">
      {usuario === false ? (
        /*  <Modal show={showModal} handleClose={handleClose}></Modal> */
        <Fragment>
          <Input
            label={"Ingrese Numero Cedula:"}
            placeholder="Ej:1030652xxx"
            value={numconsultaProceso}
            type="number"
            minlength="5"
            onChange={(e) => setNumConsultaProceso(e.target.value)}
          ></Input>
          <ButtonBar /* className={contenedorBotones} */ type="">
            <Button
              /* type="submit" */ type=""
              onClick={(e) => funConsultaProceso(e)}
            >
              Crear Proceso
            </Button>
          </ButtonBar>
        </Fragment>
      ) : usuario === true && respuestaProceso ? (
        (respuestaProceso?.length >= 0 &&
          respuestaProceso[0]?.validation_state === "201" &&
          verificarCedProceso) ||
        respuestaProceso?.length === 0 /* s / / ||
         respuestaProceso.length >= 0 && Verificar que el numero de datos sea mayor a 5 y el numero de la consulta sea igual al que se esta bscando 
          respuestaProceso[0].validation_state ===
            "En Proceso de Validación" */ ? (
          <Fragment>
            <span className={tituloFormularioInscripcion}>
              Formulario de Inscripción
            </span>
            {autorizacion === "SI" && tratamientoDatos === "SI" ? (
              <div>
                <Form
                  /* gird={false} */
                  grid
                  onSubmit={(e) => handleSubmit(e)}
                >
                  <Input
                    label={"Nombre Comercio"}
                    placeholder="Ingrese Nombre Comercio"
                    value={nombreComercio}
                    onChange={(e) =>
                      setNombreComercio(capitalize(e.target.value))
                    }
                    type="text"
                  ></Input>
                  <Fieldset
                    legend="Representante legal"
                    className="lg:col-span-2"
                  >
                    <Input
                      label={"Nombres"}
                      placeholder="Ingrese sus Nombres"
                      value={nombre}
                      onChange={(e) => setNombre(capitalize(e.target.value))}
                      type={"text"}
                    ></Input>

                    <Input
                      label={"Apellidos"}
                      placeholder="Ingrese sus Apellidos"
                      value={apellido}
                      onChange={(e) => setApellido(capitalize(e.target.value))}
                      type={"text"}
                    ></Input>
                    <Input
                      label={"N° Documento"}
                      placeholder="Ingrese su Numero Documento"
                      onChange={(e) => setNumDocumento(e.target.value)}
                      type={"number"}
                    ></Input>
                    <Select
                      onChange={(event) =>
                        setTipoIdentificacion(event.target.value)
                      }
                      id="comissionType" /* para que es esto */
                      label="Tipo de Identificación"
                      options={{
                        "": "",
                        "C.C Cedula de Ciudadania": "CC",
                        "C.E Cedula de Extranjeria": "CE",
                      }}
                    ></Select>
                  </Fieldset>

                  <Fieldset legend="Empresa" className="lg:col-span-2">
                    <Input
                      label={"N° NIT"}
                      placeholder="Ingrese NIT"
                      onChange={(e) => setNumNit(e.target.value)}
                      type={"number"}
                    ></Input>
                    <Input
                      label={"N° Camara & Comercio"}
                      placeholder="Ingrese Camara & Comercio"
                      onChange={(e) => setNumCamaraComerci(e.target.value)}
                      type={"text"}
                    ></Input>
                    <Input
                      label={"N° RUT"}
                      placeholder="Ingrese RUT"
                      onChange={(e) => setNumRut(e.target.value)}
                      type={"number"}
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
                            const str3 = val.substring(
                              foundIdx + actividad.length
                            );
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
                                        ({
                                          id_actividad,
                                          nombre_actividad,
                                        }) => {
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
                    <Select
                      onChange={(event) =>
                        setResponsableIva(event.target.value)
                      }
                      id="comissionType" /* para que es esto */
                      label={`Responsable del iva "CAMPO 53 RUT"`}
                      options={{
                        "": "",
                        SI: "SI",
                        NO: "NO",
                      }}
                    ></Select>
                  </Fieldset>

                  <Fieldset legend="Contacto" className="lg:col-span-2">
                    <MultipleInput
                      arrState={[telefonos, setTelefonos]}
                      label={(idx) => {
                        if (idx === 0) return "Numero de celular";
                        else return `Numero de celular adicional ${idx}`;
                      }}
                      max={1}
                    />

                    <MultipleInput
                      arrState={[correos, setCorreos]}
                      label={(idx) => {
                        if (idx === 0) return "Correo electronico";
                        else return `Correo electronico adicional ${idx}`;
                      }}
                      max={1}
                      type={"email"}
                    />
                  </Fieldset>
                  <LocationForm
                    place="Comercio"
                    location={commerceLocation}
                    LocalidadComponent={
                      <Select
                        onChange={(event) =>
                          commerceLocation.localidad[1](event.target.value)
                        }
                        id="comissionType"
                        value={commerceLocation.localidad[0]}
                        label={`Localidad`}
                        options={
                          Object.fromEntries([
                            ["", ""],
                            ...LocalidadUbComercio.map(
                              ({ nom_localidad, id_localidad }) => {
                                return [nom_localidad, id_localidad];
                              }
                            ),
                          ]) || { "": "" }
                        }
                      ></Select>
                    }
                  />
                  <LocationForm
                    place="Correspondencia"
                    location={homeLocation}
                    LocalidadComponent={
                      <Select
                        onChange={(event) =>
                          homeLocation.localidad[1](event.target.value)
                        }
                        id="comissionType"
                        value={homeLocation.localidad[0]}
                        label={`Localidad`}
                        options={
                          Object.fromEntries([
                            ["", ""],
                            ...LocalidadUbCorrespondencia.map(
                              ({ nom_localidad, id_localidad }) => {
                                return [nom_localidad, id_localidad];
                              }
                            ),
                          ]) || { "": "" }
                        }
                      ></Select>
                    }
                  />
                  <FileInput
                    className="lg:col-span-2"
                    label={"Elige el archivo del Rut"}
                    onGetFile={onFileChange}
                    accept=".pdf"
                    allowDrop={false}
                  />
                  <FileInput
                    className="lg:col-span-2"
                    label={"Elige el archivo de la CC"}
                    onGetFile={onFileChange2}
                    accept=".pdf"
                    allowDrop={false}
                  />
                  <FileInput
                    className="lg:col-span-2"
                    label={"Elige el archivo de la Camara & Comercio"}
                    onGetFile={onFileChange3}
                    accept=".pdf"
                    allowDrop={false}
                  />
                  <ButtonBar className={"lg:col-span-2"} type="">
                    {
                      <Button type="submit">Enviar Formulario</Button>
                      /*  ) : null */
                    }
                  </ButtonBar>
                </Form>
              </div>
            ) : (
              <div className=" grid gap-4 grid-cols-0 mx-auto xl:w-full border border-solid border-gray-500 p-3">
                <div className={mensajeAutorizacion}>
                  <span className={textoMensajeAutorizacion}>
                    SOLUCIONES EN RED Cumpliendo con la ley estructurada 1581 de
                    2012, en la cual se establece el régimen general de
                    protección de datos y decreto reglamentario 1377 del 2013,
                    solicita respetuosamente su autorización de los datos que
                    han sido suministrados en el presente formato, precisando
                    las siguientes finalidades para el uso de su información: 1.
                    Afiliación del establecimiento de comercio a los productos y
                    servicios ofrecidos por Soluciones En Red 2. Realización de
                    campañas de mercadeo 3. Notificación al establecimiento del
                    comercio de productos y servicios de Red Platik El nombre y
                    la foto asociados a tu cuenta de Google se registrarán
                    cuando subas archivos y envíes este formulario. ¿No es tuya
                    la dirección telemercadeo@puntodepago.com.co? Cambiar de
                    cuenta Los archivos que se suban se compartirán fuera de la
                    organización a la que pertenecen..
                  </span>
                </div>
                <div>
                  <Select
                    onChange={(event) =>
                      setTratamientoDatos(event.target.value)
                    }
                    id="comissionType" /* para que es esto */
                    value={tratamientoDatos}
                    options={{
                      "": "",
                      SI: "SI",
                      NO: "NO",
                    }}
                  ></Select>
                </div>
                <div className={mensajeAutorizacion}>
                  <span className={textoMensajeAutorizacion}>
                    Autorizo a Soluciones En Red al envío de SMS al número
                    celular registrado y el envío de correos electrónicos con
                    información de los productos y servicios.
                  </span>
                </div>
                <div>
                  <Select
                    onChange={(event) => setAutorizacion(event.target.value)}
                    id="comissionType" /* para que es esto */
                    value={autorizacion}
                    options={{
                      "": "",
                      SI: "SI",
                      NO: "NO",
                    }}
                  ></Select>
                </div>
              </div>
            )}
          </Fragment>
        ) : (
          <h1>Usuario se encunetra en proceso</h1>
        )
      ) : (
        ""
      )}
    </div>
  );
};

export default FormularioAutoEnrolamiento;
