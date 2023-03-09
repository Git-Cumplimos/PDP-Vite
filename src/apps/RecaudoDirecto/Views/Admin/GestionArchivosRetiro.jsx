// // import { Fragment } from "react";
// // // import { Navigate, useNavigate } from "react-router-dom";
// // import ButtonBar from "../../../../components/Base/ButtonBar";
// // import Form from "../../../../components/Base/Form";
// // import Input from "../../../../components/Base/Input";
// // import Button from "../../../../components/Base/Button";
// // // import BarcodeReader from "../../../../components/Base/BarcodeReader";

// // const CargarArchivosRetiro = () => {
// //   return (
// //     <Fragment>
// //       <h1 className="text-3xl mt-6">Cargar archivos de Retiro</h1>
// //       <Form onSubmit={(e) => { e.preventDefault();console.log(e) }}>
// //         <Input
// //           // label='Seleccionar Archivo'
// //           type='file'
// //           autoComplete='off'
// //         />
// //         <ButtonBar>
// //           <Button type="submit">Cargar Archivo</Button>
// //         </ButtonBar>
// //       </Form>
// //     </Fragment>
// //   )
// // }

// // export default CargarArchivosRetiro
// import { Fragment, useCallback, useEffect, useState } from "react";
// import Modal from "../../../../components/Base/Modal";
// import Button from "../../../../components/Base/Button";
// import ButtonBar from "../../../../components/Base/ButtonBar";
// import TableEnterprise from "../../../../components/Base/TableEnterprise";
// import Form from "../../../../components/Base/Form";
// import Input from "../../../../components/Base/Input";
// import { notifyError, notifyPending } from "../../../../utils/notify";
// import { getRetirosList, addFileConveniosRecaudo } from "../../utils/fetchFunctions"

// export const fetchUploadFileCustom = async (url, body) => {
//   try {
//     const Peticion = await fetch(url, {
//       method: "POST",
//       body,
//       mode: "cors",
//     });
//     const res = await Peticion.json()
//     return res;
//   } catch (error) {
//     throw error;
//   }
// };

// const CargarArchivosRetiro = () => {
//   const [showModal, setShowModal] = useState(false)
//   const [selected, setSelected] = useState(false); // fila selecionada
//   const [listRetiros, setListRetiros] = useState('')
//   const [pageData, setPageData] = useState({ page: 1, limit: 10 });
//   const [maxPages, setMaxPages] = useState(0);
//   const [cargando, setCargando] = useState(false)
//   const [file, setFile] = useState(null);
//   const [searchFilters, setSearchFilters] = useState({
//     pk_id_convenio_directo: "",
//     ean13: "",
//     nombre_convenio: "",
//   });

//   const getRetiros = useCallback(async () => {
//     await getRetirosList({
//       ...searchFilters,
//       limit: pageData.limit,
//       offset: pageData.page === 1 ? 0 : (pageData.page * pageData.limit) - pageData.limit,
//     })
//       .then((data) => {
//         setListRetiros(data?.obj?.results ?? []);
//         setMaxPages(data?.obj?.maxPages ?? '')
//       })
//       .catch((err) => {
//         // if (err?.cause === "custom") {
//         //   notifyError(err?.message);
//         //   return;
//         // }
//         console.error(err?.message);
//       });
//     setCargando(true)
//   }, [pageData, searchFilters])

//   useEffect(() => { getRetiros() }, [getRetiros, pageData, searchFilters])

//   const handleClose = useCallback(() => {
//     setShowModal(false);
//     setSelected(false)
//   }, []);


//   const CargarArchivo = useCallback(async (e) => {
//     const url = `http://127.0.0.1:8000/convenio-retiro/validar_csv?convenio_id=${selected.pk_id_convenio_directo}`;
//     e.preventDefault();
//     const formData = new FormData();
//     formData.set("file", file);
//     try {
//       fetchUploadFileCustom(url, formData)
//         .then((data) => {
//           if (data?.status === true){
//             console.log(data)
//           }
//           else {console.log(data)}
//         })
//         .catch((e)=> console.log("err",e))
//     }
//     catch (e) { console.log(e) }

//     handleClose()
//   }, [handleClose, file, selected])

//   return (
//     <Fragment>
//       <h1 className="text-3xl mt-6">Convenios de Recaudos Directo</h1>
//       {cargando ? (<>
//         <TableEnterprise
//           title="Convenios de Recaudos"
//           headers={[
//             "Código convenio",
//             "Código EAN o IAC",
//             "Nombre convenio",
//             "Permite vencidos",
//             "Estado",
//             "Fecha creacion",
//           ]}
//           // data={datos['value'].map(
//           data={listRetiros.map(
//             ({
//               pk_id_convenio_directo,
//               ean13,
//               nombre_convenio,
//               permite_vencidos,
//               estado,
//               fecha_creacion,
//             }) => ({
//               pk_id_convenio_directo,
//               ean13,
//               nombre_convenio,
//               permite_vencidos: permite_vencidos ? "Verdadero" : "Falso",
//               estado: estado ? "Activo" : "No activo",
//               fecha_creacion: fecha_creacion ?? "ninguna",
//             })
//           )}
//           onSelectRow={(e, i) => {
//             setShowModal(true);
//             setSelected(listRetiros[i]);
//           }}
//           maxPage={maxPages}
//           onSetPageData={setPageData}
//           onChange={(ev) => {
//             setSearchFilters((old) => ({
//               ...old,
//               [ev.target.name]: ev.target.value,
//             }))
//           }}
//         >
//           <Input
//             id={"pk_codigo_convenio"}
//             label={"Código de convenio"}
//             name={"pk_id_convenio_directo"}
//             type="tel"
//             autoComplete="off"
//             maxLength={"4"}
//             onChange={(ev) => { }}

//           />
//           <Input
//             id={"codigo_ean_iac_search"}
//             label={"Código EAN o IAC"}
//             name={"ean13"}
//             type="tel"
//             autoComplete="off"
//             maxLength={"13"}
//             onChange={(ev) => { }}
//           />
//           <Input
//             id={"nombre_convenio"}
//             label={"Nombre del convenio"}
//             name={"nombre_convenio"}
//             type="text"
//             autoComplete="off"
//             maxLength={"30"}
//             onChange={(ev) => { }}
//           />
//         </TableEnterprise>
//       </>) : (<>cargando...</>)}
//       <Modal show={showModal} handleClose={handleClose}>
//         <h2 className="text-3xl mx-auto text-center mb-4">Cargar archivos de recaudo</h2>
//         <Form onSubmit={CargarArchivo}>
//           <Input
//             // label='Seleccionar Archivo'
//             type='file'
//             autoComplete='off'
//             onChange={(e) => {
//               setFile(e.target.files[0]);
//             }}
//             required
//           />
//           <ButtonBar>
//             <Button type="submit">Cargar Archivo</Button>
//           </ButtonBar>
//         </Form>
//       </Modal>
//     </Fragment>
//   )
// }

// export default CargarArchivosRetiro
// import { Fragment } from "react";
// // import { Navigate, useNavigate } from "react-router-dom";
// import ButtonBar from "../../../../components/Base/ButtonBar";
// import Form from "../../../../components/Base/Form";
// import Input from "../../../../components/Base/Input";
// import Button from "../../../../components/Base/Button";
// // import BarcodeReader from "../../../../components/Base/BarcodeReader";

// const CargarArchivosRetiro = () => {
//   return (
//     <Fragment>
//       <h1 className="text-3xl mt-6">Cargar archivos de Retiro</h1>
//       <Form onSubmit={(e) => { e.preventDefault();console.log(e) }}>
//         <Input
//           // label='Seleccionar Archivo'
//           type='file'
//           autoComplete='off'
//         />
//         <ButtonBar>
//           <Button type="submit">Cargar Archivo</Button>
//         </ButtonBar>
//       </Form>
//     </Fragment>
//   )
// }

// export default CargarArchivosRetiro
import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { notifyError, notify } from "../../../../utils/notify";
import { getRetirosList } from "../../utils/fetchFunctions"

export const fetchImportFile = async (url, body) => {
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
export const fetchDownloadFile = async (url) => {
  try {
    const Peticion = await fetch(url, {
      method: "GET",
      mode: "cors",
    });
    return Peticion;
  } catch (error) {
    throw error;
  }
};

const GestionArchivosRetiro = () => {
  const [showModal, setShowModal] = useState(false)
  const [showMainModal, setShowMainModal] = useState(false)
  const [showModalOptions, setShowModalOptions] = useState(false)
  const [selected, setSelected] = useState(false); // fila selecionada

  const [listRetiros, setListRetiros] = useState('')
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [cargando, setCargando] = useState(false)
  const [file, setFile] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });

  const getRetiros = useCallback(async () => {
    await getRetirosList({
      ...searchFilters,
      limit: pageData.limit,
      offset: pageData.page === 1 ? 0 : (pageData.page * pageData.limit) - pageData.limit,
    })
      .then((data) => {
        setListRetiros(data?.obj?.results ?? []);
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

  useEffect(() => { getRetiros() }, [getRetiros, pageData, searchFilters])

 const handleClose = useCallback(() => {
    setShowModal(false);
    setShowMainModal(false);
    setShowModalOptions(false);
    setSelected(false)
  }, []);


  const CargarArchivo = useCallback(async (e) => {
    const url = `http://127.0.0.1:8000/convenio-retiro/validar_csv?convenio_id=${selected.pk_id_convenio_directo}`;
    e.preventDefault();
    const formData = new FormData();
    formData.set("file", file);
    try {
      fetchImportFile(url, formData)
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
  const DescargarArchivo = useCallback(async (e) => {
    const url = `http://127.0.0.1:8000/convenio-retiro/descargar_reporte?convenio_id=${selected.pk_id_convenio_directo}`;
    e.preventDefault();
    try {
      fetchDownloadFile(url)
        .then(async (data) => {
          const dataBlob = await data.blob()
          if (dataBlob.type === 'text/csv'){
            const file = window.URL.createObjectURL(new Blob([dataBlob]));
            const link = document.createElement('a');
            link.href = file;
            link.setAttribute('download', `Reporte_${selected?.nombre_convenio}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
           }          
          else {notifyError(`ERROR al descargar reporte`);handleClose()}
        })
        .catch((e) => console.log("err", e))
    }
    catch (e) { console.log(e) }

    handleClose()
  }, [handleClose, selected])

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
          data={listRetiros.map(
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
            setSelected(listRetiros[i]);
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
        <h2 className="text-3xl mx-auto text-center mb-4">Gestion de archivos de retiro</h2>
        <ButtonBar>
          <Button onClick={()=>{setShowMainModal(true);setShowModalOptions(true)}}>Cargar Archivo</Button>
          <Button onClick={()=>{setShowMainModal(true)}}>Descargar Reporte</Button>
        </ButtonBar>
      </Modal>
      <Modal show={showMainModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">Gestion de archivos de retiro</h2>
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
          <ButtonBar>
            <Button type="submit">{showModalOptions ? "Cargar Archivo" : "Descargar Reporte"}</Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default GestionArchivosRetiro