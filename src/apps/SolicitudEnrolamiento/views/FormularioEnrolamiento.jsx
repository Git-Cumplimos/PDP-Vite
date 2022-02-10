import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import classes from "../../SolicitudEnrolamiento/views/FormularioEnrolamiento.module.css";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import MultipleInput from "../../../components/Base/MultipleInput/MultipleInput";
import FileInput from "../../../components/Base/FileInput/FileInput";
import { useState, useEffect, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../../components/Base/Select/Select";
import { useImgs } from "../../../hooks/ImgsHooks";
import { useWindowSize } from "../../../hooks/WindowSizeHooks";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import LocationForm from "../../../components/Compound/LocationForm/LocationForm";
import InputSuggestions from "../../../components/Base/InputSuggestions/InputSuggestions";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import sendFormData from "../../../utils/sendFormData";

const url = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actividad`;

const FormularioEnrolamiento = () => {
  const {
    principal,
    tituloFormularioInscripcion,
    datos,
    datosCorreo,
    autorizacionMensajes,
    mensajeAutorizacion,
    textoMensajeAutorizacion,
  } = classes;
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
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estadoFormulario, setEstadoForm] = useState(false);
  const [autorizacion, setAutorizacion] = useState("");
  const [tratamientoDatos, setTratamientoDatos] = useState("");
  const [responsableIva, setResponsableIva] = useState("");

  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);

  const [commerceType, setCommerceType] = useState([]);

  const [archivos1, setArchivos1] = useState([]);
  const [archivos2, setArchivos2] = useState([]);

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
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const datos = {
        asesor: "juan",
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
        /*  id_reconocer: "", */
        responsable: "",
      };
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/iniciarproceso`,

        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      )
        .then((res) => res.json())
        .then((respuesta) => {
          console.log(respuesta);
          const formData = new FormData();

          formData.set("rut", archivos1[0]);
          /* formData.set("pdf-1-2", archivos1[1]); */

          formData.set("cc", archivos2[0]);

          formData.set("numdoc", numDocumento);

          formData.set("id_proceso", respuesta.body.id_proceso);
          /*   console.log(archivos1[0]);
          console.log(archivos2[0]); */
          notify("Se ha comenzado la carga");

          console.log(Object.fromEntries(formData.entries()));

          fetch(
            `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/uploadfile`,

            {
              method: "POST",
              /*   headers: {
                "Content-type": "application/json",
              }, */
              body: formData,
            }
          )
            .then((res) => res.json())
            .then((respuesta) => {
              if (!respuesta?.status) {
                notifyError(respuesta?.msg);
              } else {
                console.log(respuesta?.obj);
                notify("Se han subido los archivos");
                setEstadoForm(true);
              }
            });
          /* sendFormData(
            `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/uploadfile`,
            "POST",
            formData,
            (xhr) => {
              if (xhr.status === 200) {
                const res = xhr.response;
                if (!res?.status) {
                  notifyError(res?.msg);
                } else {
                  console.log(res?.obj);
                  notify("Se han subido los archivos");
                  setEstadoForm(true);
                }
              }
            },
            (xhr) => {
              notifyError("Error de red");
            },
            "json"
          ); */
        });
    },
    [archivos1, archivos2]
  );
  const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
  const commerceLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };
  const homeLocation = {
    municipio: useState(""),
    departamento: useState(""),
    localidad: useState(""),
    barrio: useState(""),
    direccion: useState(""),
    foundMunicipios: useState([]),
  };

  const navigate = useNavigate();

  /*  const handleSubmit = () => {
   
  }; */
  const handleReconoser = async () => {
    navigate("/Solicitud-enrolamiento/reconoserid");
  };
  const [clientWidth] = useWindowSize();
  const {
    imgs: { personas },
    svgs: { backIcon, backIconSecondary },
  } = useImgs();
  useEffect(() => {
    if (clientWidth > 768) {
      document.body.style.backgroundImage = `url(""), url("${backIcon}"), url("")`;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "2.5% 100%, center, center";
      document.body.style.backgroundSize = "500px, cover, cover";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [backIcon, backIconSecondary, clientWidth]);
  return (
    <div className=" flex flex-col justify-center items-center text-justify my-8">
      <span className={tituloFormularioInscripcion}>
        Formulario de Inscripción
      </span>
      {autorizacion === "SI" && tratamientoDatos === "SI" ? (
        <div>
          <Form
            /* gird={false} */
            grid
            onSubmit={(e) => handleSubmit() || handleReconoser(e)}
          >
            <Input
              label={"Nombre Comercio"}
              placeholder="Ingrese Nombre Comercio"
              value={nombreComercio}
              onChange={(e) => setNombreComercio(capitalize(e.target.value))}
              type="text"
              required
            ></Input>

            <Fieldset
              legend="Representante legal"
              className="lg:col-span-3
      "
            >
              <Input
                label={"Nombres"}
                placeholder="Ingrese sus Nombres"
                value={nombre}
                onChange={(e) => setNombre(capitalize(e.target.value))}
                type={"text"}
                required
              ></Input>

              <Input
                label={"Apellidos"}
                placeholder="Ingrese sus Apellidos"
                value={apellido}
                onChange={(e) => setApellido(capitalize(e.target.value))}
                type={"text"}
                required
              ></Input>
              <Input
                label={"N° Documento"}
                placeholder="Ingrese su Numero Documento"
                onChange={(e) => setNumDocumento(e.target.value)}
                type={"number"}
                required
              ></Input>
              <Select
                onChange={(event) => setTipoIdentificacion(event.target.value)}
                id="comissionType" /* para que es esto */
                name="comissionType"
                label="Tipo de Identificación"
                required
                options={{
                  "": "",
                  "C.C Cedula de Ciudadania": "CC",
                  "C.E Cedula de Extranjeria": "CE",
                }}
              ></Select>
            </Fieldset>

            <Fieldset
              legend="Empresa"
              className="lg:col-span-3
      "
            >
              <Input
                label={"N° NIT"}
                placeholder="Ingrese NIT"
                onChange={(e) => setNumNit(e.target.value)}
                type={"number"}
                required
              ></Input>
              <Input
                label={"N° Camara & Comercio"}
                placeholder="Ingrese Camara & Comercio"
                onChange={(e) => setNumCamaraComerci(e.target.value)}
                type={"text"}
                required
              ></Input>
              <Input
                label={"N° RUT"}
                placeholder="Ingrese RUT"
                onChange={(e) => setNumRut(e.target.value)}
                type={"number"}
                required
              ></Input>
              <div className="flex flex-col justify-center items-center text-center my-4 mx-4 gap-4">
                <InputSuggestions
                  id="actividades_ec2"
                  label={"Buscar Actividad Economica"}
                  type={"search"}
                  required
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
                        <h1 className="text-xs">
                          {str1}
                          <strong>{str2}</strong>
                          {str3}
                        </h1>
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
                        fetchData(url, "GET", {
                          q: _actividad,
                          limit: 5,
                        })
                          .then((res) => {
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
              <Select
                onChange={(event) => setResponsableIva(event.target.value)}
                id="comissionType" /* para que es esto */
                name="comissionType"
                required
                label={`Responsable del iva "CAMPO 53 RUT"`}
                options={{
                  "": "",
                  SI: "SI",
                  NO: "NO",
                }}
              ></Select>
              <Select
                onChange={(event) => setTipoComercio(event.target.value)}
                id="comissionType" /* para que es esto */
                name="comissionType"
                label={`Tipo de Establecimiento`}
                required
                options={{
                  "": "",
                  Papeleria: "Papeleria",
                  " Tienda De Mascotas": " Tienda De Mascotas",
                }}
              ></Select>
            </Fieldset>

            <Fieldset legend="Contacto" className="lg:col-span-3">
              <MultipleInput
                arrState={[telefonos, setTelefonos]}
                label={(idx) => {
                  if (idx === 0) return "Numero de celular";
                  else return `Numero de celular adicional ${idx}`;
                }}
                max={3}
                required
              />

              <MultipleInput
                arrState={[correos, setCorreos]}
                label={(idx) => {
                  if (idx === 0) return "Correo electronico";
                  else return `Correo electronico adicional ${idx}`;
                }}
                max={3}
                type={"email"}
                required
              />
            </Fieldset>
          </Form>
          <LocationForm place="Comercio" location={commerceLocation} required />
          <LocationForm
            place="Correspondencia"
            location={homeLocation}
            required
          />

          <Fragment>
            <Form /* onSubmit={onSubmit}  */ grid>
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
              {/*   <ButtonBar className="lg:col-span-2">
          <Button type="submit">Subir archivos</Button>
        </ButtonBar> */}
            </Form>
          </Fragment>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              /* archivos1.length > 0 && archivos2.length > 0  */ /* estadoFormulario ? ( */
              <Button
                type="submit"
                onClick={(e) =>
                  /* setEstadoForm((old) => !old) */ handleSubmit(e)
                }
              >
                Enviar Formulario
              </Button>
              /*  ) : null */
            }
          </ButtonBar>
        </div>
      ) : (
        <div className=" grid gap-4 grid-cols-0 mx-auto xl:w-full border border-solid border-gray-500 p-3">
          <div className={mensajeAutorizacion}>
            <span className={textoMensajeAutorizacion}>
              SOLUCIONES EN RED Cumpliendo con la ley estructurada 1581 de 2012,
              en la cual se establece el régimen general de protección de datos
              y decreto reglamentario 1377 del 2013, solicita respetuosamente su
              autorización de los datos que han sido suministrados en el
              presente formato, precisando las siguientes finalidades para el
              uso de su información: 1. Afiliación del establecimiento de
              comercio a los productos y servicios ofrecidos por Soluciones En
              Red 2. Realización de campañas de mercadeo 3. Notificación al
              establecimiento del comercio de productos y servicios de Red
              Platik El nombre y la foto asociados a tu cuenta de Google se
              registrarán cuando subas archivos y envíes este formulario. ¿No es
              tuya la dirección telemercadeo@puntodepago.com.co? Cambiar de
              cuenta Los archivos que se suban se compartirán fuera de la
              organización a la que pertenecen..
            </span>
          </div>
          <div>
            <Select
              onChange={(event) => setTratamientoDatos(event.target.value)}
              id="comissionType" /* para que es esto */
              name="comissionType"
              value={tratamientoDatos}
              required
              options={{
                "": "",
                SI: "SI",
                NO: "NO",
              }}
            ></Select>
          </div>
          <div className={mensajeAutorizacion}>
            <span className={textoMensajeAutorizacion}>
              Autorizo a Soluciones En Red al envío de SMS al número celular
              registrado y el envío de correos electrónicos con información de
              los productos y servicios.
            </span>
          </div>
          <div>
            <Select
              onChange={(event) => setAutorizacion(event.target.value)}
              id="comissionType" /* para que es esto */
              name="comissionType"
              value={autorizacion}
              required
              options={{
                "": "",
                SI: "SI",
                NO: "NO",
              }}
            ></Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioEnrolamiento;
