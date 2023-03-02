import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { getRecaudosList, addFileConveniosRecaudo } from "../../utils/fetchFunctions"

export const fetchUploadFileCustom = async (url, body) => {
  try {
    const Peticion = await fetch(url, {
      method: "POST",
      body,
      mode: "cors",
    });
    const res = await Peticion.json()
    return res;
  } catch (error) {
    throw error;
  }
};

const CargarArchivosRecaudo = () => {
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(false); // fila selecionada
  const [listRecaudos, setListRecaudos] = useState('')
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [cargando, setCargando] = useState(false)
  const [file, setFile] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });

  const getRecaudos = useCallback(async () => {
    await getRecaudosList({
      ...searchFilters,
      limit: pageData.limit,
      offset: pageData.page === 1 ? 0 : (pageData.page * pageData.limit) - pageData.limit,
    })
      .then((data) => {
        setListRecaudos(data?.obj?.results ?? []);
        setMaxPages(data?.obj?.maxPages ?? '')
      })
      .catch((err) => {
        // if (err?.cause === "custom") {
        //   notifyError(err?.message);
        //   return;
        // }
        console.error(err?.message);
      });
    setCargando(true)
  }, [pageData, searchFilters])

  useEffect(() => { getRecaudos() }, [getRecaudos, pageData, searchFilters])

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false)
  }, []);


  const CargarArchivo = useCallback(async (e) => {
    const url = `http://127.0.0.1:8000/convenio-recaudo/validar_csv?convenio_id=${selected.pk_id_convenio_directo}`;
    e.preventDefault();
    const formData = new FormData();
    formData.set("file", file);
    try {
      fetchUploadFileCustom(url, formData)
        .then((data) => {
          if (data?.status === true){
            console.log(data)
          }
          else {console.log(data)}
        })
        .catch((e)=> console.log("err",e))
    }
    catch (e) { console.log(e) }

    handleClose()
  }, [handleClose, file, selected])

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Recaudos Directo</h1>
      {cargando ? (<>
        <TableEnterprise
          title="Convenios de Recaudos"
          headers={[
            "Código convenio",
            "Código EAN o IAC",
            "Nombre convenio",
            "Permite vencidos",
            "Estado",
            "Fecha creacion",
          ]}
          // data={datos['value'].map(
          data={listRecaudos.map(
            ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              permite_vencidos,
              estado,
              fecha_creacion,
            }) => ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              permite_vencidos: permite_vencidos ? "Verdadero" : "Falso",
              estado: estado ? "Activo" : "No activo",
              fecha_creacion: fecha_creacion ?? "ninguna",
            })
          )}
          onSelectRow={(e, i) => {
            setShowModal(true);
            setSelected(listRecaudos[i]);
          }}
          maxPage={maxPages}
          onSetPageData={setPageData}
          onChange={(ev) => {
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }}
        >
          <Input
            id={"pk_codigo_convenio"}
            label={"Código de convenio"}
            name={"pk_id_convenio_directo"}
            type="tel"
            autoComplete="off"
            maxLength={"4"}
            onChange={(ev) => { }}

          />
          <Input
            id={"codigo_ean_iac_search"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            type="tel"
            autoComplete="off"
            maxLength={"13"}
            onChange={(ev) => { }}
          />
          <Input
            id={"nombre_convenio"}
            label={"Nombre del convenio"}
            name={"nombre_convenio"}
            type="text"
            autoComplete="off"
            maxLength={"30"}
            onChange={(ev) => { }}
          />
        </TableEnterprise>
      </>) : (<>cargando...</>)}
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">Cargar archivos de recaudo</h2>
        <Form onSubmit={CargarArchivo}>
          <Input
            // label='Seleccionar Archivo'
            type='file'
            autoComplete='off'
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
            required
          />
          <ButtonBar>
            <Button type="submit">Cargar Archivo</Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default CargarArchivosRecaudo