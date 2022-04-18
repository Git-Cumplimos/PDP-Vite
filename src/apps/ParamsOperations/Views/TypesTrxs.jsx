import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import InputSuggestions from "../../../components/Base/InputSuggestions";
import Modal from "../../../components/Base/Modal";
import Table from "../../../components/Base/Table";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Pagination from "../../../components/Compound/Pagination";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import useQuery from "../../../hooks/useQuery";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import { fetchAutorizadores } from "../../TrxParams/utils/fetchRevalAutorizadores";

const url_types = process.env.REACT_APP_URL_TRXS_TRX;

const fetchTrxTypesPages = async (Nombre_operacion, page, limit) => {
  try {
    const res = await fetchData(
      `${url_types}/tipos-operaciones-pagination`,
      "GET",
      {
        Nombre_operacion,
        page,
        limit,
      }
    );

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

const fetchAliadosPDPPages = async (nombre) => {
  try {
    const res = await fetchData(`${url_types}/aliados-pagination`, "GET", {
      nombre,
      page: 1,
      limit: 10,
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

const TypesTrxs = () => {
  const [{ searchTrxType = "" }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const [maxPages, setMaxPages] = useState(0);
  const [trxTypes, setTrxTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [autorizadores, setAutorizadores] = useState([]);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableTrxTypes = useMemo(() => {
    return trxTypes.map(({ id_tipo_operacion, Autorizador, Nombre }) => ({
      Id: id_tipo_operacion,
      "Tipo de transaccion": Nombre,
      Autorizador,
    }));
  }, [trxTypes]);

  const mapSuggestionsAutorizadores = useMemo(
    () =>
      autorizadores.map(({ nombre_autorizador }) => (
        <h1 className='py-2'>{nombre_autorizador}</h1>
      )),
    [autorizadores]
  );

  const fecthAutorizadoresFunc = useCallback((e) => {
    fetchAutorizadores({ nombre_autorizador: e.target.value ?? "" })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setAutorizadores(autoArr?.results);
      })
      .catch((err) => console.error(err));
  }, []);

  const onSelectSuggestion = useCallback(
    (i, el) => {
      const copy = { ...selected };
      copy.NewAutorizador = autorizadores[i];
      copy.Autorizador = autorizadores[i].nombre_autorizador;
      copy.id_autorizador = autorizadores[i].id_autorizador;
      setSelected({ ...copy });
    },
    [autorizadores, selected]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(null);
    setFoundTrxTypes();
  }, []);

  const setFoundTrxTypes = useCallback(() => {
    fetchTrxTypesPages(searchTrxType, page, limit)
      .then((res) => {
        setTrxTypes([...res?.results]);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [searchTrxType, page, limit]);

  const onChange = useCallback(
    (e) => {
      const formData = new FormData(e.target.form);
      const Nombre_operacion = formData.get("searchTrxType");

      setQuery({ searchTrxType: Nombre_operacion }, { replace: true });
    },
    [setQuery]
  );

  const onSelectType = useCallback(
    (e, i) => {
      setSelected({ ...trxTypes[i] });
      setShowModal(true);
    },
    [trxTypes]
  );

  const onChangeSelected = useCallback((e) => {
    const formData = new FormData(e.target.form);

    const colsInputs = ["Parametros", "Nombre", "Autorizador"];
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
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
        fetchData(
          `${url_types}/tipos-operaciones`,
          "POST",
          {},
          {
            id_autorizador: selected?.id_autorizador,
            Nombre_operacion: selected?.Nombre,
            Parametros: selected?.Parametros,
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      }
    },
    [selected, selected?.Parametros, setFoundTrxTypes]
  );

  useEffect(() => {
    setFoundTrxTypes();
  }, [setFoundTrxTypes]);

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type='submit'
          onClick={() => {
            setShowModal(true);
            setSelected({
              Nombre: "",
              Autorizador: "",
              id_autorizador: "",
              Parametros: {},
            });
          }}>
          Crear tipo de transaccion
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Convenios'
        maxPage={maxPages}
        onChange={onChange}
        headers={["Id", "Tipo de transaccion", "Autorizador"]}
        data={tableTrxTypes}
        onSelectRow={onSelectType}
        onSetPageData={setPageData}>
        <Input
          id='searchTrxType'
          name='searchTrxType'
          label={"Buscar tipo de transaccion"}
          type='search'
          autoComplete='off'
          defaultValue={searchTrxType}
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={handleClose}>
        {selected ? (
          <PaymentSummary
            title='Editar parametros de tipo de transacción'
            // subtitle="Datos tipo de transaccion"
            subtitle=''
            // summaryTrx={{
            //   Id: selected?.id_tipo_operacion,
            //   Nombre: selected?.Nombre,
            //   Aliado: selected?.Aliado,
            // }}
          >
            <Form onChange={onChangeSelected} onSubmit={onSubmit} grid>
              <Input
                id='nameTrxType'
                name='Nombre'
                label={"Nombre"}
                type='search'
                autoComplete='off'
                value={selected?.Nombre || ""}
                onChange={() => {}}
                // readOnly={selected?.id_tipo_operacion}
              />
              <InputSuggestions
                id='Autorizador'
                name='Autorizador'
                label={"Autorizador"}
                type='search'
                autoComplete='off'
                suggestions={mapSuggestionsAutorizadores || []}
                onLazyInput={{
                  callback: fecthAutorizadoresFunc,
                  timeOut: 500,
                }}
                onSelectSuggestion={onSelectSuggestion}
                value={selected?.Autorizador || ""}
                onChange={() => {}}
                disabled={selected?.id_tipo_operacion ? true : false}
                // readOnly={selected?.id_tipo_operacion}
              />
              <Fieldset legend={"Parametros"}>
                {Object.entries(selected?.Parametros || {}).map(
                  ([key, val], index) => {
                    return (
                      <div
                        className='grid grid-cols-auto-fit-md place-items-center place-content-end'
                        key={index}>
                        <Input
                          id={`${index}_key`}
                          name={`param_key`}
                          label={"Clave"}
                          type='text'
                          autoComplete='off'
                          value={key}
                          onInput={() => {}}
                          onChange={() => {}}
                        />
                        <Input
                          id={`${index}_value`}
                          name={`param_value`}
                          label={"Valor"}
                          type='text'
                          autoComplete='off'
                          value={val}
                          onInput={() => {}}
                          onChange={() => {}}
                        />
                        <ButtonBar className={"lg:col-span-2"}>
                          <Button
                            type='button'
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
                            }>
                            Eliminar parametro
                          </Button>
                        </ButtonBar>
                      </div>
                    );
                  }
                )}
                <ButtonBar>
                  <Button
                    type='button'
                    onClick={() =>
                      setSelected((old) => {
                        const copy = { ...old };
                        const paramsCopy = Object.entries(copy.Parametros);
                        paramsCopy.push(["", ""]);
                        copy.Parametros = Object.fromEntries(paramsCopy);
                        return { ...copy };
                      })
                    }>
                    Añadir parametro
                  </Button>
                </ButtonBar>
              </Fieldset>
              {!selected?.id_tipo_operacion ? (
                <ButtonBar>
                  <Button type='submit'>Crear tipo de transaccion</Button>
                  <Button type='button' onClick={handleClose}>
                    Cancelar
                  </Button>
                </ButtonBar>
              ) : (
                <ButtonBar>
                  <Button type='submit'>Editar tipo de transaccion</Button>
                  <Button type='button' onClick={handleClose}>
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

export default TypesTrxs;
