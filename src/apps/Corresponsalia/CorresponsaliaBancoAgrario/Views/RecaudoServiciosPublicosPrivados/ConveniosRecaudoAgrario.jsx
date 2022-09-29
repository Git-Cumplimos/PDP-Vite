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
  postConsultaTablaConveniosPaginado,
  postConsultaTablaConveniosPaginadoTotal,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const url_cargueS3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}/grupo_aval_cb_recaudo/subir_archivos_convenios`;

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
    algoritmo_ref1: "",
    algoritmo_ref2: "",
    algoritmo_ref3: "",
    codigo: "",
    ean: "",
    estado: false,
    longitud_max_ref1: 0,
    longitud_max_ref2: 0,
    longitud_max_ref3: 0,
    longitud_min_ref1: 0,
    longitud_min_ref2: 0,
    longitud_min_ref3: 0,
    nit: "",
    nombre_convenio: "",
    nombre_ref1: "",
    nombre_ref2: "",
    nombre_ref3: "",
    pk_tbl_convenios_banco_agrario: 0,
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
      algoritmo_ref1: "N 010 Numérico",
      algoritmo_ref2: "",
      algoritmo_ref3: "",
      codigo: "",
      ean: "",
      estado: false,
      longitud_max_ref1: 0,
      longitud_max_ref2: 0,
      longitud_max_ref3: 0,
      longitud_min_ref1: 0,
      longitud_min_ref2: 0,
      longitud_min_ref3: 0,
      nit: "",
      nombre_convenio: "",
      nombre_ref1: "",
      nombre_ref2: "",
      nombre_ref3: "",
      pk_tbl_convenios_banco_agrario: 0,
    });
  };
  const onSelectAutorizador = useCallback((e, i) => {}, []);
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
  const onChangeFormat = useCallback((ev) => {
    setDataConvenios((old) => {
      return { ...old, [ev.target.name]: ev.target.value };
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

  //------------------Funcion Para Subir El Formulario---------------------//
  const saveFile = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const f = new Date();
      const query = {
        contentType: "application/text",
        filename: `archivo_convenios_aval/${file.name}`,
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
              // console.log(formData2, `${respuesta?.obj?.url}`);
              fetch(`${respuesta?.obj?.url}`, {
                method: "POST",
                body: formData2,
              }).then((res) => {
                if (res?.ok) {
                  notify("Se ha subido exitosamente el archivo");
                } else {
                  notifyError("No fue posible conectar con el Bucket");
                }
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
  return (
    <>
      <SimpleLoading show={isUploading} />
      <TableEnterprise
        title='Tabla convenios AVAL corresponsal bancario'
        maxPage={maxPages}
        headers={["Id", "Convenio", "Ean", "Estado"]}
        data={tableConvenios}
        onSelectRow={onSelectAutorizador}
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
        ) : estado === 1 ? (
          <Form
            grid
            onSubmit={(e) => {
              e.preventDefault();
              console.log("entro");
            }}>
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
                maxLength='7'
                required
                value={dataConvenios?.nit}
                onInput={onChangeFormatNumber}></Input>
            </Fieldset>
            <Fieldset
              legend='Información del referencia 1'
              className='lg:col-span-2'>
              <Input
                id='nombre_ref1'
                label='Nombre referencia 1'
                type='text'
                name='nombre_ref1'
                minLength='1'
                maxLength='50'
                required
                value={dataConvenios?.nombre_ref1}
                onInput={onChangeFormat}></Input>
              <Select
                className='place-self-stretch'
                id='algoritmo_ref1'
                name='algoritmo_ref1'
                label='Tipo de algoritmo referencia 1'
                required={true}
                options={{
                  "N 010 Numérico": "N 010 Numérico",
                  "A 000 Alfanumérico Números": "A 000 Alfanumérico Números",
                }}
                onChange={onChangeFormat}
                value={dataConvenios?.algoritmo_ref1}
              />
              <Input
                id='longitud_min_ref1'
                label='longitud minima referencia 1'
                type='text'
                name='longitud_min_ref1'
                minLength='1'
                maxLength='2'
                required
                value={dataConvenios?.longitud_min_ref1}
                onInput={onChangeFormatNumber}></Input>
              <Input
                id='longitud_max_ref1'
                label='longitud maxima referencia 1'
                type='text'
                name='longitud_max_ref1'
                minLength='1'
                maxLength='2'
                required
                value={dataConvenios?.longitud_max_ref1}
                onInput={onChangeFormatNumber}></Input>
            </Fieldset>
            <Fieldset
              legend='Información del referencia 2'
              className='lg:col-span-2'>
              <Input
                id='nombre_ref2'
                label='Nombre referencia 2'
                type='text'
                name='nombre_ref2'
                minLength='1'
                maxLength='50'
                value={dataConvenios?.nombre_ref2}
                onInput={onChangeFormat}></Input>
              <Select
                className='place-self-stretch'
                id='algoritmo_ref2'
                name='algoritmo_ref2'
                label='Tipo de algoritmo referencia 2'
                options={{
                  "": "",
                  "N 010 Numérico": "N 010 Numérico",
                  "A 000 Alfanumérico Números": "A 000 Alfanumérico Números",
                }}
                onChange={onChangeFormat}
                value={dataConvenios?.algoritmo_ref2}
              />
              <Input
                id='longitud_min_ref2'
                label='longitud minima referencia 2'
                type='text'
                name='longitud_min_ref2'
                minLength='0'
                maxLength='2'
                value={dataConvenios?.longitud_min_ref2}
                onInput={onChangeFormatNumber}></Input>
              <Input
                id='longitud_max_ref1'
                label='longitud maxima referencia 1'
                type='text'
                name='longitud_max_ref1'
                minLength='0'
                maxLength='2'
                value={dataConvenios?.longitud_max_ref2}
                onInput={onChangeFormatNumber}></Input>
            </Fieldset>
            <Fieldset
              legend='Información del referencia 3'
              className='lg:col-span-2'>
              <Input
                id='nombre_ref3'
                label='Nombre referencia 3'
                type='text'
                name='nombre_ref3'
                minLength='1'
                maxLength='50'
                value={dataConvenios?.nombre_ref3}
                onInput={onChangeFormat}></Input>
              <Select
                className='place-self-stretch'
                id='algoritmo_ref3'
                name='algoritmo_ref3'
                label='Tipo de algoritmo referencia 3'
                options={{
                  "": "",
                  "N 010 Numérico": "N 010 Numérico",
                  "A 000 Alfanumérico Números": "A 000 Alfanumérico Números",
                }}
                onChange={onChangeFormat}
                value={dataConvenios?.algoritmo_ref3}
              />
              <Input
                id='longitud_min_ref3'
                label='longitud minima referencia 3'
                type='text'
                name='longitud_min_ref3'
                minLength='0'
                maxLength='2'
                value={dataConvenios?.longitud_min_ref3}
                onInput={onChangeFormatNumber}></Input>
              <Input
                id='longitud_max_ref3'
                label='longitud maxima referencia 3'
                type='text'
                name='longitud_max_ref3'
                minLength='0'
                maxLength='2'
                value={dataConvenios?.longitud_max_ref3}
                onInput={onChangeFormatNumber}></Input>
            </Fieldset>
            <ButtonBar>
              <Button onClick={hideModal}>Cancelar</Button>
              <Button type='submit'>Aceptar</Button>
            </ButtonBar>
          </Form>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default ConveniosRecaudoAgrario;
