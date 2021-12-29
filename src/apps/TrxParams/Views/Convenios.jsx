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

const initTable = [
  {
    "Id convenio": 2,
    "Nombre de convenio": "Enel",
  },
  {
    "Id convenio": 4,
    "Nombre de convenio": "Acueducto",
  },
];

const initSelected = {
  "Id convenio": 4,
  "Nombre de convenio": "Acueducto",
  Ean13: "7702424562342",
  Tags: ["Acueducto", "agua", "aseo", "servicio publico"],
  Referencias: [
    {
      "Nombre de Referencia": "Documento",
      "Longitud minima": 7,
      "Longitud maxima": 10,
    },
    {
      "Nombre de Referencia": "Numero de contrato",
      "Longitud minima": 5,
      "Longitud maxima": 9,
    },
  ],
};

const searchManyConvenios = async (nameAuto, page) => {
  if (!nameAuto) {
    return [];
  }
  try {
    // const res = await fetchData("", "GET", {
    //   nombre_autorizador: nameAuto,
    //   page,
    // });
    return initTable;
  } catch (err) {
    throw err;
  }
};

const searchUniqueConvenios = async (id_convenio) => {
  if (!id_convenio) {
    return [];
  }
  try {
    // const res = await fetchData("", "GET", {
    //   nombre_autorizador: nameAuto,
    //   page,
    // });
    return initSelected;
  } catch (err) {
    throw err;
  }
};

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

  const onSelectConvenio = useCallback(
    (e, i) => {
      setShowModal(true);
      searchUniqueConvenios(convenios[i]["Id convenio"])
        .then((autoArr) => setSelectedConvenio(autoArr))
        .catch((err) => console.error(err));
    },
    [convenios]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const nameConvenio = formData.get("searchConvenio");
      const eanConvenio = formData.get("ean13Convenio");
      // const page = parseInt(formData.get("page"));
      setQuery(
        { searchConvenio: nameConvenio, ean13Convenio: eanConvenio },
        { replace: true }
      );
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

  const onSubmit = useCallback((ev) => {
    ev.preventDefault();

    const formData = new FormData(ev.target);

    console.log(Object.fromEntries(formData.entries()));

    // fetchData("", "POST", {}, Object.fromEntries(formData.entries()))
    //   .then((res) => {})
    //   .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    searchManyConvenios(searchConvenio, page)
      .then((autoArr) => setConvenios(autoArr))
      .catch((err) => console.error(err));
  }, [searchConvenio, page]);

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
      <Pagination maxPage={1} onChange={onChange} grid>
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
          {!selectedConvenio ? (
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
                      "id_convenio",
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
