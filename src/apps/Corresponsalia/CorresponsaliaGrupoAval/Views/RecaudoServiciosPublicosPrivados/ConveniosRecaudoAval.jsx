import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import InputX from "../../../../../components/Base/InputX/InputX";
import Modal from "../../../../../components/Base/Modal";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import fetchData from "../../../../../utils/fetchData";
import { notify, notifyError } from "../../../../../utils/notify";
import {
  postCheckEstadoConveniosAval,
  postConsultaTablaConveniosEspecifico,
  postConsultaTablaConveniosPaginadoTotal,
  putModificarConvenio,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { v4 as uuidv4 } from "uuid";
import useDelayedCallback from "../../../../../hooks/useDelayedCallback";
import { onChangeNumber } from "../../../../../utils/functions";
import ToggleInput from "../../../../../components/Base/ToggleInput/ToggleInput";
import Fieldset from "../../../../../components/Base/Fieldset/Fieldset";
import Select from "../../../../../components/Base/Select/Select";
import { useNavigate } from "react-router-dom";

const url_cargueS3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_recaudo/subir_archivos_convenios`;

const def_validacion_referencia = (referencias) => {
  const hashTable = {};
  for (let i = 0; i < referencias.length; i++) {
    if (
      parseInt(referencias[i].limiteMenor) >
      parseInt(referencias[i].limiteMayor)
    ) {
      return [
        true,
        "En la restricción de longitud de referencias el limite mayor debe ser mayor al limite menor",
      ];
    }
  }
  for (let i = 0; i < referencias.length; i++) {
    if (hashTable[referencias[i].referencia]) {
      return [
        true,
        "En la restricción de longitud de referencias se encuentra repetido alguna referecia",
      ];
    } else {
      hashTable[referencias[i].referencia] = true;
    }
  }
  return [false, ""];
};

const ConveniosRecaudoAval = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [statusModal, setStatusModal] = useState("cargue");
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    convenio: "",
    idConvenio: "",
    idEAN: "",
    nit: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState({});
  const [convenios, setConvenios] = useState([]);
  const [convenio, setConvenio] = useState([]);
  const [restriccionReferencias, setRestriccionReferencias] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(
        ({ pk_convenios_recaudo_aval, nura, convenio, ean, nit }) => {
          return {
            "Id convenio": nura,
            Convenio: convenio !== "" ? convenio : "N/A",
            NIT: nit !== "" ? nit : "N/A",
            EAN: ean !== "" ? ean : "N/A",
          };
        }
      ),
    ];
  }, [convenios]);
  const hideModal = () => {
    setShowModal(false);
    setFile({});
  };
  const onSelectConvenio = useCallback(
    (e, i) => {
      fecthTablaConveniosEspecificoFunc(
        convenios[i]?.pk_convenios_recaudo_aval
      );
      setStatusModal("convenio");
    },
    [convenios]
  );
  const fecthTablaConveniosEspecificoFunc = (pk_convenios_recaudo_aval) => {
    setIsUploading(true);
    postConsultaTablaConveniosEspecifico({
      pk_convenios_recaudo_aval: pk_convenios_recaudo_aval,
    })
      .then((autoArr) => {
        setConvenio(autoArr?.results[0]);
        setIsUploading(false);
        setRestriccionReferencias(
          autoArr?.results[0]?.data_opcional?.restriccion_referencia ?? []
        );
        setShowModal(true);
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = useDelayedCallback(
    useCallback(() => {
      postConsultaTablaConveniosPaginadoTotal({
        convenio: datosTrans.convenio,
        nura: datosTrans.idConvenio,
        ean: datosTrans.ean,
        nit: datosTrans.nit,
        page,
        limit,
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.maxPages);
          setConvenios(autoArr?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [datosTrans, limit, page]),
    500
  );
  const onChangeFile = (files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        // console.log(m_file);
        setFile(m_file);
        // setFileName(m_file.name);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  //------------------Funcion Para Subir El Formulario---------------------//
  const saveFile = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const f = new Date();
      const uniqueId = uuidv4();
      const query = {
        uuid: uniqueId,
        contentType: "application/text",
        filename: `archivo_convenios_aval/${file.name}`,
      };
      fetchData(url_cargueS3, "POST", {}, query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
            setIsUploading(false);
            hideModal();
          } else {
            // setEstadoForm(true);
            const formData2 = new FormData();
            if (file) {
              for (const property in respuesta?.obj?.fields) {
                formData2.set(
                  `${property}`,
                  `${respuesta?.obj?.fields[property]}`
                );
              }
              formData2.set("file", file);
              fetch(`${respuesta?.obj?.url}`, {
                method: "POST",
                body: formData2,
              })
                .then(async (res) => {
                  if (res?.ok) {
                    notify(
                      "Se ha subido exitosamente el archivo, espere un momento se esta realizando el cargue a la base de datos"
                    );
                    for (let i = 0; i < 3; i++) {
                      try {
                        const prom = await new Promise((resolve, reject) =>
                          setTimeout(() => {
                            postCheckEstadoConveniosAval({
                              uuid: uniqueId,
                            })
                              .then((res) => {
                                if (
                                  res?.msg !==
                                  "Error respuesta PDP: (No ha terminado la operación)"
                                ) {
                                  if (res?.status) {
                                    setIsUploading(false);
                                    notify(res?.msg);
                                    resolve(true);
                                  } else {
                                    notifyError(res?.msg ?? res?.message ?? "");
                                    resolve(true);
                                  }
                                } else {
                                  notifyError(res?.msg ?? res?.message ?? "");
                                  // setIsUploading(false);
                                  // hideModal();
                                  resolve(false);
                                }
                              })
                              .catch((err) => {
                                setIsUploading(false);
                                // notifyError("No se ha podido conectar al servidor");
                                console.error(err);
                              });
                          }, 15000)
                        );
                        if (prom === true) {
                          setIsUploading(false);
                          hideModal();
                          break;
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }
                  } else {
                    notifyError("No fue posible conectar con el Bucket");
                  }
                  fecthTablaConveniosPaginadoFunc();
                  setIsUploading(false);
                  hideModal();
                })
                .catch((err) => {
                  notifyError("Error al cargar el archivo");
                  console.error(err);
                  setIsUploading(false);
                  hideModal();
                }); /* notify("Se ha comenzado la carga"); */
            }
          }
        })
        .catch((err) => {
          notifyError("Error al cargar Datos");
          setIsUploading(false);
          hideModal();
        }); /* notify("Se ha comenzado la carga"); */
    },
    [file]
  );
  const handleConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      const formData = new FormData(ev.currentTarget);
      if (!formData.has("parciales")) {
        formData.set("parciales", "0");
      } else {
        formData.set("parciales", "1");
      }
      if (!formData.has("estado")) {
        formData.set("estado", "0");
      } else {
        formData.set("estado", "1");
      }
      let body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData))
          .map(([key, val]) => {
            return [
              key,
              key.includes("referencia_") && val === "" ? null : val,
            ];
          })
          .filter(([key, val]) => {
            const data = ["limiteMayor", "limiteMenor", "referencia"];
            return !data.includes(key);
          })
        // .map(([key, val]) => [key, key === "activo" ? val === "on" : val])
      );
      if (restriccionReferencias.length > 0) {
        const dataValidacion = def_validacion_referencia(
          restriccionReferencias
        );
        if (dataValidacion[0]) {
          setIsUploading(false);
          return notifyError(dataValidacion[1]);
        }
      }
      body = {
        ...body,
        pk_convenios_recaudo_aval: convenio?.pk_convenios_recaudo_aval,
        data_opcional: {
          restriccion_referencia: restriccionReferencias,
        },
      };
      putModificarConvenio(convenio.pk_convenios_recaudo_aval, body)
        .then((res) => {
          setIsUploading(false);
          if (res?.status) {
            notify(res?.msg);
            navigate(-1);
          } else {
            notifyError(res?.msg);
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    },
    [restriccionReferencias, convenio]
  );
  return (
    <>
      <SimpleLoading show={isUploading} />
      <TableEnterprise
        title="Tabla convenios AVAL corresponsal bancario"
        maxPage={maxPages}
        headers={["Id", "Convenio", "NIT", "EAN"]}
        data={tableConvenios}
        onSelectRow={onSelectConvenio}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id="searchConvenio"
          name="searchConvenio"
          label={"Buscar convenio"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, convenio: e.target.value };
            });
          }}
        />
        <Input
          id="idConvenio"
          label="NURA"
          type="text"
          name="idConvenio"
          minLength="1"
          maxLength="13"
          value={datosTrans.idConvenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              setDatosTrans((old) => {
                return { ...old, idConvenio: num };
              });
            }
          }}
        ></Input>
        <Input
          id="nit"
          label="NIT"
          type="text"
          name="nit"
          minLength="1"
          maxLength="13"
          value={datosTrans.nit}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              setDatosTrans((old) => {
                return { ...old, nit: num };
              });
            }
          }}
        ></Input>
        <Input
          id="ean"
          label="EAN"
          type="text"
          name="ean"
          minLength="1"
          maxLength="13"
          value={datosTrans.ean}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              setDatosTrans((old) => {
                return { ...old, ean: num };
              });
            }
          }}
        ></Input>
        <ButtonBar>
          <Button
            type="button"
            onClick={() => {
              setStatusModal("cargue");
              setShowModal(true);
            }}
          >
            Subir convenios
          </Button>
        </ButtonBar>
      </TableEnterprise>
      <Modal show={showModal} handleClose={hideModal}>
        {statusModal === "cargue" ? (
          <Form formDir="col" onSubmit={saveFile}>
            <h1 className="text-2xl text-center mb-10 mt-5">
              Archivo de convenios AVAL
            </h1>
            <InputX
              id={`archivo`}
              label={file.name ? "Cambiar archivo" : `Elegir archivo`}
              type="file"
              // disabled={progress !== 0}
              accept=".txt,.csv"
              onGetFile={onChangeFile}
            />
            {file.name ? (
              <>
                <h2 className="text-l text-center mt-5">
                  {`Archivo seleccionado: ${file.name}`}
                </h2>
                <ButtonBar>
                  <Button type="button" onClick={hideModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">Subir</Button>
                </ButtonBar>
              </>
            ) : (
              ""
            )}
          </Form>
        ) : (
          <>
            <h1 className="text-3xl mx-auto text-center mb-4">
              Editar convenio
            </h1>
            <Form onSubmit={handleConvenio} grid>
              <Input
                id={"nura"}
                label={"Código NURA"}
                name={"nura"}
                type="tel"
                autoComplete="off"
                minLength={"13"}
                maxLength={"13"}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                defaultValue={convenio?.nura ?? ""}
              />
              <Input
                id={"ean"}
                label={"Código EAN o IAC"}
                name={"ean"}
                type="tel"
                autoComplete="off"
                minLength={"13"}
                maxLength={"13"}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                defaultValue={convenio?.ean ?? ""}
              />
              <Input
                id={"convenio"}
                label={"Nombre del Convenio"}
                name={"convenio"}
                type="text"
                autoComplete="off"
                maxLength={"30"}
                defaultValue={convenio?.convenio ?? ""}
                required
              />
              <Input
                id={"nit"}
                label={"NIT"}
                name={"nit"}
                type="text"
                autoComplete="off"
                maxLength={"30"}
                defaultValue={convenio?.nit ?? ""}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                required
              />
              <ToggleInput
                id={"parciales"}
                label={"Modificar valor"}
                name={"parciales"}
                defaultChecked={convenio?.parciales === "1" ?? false}
              />
              <ToggleInput
                id={"estado"}
                label={"Se encuentra activo"}
                name={"estado"}
                defaultChecked={convenio?.estado === "1" ?? false}
              />
              <Fieldset legend="Restricción de longitud de referencias">
                {restriccionReferencias.length > 0 ? (
                  restriccionReferencias.map((data, i) => {
                    return (
                      <Fieldset legend="Restricción de referencia" key={i}>
                        <Select
                          className="place-self-stretch"
                          id={"referencia"}
                          label={"Referencia"}
                          name={"referencia"}
                          options={[
                            { label: "Referencia 1", value: "Referencia1" },
                            // { label: "Referencia 2", value: "Referencia2" },
                            // { label: "Referencia 3", value: "Referencia3" },
                          ]}
                          value={
                            restriccionReferencias[i]?.referencia ??
                            "Referencia1"
                          }
                          onChange={(e) => {
                            let copy = [...restriccionReferencias];
                            copy[i]["referencia"] = e.target.value;
                            setRestriccionReferencias(copy);
                          }}
                          required
                        />
                        <Input
                          id={"limiteMenor"}
                          label={"Limite menor"}
                          name={"limiteMenor"}
                          type="text"
                          autoComplete="off"
                          maxLength={"2"}
                          onInput={(e) => {
                            let valor = e.target.value;
                            let num = valor.replace(/[\s\.\-+eE]/g, "");
                            if (!isNaN(num)) {
                              let copy = [...restriccionReferencias];
                              copy[i]["limiteMenor"] = !isNaN(parseInt(num))
                                ? parseInt(num)
                                : 0;
                              setRestriccionReferencias(copy);
                            }
                          }}
                          value={restriccionReferencias[i]?.limiteMenor}
                        />
                        <Input
                          id={"limiteMayor"}
                          label={"Limite mayor"}
                          name={"limiteMayor"}
                          type="text"
                          autoComplete="off"
                          maxLength={"2"}
                          onInput={(e) => {
                            let valor = e.target.value;
                            let num = valor.replace(/[\s\.\-+eE]/g, "");
                            if (!isNaN(num)) {
                              let copy = [...restriccionReferencias];
                              copy[i]["limiteMayor"] = !isNaN(parseInt(num))
                                ? parseInt(num)
                                : 0;
                              setRestriccionReferencias(copy);
                            }
                          }}
                          value={restriccionReferencias[i]?.limiteMayor}
                        />
                        <ButtonBar>
                          <Button
                            type={"button"}
                            disabled={isUploading}
                            onClick={(e) => {
                              let copy = [...restriccionReferencias];
                              copy.splice(i, 1);
                              setRestriccionReferencias(copy);
                            }}
                          >
                            Eliminar restricción
                          </Button>
                        </ButtonBar>
                      </Fieldset>
                    );
                  })
                ) : (
                  <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                    <h1>
                      No se ha configurado ninguna restricción de longitud a las
                      referencias
                    </h1>
                  </div>
                )}
                {restriccionReferencias.length < 1 && (
                  <ButtonBar>
                    <Button
                      type={"button"}
                      disabled={isUploading}
                      onClick={(e) => {
                        setRestriccionReferencias((obj) => [
                          ...obj,
                          {
                            referencia: "Referencia1",
                            limiteMenor: 0,
                            limiteMayor: 0,
                          },
                        ]);
                      }}
                    >
                      Agregar restricción
                    </Button>
                  </ButtonBar>
                )}
              </Fieldset>
              <ButtonBar>
                <Button type={"submit"} disabled={isUploading}>
                  Realizar cambios
                </Button>
              </ButtonBar>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default ConveniosRecaudoAval;
