import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import { getRecaudosList, downloadFileRecaudo } from "../../utils/fetchFunctions"
import { ExportToCsv } from "export-to-csv";
import fetchData from "../../../../utils/fetchData";


export const fetchImportFile = async (url, body) => {
  try {
    const res = await fetchData(url,'POST',{},body);
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }
      throw new Error(res, { cause: "custom" });
    }

    // const res = await Peticion.json()
    return res;
  } catch (error) {
    throw error;
  }
};

const GestionArchivosRecaudo = () => {
  const [showModal, setShowModal] = useState(false)
  const [showMainModal, setShowMainModal] = useState(false)
  const [showModalOptions, setShowModalOptions] = useState(false)
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

  useEffect(() => {
    setPageData(pageData => ({ ...pageData, page: 1 }));
  }, [pageData.limit]);

  const getRecaudos = useCallback(async () => {
    await getRecaudosList({
      ...pageData,
      ...searchFilters,
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
    setShowMainModal(false);
    setShowModalOptions(false);
    setSelected(false)
  }, []);


  const CargarArchivo = useCallback(async (e) => {
    const url = `http://127.0.0.1:8000/convenio-recaudo/validar_csv?convenio_id=${selected.pk_id_convenio_directo}`;
    e.preventDefault();
    const formData = new FormData();
    formData.set("file", file);
    notifyPending(
      fetchImportFile(url, formData),
      {
        render() {
          return "Enviando solicitud";
        },
      },
      {
        render({data:res}){
          handleClose()
          return res?.msg;
        }
      },
      {
        render({data:err}){
          if (err?.cause === "custom") {
            return err?.message;
          }
          console.error(err?.message);
          return `Archivo erroneo`;
        }
      }
    )
    // try {
    //   fetchImportFile(url, formData)
    //     .then((data) => {
    //       if (data?.status === true) {
    //         console.log(data)
    //       }
    //       else { console.log(data) }
    //     })
    //     .catch((e) => console.log("err", e))
    // }
    // catch (e) { console.log(e) }

    // handleClose()
  }, [handleClose, file, selected])

  const DescargarArchivo = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    try {
      downloadFileRecaudo({...body,convenio_id:selected.pk_id_convenio_directo})
      .then(async (res) => {
        if (res.codigo) throw res.msg
        const options = {
          fieldSeparator: ";",
          quoteStrings: '"',
          decimalSeparator: ",",
          showLabels: true,
          showTitle: false,
          title: `Reporte_${selected?.nombre_convenio}`,
          useTextFile: false,
          useBom: true,
          useKeysAsHeaders: false,
          filename: `Reporte_${selected?.nombre_convenio}`,
        };
        const csvExporter = new ExportToCsv(options);
        const data = JSON.stringify(res)
        csvExporter.generateCsv(data);
        
        // const resp = await data.json()
        // console.log(resp)
        // if (resp.status){
          //   notify(`${resp.msg}`)
          //   const url = window.URL.createObjectURL(new Blob([resp.obj]));
          //   const link = document.createElement('a');
          //   link.href = url;
          //   link.setAttribute('download', resp.file_name);
          //   document.body.appendChild(link);
          //   link.click();
          //   link.parentNode.removeChild(link);
          // }
          // else{
            //   notifyError(`${resp.msg}`)
            //   handleClose()
            // }

          // const dataBlob = await data.blob()
          // if (dataBlob.type === 'text/csv') {
          //   const file = window.URL.createObjectURL(new Blob([dataBlob]));
          //   const link = document.createElement('a');
          //   link.href = file;
          //   link.setAttribute('download', `Reporte_${selected?.nombre_convenio}.csv`);
          //   document.body.appendChild(link);
          //   link.click();
          //   link.parentNode.removeChild(link);
          // }
          // else { notifyError(`ERROR al descargar reporte`); handleClose() }
        })
        .catch((e) => {notifyError(e); handleClose()} )
    }
    catch (e) { console.log(e) }

    handleClose()
  }, [handleClose, selected])

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Recaudos Directos</h1>
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
        <h2 className="text-3xl mx-auto text-center mb-4">Gestion de archivos de recaudo</h2>
        <ButtonBar>
          <Button onClick={() => { setShowMainModal(true); setShowModalOptions(true) }}>Cargar Archivo</Button>
          <Button onClick={() => { setShowMainModal(true) }}>Descargar Reporte</Button>
        </ButtonBar>
      </Modal>
      <Modal show={showMainModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">Gestion de archivos de recaudo</h2>
        <Form onSubmit={showModalOptions ? CargarArchivo : DescargarArchivo}>
          {showModalOptions && (
            <Input
              // label='Seleccionar Archivo'
              type='file'
              autoComplete='off'
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              required
            />
          )}
          {!showModalOptions && (
            <>
              <Input

                type='date'
                autoComplete='off'
                name={"fecha_inicial"}
                label={"Fecha inicial"}
                // onChange={(e) => {
                //   setFile(e.target.files[0]);
                // }}
                required
              />
              <Input
                type='date'
                autoComplete='off'
                name={"fecha_final"}
                label={"Fecha final"}
                // onChange={(e) => {
                //   setFile(e.target.files[0]);
                // }}
                required
              />
            </>
          )}
          <ButtonBar>
            <Button type="submit">{showModalOptions ? "Cargar Archivo" : "Descargar Reporte"}</Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default GestionArchivosRecaudo


