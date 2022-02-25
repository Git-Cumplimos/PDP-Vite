import React from "react";
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
import { useParams } from "react-router";

const CorreccionFormulario = () => {
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
  //Datos Ubicacion Comercio
  const [municipioCorr, setMunicipioCorr] = useState("");
  const [departamentoCorr, setDepartamentoCorr] = useState("");
  const [localidadCorr, setLocalidadCorr] = useState("");
  const [barrioCorr, setBarrioCorr] = useState("");
  const [direccionCorr, setDireccionCorr] = useState("");
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/actualizacion-estado?numDoc=${params.numCedula}`
    )
      .then((res) => res.json())
      .then((respuesta) => {
        dat: setDatosParams(respuesta.obj.results);
        nomComer: setNombreComercio(
          respuesta.obj.results[0]["nombre_comercio"]
        );
        nomAsesor: setAsignarAsesores(respuesta.obj.results[0]["asesor"]);
        nomRespo: setNombre(respuesta.obj.results[0]["nombre"]);
        apellidoRespo: setApellido(respuesta.obj.results[0]["apellido"]);
        numDoc: setNumDocumento(respuesta.obj.results[0]["numdoc"]);
        tipoDoc: setTipoIdentificacion(respuesta.obj.results[0]["tipodoc"]);
        numNit: setNumNit(respuesta.obj.results[0]["numnit"]);
        numCamara: setNumCamaraComerci(respuesta.obj.results[0]["numcamycom"]);
        numRut: setNumRut(respuesta.obj.results[0]["numrut"]);
        actividadEcono: setActividad(
          respuesta.obj.results[0]["actividad_economica"]
        );
        telefono: setTelefonos(respuesta.obj.results[0]["celular"]);
        correo: setCorreos(respuesta.obj.results[0]["email"]);
        munCorr: setMunicipioCorr(
          respuesta.obj.results[0]["municipio_correspondencia"]
        );
        depCorr: setDepartamentoCorr(
          respuesta.obj.results[0]["departamento_correspondencia"]
        );
        barCorr: setBarrioCorr(
          respuesta.obj.results[0]["barrio_correspondencia"]
        );
        localidadCorr: setLocalidadCorr(
          respuesta.obj.results[0]["localidad_correspondencia"]
        );
        dirCorr: setDireccionCorr(
          respuesta.obj.results[0]["direccion_correspondencia"]
        );
      });
  }, []);
  console.log(datosParams);

  const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };
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
            />

            <Input
              label={"Departamento"}
              placeholder={datosParams[0]["departamento"]}
            />
            <Input label={"Barrio"} placeholder={datosParams[0]["barrio"]} />
            {datosParams[0]["localidad_bogota"].length > 0 ? (
              <Input
                label={"Localidad"}
                placeholder={datosParams[0]["localidad_bogota"]}
              />
            ) : (
              ""
            )}

            <Input
              label={"Direccion"}
              placeholder={datosParams[0]["direccion_comercio"]}
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
            {datosParams[0]["localidad_correspondencia"].length > 0 ? (
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

          {/*   <div>
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
          </div> */}
        </Form>
      ) : (
        ""
      )}
    </div>
  );
};

export default CorreccionFormulario;
