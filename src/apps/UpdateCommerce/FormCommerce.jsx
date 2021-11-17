import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../components/Base/Button/Button";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../components/Base/Fieldset/Fieldset";
import Form from "../../components/Base/Form/Form";
import Input from "../../components/Base/Input/Input";
import Modal from "../../components/Base/Modal/Modal";
import MultipleInput from "../../components/Base/MultipleInput/MultipleInput";
import MultipleSelect from "../../components/Base/MultipleSelect/MultipleSelect";
import Select from "../../components/Base/Select/Select";
import LocationForm from "../../components/Compound/LocationForm/LocationForm";
import { useAuth } from "../../utils/AuthHooks";
import fetchData from "../../utils/fetchData";

const url =
  "http://actividades-economicas-ciiu-dev.us-east-2.elasticbeanstalk.com/actividad";

const FormCommerce = () => {
  const [commerceId, setCommerceId] = useState(123);
  const [commerceName, setCommerceName] = useState("");

  const [legalRepName, setLegalRepName] = useState("");
  const [legalRepIdType, setLegalRepIdType] = useState("");
  const [legalRepDodId, setLegalRepDodId] = useState("");

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

  const [showModal, setShowModal] = useState(false);
  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);

  const { roleInfo } = useAuth();
  useEffect(() => {
    // console.log(roleInfo);
    setCommerceId(roleInfo?.id_comercio || 0);
  }, [roleInfo]);

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

  const onSubmit = (event) => {
    event.preventDefault();

    // Revisar municipios
    fetchData(url, "GET", {
      $where: `municipio='${commerceLocation.municipio[0]}'`,
      $limit: 5,
    })
      .then((res) => {
        if (res.length !== 1) {
          notifyError("Por favor ingrese un municipio valido para el comercio");
        } else {
          fetchData(url, "GET", {
            $where: `municipio='${homeLocation.municipio[0]}'`,
            $limit: 5,
          })
            .then((res) => {
              if (res.length !== 1) {
                notifyError(
                  "Por favor ingrese un municipio valido para la residencia"
                );
              }
            })
            .catch((err) => console.error(err));
        }
      })
      .catch((err) => console.error(err));

    // Ver tipos de negocio
    if (commerceType.length === 0) {
      notifyError("Por favor ingrese algun tipo de negocio");
    } else {
    }
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
          <option value={roleInfo?.["nombre comercio"] || ""}></option>
        </datalist>
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
            id="legalRepDodId"
            label="Numero de identificacion"
            type="text"
            autoComplete="off"
            value={legalRepDodId}
            onInput={(e) => setLegalRepDodId(e.target.value)}
            required
          />
          <div className="flex flex-col md:flex-row justify-center items-center text-center my-4 mx-4 gap-4">
            <label className="text-xl text-center" htmlFor="legalRepIdType">
              Tipo de identificacion
            </label>
            <Select
              id="legalRepIdType"
              className="px-4 py-2 rounded-md bg-secondary-light text-black max-w-xs"
              options={{
                "": "",
                "Cédula de ciudadanía (CC)": 13,
                "Tarjeta de extranjeria (TE)": 21,
                "Cédula de extranjeria (CE)": 22,
                "Pasaporte (PA)": 41,
                "Permiso de permanencia (PE)": 44,
                "Documento de identificación extranjero": 42,
                "Número Único de Identificación Personal (NUIP)": 91,
              }}
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
                      setFoundActivities(
                        res?.obj.map(({ id_actividad, nombre_actividad }) => {
                          return `${id_actividad} - ${nombre_actividad}`;
                        })
                      );
                    })
                    .catch((err) => console.error(err));
                } else {
                  setFoundActivities([]);
                }
              },
              timeOut: 500,
            }}
          />
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
        </div>
        <Select
          id="giftLocation"
          label="Donde desea recibir el regalo"
          options={{
            "": "",
            Comercio: 1,
            Residencia: 2,
          }}
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
