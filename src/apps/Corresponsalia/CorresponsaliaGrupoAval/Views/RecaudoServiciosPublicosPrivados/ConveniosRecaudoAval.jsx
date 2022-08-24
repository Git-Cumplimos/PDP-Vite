import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { postConsultaTablaConveniosPaginado } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const url_cargueS3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_recaudo/subir_archivos_convenios`;

const ConveniosRecaudoAval = () => {
  const navigate = useNavigate();
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
          Convenio: convenio,
          EAN: ean,
        };
      }),
    ];
  }, [convenios]);
  const hideModal = () => {
    setShowModal(false);
  };
  const onSelectAutorizador = useCallback(
    (e, i) => {
      // navigate(
      //   "../corresponsalia/corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/manual",
      //   {
      //     state: {
      //       id: convenios[i]["pk_convenios_recaudo_aval"],
      //     },
      //   }
      // );
    },
    [navigate, convenios]
  );
  const subirArchivos = useCallback((e) => {
    console.log(e);
  }, []);
  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaTablaConveniosPaginado({
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
        console.log(m_file);
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
      const query = {
        contentType: "application/text",
        filename: `${file.name}`,
      };
      fetchData(url_cargueS3, "POST", {}, query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
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
              console.log(formData2, `${respuesta?.obj?.url}`);
              fetch(`${respuesta?.obj?.url}`, {
                method: "POST",
                body: formData2,
              }).then((res) => {
                if (res?.ok) {
                  console.log("subio");
                  // setTimeout(() => {
                  //   EstadoArchivos().then((res) => {
                  //     if (typeof res != Object) {
                  //       if ("Motivo" in res?.[0]) {
                  //         closeModal();
                  //         if (res[0]["Estado"] === 1) {
                  //           notify(res[0]["Motivo"]);
                  //         } else {
                  //           notifyError(res[0]["Motivo"]);
                  //         }
                  //       } else {
                  //         notifyError("Consulte con soporte");
                  //       }
                  //     }
                  //   });
                  // }, 3000);
                } else {
                  notifyError("No fue posible conectar con el Bucket");
                }
              });
            }
          }
        })
        .catch((err) => {
          notifyError("Error al cargar Datos");
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
        headers={["Id", "Convenio", "Ean"]}
        data={tableConvenios}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Buscar convenio"}
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
          label='Ean'
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
          <Button type='submit' onClick={() => setShowModal(true)}>
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
