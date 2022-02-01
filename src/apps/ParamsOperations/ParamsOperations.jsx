import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/Base/Button/Button";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../components/Base/Fieldset/Fieldset";
import Form from "../../components/Base/Form/Form";
import Input from "../../components/Base/Input/Input";
import InputSuggestions from "../../components/Base/InputSuggestions/InputSuggestions";
import Modal from "../../components/Base/Modal/Modal";
import Table from "../../components/Base/Table/Table";
import Pagination from "../../components/Compound/Pagination/Pagination";
import PaymentSummary from "../../components/Compound/PaymentSummary/PaymentSummary";
import useQuery from "../../hooks/useQuery";
import fetchData from "../../utils/fetchData";
import { notify, notifyError } from "../../utils/notify";

const url_types = process.env.REACT_APP_URL_TRXS_TIPOS_BASE;

const fetchTrxTypesPages = (Nombre_operacion, page) => {
  try {
    const res = fetchData(`${url_types}/tipos-operaciones-pagination`, "GET", {
      Nombre_operacion,
      page,
    });

    if (res?.status) {
      return res?.obj;
    } else {
      notifyError(res?.msg);
    }
  } catch (err) {
    throw err;
  }
  return {};
};

const ParamsOperations = () => {
  const [{ searchTrxType = "", page = 1 }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const [maxPages, setMaxPages] = useState(0);
  const [trxTypes, setTrxTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [foundAliados, setFoundAliados] = useState([]);

  const tableTrxTypes = useMemo(() => {
    return trxTypes.map(({ id_tipo_operacion, Aliado, Nombre }) => ({
      Id: id_tipo_operacion,
      "Tipo de transaccion": Nombre,
      Aliado: Aliado,
    }));
  }, [trxTypes]);

  const mapSuggestionsAliados = useMemo(
    () => foundAliados.map((val) => val),
    [foundAliados]
  );

  const searchAliados = useCallback(() => {
    setFoundAliados([]);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(null);
  }, []);

  const setFoundTrxTypes = useCallback(() => {
    fetchTrxTypesPages(searchTrxType, page)
      .then((res) => {
        setTrxTypes([...res?.results]);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [searchTrxType, page]);

  const onChange = useCallback(
    (e) => {
      const formData = new FormData(e.target.form);
      const Nombre_operacion = formData.get("searchTrxType");

      setQuery({ searchTrxType: Nombre_operacion }, { replace: true });
    },
    [setQuery]
  );

  const onSelectAutorizador = useCallback(
    (e, i) => {
      setSelected({ ...trxTypes[i] });
      setShowModal(true);
    },
    [trxTypes]
  );

  const onChangeSelected = useCallback((e) => {
    const formData = new FormData(e.target.form);

    const colsInputs = ["Parametros", "Nombre"];
    const colsParams = ["param_key", "param_value"];

    if (
      !colsInputs.includes(e.target.name) &&
      !colsParams.includes(e.target.name)
    ) {
      return;
    }

    const newData = [];
    colsInputs.forEach((col) => {
      let data = null;
      if (col === "Parametros") {
        const temp = [];
        colsParams.forEach((colRef) => {
          temp.push(formData.getAll(colRef));
        });
        const objBuild = [];
        temp[0].forEach((_, ind) => {
          objBuild.push([temp[0][ind], temp[1][ind]]);
        });
        data = Object.fromEntries(objBuild);
      } else {
        data = formData.get(col);
      }
      newData.push([col, data]);
    });
    setSelected((old) => ({
      ...old,
      ...Object.fromEntries(newData),
    }));
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (selected?.id_tipo_operacion) {
        fetchData(
          `${url_types}/tipos-operaciones`,
          "PUT",
          {
            tipo_op: selected?.id_tipo_operacion,
          },
          {
            Parametros: selected?.Parametros,
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              setSelected(null);
              setShowModal(false);
              setFoundTrxTypes();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
      }
    },
    [selected?.id_tipo_operacion, selected?.Parametros, setFoundTrxTypes]
  );

  useEffect(() => {
    setFoundTrxTypes();
  }, [setFoundTrxTypes]);

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            setShowModal(true);
            setSelected({
              Nombre: "",
              Aliado: "",
              Parametros: {},
            });
          }}
        >
          Crear tipo de transaccion
        </Button>
      </ButtonBar>
      <Pagination maxPage={maxPages} onChange={onChange} grid>
        <Input
          id="searchTrxType"
          name="searchTrxType"
          label={"Buscar tipo de transaccion"}
          type="search"
          autoComplete="off"
          defaultValue={searchTrxType}
        />
        <ButtonBar></ButtonBar>
      </Pagination>
      {Array.isArray(tableTrxTypes) && tableTrxTypes.length > 0 ? (
        <Table
          headers={Object.keys(tableTrxTypes[0])}
          data={tableTrxTypes}
          onSelectRow={onSelectAutorizador}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        {selected ? (
          <PaymentSummary
            title="Editar parametros de tipo de transaccion"
            // subtitle="Datos tipo de transaccion"
            subtitle=""
            // summaryTrx={{
            //   Id: selected?.id_tipo_operacion,
            //   Nombre: selected?.Nombre,
            //   Aliado: selected?.Aliado,
            // }}
          >
            <Form onChange={onChangeSelected} onSubmit={onSubmit} grid>
              <Input
                id="nameTrxType"
                name="Nombre"
                label={"Nombre"}
                type="search"
                autoComplete="off"
                value={selected?.Nombre || ""}
                readOnly={selected?.id_tipo_operacion}
              />
              <InputSuggestions
                id="searchTrxType"
                name="searchTrxType"
                label={"Aliado"}
                type="search"
                autoComplete="off"
                suggestions={mapSuggestionsAliados || []}
                onLazyInput={{
                  callback: searchAliados,
                  timeOut: 500,
                }}
                // onSelectSuggestion={}
                defaultValue={selected?.Aliado || ""}
                readOnly={selected?.id_tipo_operacion}
              />
              <Fieldset legend={"Parametros"}>
                {Object.entries(selected?.Parametros || {}).map(
                  ([key, val], index) => {
                    return (
                      <div
                        className="grid grid-cols-auto-fit-md place-items-center place-content-end"
                        key={index}
                      >
                        <Input
                          id={`${index}_key`}
                          name={`param_key`}
                          label={"Clave"}
                          type="text"
                          autoComplete="off"
                          value={key}
                          onInput={() => {}}
                        />
                        <Input
                          id={`${index}_value`}
                          name={`param_value`}
                          label={"Valor"}
                          type="text"
                          autoComplete="off"
                          value={val}
                          onInput={() => {}}
                        />
                        <ButtonBar className={"lg:col-span-2"}>
                          <Button
                            type="button"
                            onClick={() =>
                              setSelected((old) => {
                                const copy = { ...old };
                                const paramsCopy = Object.entries(
                                  copy.Parametros
                                );
                                paramsCopy.splice(index, 1);
                                copy.Parametros =
                                  Object.fromEntries(paramsCopy);
                                return { ...copy };
                              })
                            }
                          >
                            Eliminar parametro
                          </Button>
                        </ButtonBar>
                      </div>
                    );
                  }
                )}
                <ButtonBar>
                  <Button
                    type="button"
                    onClick={() =>
                      setSelected((old) => {
                        const copy = { ...old };
                        const paramsCopy = Object.entries(copy.Parametros);
                        paramsCopy.push(["", ""]);
                        copy.Parametros = Object.fromEntries(paramsCopy);
                        return { ...copy };
                      })
                    }
                  >
                    Añadir parametro
                  </Button>
                </ButtonBar>
              </Fieldset>
              {!selected?.id_tipo_operacion ? (
                <ButtonBar>
                  <Button type="submit">Crear tipo de transaccion</Button>
                  <Button type="button" onClick={handleClose}>
                    Cancelar
                  </Button>
                </ButtonBar>
              ) : (
                <ButtonBar>
                  <Button type="submit">Editar tipo de transaccion</Button>
                  <Button type="button" onClick={handleClose}>
                    Cancelar
                  </Button>
                </ButtonBar>
              )}
            </Form>
          </PaymentSummary>
        ) : (
          ""
        )}
      </Modal>
    </Fragment>
  );
};

export default ParamsOperations;
