import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Fieldset from "../../../../../components/Base/Fieldset";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import InputX from "../../../../../components/Base/InputX/InputX";
import Modal from "../../../../../components/Base/Modal";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import fetchData from "../../../../../utils/fetchData";
import { notify, notifyError } from "../../../../../utils/notify";
import {
  postCheckEstadoConveniosAgrario,
  postConsultaTablaConveniosPaginadoTotal,
  postCrearConvenio,
  putModificarConvenio,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { v4 as uuidv4 } from "uuid";

const url_cargueS3 = `${process.env.REACT_APP_URL_BANCO_AGRARIO}/banco-agrario/banco_agrario_cb_recaudo/subir_archivos_convenios`;

const ConveniosRecaudoAgrario = () => {
  const navigate = useNavigate();
  // const [{ searchConvenio = "" }, setQuery] = useQuery();
  const [{ estado, showModal }, setShowModal] = useState({
    estado: 0,
    showModal: false,
  });
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    convenio: "",
    idConvenio: "",
    idEAN: "",
  });
  const [dataConvenios, setDataConvenios] = useState({
    codigo: "",
    ean: "",
    estado: true,
    nit: "",
    nombre_convenio: "",
    pk_tbl_convenios_banco_agrario: 0,
    referencias: [
      {
        nombre_ref1: "",
        longitud_min_ref1: 1,
        longitud_max_ref1: 0,
        algoritmo_ref1: "N 010 Numérico",
      },
    ],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState({});
  const [convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(
        ({
          pk_tbl_convenios_banco_agrario,
          codigo,
          nombre_convenio,
          ean,
          estado,
        }) => {
          return {
            "Id convenio": codigo,
            Convenio: nombre_convenio !== "" ? nombre_convenio : "N/A",
            EAN: ean !== "" ? ean : "N/A",
            Estado: estado ? "Activo" : "Inactivo",
          };
        }
      ),
    ];
  }, [convenios]);
  const hideModal = () => {
    setShowModal((old) => ({ estado: 0, showModal: false }));
    setFile({});
    setDataConvenios({
      codigo: "",
      ean: "",
      estado: true,
      nit: "",
      nombre_convenio: "",
      pk_tbl_convenios_banco_agrario: 0,
      referencias: [
        {
          nombre_ref1: "",
          longitud_min_ref1: 0,
          longitud_max_ref1: 0,
          algoritmo_ref1: "N 010 Numérico",
        },
      ],
    });
  };
  const onSelectConvenio = useCallback(
    (e, i) => {
      const refTemp = [];
      if (convenios[i].nombre_ref1 !== "" && convenios[i].nombre_ref1) {
        refTemp.push({
          nombre_ref1: convenios[i].nombre_ref1,
          longitud_min_ref1: convenios[i].longitud_min_ref1,
          longitud_max_ref1: convenios[i].longitud_max_ref1,
          algoritmo_ref1: convenios[i].algoritmo_ref1,
        });
        if (convenios[i].nombre_ref2 !== "" && convenios[i].nombre_ref2) {
          refTemp.push({
            nombre_ref2: convenios[i].nombre_ref2,
            longitud_min_ref2: convenios[i].longitud_min_ref2,
            longitud_max_ref2: convenios[i].longitud_max_ref2,
            algoritmo_ref2: convenios[i].algoritmo_ref2,
          });
          if (convenios[i].nombre_ref3 !== "" && convenios[i].nombre_ref3) {
            refTemp.push({
              nombre_ref3: convenios[i].nombre_ref3,
              longitud_min_ref3: convenios[i].longitud_min_ref3,
              longitud_max_ref3: convenios[i].longitud_max_ref3,
              algoritmo_ref3: convenios[i].algoritmo_ref3,
            });
          }
        }
      }
      setDataConvenios({
        codigo: convenios[i].codigo,
        ean: convenios[i].ean,
        estado: convenios[i].estado,
        nit: convenios[i].nit,
        nombre_convenio: convenios[i].nombre_convenio,
        pk_tbl_convenios_banco_agrario:
          convenios[i].pk_tbl_convenios_banco_agrario,
        referencias: refTemp,
      });
      setShowModal((old) => ({ estado: 1, showModal: true }));
    },
    [convenios]
  );
  const createUpdateConvenio = useCallback(
    (e) => {
      e.preventDefault();
      for (let i = 0; i < dataConvenios.referencias.length; i++) {
        const element = dataConvenios.referencias[i];
        if (
          element.longitud_max_ref1 === 0 ||
          element.longitud_min_ref1 === 0
        ) {
          return notifyError(
            `La longitud máxima o mínima debe ser diferente de 0`
          );
        }
        if (element.longitud_min_ref1 > element.longitud_max_ref1) {
          return notifyError(`La longitud mínima debe ser menor a la máxima`);
        }
      }
      setShowModal((old) => ({ estado: 2, showModal: true }));
    },
    [dataConvenios]
  );
  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaTablaConveniosPaginadoTotal({
      nombre_convenio: datosTrans.convenio,
      codigo: datosTrans.idConvenio,
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
        setFile(m_file);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "estado") {
      if (value && typeof value === "string") {
        value = value.toLowerCase() === "false" ? false : true;
      }
    }
    setDataConvenios((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    let num = valor.replace(/[\s\.]/g, "");
    if (!isNaN(num)) {
      setDataConvenios((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const onChangeFormatVect = useCallback(
    (i) => (ev) => {
      const tempData = { ...dataConvenios };
      tempData.referencias[i][ev.target.name] = ev.target.value;
      setDataConvenios(tempData);
    },
    [dataConvenios]
  );
  const onChangeFormatNumberVect = useCallback(
    (i) => (ev) => {
      const valor = ev.target.value;
      let num = valor === "" ? 0 : valor.replace(/[\s\.]/g, "");
      if (!isNaN(num)) {
        const tempData = { ...dataConvenios };
        tempData.referencias[i][ev.target.name] = parseInt(num);
        setDataConvenios(tempData);
      }
    },
    [dataConvenios]
  );
  const addReferencia = useCallback(
    (ev) => {
      ev.preventDefault();
      const tempData = { ...dataConvenios };
      const lenData = tempData.referencias.length;
      if (lenData < 3) {
        tempData.referencias.push({
          [`nombre_ref${lenData + 1}`]: "",
          [`longitud_min_ref${lenData + 1}`]: 1,
          [`longitud_max_ref${lenData + 1}`]: 0,
          [`algoritmo_ref${lenData + 1}`]: "N 010 Numérico",
        });
        setDataConvenios(tempData);
      }
    },
    [dataConvenios]
  );
  const deleteReferencia = useCallback(
    (ev) => {
      ev.preventDefault();
      const tempData = { ...dataConvenios };
      const lenData = tempData.referencias.length;
      if (lenData > 1) {
        tempData.referencias.pop();
        setDataConvenios(tempData);
      }
    },
    [dataConvenios]
  );

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
        filename: `archivo_convenios_agrario/${file.name}`,
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
              }).then(async (res) => {
                if (res?.ok) {
                  notify(
                    "Se ha subido exitosamente el archivo, espere un momento se esta realizando el cargue a la base de datos"
                  );
                  for (let i = 0; i < 3; i++) {
                    try {
                      const prom = await new Promise((resolve, reject) =>
                        setTimeout(() => {
                          postCheckEstadoConveniosAgrario({
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
                                // notifyError(res?.msg ?? res?.message ?? "");
                                setIsUploading(false);
                                hideModal();
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
              });
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
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      setIsUploading(true);
      let dataTemp = { ...dataConvenios };
      for (let id = 0; id < dataConvenios.referencias.length; id++) {
        const element = dataConvenios.referencias[id];
        dataTemp[`nombre_ref${id + 1}`] = element[`nombre_ref${id + 1}`];
        dataTemp[`longitud_min_ref${id + 1}`] =
          element[`longitud_min_ref${id + 1}`];
        dataTemp[`longitud_max_ref${id + 1}`] =
          element[`longitud_max_ref${id + 1}`];
        dataTemp[`algoritmo_ref${id + 1}`] = element[`algoritmo_ref${id + 1}`];
      }
      delete dataTemp["referencias"];
      if (dataConvenios.pk_tbl_convenios_banco_agrario !== 0) {
        putModificarConvenio(dataConvenios.pk_tbl_convenios_banco_agrario, {
          ...dataTemp,
        })
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
      } else {
        delete dataTemp["pk_tbl_convenios_banco_agrario"];
        postCrearConvenio({
          ...dataTemp,
        })
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
      }
    },
    [dataConvenios, navigate]
  );
  return (
    <>
      <SimpleLoading show={isUploading} />
      <TableEnterprise
        title='Tabla de convenios Banco Agrario'
        maxPage={maxPages}
        headers={["Código", "Convenio", "EAN", "Estado"]}
        data={tableConvenios}
        onSelectRow={onSelectConvenio}
        onSetPageData={setPageData}>
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
          label='Código convenio'
          type='text'
          name='idConvenio'
          minLength='1'
          maxLength='13'
          value={datosTrans.idConvenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              let num = e.target.value;
              num = Math.abs(num)
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
          <Button
            type='submit'
            onClick={() =>
              setShowModal((old) => ({ estado: 0, showModal: true }))
            }>
            Subir convenios
          </Button>
          <Button
            type='submit'
            onClick={() =>
              setShowModal((old) => ({ estado: 1, showModal: true }))
            }>
            Crear convenios
          </Button>
        </ButtonBar>
      </TableEnterprise>
      <Modal show={showModal} handleClose={hideModal}>
        {estado === 0 ? (
          <Form formDir='col' onSubmit={saveFile}>
            <h1 className='text-2xl text-center mb-10 mt-5'>
              Archivo de convenios Agrario
            </h1>
            <InputX
              id={`archivo`}
              label={file.name ? "Cambiar archivo" : `Elegir archivo`}
              type='file'
              // disabled={progress !== 0}
              accept='.csv,.txt'
              onGetFile={onChangeFile}
            />
            {file.name ? (
              <>
                <h2 className='text-l text-center mt-5'>
                  {`Archivo seleccionado: ${file.name}`}
                </h2>
                <ButtonBar>
                  <Button type='submit'>Subir</Button>
                </ButtonBar>
              </>
            ) : (
              ""
            )}
          </Form>
        ) : estado === 1 ? (
          <Form grid onSubmit={createUpdateConvenio}>
            <h1 className='text-2xl font-semibold text-center'>
              {dataConvenios?.pk_tbl_convenios_banco_agrario !== 0
                ? "Editar convenio Agrario"
                : "Crear convenio Agrario"}
            </h1>
            <Fieldset
              legend='Información del convenio'
              className='lg:col-span-2'>
              {dataConvenios?.pk_tbl_convenios_banco_agrario !== 0 && (
                <Input
                  id='pk_tbl_convenios_banco_agrario'
                  label='Id comercio'
                  type='text'
                  name='pk_tbl_convenios_banco_agrario'
                  minLength='1'
                  maxLength='32'
                  value={dataConvenios?.pk_tbl_convenios_banco_agrario}
                  onInput={onChangeFormat}
                  disabled></Input>
              )}
              <Input
                id='codigo'
                label='Código convenio'
                type='text'
                name='codigo'
                minLength='1'
                maxLength='6'
                required
                value={dataConvenios?.codigo}
                onInput={onChangeFormatNumber}></Input>
              <Input
                id='nombre_convenio'
                label='Nombre convenio'
                type='text'
                name='nombre_convenio'
                minLength='1'
                maxLength='80'
                required
                value={dataConvenios?.nombre_convenio}
                onInput={onChangeFormat}></Input>
              <Input
                id='ean'
                label='EAN'
                type='text'
                name='ean'
                minLength='1'
                maxLength='13'
                required
                value={dataConvenios?.ean}
                onInput={onChangeFormatNumber}></Input>
              <Input
                id='nit'
                label='NIT'
                type='text'
                name='nit'
                minLength='1'
                maxLength='10'
                required
                value={dataConvenios?.nit}
                onInput={onChangeFormatNumber}></Input>
              <Select
                className='place-self-stretch'
                id='estado'
                name='estado'
                label='Estado del convenio'
                required={true}
                options={{
                  Inactivo: false,
                  Activo: true,
                }}
                onChange={onChangeFormat}
                value={dataConvenios?.estado}
              />
            </Fieldset>
            {dataConvenios.referencias.map((item, id) => (
              <Fieldset
                legend={`Información referencia ${id + 1}`}
                className='lg:col-span-2'
                key={id}>
                <Input
                  id={`nombre_ref${id + 1}`}
                  label={`Nombre referencia ${id + 1}`}
                  type='text'
                  name={`nombre_ref${id + 1}`}
                  minLength='1'
                  maxLength='50'
                  required
                  value={dataConvenios?.referencias[id][`nombre_ref${id + 1}`]}
                  onInput={onChangeFormatVect(id)}></Input>
                <Select
                  className='place-self-stretch'
                  id={`algoritmo_ref${id + 1}`}
                  name={`algoritmo_ref${id + 1}`}
                  label={`Tipo de algoritmo referencia ${id + 1}`}
                  required={true}
                  options={{
                    "N 010 Numérico": "N 010 Numérico",
                    "A 000 Alfanumérico Números": "A 000 Alfanumérico Números",
                    "Q 108 Modlo 10": "Q 108 Modlo 10",
                    "U 109 Base 9": "U 109 Base 9",
                  }}
                  onChange={onChangeFormatVect(id)}
                  value={
                    dataConvenios?.referencias[id][`algoritmo_ref${id + 1}`]
                  }
                />
                <Input
                  id={`longitud_min_ref${id + 1}`}
                  label={`longitud mínima referencia ${id + 1}`}
                  type='text'
                  name={`longitud_min_ref${id + 1}`}
                  minLength='1'
                  maxLength='2'
                  required
                  value={
                    dataConvenios?.referencias[id][`longitud_min_ref${id + 1}`]
                  }
                  onInput={onChangeFormatNumberVect(id)}></Input>
                <Input
                  id={`longitud_max_ref${id + 1}`}
                  label={`longitud máxima referencia ${id + 1}`}
                  type='text'
                  name={`longitud_max_ref${id + 1}`}
                  minLength='1'
                  maxLength='2'
                  required
                  value={
                    dataConvenios?.referencias[id][`longitud_max_ref${id + 1}`]
                  }
                  onInput={onChangeFormatNumberVect(id)}></Input>
              </Fieldset>
            ))}
            <ButtonBar className='lg:col-span-2'>
              {dataConvenios.referencias.length > 1 && (
                <Button onClick={deleteReferencia}>Eliminar Referencia</Button>
              )}
              {dataConvenios.referencias.length < 3 && (
                <Button type='button' onClick={addReferencia}>
                  Agregar referencia
                </Button>
              )}
            </ButtonBar>
            <ButtonBar>
              <Button
                onClick={() => {
                  notify("Operación cancelada");
                  hideModal();
                }}>
                Cancelar
              </Button>
              <Button type='submit'>
                {dataConvenios?.pk_tbl_convenios_banco_agrario !== 0
                  ? "Editar convenio"
                  : "Crear convenio"}
              </Button>
            </ButtonBar>
          </Form>
        ) : estado === 2 ? (
          <>
            <h1 className='text-2xl text-center mb-5 font-semibold'>
              {`¿Está seguro de ${
                dataConvenios?.pk_tbl_convenios_banco_agrario !== 0
                  ? "editar el convenio"
                  : "crear el convenio"
              }?`}
            </h1>
            <>
              <ButtonBar>
                <Button
                  onClick={() => {
                    notify("Operación cancelada");
                    hideModal();
                  }}>
                  Cancelar
                </Button>
                <Button type='submit' onClick={onSubmit}>
                  {dataConvenios?.pk_tbl_convenios_banco_agrario !== 0
                    ? "Aceptar"
                    : "Aceptar"}
                </Button>
              </ButtonBar>
            </>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default ConveniosRecaudoAgrario;
