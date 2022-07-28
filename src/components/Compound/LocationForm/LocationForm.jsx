import { useState } from "react";
import fetchData from "../../../utils/fetchData";
import AddressInput from "../../Base/AddressInput/AddressInput";
import Button from "../../Base/Button";
import ButtonBar from "../../Base/ButtonBar";
import Fieldset from "../../Base/Fieldset";
import Input from "../../Base/Input";
import Modal from "../../Base/Modal";
import Table from "../../Base/Table";

const capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
};

const url = process.env.REACT_APP_URL_DANE_MUNICIPIOS;

const LocationForm = ({
  place = "",
  location,
  LocalidadComponent = null,
  addressInput = true,
}) => {
  const {
    municipio: munState,
    departamento: depState,
    localidad: locState,
    direccion: addrState,
    foundMunicipios: foundState,
    barrio: barrState,
  } = location;

  const [municipio, setMunicipio] = munState;
  const [departamento, setDepartamento] = depState;
  const [foundMuni, setFoundMuni] = foundState;
  const [localidad, setLocalidad] = locState;
  const [barrio, setBarrio] = barrState;

  const [showModal, setShowModal] = useState(false);
  const [simpleSearch, setSimpleSearch] = useState("");

  return (
    <Fieldset
      legend={`Ubicación${place !== "" ? ` ${place}` : ""}`}
      className="lg:col-span-2"
    >
      <Input
        id={`municipio_${place}`}
        label="Municipio"
        type="search"
        value={municipio}
        disabled
        required
      />
      <Input
        id={`departamento_${place}`}
        label="Departamento"
        type="search"
        value={departamento}
        disabled
        required
      />
      <ButtonBar className="lg:col-span-2">
        <Button type="button" onClick={() => setShowModal(true)}>
          Buscar municipio y departamento
        </Button>
      </ButtonBar>
      <Input
        id={`barrio_${place}`}
        label="Barrio"
        type="text"
        autoComplete="off"
        minLength="1"
        maxLength="30"
        value={barrio}
        onInput={(e) => setBarrio(capitalize(e.target.value))}
        required
      />
      {(Array.isArray(foundMuni) &&
        foundMuni.length === 1 &&
        parseInt(foundMuni[0].c_digo_dane_del_departamento) === 11) ||
      (foundMuni.length === 1 &&
        parseInt(foundMuni[0].c_digo_dane_del_departamento) === 13) ||
      (foundMuni.length === 1 &&
        parseInt(foundMuni[0].c_digo_dane_del_departamento) === 8) ? (
        LocalidadComponent ? (
          LocalidadComponent
        ) : (
          <Input
            id={`localidad_${place}`}
            label="Localidad"
            type="search"
            autoComplete="off"
            value={localidad}
            onInput={(e) => setLocalidad(capitalize(e.target.value))}
            required
          />
        )
      ) : (
        ""
      )}
      {addressInput === "input" ? (
        <Input
          id={`dir_${place}`}
          label={`Dirección de ${place}`}
          type="text"
          autoComplete="off"
          minLength="1"
          maxLength="60"
          value={addrState[0]}
          onInput={(e) => addrState[1](e.target.value)}
          required
        />
      ) : addressInput ? (
        <AddressInput
          label={`Dirección de ${place}`}
          place={place}
          getAddress={addrState[1]}
        />
      ) : (
        ""
      )}
      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        className="px-6"
      >
        <Input
          id={`buscar_${place}`}
          label="Búsqueda por municipio"
          type="search"
          autoComplete="off"
          value={simpleSearch}
          onInput={(e) => setSimpleSearch(capitalize(e.target.value))}
          onLazyInput={{
            callback: (e) => {
              const query = capitalize(e.target.value);
              if (query.length > 1) {
                fetchData(
                  url,
                  "GET",
                  {
                    $where: `municipio LIKE '%${query}%'`,
                    $limit: 5,
                  },
                  {},
                  {},
                  false
                )
                  .then((res) => {
                    setFoundMuni(res);
                  })
                  .catch(() => {});
              } else {
                setFoundMuni([]);
              }
            },
            timeOut: 500,
          }}
        />
        {Array.isArray(foundMuni) && foundMuni.length > 0 ? (
          <Table
            headers={["Departamento", "Municipio"]}
            data={foundMuni.map(({ departamento, municipio }) => {
              return { departamento, municipio };
            })}
            onSelectRow={(e, i) => {
              setDepartamento(foundMuni[i].departamento);
              setMunicipio(foundMuni[i].municipio);
              setFoundMuni([foundMuni[i]]);
              setSimpleSearch("");
              setShowModal(false);
            }}
          ></Table>
        ) : (
          ""
        )}
      </Modal>
    </Fieldset>
  );
};

export default LocationForm;
