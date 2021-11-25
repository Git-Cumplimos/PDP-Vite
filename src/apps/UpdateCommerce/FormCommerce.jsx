import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Base/Button/Button";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../components/Base/Fieldset/Fieldset";
import Form from "../../components/Base/Form/Form";
import Input from "../../components/Base/Input/Input";
import MultipleInput from "../../components/Base/MultipleInput/MultipleInput";
import Select from "../../components/Base/Select/Select";
import LocationForm from "../../components/Compound/LocationForm/LocationForm";
import { useAuth } from "../../utils/AuthHooks";
import fetchData from "../../utils/fetchData";

const url = process.env.REACT_APP_URL_ACTIVIDADES;

const url_send = process.env.REACT_APP_URL_FORM_COMMERCE;

const url_types = process.env.REACT_APP_URL_TYPES_FORM_COMMERCE;

const FormCommerce = () => {
  const [commerceId, setCommerceId] = useState(123);
  const [commerceName, setCommerceName] = useState("");
  const [commerceName2, setCommerceName2] = useState("");

  const [legalRepName, setLegalRepName] = useState("");
  const [legalRepIdType, setLegalRepIdType] = useState("");
  const [legalRepDocId, setLegalRepDocId] = useState("");

  const [phones, setPhones] = useState(["", ""]);
  const [emails, setEmails] = useState([""]);

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

  const [commerceType, setCommerceType] = useState([]);
  const [giftLocation, setGiftLocation] = useState("");

  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);

  // types
  const [docsTypes, setDocsTypes] = useState({});
  const [locsTypes, setLocsTypes] = useState({});

  const { roleInfo } = useAuth();

  const history = useHistory();

  useEffect(() => {
    setCommerceId(roleInfo?.id_comercio ?? 0);
    fetchData(`${url_send}/review`, "GET", {
      id_comercio: roleInfo?.id_comercio ?? 0,
    })
      .then((res) => {
        if (res?.status) {
          if (res?.obj.isActualizado) {
            notify(
              `Formulario ya actualizado el ${Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(res?.obj.fecha_update))}`
            );
            history.replace("/");
          }
        } else {
          notifyError(res?.msg);
        }
      })
      .catch(() => {});
    fetchData(`${url_types}/type-doc`, "GET", {}, {})
      .then((res) => {
        if (res?.status) {
          const temp = { "": "" };
          res?.obj.forEach(({ id_doc, Nombre, nombre_corto }) => {
            temp[`${Nombre} (${nombre_corto})`] = id_doc;
          });
          setDocsTypes({ ...temp });
        } else {
          notifyError(res?.msg);
        }
      })
      .catch(() => {});
    fetchData(`${url_types}/type-loc`, "GET", {}, {})
      .then((res) => {
        if (res?.status) {
          const temp = { "": "" };
          res?.obj.forEach(({ id_doc, Nombre }) => {
            temp[Nombre] = id_doc;
          });
          setLocsTypes({ ...temp });
        } else {
          notifyError(res?.msg);
        }
      })
      .catch(() => {});
  }, [roleInfo, history]);

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  console.log(roleInfo)

  const onSubmit = async (event) => {
    event.preventDefault();

    // Ver tipos de negocio
    if (commerceType.length === 0) {
      notifyError("Por favor ingrese algun tipo de negocio");
      return;
    }

    try {
      const _res = await fetchData(
        `${url_send}/fill`,
        "POST",
        {},
        {
          id_comercio: commerceId,
          Nombre_comercio: commerceName,
          Nombre_comercio_2: commerceName2,
          Tipo_comercio:
            roleInfo?.tipo_comercio === "CRCS"
              ? 2
              : roleInfo?.tipo_comercio === "COMERCIOS CEAS"
              ? 3
              : 1,
          Representante: {
            Nombre: legalRepName,
            Tipo_doc: legalRepIdType,
            Numero_doc: legalRepDocId,
          },
          Contacto: {
            Numeros: phones,
            Correos: emails,
          },
          Location: {
            Comercio: {
              Municipio: {
                id: commerceLocation.foundMunicipios[0][0]
                  .c_digo_dane_del_municipio,
                Nombre: commerceLocation.foundMunicipios[0][0].municipio,
              },
              Departamento: {
                id: commerceLocation.foundMunicipios[0][0]
                  .c_digo_dane_del_departamento,
                Nombre: commerceLocation.foundMunicipios[0][0].departamento,
              },
              Barrio: commerceLocation.barrio[0],
              Localidad: commerceLocation.localidad[0],
              Direccion: commerceLocation.direccion[0],
            },
            Residencia: {
              Municipio: {
                id: homeLocation.foundMunicipios[0][0]
                  .c_digo_dane_del_municipio,
                Nombre: homeLocation.foundMunicipios[0][0].municipio,
              },
              Departamento: {
                id: homeLocation.foundMunicipios[0][0]
                  .c_digo_dane_del_departamento,
                Nombre: homeLocation.foundMunicipios[0][0].departamento,
              },
              Barrio: commerceLocation.barrio[0],
              Localidad: commerceLocation.localidad[0],
              Direccion: commerceLocation.direccion[0],
            },
          },
          Type_acts: commerceType.map((val) => {
            return val.substring(0, 4);
          }),
          Gift: giftLocation,
        }
      );
      if (_res?.status) {
        notify("Formulario subido exitosamente");
        history.replace("/");
      } else {
        notifyError(`Error al subir el formulario: ${_res?.msg}`);
      }
    } catch (err) {}
  };

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Actualizacion de datos</h1>
      <Form className="my-4" onSubmit={onSubmit} grid>
        <Input
          id="idCommerce"
          label="Id de comercio"
          type="text"
          autoComplete="off"
          value={commerceId}
          disabled={true}
        />
        <Input
          id="commerceName"
          label="Nombre del comercio"
          type="text"
          list="oldNameCommerce"
          autoComplete="off"
          value={commerceName}
          onInput={(e) => setCommerceName(e.target.value)}
          required
        />
        <datalist id="oldNameCommerce">
          <option value={roleInfo?.["nombre comercio"] ?? ""} />
        </datalist>
        {roleInfo?.tipo_comercio?.includes("CRC") ? (
          <Input
            id="commerceName2"
            label="Nombre del centro medico"
            type="text"
            autoComplete="off"
            value={commerceName2}
            onInput={(e) => setCommerceName2(e.target.value)}
            required
          />
        ) : roleInfo?.tipo_comercio?.includes("CEA") ? (
          <Input
            id="commerceName2"
            label="Nombre del centro de enseñanza"
            type="text"
            autoComplete="off"
            value={commerceName2}
            onInput={(e) => setCommerceName2(e.target.value)}
            required
          />
        ) : (
          ""
        )}
        <Fieldset legend="Representante legal" className="lg:col-span-2">
          <Input
            id="legalRepName"
            label="Nombre"
            type="text"
            autoComplete="off"
            value={legalRepName}
            onInput={(e) => setLegalRepName(e.target.value)}
            required
          />
          <Input
            id="legalRepDocId"
            label="Numero de identificacion"
            type="text"
            minLength="6"
            autoComplete="off"
            value={legalRepDocId}
            onInput={(e) => setLegalRepDocId(e.target.value)}
            required
          />
          <div className="flex flex-col md:flex-row justify-center items-center text-center my-4 mx-4 gap-4">
            <label className="text-xl text-center" htmlFor="legalRepIdType">
              Tipo de identificacion
            </label>
            <Select
              id="legalRepIdType"
              className="px-4 py-2 rounded-md bg-secondary-light text-black max-w-xs"
              options={docsTypes || []}
              value={legalRepIdType}
              onChange={(e) =>
                setLegalRepIdType(parseInt(e.target.value) || "")
              }
              required
              self
            />
          </div>
        </Fieldset>
        <Fieldset legend="Contacto" className="lg:col-span-2">
          <MultipleInput
            arrState={[phones, setPhones]}
            label={(idx) => {
              if (idx === 0) return "Numero de celular";
              else return `Numero de celular adicional ${idx}`;
            }}
            min={2}
            max={3}
            required
          />
          <MultipleInput
            arrState={[emails, setEmails]}
            label={(idx) => {
              if (idx === 0) return "Correo electronico";
              else return `Correo electronico adicional ${idx}`;
            }}
            max={3}
            required
          />
        </Fieldset>
        <LocationForm place="comercio" location={commerceLocation} />
        <LocationForm place="residencia" location={homeLocation} />
        <div className="flex flex-col justify-center items-center text-center my-4 mx-4 gap-4">
          <Input
            id="actividades_ec"
            label="Buscar tipo de negocio"
            type="search"
            disabled={commerceType.length === 3}
            suggestions={foundActivities || []}
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
                          res?.obj.map(({ id_actividad, nombre_actividad }) => {
                            return `${id_actividad} - ${nombre_actividad}`;
                          })
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
          id="giftLocation"
          label="Donde desea recibir el regalo"
          options={locsTypes}
          value={giftLocation}
          onChange={(e) => setGiftLocation(parseInt(e.target.value) || "")}
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">Enviar formulario</Button>
        </ButtonBar>
      </Form>
      {/* <Modal show={showModal} handleClose={() => setShowModal(false)}></Modal> */}
    </div>
  );
};

export default FormCommerce;
