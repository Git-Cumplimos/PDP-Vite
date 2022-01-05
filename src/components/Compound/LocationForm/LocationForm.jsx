import { useState } from "react";
import fetchData from "../../../utils/fetchData";
import AddressInput from "../../Base/AddressInput/AddressInput";
import Button from "../../Base/Button/Button";
import ButtonBar from "../../Base/ButtonBar/ButtonBar";
import Fieldset from "../../Base/Fieldset/Fieldset";
import Input from "../../Base/Input/Input";
import Modal from "../../Base/Modal/Modal";
import Table from "../../Base/Table/Table";

const capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
};

const url = process.env.REACT_APP_URL_DANE_MUNICIPIOS;

const LocationForm = ({ place = "", location }) => {
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
      legend={`Ubicacion${place !== "" ? ` ${place}` : ""}`}
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
        value={barrio}
        onInput={(e) => setBarrio(capitalize(e.target.value))}
        required
      />
      {Array.isArray(foundMuni) &&
      foundMuni.length === 1 &&
      parseInt(foundMuni[0].c_digo_dane_del_departamento) === 11 ? (
        <Input
          id={`localidad_${place}`}
          label="Localidad"
          type="search"
          autoComplete="off"
          value={localidad}
          onInput={(e) => setLocalidad(capitalize(e.target.value))}
          required
        />
      ) : (
        ""
      )}
      <AddressInput
        label="Direccion de comercio"
        place={place}
        getAddress={addrState[1]}
      />
      <Modal
        show={showModal}
        handleClose={() => setShowModal(false)}
        className="px-6"
      >
        <Input
          id={`buscar_${place}`}
          label="Busqueda por municipio"
          type="search"
          minLength="4"
          autoComplete="off"
          value={simpleSearch}
          onInput={(e) => setSimpleSearch(capitalize(e.target.value))}
          onLazyInput={{
            callback: (e) => {
              const query = capitalize(e.target.value);
              if (query.length > 1) {
                fetchData(url, "GET", {
                  $where: `municipio LIKE '%${query}%'`,
                  $limit: 5,
                })
                  .then((res) => {
                    setFoundMuni(res);
                  }).catch(() => {})
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
