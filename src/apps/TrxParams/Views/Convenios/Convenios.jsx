import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import InputSuggestions from "../../../../components/Base/InputSuggestions";
import Modal from "../../../../components/Base/Modal";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";
import {
  fetchConveniosMany,
  fetchConveniosUnique,
  fetchTiposConvenios,
  postConvenios,
  putConvenios,
} from "../../utils/fetchRevalConvenios";

const Convenios = () => {
  const [{ searchConvenio = "", ean13Convenio = "" }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedConvenio({
      "Nombre de convenio": "",
      Ean13: "",
      tiposConvenios: "",
      NewTipoConvenio: {},
      pk_id_tipo_convenio: "",
      Tags: [""],
      Referencias: [
        // {
        //   "Nombre de Referencia": "",
        //   "Longitud minima": "",
        //   "Longitud maxima": "",
        // },
      ],
    });
    fetchConveniosUnique();
  }, []);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [convenios, setConvenios] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tiposConvenios, setTiposConvenios] = useState([]);
  const [selectedConvenio, setSelectedConvenio] = useState({
    "Nombre de convenio": "",
    Ean13: "",
    tiposConvenios: "",
    NewTipoConvenio: {},
    pk_id_tipo_convenio: "",
    Tags: [""],
    Referencias: [
      // {
      //   "Nombre de Referencia": "",
      //   "Longitud minima": "",
      //   "Longitud maxima": "",
      // },
    ],
  });
  const [maxPages, setMaxPages] = useState(0);
  const mapSuggestionsTiposConvenios = useMemo(
    () =>
      tiposConvenios.map(({ nombre_tipo_convenio }) => (
        <h1 className='py-2'>{nombre_tipo_convenio}</h1>
      )),
    [tiposConvenios]
  );
  const fecthTiposConveniosFunc = useCallback((e) => {
    fetchTiposConvenios({
      nombre_tipo_convenio: e.target.value ?? "",
      limit: 5,
    })
      .then((autoArr) => {
        // setMaxPages(autoArr?.maxPages);
        setTiposConvenios(autoArr?.results);
      })
      .catch((err) => console.error(err));
  }, []);
  const onSelectSuggestion = useCallback(
    (i, el) => {
      const copy = { ...selectedConvenio };
      copy.NewTipoConvenio = tiposConvenios[i];
      copy.tiposConvenios = tiposConvenios[i].nombre_tipo_convenio;
      copy.pk_id_tipo_convenio = tiposConvenios[i].pk_id_tipo_convenio;
      setSelectedConvenio({ ...copy });
    },
    [selectedConvenio, tiposConvenios]
  );
  const onSelectConvenio = useCallback(
    (e, i) => {
      setShowModal(true);
      setIsUploading(true);
      fetchConveniosUnique({ id_convenio: convenios[i]?.["Id convenio"] })
        .then((res) => {
          setIsUploading(false);
          const dataTemp = [...res?.results];
          const dataSelect = dataTemp.map(
            ({
              id_convenio,
              fk_id_tipo_convenio,
              nombre_convenio,
              ean13,
              tags,
              referencias,
              nombre_tipo_convenio,
            }) => {
              return {
                "Id convenio": id_convenio,
                "Nombre de convenio": nombre_convenio,
                Ean13: ean13,
                pk_id_tipo_convenio: fk_id_tipo_convenio,
                tiposConvenios: nombre_tipo_convenio
                  ? nombre_tipo_convenio
                  : "",
                NewTipoConvenio: {},
                Tags: tags.split(","),
                Referencias: [
                  ...(referencias.length
                    ? referencias.map(({ nombre_referencia, max, min }) => {
                        return {
                          "Nombre de Referencia": nombre_referencia,
                          "Longitud minima": min,
                          "Longitud maxima": max,
                        };
                      })
                    : []),
                ],
              };
            }
          )[0];
          setSelectedConvenio(dataSelect);
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
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
    [
      "Nombre de convenio",
      "Ean13",
      "Tags",
      "Referencias",
      "tiposConvenios",
      "id_convenio",
    ].forEach((col) => {
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
      } else if (col === "Ean13") {
        data = ((formData.get(col) ?? "").match(/\d/g) ?? []).join("");
      } else {
        data = formData.get(col);
      }
      newData.push([col, data]);
    });
    setSelectedConvenio((old) => ({
      "Id convenio": old?.["Id convenio"] || -1,
      ...Object.fromEntries(newData),
    }));
  }, []);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      if (selectedConvenio?.Referencias.length > 0) {
        if (selectedConvenio?.Referencias[0]["Nombre de Referencia"] === "") {
          notifyError("Se deben ingresar todos los campos de referecia");
          return;
        }
      }
      if (selectedConvenio?.["Id convenio"] !== -1) {
        let obj = {};
        if (selectedConvenio?.Ean13 !== "") {
          obj = { ...obj, ean13: selectedConvenio?.Ean13 };
        }
        putConvenios(
          { id_convenio: selectedConvenio?.["Id convenio"] },
          {
            ...obj,
            id_convenio: selectedConvenio?.["Id convenio"],
            nombre_convenio: selectedConvenio?.["Nombre de convenio"],
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
            setIsUploading(false);
            if (res?.status) {
              notify(res?.msg);
              fetchConveniosUniqueFetch();
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => {
            setIsUploading(false);
            notifyError("No se ha podido conectar al servidor");
            console.error(err);
          });
      } else {
        let obj = {};
        if (selectedConvenio?.Ean13 !== "") {
          obj = { ...obj, ean13: selectedConvenio?.Ean13 };
        }
        if (selectedConvenio?.id_convenio !== "") {
          obj = { ...obj, id_convenio: selectedConvenio?.id_convenio };
        }
        postConvenios({
          ...obj,
          nombre_convenio: selectedConvenio?.["Nombre de convenio"],
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
        })
          .then((res) => {
            setIsUploading(false);
            if (res?.status) {
              notify(res?.msg);
              fetchConveniosUniqueFetch();
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => {
            setIsUploading(false);
            notifyError("No se ha podido conectar al servidor");
            console.error(err);
          });
      }
    },
    [selectedConvenio]
  );

  useEffect(() => {
    fetchConveniosUniqueFetch();
  }, [searchConvenio, page, limit]);

  const fetchConveniosUniqueFetch = useCallback(() => {
    setIsUploading(true);
    fetchConveniosUnique({ tags: searchConvenio, page, limit })
      .then((res) => {
        setIsUploading(false);
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
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
  }, [searchConvenio, page, limit]);

  // useEffect(() => {
  //   fetchConveniosUnique(null, ean13Convenio)
  //     .then((res) => {
  //       setConvenios(
  //         [...res?.results].map(({ id_convenio, nombre_convenio }) => {
  //           return {
  //             "Id convenio": id_convenio,
  //             "Nombre de convenio": nombre_convenio,
  //           };
  //         })
  //       );
  //       setMaxPages(res?.maxPages);
  //     })
  //     .catch((err) => console.error(err));
  // }, [ean13Convenio]);
  const fetchConveniosManyFunc = () => {
    setIsUploading(true);
    fetchConveniosMany({ tags: searchConvenio, page, limit })
      .then((res) => {
        setIsUploading(false);
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
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
  };

  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <ButtonBar>
        <Button type='submit' onClick={() => setShowModal(true)}>
          Crear convenio
        </Button>
        {/* <Button type="submit" onClick={() => setShowModal(true)}>
          Crear convenio masivo
        </Button> */}
      </ButtonBar>
      {/* <Pagination maxPage={maxPages} onChange={onChange} grid></Pagination> */}
      <TableEnterprise
        title='Convenios'
        maxPage={maxPages}
        onChange={onChange}
        headers={["Id convenio", "Nombre convenio"]}
        data={convenios}
        onSelectRow={onSelectConvenio}
        onSetPageData={setPageData}>
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Tag convenio"}
          type='text'
          autoComplete='off'
          defaultValue={searchConvenio}
        />
        <Input
          id='ean13Convenio'
          name='ean13Convenio'
          label={"Ean13"}
          type='text'
          autoComplete='off'
          defaultValue={ean13Convenio}
        />
      </TableEnterprise>

      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={onChangeConv}>
          {!selectedConvenio?.["Id convenio"] ||
          selectedConvenio?.["Id convenio"] === -1 ? (
            <>
              <h1 className='text-3xl text-center'>Crear convenio</h1>
              <Input
                id='id_convenio'
                label='Id convenio(Opcional)'
                type='text'
                name='id_convenio'
                autoComplete='off'
                minLength='1'
                maxLength='32'
                defaultValue={selectedConvenio?.["id_convenio"]}
                onChange={() => {}}></Input>
            </>
          ) : (
            <h1 className='text-3xl text-center'>Actualizar convenio</h1>
          )}
          <Input
            id='Nombre de convenio'
            name='Nombre de convenio'
            label={"Nombre de convenio"}
            type='text'
            autoComplete='off'
            defaultValue={selectedConvenio?.["Nombre de convenio"]}
            onChange={() => {}}
            required
          />
          <Input
            id='Ean13'
            name='Ean13'
            label={"Ean13"}
            type='text'
            // step='1'
            minLength='13'
            maxLength='13'
            autoComplete='off'
            value={selectedConvenio?.Ean13}
            onChange={() => {}}
          />
          <InputSuggestions
            id='tiposConvenios'
            name='tiposConvenios'
            label={"Tipo convenio"}
            type='search'
            autoComplete='off'
            suggestions={mapSuggestionsTiposConvenios || []}
            onLazyInput={{
              callback: fecthTiposConveniosFunc,
              timeOut: 500,
            }}
            onSelectSuggestion={onSelectSuggestion}
            value={selectedConvenio?.tiposConvenios || ""}
            onChange={() => {}}
            // disabled={selected?.id_tipo_operacion ? true : false}
            // readOnly={selected?.id_tipo_operacion}
          />
          <Fieldset legend={"Tags"}>
            {selectedConvenio?.Tags?.map((val, ind) => {
              return (
                <div className='flex align-middle justify-center' key={ind}>
                  <Input
                    key={ind}
                    id={`tagsConvenio_${ind}`}
                    name='Tags'
                    type='text'
                    autoComplete='off'
                    value={val}
                    onChange={() => {}}
                    required
                  />
                  {selectedConvenio?.Tags.length > 1 && (
                    <ButtonBar className='w-52'>
                      <Button
                        type='button'
                        onClick={() => {
                          if (selectedConvenio?.Tags.length < 2) {
                            return;
                          }
                          const copy = { ...selectedConvenio };
                          copy?.Tags.splice(ind, 1);
                          setSelectedConvenio({ ...copy });
                        }}>
                        Eliminar tag
                      </Button>
                    </ButtonBar>
                  )}
                </div>
              );
            })}
            <ButtonBar>
              <Button
                type='button'
                onClick={() => {
                  const copy = { ...selectedConvenio };
                  copy?.Tags.push("");
                  setSelectedConvenio({ ...copy });
                }}>
                Añadir tag
              </Button>
            </ButtonBar>
          </Fieldset>
          <Fieldset legend={"Referencias"}>
            {selectedConvenio?.Referencias?.map((val, index) => {
              return (
                <div
                  key={index}
                  // className='grid grid-cols-auto-fit-md place-items-center place-content-end'
                >
                  {Object.entries(val).map(([key, valRef]) => {
                    return (
                      <Input
                        key={key}
                        id={`${key}_${index}`}
                        name={key}
                        label={key}
                        type={`${key.includes("Longitud") ? "number" : "text"}`}
                        autoComplete='off'
                        value={valRef}
                        onChange={() => {}}
                        required
                      />
                    );
                  })}
                  {selectedConvenio?.Referencias.length > 1 && (
                    <ButtonBar>
                      <Button
                        type='button'
                        onClick={() => {
                          if (selectedConvenio?.Referencias.length < 2) {
                            return;
                          }
                          const copy = { ...selectedConvenio };
                          copy?.Referencias.splice(index, 1);
                          setSelectedConvenio({ ...copy });
                        }}>
                        Eliminar referencia
                      </Button>
                    </ButtonBar>
                  )}
                </div>
              );
            })}
            <ButtonBar>
              <Button
                type='button'
                onClick={() => {
                  if (selectedConvenio?.Referencias.length > 2) {
                    return;
                  }
                  const copy = { ...selectedConvenio };
                  copy?.Referencias.push({
                    "Nombre de Referencia": "",
                    "Longitud minima": "",
                    "Longitud maxima": "",
                  });
                  setSelectedConvenio({ ...copy });
                }}>
                Añadir referencia
              </Button>
            </ButtonBar>
          </Fieldset>
          {!selectedConvenio?.["Id convenio"] ||
          selectedConvenio?.["Id convenio"] === -1 ? (
            <ButtonBar>
              <Button type='button' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='submit'>Crear convenio</Button>
            </ButtonBar>
          ) : (
            <Fragment>
              <ButtonBar>
                {/* <Button
                  type='button'
                  onClick={() => {
                    const urlParams = new URLSearchParams();
                    urlParams.append(
                      "convenios_id_convenio",
                      selectedConvenio?.["Id convenio"]
                    );
                    navigate(
                      `/trx-params/comisiones/pagadas?${urlParams.toString()}`
                    );
                  }}>
                  Editar comisiones a pagar
                </Button>
                <Button
                  type='button'
                  onClick={() => {
                    const urlParams = new URLSearchParams();
                    urlParams.append(
                      "convenios_id_convenio",
                      selectedConvenio?.["Id convenio"]
                    );
                    navigate(`autorizadores?${urlParams.toString()}`);
                  }}>
                  Editar autorizadores del convenio
                </Button> */}
              </ButtonBar>
              <ButtonBar>
                <Button type='button' onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type='submit'>Editar convenio</Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default Convenios;
