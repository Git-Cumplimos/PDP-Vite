import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchConveniosMany,
  fetchConveniosUnique,
  postConvenios,
  putConvenios,
} from "../utils/fetchRevalConvenios";

const Convenios = () => {
  const navigate = useNavigate();
  const [{ searchConvenio = "", ean13Convenio = "", page = 1 }, setQuery] =
    useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedConvenio(null);
  }, []);

  const [convenios, setConvenios] = useState([]);
  const [selectedConvenio, setSelectedConvenio] = useState(null);
  const [maxPages, setMaxPages] = useState(0);

  const onSelectConvenio = useCallback(
    (e, i) => {
      setShowModal(true);
      fetchConveniosUnique(convenios[i]?.["Id convenio"])
        .then((res) => {
          setSelectedConvenio(
            [...res?.results].map(
              ({ id_convenio, nombre_convenio, ean13, tags, referencias }) => {
                return {
                  "Id convenio": id_convenio,
                  "Nombre de convenio": nombre_convenio,
                  Ean13: ean13,
                  Tags: tags.split(","),
                  Referencias: [
                    ...referencias.map(({ nombre_referencia, max, min }) => {
                      return {
                        "Nombre de Referencia": nombre_referencia,
                        "Longitud minima": min,
                        "Longitud maxima": max,
                      };
                    }),
                  ],
                };
              }
            )[0]
          );
        })
        .catch((err) => console.error(err));
      // searchUniqueConvenios(convenios[i]["Id convenio"])
      //   .then((autoArr) => setSelectedConvenio(autoArr))
      //   .catch((err) => console.error(err));
    },
    [convenios]
  );

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name === "searchConvenio") {
        setQuery({ searchConvenio: ev.target.value }, { replace: true });
      } else if (ev.target.name === "ean13Convenio") {
        setQuery({ ean13Convenio: ev.target.value }, { replace: true });
      }
    },
    [setQuery]
  );

  const onChangeConv = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const colsRefs = [
      "Nombre de Referencia",
      "Longitud minima",
      "Longitud maxima",
    ];
    const newData = [];
    ["Nombre de convenio", "Ean13", "Tags", "Referencias"].forEach((col) => {
      let data = null;
      if (col === "Referencias") {
        data = [];
        let temp = [];
        colsRefs.forEach((colRef) => {
          temp.push(formData.getAll(colRef));
        });
        temp[0].forEach((_, col) => {
          const tempi = [];
          temp.forEach((r, row) => {
            tempi.push([colsRefs[row], r[col]]);
          });
          data.push(Object.fromEntries(tempi));
        });
      } else if (col === "Tags") {
        data = formData.getAll(col);
      } else {
        data = formData.get(col);
      }
      newData.push([col, data]);
    });
    setSelectedConvenio(Object.fromEntries(newData));
  }, []);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      if (selectedConvenio?.["Id convenio"]) {
        putConvenios(
          { id_convenio: selectedConvenio?.["Id convenio"] },
          {
            ean13: selectedConvenio?.Ean13,
            nombre_convenio: selectedConvenio?.["Nombre de convenio"],
            descripcion: "",
            tags: selectedConvenio?.Tags.join(","),
            referencias: [
              ...selectedConvenio?.Referencias.map(
                ({
                  "Nombre de Referencia": nombre_referencia,
                  "Longitud minima": min,
                  "Longitud maxima": max,
                }) => {
                  return {
                    nombre_referencia,
                    min,
                    max,
                  };
                }
              ),
            ],
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              setShowModal(false);
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
        postConvenios({
          ean13: selectedConvenio?.Ean13,
          nombre_convenio: selectedConvenio?.["Nombre de convenio"],
          descripcion: "",
          tags: selectedConvenio?.Tags.join(","),
          referencias: [
            ...selectedConvenio?.Referencias.map(
              ({
                "Nombre de Referencia": nombre_referencia,
                "Longitud minima": min,
                "Longitud maxima": max,
              }) => {
                return {
                  nombre_referencia,
                  min,
                  max,
                };
              }
            ),
          ],
          comision_pagada: {
            type: "monto",
            ranges: [{ Minimo: 0, Maximo: -1, Porcentaje: 0, Fija: 0 }],
          },
        })
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              setShowModal(false);
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      }
    },
    [selectedConvenio]
  );

  useEffect(() => {
    fetchConveniosMany(searchConvenio, page)
      .then((res) => {
        setConvenios(
          [...res?.results].map(({ id_convenio, nombre_convenio }) => {
            return {
              "Id convenio": id_convenio,
              "Nombre de convenio": nombre_convenio,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [searchConvenio, page]);

  useEffect(() => {
    fetchConveniosUnique(null, ean13Convenio)
      .then((res) => {
        setConvenios(
          [...res?.results].map(({ id_convenio, nombre_convenio }) => {
            return {
              "Id convenio": id_convenio,
              "Nombre de convenio": nombre_convenio,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [ean13Convenio]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear convenio
        </Button>
        {/* <Button type="submit" onClick={() => setShowModal(true)}>
          Crear convenio masivo
        </Button> */}
      </ButtonBar>
      <Pagination maxPage={maxPages} onChange={onChange} grid>
        <Input
          id="searchConvenio"
          name="searchConvenio"
          label={"Buscar convenio"}
          type="text"
          autoComplete="off"
          defaultValue={searchConvenio}
        />
        <Input
          id="ean13Convenio"
          name="ean13Convenio"
          label={"Ean13"}
          type="text"
          autoComplete="off"
          defaultValue={ean13Convenio}
        />
      </Pagination>
      {Array.isArray(convenios) && convenios.length > 0 ? (
        <Table
          headers={Object.keys(convenios[0])}
          data={convenios}
          onSelectRow={onSelectConvenio}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={onChangeConv} grid>
          <Input
            id="Nombre de convenio"
            name="Nombre de convenio"
            label={"Nombre de convenio"}
            type="text"
            autoComplete="off"
            defaultValue={selectedConvenio?.["Nombre de convenio"]}
            required
          />
          <Input
            id="Ean13"
            name="Ean13"
            label={"Ean13"}
            type="number"
            step="1"
            autoComplete="off"
            defaultValue={selectedConvenio?.Ean13}
            required
          />
          <Fieldset legend={"Tags"}>
            {selectedConvenio?.Tags.map((val, ind) => {
              return (
                <div className="grid grid-cols-2">
                  <Input
                    id={`tagsConvenio_${ind}`}
                    name="Tags"
                    type="text"
                    autoComplete="off"
                    value={val}
                    onChange={() => {}}
                    required
                  />
                  <ButtonBar>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedConvenio((old) => {
                          const copy = { ...old };
                          copy?.Tags.splice(ind, 1);
                          return { ...copy };
                        });
                      }}
                    >
                      Eliminar tag
                    </Button>
                  </ButtonBar>
                </div>
              );
            })}
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  setSelectedConvenio((old) => {
                    const copy = { ...old };
                    copy?.Tags.push("");
                    return { ...copy };
                  });
                }}
              >
                Añadir tag
              </Button>
            </ButtonBar>
          </Fieldset>
          <Fieldset legend={"Referencias"}>
            {selectedConvenio?.Referencias.map((val, index) => {
              return (
                <div className="grid grid-cols-auto-fit-md place-items-center place-content-end">
                  {Object.entries(val).map(([key, valRef]) => {
                    return (
                      <Input
                        id={`${key}_${index}`}
                        name={key}
                        label={key}
                        type={`${key.includes("Longitud") ? "number" : "text"}`}
                        autoComplete="off"
                        value={valRef}
                        onChange={() => {}}
                        required
                      />
                    );
                  })}
                  <ButtonBar>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedConvenio((old) => {
                          const copy = { ...old };
                          copy?.Referencias.splice(index, 1);
                          return { ...copy };
                        });
                      }}
                    >
                      Eliminar referencia
                    </Button>
                  </ButtonBar>
                </div>
              );
            })}
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  setSelectedConvenio((old) => {
                    const copy = { ...old };
                    copy?.Referencias.push({
                      "Nombre de Referencia": "",
                      "Longitud minima": "",
                      "Longitud maxima": "",
                    });
                    return { ...copy };
                  });
                }}
              >
                Añadir referencia
              </Button>
            </ButtonBar>
          </Fieldset>
          {!selectedConvenio?.["Id convenio"] ? (
            <ButtonBar>
              <Button type="submit">Crear autorizador</Button>
              <Button type="button" onClick={handleClose}>
                Cancelar
              </Button>
            </ButtonBar>
          ) : (
            <Fragment>
              <ButtonBar>
                <Button
                  type="button"
                  onClick={() => {
                    const urlParams = new URLSearchParams();
                    urlParams.append(
                      "convenios_id_convenio",
                      selectedConvenio?.["Id convenio"]
                    );
                    navigate(
                      `/trx-params/comisiones/pagadas?${urlParams.toString()}`
                    );
                  }}
                >
                  Editar comisiones a pagar
                </Button>
              </ButtonBar>
              <ButtonBar>
                <Button type="submit">Editar convenio</Button>
                <Button type="button" onClick={handleClose}>
                  Cancelar
                </Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default Convenios;
