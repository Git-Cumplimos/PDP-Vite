import fetchData from "../../../utils/fetchData";
import AddressInput from "../../Base/AddressInput/AddressInput";
import Fieldset from "../../Base/Fieldset/Fieldset";
import Input from "../../Base/Input/Input";
import Select from "../../Base/Select/Select";

const capitalizeSentence = (sentence) => {
  const words = sentence.split(/[ ]+/g);
  for (const key in words) {
    const word = words[key];
    words[key] = capitalize(word);
    const letters = words[key].split(/[.]+/g);
    for (const key2 in letters) {
      const letter = letters[key2];
      letters[key2] = capitalize(letter);
    }
    words[key] = letters.join(".");
  }
  return words.join(" ");
};
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

  return (
    <Fieldset
      legend={`Ubicacion${place !== "" ? ` ${place}` : ""}`}
      className="lg:col-span-2"
    >
      <Input
        id={`municipio_${place}`}
        label="Municipio"
        type="search"
        list={`opts-muni_${place}`}
        minLength="4"
        autoComplete="off"
        value={municipio}
        onInput={(e) => setMunicipio(capitalizeSentence(e.target.value))}
        onLazyInput={{
          callback: (e) => {
            const municipio = capitalizeSentence(e.target.value);
            if (municipio.length > 1) {
              fetchData(url, "GET", {
                $where: `municipio LIKE '%25${municipio}%25'`,
                $limit: 5,
              })
                .then((res) => {
                  setFoundMuni(res);
                  if (res.length === 1) {
                    setDepartamento(res[0].departamento);
                  } else {
                    setDepartamento("");
                  }
                })
                .catch((err) => console.error(err));
            } else {
              setFoundMuni([]);
              setDepartamento("");
            }
          },
          timeOut: 500,
        }}
        required
      />
      <datalist id={`opts-muni_${place}`}>
        {Array.isArray(foundMuni) &&
          foundMuni
            .filter(({ municipio: mun }, index) => {
              return (
                index ===
                foundMuni.findIndex((obj) => {
                  return obj.municipio === mun;
                })
              );
            })
            .map(({ municipio: mun, c_digo_dane_del_municipio: cod_mun }) => {
              return <option key={cod_mun} value={mun} />;
            })}
      </datalist>
      <Select
        id={`departamento_${place}`}
        label="Departamento"
        options={
          foundMuni.length === 1
            ? Object.fromEntries([
                ...foundMuni.map(
                  ({
                    departamento: dep,
                    c_digo_dane_del_departamento: cod_dep,
                  }) => {
                    return [dep, cod_dep];
                  }
                ),
              ])
            : {
                "": "",
                ...Object.fromEntries([
                  ...foundMuni.map(
                    ({
                      departamento: dep,
                      c_digo_dane_del_departamento: cod_dep,
                    }) => {
                      return [dep, cod_dep];
                    }
                  ),
                ]),
              }
        }
        value={departamento}
        onChange={(e) => setDepartamento(e.target.value)}
        required
      />
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
    </Fieldset>
  );
};

export default LocationForm;
