import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import classes from "../../SolicitudEnrolamiento/views/FormularioEnrolamiento.module.css";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import MultipleInput from "../../../components/Base/MultipleInput/MultipleInput";
import FileInput from "../../../components/Base/FileInput/FileInput";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../../components/Base/Select/Select";
import { useImgs } from "../../../hooks/ImgsHooks";
import { useWindowSize } from "../../../hooks/WindowSizeHooks";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import LocationForm from "../../../components/Compound/LocationForm/LocationForm";
import InputSuggestions from "../../../components/Base/InputSuggestions/InputSuggestions";
import fetchData from "../../../utils/fetchData";

const url = process.env.REACT_APP_URL_ACTIVIDADES;

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
  const [responsableIva, setResponsableIva] = useState("");

  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);

  const [commerceType, setCommerceType] = useState([]);

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
  /* console.log(foundActivities); */
  const handleSubmit = () => {
    /*  console.log(commerceLocation.municipio[0]); */
    /*  e.preventDefault(); */
    const datos = {
      /*   f_name: nombre,
      lastname: apellido,
      email: correos,
      telefono: telefonos,
      task_token: "token",
      validation_state: "Iniciado",
      completado: false, */

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
      Id_Reconocer: "",
      responsable: "",

      /*   asesor: "fabricio",
      nombre: "pablo",
      apellido: "galvis",
      sede: "Bogota",
      tipoDoc: "CC",
      numDoc: "1030635010",
      email: "pablo.galgis@cumplimos.co",
      celular: "3016269510",
      task_token: "token",
      validation_state: "Iniciado",
      Id_Reconocer: "qwe",
      nombre_comercio: "qwe",
      numnit: "qwe",
      numcamycom: "eqw",
      numrut: "eqw",
      autosms: "wqe",
      tipozona: "eqw",
      unidad_negocio: "eqw",
      responsable: "qew",
      cod_localidad: "eqw",
      asesor_comercial_localidad: "qwe",
      actividad_economica: "eqw",
      responsableiva: "eqw",
      tipo_establecimiento: "qw",
      direccion_comercio: "eqw",
      departamento: "eqw",
      municipio: "eqw",
      localidad_bogota: "qwe",
      barrio: "qwe",
      direccion_correspondencia: "sdfaesd",
      departamento_correspondencia: "wqeq",
      municipio_correspondencia: "awe",
      localidad_correspondencia: "qeqweqw",
      barrio_correspondencia: "asdasd", */
    };
    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/iniciarproceso`,
      /* `http://127.0.0.1:5000/iniciarproceso`, */
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta));
    /*    setNombre("");
    setApellido("");
    setTelefono("");
    setCorreo(""); */
    setEstadoForm((old) => !old);
  };
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
    <div class=" flex flex-col justify-center items-center my-8">
      <span className={tituloFormularioInscripcion}>
        Formulario de Inscripción
      </span>
      <Form
        /* gird={false} */
        grid
        onSubmit={(e) => handleSubmit() || handleReconoser(e)}
      >
        <Input
          label={"Nombre Comercio"}
          placeholder="Ingrese Nombre Comercio"
          onChange={(e) => setNombreComercio(e.target.value)}
        ></Input>

        <Fieldset
          legend="Representante legal"
          className="lg:col-span-3
        "
        >
          <Input
            label={"Nombre"}
            placeholder="Ingrese su Nombre"
            onChange={(e) => setNombre(e.target.value)}
          ></Input>

          <Input
            label={"Apellido"}
            placeholder="Ingrese su Apellido"
            onChange={(e) => setApellido(e.target.value)}
          ></Input>
          <Input
            label={"N° Documento"}
            placeholder="Ingrese su Numero Documento"
            onChange={(e) => setNumDocumento(e.target.value)}
          ></Input>
          <Select
            onChange={(event) => setTipoIdentificacion(event.target.value)}
            id="comissionType" /* para que es esto */
            name="comissionType"
            label="Tipo de Identificación"
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
          ></Input>
          <Input
            label={"N° Camara & Comercio"}
            placeholder="Ingrese Camara & Comercio"
            onChange={(e) => setNumCamaraComerci(e.target.value)}
          ></Input>
          <Input
            label={"N° RUT"}
            placeholder="Ingrese RUT"
            onChange={(e) => setNumRut(e.target.value)}
          ></Input>
          <div className="flex flex-col justify-center items-center text-center my-4 mx-4 gap-4">
            <InputSuggestions
              id="actividades_ec2"
              label={"Buscar Actividad Economica"}
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
            required
          />
          <div className={autorizacionMensajes}>
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
                options={{
                  "": "",
                  SI: "SI",
                  NO: "NO",
                }}
              ></Select>
            </div>
          </div>
        </Fieldset>
      </Form>
      <LocationForm place="Comercio" location={commerceLocation} />
      <LocationForm place="Correspondencia" location={homeLocation} />

      <ButtonBar className={"lg:col-span-2"} type="">
        {estadoFormulario ? null : (
          <Button
            type="submit"
            onClick={() => /* setEstadoForm((old) => !old) */ handleSubmit()}
          >
            Enviar Formulario
          </Button>
        )}
      </ButtonBar>
      {/* <ButtonBar className={"lg:col-span-2"} type="">
        {estadoFormulario ? (
          <Button type="submit" onClick={() => handleReconoser()}>
            Comenzar ReconoserID
          </Button>
        ) : null}
      </ButtonBar> */}
      <FileInput self={true}></FileInput>
    </div>
  );
};

export default FormularioEnrolamiento;
