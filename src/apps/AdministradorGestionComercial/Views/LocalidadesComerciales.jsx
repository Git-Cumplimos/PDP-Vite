import { useState, useEffect, Fragment, useCallback, useMemo } from "react";
import Table from "../../../components/Base/Table/Table";
import Button from "../../../components/Base/Button/Button";
import fetchData from "../../../utils/fetchData";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import { notify, notifyError } from "../../../utils/notify";
import Form from "../../../components/Base/Form/Form";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";
import Input from "../../../components/Base/Input/Input";
import useQuery from "../../../hooks/useQuery";
import InputSuggestions from "../../../components/Base/InputSuggestions/InputSuggestions";

const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
};

const LocalidadesComerciales = () => {
  const [{ page = 1 }] = useQuery();

  const [localidades, setLocalidades] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  /**
   * Input Suggestions vars
   */
  const [foundMunicipios, setFoundMunicipios] = useState([]);
  const [searchMunicipios, setSearchMunicipios] = useState("");
  const [selectedMunicipios, setSelectedMunicipios] = useState([]);

  const suggestionsResp = useMemo(() => {
    return (
      foundMunicipios.map((val) => {
        const foundIdx = val
          .toLowerCase()
          .indexOf(searchMunicipios.toLowerCase());
        if (foundIdx === -1) {
          return (
            <div className="grid grid-cols-1 place-items-center px-4 py-2">
              <h1 className="text-sm">{val}</h1>
            </div>
          );
        }
        const str1 = val.substring(0, foundIdx);
        const str2 = val.substring(
          foundIdx,
          foundIdx + searchMunicipios.length
        );
        const str3 = val.substring(foundIdx + searchMunicipios.length);
        return (
          <div className="grid grid-cols-1 place-items-center px-4 py-2">
            <h1 className="text-sm">
              {str1}
              <strong>{str2}</strong>
              {str3}
            </h1>
          </div>
        );
      }) || []
    );
  }, [searchMunicipios, foundMunicipios]);

  const onSelectSugg = useCallback(
    (index) => {
      setSelectedMunicipios([foundMunicipios[index]]);
      setSearchMunicipios("");
      setFoundMunicipios([]);
    },
    [foundMunicipios]
  );

  const inputSuggResp = useMemo(() => {
    return (
      <div className="grid grid-cols-1 place-items-center text-center gap-4">
        <InputSuggestions
          id="municipiosLocalidades"
          label={"Buscar municipio"}
          type={"search"}
          suggestions={suggestionsResp}
          onSelectSuggestion={onSelectSugg}
          minLength="4"
          autoComplete="off"
          value={searchMunicipios}
          onInput={(e) => setSearchMunicipios(e.target.value)}
          onLazyInput={{
            callback: (e) => {
              const _responsable = capitalize(e.target.value);
              if (_responsable.length > 0) {
                fetchData(
                  process.env.REACT_APP_URL_DANE_MUNICIPIOS,
                  "GET",
                  {
                    $where: `municipio LIKE '%${_responsable}%'`,
                    $limit: 5,
                  },
                  {},
                  {},
                  false
                )
                  .then((res) => {
                    setFoundMunicipios(
                      res?.map(
                        ({
                          departamento,
                          municipio,
                          c_digo_dane_del_municipio,
                        }) =>
                          `${c_digo_dane_del_municipio}) ${municipio} (${departamento})`
                      )
                    );
                  })
                  .catch(() => {});
              } else {
                setFoundMunicipios([]);
              }
            },
            timeOut: 500,
          }}
        />
        {selectedMunicipios.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {selectedMunicipios.map((el, idx) => {
              return (
                <li key={idx} className="grid grid-cols-8">
                  <span className="bi bi-pin-map-fill text-xl" />
                  <h1 className="col-span-6">{el}</h1>
                  <span
                    onClick={() => {
                      const copy = [...selectedMunicipios];
                      copy.splice(idx, 1);
                      setSelectedMunicipios([...copy]);
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
    );
  }, [onSelectSugg, searchMunicipios, selectedMunicipios, suggestionsResp]);

  const getDataFromCodes = useCallback(async (codes) => {
    if (!Array.isArray(codes) || codes.length < 1) {
      return new Promise((resolve, reject) => resolve([]));
    }
    try {
      const newData = [];
      for (const code of codes) {
        const res = await fetchData(
          process.env.REACT_APP_URL_DANE_MUNICIPIOS,
          "GET",
          {
            c_digo_dane_del_municipio: code,
          },
          {},
          {},
          false
        );
        newData.push(...res);
      }
      return newData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);
  /**
   * End
   */

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(null);
    setSelectedMunicipios([]);
    setSearchMunicipios("");
  }, []);

  const fetchLocalidades = useCallback(() => {
    fetchData(`${url}/localidades`, "GET", { page })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        setCantidadPaginas(res?.obj?.maxPages);
        getDataFromCodes([
          ...new Set(
            res?.obj?.results
              .map(({ cod_dane }) => cod_dane)
              .filter((val) => val)
          ),
        ])
          .then((_res) => {
            setLocalidades(
              res?.obj?.results.map((val) => {
                const place = _res.find(
                  ({ c_digo_dane_del_municipio }) =>
                    c_digo_dane_del_municipio === val?.cod_dane
                );

                const municipio = place
                  ? `${place?.municipio ?? ""} (${place?.departamento ?? ""})`
                  : "";
                return {
                  ...val,
                  municipio,
                };
              })
            );
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => console.error(err));
  }, [page, getDataFromCodes]);

  const onCrearLocalidades = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      const body = {
        nom_localidad: formData.get("nom_localidad"),
      };

      if (selectedMunicipios.length > 0) {
        body.cod_dane = selectedMunicipios.map((val) => val.split(") ")[0])[0];
      } else {
        body.cod_dane = "";
      }

      fetchData(`${url}/localidades`, "POST", {}, body).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        ev.target.reset();
        notify("La Localidad Ha Sido Creada Con Exito.");
        fetchLocalidades();
        handleClose();
      });
    },
    [handleClose, fetchLocalidades, selectedMunicipios]
  );

  const onEditLocalidades = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      const args = {
        id_localidad: formData.get("id_localidad"),
      };

      const body = {
        nom_localidad: formData.get("nom_localidad"),
      };

      if (selectedMunicipios.length > 0) {
        body.cod_dane = selectedMunicipios.map((val) => val.split(") ")[0])[0];
      } else {
        body.cod_dane = "";
      }

      fetchData(`${url}/localidades`, "PUT", args, body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }
          ev.target.reset();
          notify("La Localidad Ha Sido Editada Con Exito.");
          fetchLocalidades();
          handleClose();
        })
        .catch((err) => console.error(err));
    },
    [handleClose, fetchLocalidades, selectedMunicipios]
  );

  useEffect(() => {
    fetchLocalidades();
  }, [fetchLocalidades]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="" onClick={() => setShowModal(true)}>
          Agregar Localidad
        </Button>
      </ButtonBar>
      <Pagination maxPage={cantidadPaginas} grid></Pagination>
      {Array.isArray(localidades) && localidades.length > 0 ? (
        <Table
          headers={["Id localidad", "Nombre localidad", "Municipio"]}
          data={localidades.map(
            ({ id_localidad, nom_localidad, municipio }) => ({
              id_localidad,
              nom_localidad,
              municipio,
            })
          )}
          onSelectRow={(e, i) => {
            setSelected(localidades[i]);
            if (localidades[i]?.cod_dane) {
              setSelectedMunicipios([
                `${localidades[i]?.cod_dane}) ${localidades[i]?.municipio}`,
              ]);
            }
            setShowModal(true);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        {selected ? (
          <Fragment>
            <PaymentSummary
              title="Editar localidad"
              subtitle="Datos localidad"
            ></PaymentSummary>
            <Form onSubmit={onEditLocalidades} grid>
              <input
                type="hidden"
                name="id_localidad"
                value={selected?.id_localidad}
              />
              <Input
                label={"Nombre localidad"}
                id="localidad_editar_localidad"
                name="nom_localidad"
                type={"text"}
                defaultValue={selected?.nom_localidad}
                required
              />
              {inputSuggResp}
              <ButtonBar>
                <Button type={"submit"}>Editar localidad</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        ) : (
          <Fragment>
            <PaymentSummary
              title="Crear localidad"
              subtitle="Datos localidad"
            ></PaymentSummary>
            <Form onSubmit={onCrearLocalidades} grid>
              <Input
                label={"Nombre localidad"}
                id="localidad_crear_localidad"
                name="nom_localidad"
                type={"text"}
                required
              />
              {inputSuggResp}
              <ButtonBar>
                <Button type={"submit"}>Crear localidad</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};
export default LocalidadesComerciales;
