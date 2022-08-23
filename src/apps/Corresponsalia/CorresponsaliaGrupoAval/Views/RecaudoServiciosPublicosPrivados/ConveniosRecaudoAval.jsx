import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import InputX from "../../../../../components/Base/InputX/InputX";
import Modal from "../../../../../components/Base/Modal";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import { notify, notifyError } from "../../../../../utils/notify";
import { postConsultaTablaConveniosPaginado } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

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
  const onChange = (files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        // console.log(m_file);
        // setFile(m_file);
        // setFileName(m_file.name);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  return (
    <>
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
        {/* <Form formDir="col" onSubmit={onSubmit}>
            <InputX
              id={`archivo_${archivo}`}
              label={`Elegir archivo: ${
                options.find(({ value }) => {
                  return value === archivo;
                }).label
              }`}
              type="file"
              disabled={progress !== 0}
              accept=".txt,.csv"
              onGetFile={onChange}
            />
            {file && progress === 0 ? (
              <ButtonBar>
                <Button type="submit">Subir</Button>
              </ButtonBar>
            ) : (
              ""
            )}
          </Form> */}
      </Modal>
    </>
  );
};

export default ConveniosRecaudoAval;
