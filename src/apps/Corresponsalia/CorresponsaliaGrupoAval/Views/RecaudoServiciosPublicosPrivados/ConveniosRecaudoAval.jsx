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
  postConsultaTablaConveniosPaginado,
  postConsultaTablaConveniosPaginadoTotal,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { v4 as uuidv4 } from "uuid";

const url_cargueS3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_recaudo/subir_archivos_convenios`;

const ConveniosRecaudoAval = () => {
  // const [{ searchConvenio = "" }, setQuery] = useQuery();
  const [showModal, setShowModal] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    convenio: "",
    idConvenio: "",
    idEAN: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState({});
  const [convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(({ pk_convenios_recaudo_aval, nura, convenio, ean }) => {
        return {
          "Id convenio": nura,
          Convenio: convenio !== "" ? convenio : "N/A",
          EAN: ean !== "" ? ean : "N/A",
        };
      }),
    ];
  }, [convenios]);
  const hideModal = () => {
    setShowModal(false);
    setFile({});
  };
  const onSelectConvenio = useCallback((e, i) => {}, []);
  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaTablaConveniosPaginadoTotal({
      convenio: datosTrans.convenio,
      nura: datosTrans.idConvenio,
      ean: datosTrans.ean,
      page,
      limit,
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  };
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
  return (
    <>
      <SimpleLoading show={isUploading} />
      <TableEnterprise
        title='Tabla convenios AVAL corresponsal bancario'
        maxPage={maxPages}
        headers={["Id", "Convenio", "EAN"]}
        data={tableConvenios}
        onSelectRow={onSelectConvenio}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Buscar convenio"}
          minLength='1'
          maxLength='30'
          type='text'
          autoComplete='off'
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, convenio: e.target.value };
            });
          }}
        />
        <Input
          id='idConvenio'
          label='Id convenio'
          type='text'
          name='idConvenio'
          minLength='1'
          maxLength='13'
          value={datosTrans.idConvenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, idConvenio: num };
              });
            }
          }}></Input>
        <Input
          id='ean'
          label='EAN'
          type='text'
          name='ean'
          minLength='1'
          maxLength='13'
          value={datosTrans.ean}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, ean: num };
              });
            }
          }}></Input>
        <ButtonBar>
          <Button type='button' onClick={() => setShowModal(true)}>
            Subir convenios
          </Button>
        </ButtonBar>
      </TableEnterprise>
      <Modal show={showModal} handleClose={hideModal}>
        {/* <CargarForm
            selected={archivo}
            file={fileName}
            disabledBtns={disabledBtns}
            closeModal={closeModal}
            handleSubmit={() => {
              saveFile();
            }}
          /> */}
        <Form formDir='col' onSubmit={saveFile}>
          <h1 className='text-2xl text-center mb-10 mt-5'>
            Archivo de convenios AVAL
          </h1>
          <InputX
            id={`archivo`}
            label={file.name ? "Cambiar archivo" : `Elegir archivo`}
            type='file'
            // disabled={progress !== 0}
            accept='.txt,.csv'
            onGetFile={onChangeFile}
          />
          {file.name ? (
            <>
              <h2 className='text-l text-center mt-5'>
                {`Archivo seleccionado: ${file.name}`}
              </h2>
              <ButtonBar>
                <Button type='button' onClick={hideModal}>
                  Cancelar
                </Button>
                <Button type='submit'>Subir</Button>
              </ButtonBar>
            </>
          ) : (
            ""
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ConveniosRecaudoAval;
