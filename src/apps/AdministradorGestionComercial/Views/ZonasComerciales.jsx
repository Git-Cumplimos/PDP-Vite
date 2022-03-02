import { useState, useEffect, Fragment, useCallback, useMemo } from "react";
import Table from "../../../components/Base/Table";
import Button from "../../../components/Base/Button";
import fetchData from "../../../utils/fetchData";
import Pagination from "../../../components/Compound/Pagination";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { notify, notifyError } from "../../../utils/notify";
import Form from "../../../components/Base/Form";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import Input from "../../../components/Base/Input";
import useQuery from "../../../hooks/useQuery";
import InputSuggestions from "../../../components/Base/InputSuggestions";

const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const ZonasComerciales = () => {
  const [{ page = 1 }] = useQuery();

  const [zonas, setZonas] = useState([]);
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
      const copy = [...selectedMunicipios];
      if (
        !copy
          .map((val) => val.split(") ")[0])
          .includes(foundMunicipios[index].split(") ")[0])
      ) {
        copy.push(foundMunicipios[index]);
        setSelectedMunicipios([...copy]);
      }
      setSearchMunicipios("");
      setFoundMunicipios([]);
    },
    [foundMunicipios, selectedMunicipios]
  );

  const inputSuggResp = useMemo(() => {
    return (
      <div className="grid grid-cols-1 place-items-center text-center gap-4">
        <InputSuggestions
          id="municipiosZonas"
          label={"Buscar municipios"}
          type={"search"}
          suggestions={suggestionsResp}
          onSelectSuggestion={onSelectSugg}
          minLength="4"
          autoComplete="off"
          value={searchMunicipios}
          onInput={(e) => setSearchMunicipios(e.target.value)}
          onLazyInput={{
            callback: (e) => {
              const _responsable = e.target.value;
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

  const fetchZonas = useCallback(() => {
    fetchData(`${url}/zonas`, "GET", { page })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        setZonas(res?.obj?.results);
        setCantidadPaginas(res?.obj?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page]);

  const onCrearZonas = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      fetchData(
        `${url}/zonas`,
        "POST",
        {},
        {
          ...Object.fromEntries(formData.entries()),
          municipios: selectedMunicipios.map((val) => val.split(") ")[0]),
        }
      ).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        ev.target.reset();
        notify("La Zona Ha Sido Creada Con Exito.");
        fetchZonas();
        handleClose();
      });
    },
    [handleClose, fetchZonas, selectedMunicipios]
  );

  const onEditZonas = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      const body = Object.fromEntries(formData.entries());
      const { id_zona } = body;
      delete body.id_zona;

      fetchData(
        `${url}/zonas`,
        "PUT",
        {
          id_zona,
        },
        {
          ...body,
          municipios: selectedMunicipios.map((val) => val.split(") ")[0]),
        }
      )
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }
          ev.target.reset();
          notify("La Zona Ha Sido Editada Con Exito.");
          fetchZonas();
          handleClose();
        })
        .catch((err) => console.error(err));
    },
    [handleClose, fetchZonas, selectedMunicipios]
  );

  useEffect(() => {
    fetchZonas();
  }, [fetchZonas]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="" onClick={() => setShowModal(true)}>
          Agregar Zona
        </Button>
      </ButtonBar>
      <Pagination maxPage={cantidadPaginas} grid></Pagination>
      {Array.isArray(zonas) && zonas.length > 0 ? (
        <Table
          headers={["Id zona", "Nombre zona"]}
          data={zonas.map(({ id_zona, zona }) => ({
            id_zona,
            zona,
          }))}
          onSelectRow={(e, i) => {
            setSelected(zonas[i]);
            getDataFromCodes(zonas[i]?.municipios)
              .then((res) => {
                setSelectedMunicipios([
                  ...res?.map(
                    ({ departamento, municipio, c_digo_dane_del_municipio }) =>
                      `${c_digo_dane_del_municipio}) ${municipio} (${departamento})`
                  ),
                ]);
              })
              .catch(() => {});
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
              title="Editar zona"
              subtitle="Datos zona"
            ></PaymentSummary>
            <Form onSubmit={onEditZonas} grid>
              <input type="hidden" name="id_zona" value={selected?.id_zona} />
              <Input
                label={"Nombre zona"}
                id="zona_editar_zona"
                name="zona"
                type={"text"}
                defaultValue={selected?.zona}
                required
              />
              {inputSuggResp}
              <ButtonBar>
                <Button type={"submit"}>Editar zona</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        ) : (
          <Fragment>
            <PaymentSummary
              title="Crear zona"
              subtitle="Datos zona"
            ></PaymentSummary>
            <Form onSubmit={onCrearZonas} grid>
              <Input
                label={"Nombre zona"}
                id="zona_crear_zona"
                name="zona"
                type={"text"}
                required
              />
              {inputSuggResp}
              <ButtonBar>
                <Button type={"submit"}>Crear zona</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};
export default ZonasComerciales;
