// import React, { useCallback, useState } from "react";
// import FileInput from "../../../../../components/Base/FileInput";
// import { notify, notifyError } from "../../../../../utils/notify";
// import classes from "./CargarArchivos.module.css";
// const CargarArchivos = () => {
//   const {
//     contendorPrincipalFormulario,
//     contenedorForm,
//     titulo,
//     contenedorInput,
//     nombreInput,
//     contenedorSecundarioInput,
//     styleInput,
//     contenedorArchivos,
//     contenedorBtns,
//     file,
//     contenedorLabel,
//     btnCancelar,
//     btnEnviar,
//     contenedorLabelbasura,
//     btnBasura,
//     contenedorArchivosBasura,
//   } = classes;

//   const [archivos1, setArchivos1] = useState([]);
//   const [archivos2, setArchivos2] = useState([]);
//   const [nombreRut, setNombreRut] = useState("");
//   const [nombreCamara, setNombreCamara] = useState("");
//   const [disabledBtn, setDisabledBtn] = useState(false);

//   //------------------Guardar Archivos PDF---------------------//
//   const onFileChange = useCallback((files) => {
//     if (Array.isArray(Array.from(files))) {
//       files = Array.from(files);
//       setArchivos1(files);
//       setNombreRut(files[0]?.name);
//     }
//   }, []);

//   const onFileChange2 = useCallback((files) => {
//     if (Array.isArray(Array.from(files))) {
//       files = Array.from(files);
//       setArchivos2(files);
//       setNombreCamara(files[0]?.name);
//     }
//   }, []);

//   const Enviar = useCallback(
//     (e) => {
//       e.preventDefault();
//       /*    fetchSecure */
//       setDisabledBtn(true);
//       const datos = {
//         nombre: `${nombre}`,
//         apellido: `${apellido}`,
//         tipo_id: `${tipoDocumento}`,
//         identificacion: `${identificacion}`,
//         direccion: `${direccion}`,
//         estado: "pendiente",
//         celular: `${celular}`,
//       };

//       if (archivos1[0] && archivos2[0]) {
//         fetch(`${urlBackend}/formulario`, {
//           method: "POST",
//           headers: {
//             "Content-type": "application/json",
//           },
//           body: JSON.stringify(datos),
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             /*   console.log("primer fetch", data); */
//             const formData = new FormData();
//             formData.set("id_proceso", data.obj.id_comercio_vinculado);
//             fetch(`${urlBackend}/uploadfile2?id_proceso=1`, {
//               method: "GET",
//               mode: "cors",
//             })
//               .then((response) => response.json())
//               .then((data2) => {
//                 /*  console.log(data2); */
//                 if (!data2?.status) {
//                   notifyError(data2?.msg);
//                 } else {
//                   /* console.log(data2?.obj); */
//                   // setEstadoForm(true);
//                   const formData2 = new FormData();
//                   const formData3 = new FormData();
//                   if (archivos1 && archivos2) {
//                     var cont_rut = 0;
//                     for (const datosS3 of data2?.obj) {
//                       if (cont_rut == 0) {
//                         for (const property in datosS3.fields) {
//                           /*  console.log(datosS3.fields[property]); */
//                           formData2.set(
//                             `${property}`,
//                             `${datosS3.fields[property]}`
//                           );
//                         }
//                       }
//                       cont_rut += 1;
//                     }
//                     formData2.set("file", archivos1[0]);
//                     fetch(`${data2?.obj[0]?.url}`, {
//                       method: "POST",
//                       mode: "no-cors",
//                       body: formData2,
//                     })
//                       .then((resrut) => {
//                         resrut?.status;
//                       })
//                       .catch((err) => {
//                         {
//                           notifyError(
//                             "Error al cargar el Registro Único Tributario."
//                           );
//                           setDisabledBtn(false);
//                         }
//                       });

//                     //------fetch cc----//
//                     var cont_Cc = 0;
//                     for (const datosS3 of data2?.obj) {
//                       if (cont_Cc == 1) {
//                         for (const property in datosS3.fields) {
//                           /* console.log(datosS3.fields[property]); */
//                           formData3.set(
//                             `${property}`,
//                             `${datosS3.fields[property]}`
//                           );
//                         }
//                       }
//                       cont_Cc += 1;
//                     }
//                     formData3.set("file", archivos2[0]);
//                     fetch(`${data2?.obj[1]?.url}`, {
//                       method: "POST",
//                       body: formData3,
//                       mode: "no-cors",
//                     })
//                       .then((res) => {
//                         // console.log("res", res);
//                         /*  if (res) {
//                           setFetchCamara(true);
//                         } */
//                         // setModalOpen(true);
//                         notify("Formulario enviado con éxito.");
//                         setDisabledBtn(false);

//                         setArchivos1([]);
//                         setArchivos2([]);
//                         setNombreCamara("");
//                         setNombreRut("");
//                         // {
//                         //   () => onFileChange();
//                         // }
//                         // {
//                         //   () => onFileChange2();
//                         // }
//                         /*                         setArchivos1([]);
//                         setArchivos2([]); */
//                       })
//                       .catch((err) => {
//                         {
//                           notifyError("Error al cargar la Camara y Comercio.");
//                           setDisabledBtn(false);
//                         }
//                       });
//                   }
//                 }
//               })
//               .catch((err) => {
//                 {
//                   notifyError("Error al almacenar los documentos.");
//                   setDisabledBtn(false);
//                 }
//               });
//           })
//           .catch((err) => {
//             {
//               notifyError("Error al enviar el formulario.");
//               setDisabledBtn(false);
//             }
//           });

//         // setModalOpen(true);
//       } else {
//         if (!archivos1[0] && archivos2[0]) {
//           notifyError("Por favor adjunte el archivo Rut.");
//           setDisabledBtn(false);
//         } else {
//           if (archivos1[0] && !archivos2[0]) {
//             notifyError("Por favor adjunte el archivo Camara y Comercio.");
//             setDisabledBtn(false);
//           } else {
//             if (!archivos1[0] && !archivos2[0]) {
//               notifyError(
//                 "Por favor adjunte los archivos Rut, Camara y Comercio."
//               );
//               setDisabledBtn(false);
//             }
//           }
//         }
//       }
//     },
//     [archivos1, archivos2, onFileChange, onFileChange2]
//   );

//   const EliminarCamara = (e) => {
//     e.preventDefault();
//     () => onFileChange2();
//     setArchivos2([]);
//     setNombreCamara("");
//   };
//   const EliminarRut = (e) => {
//     e.preventDefault();
//     setArchivos1([]);
//     () => onFileChange();

//     setNombreRut("");
//   };

//   const Cancelar = (e) => {
//     e.preventDefault();
//     setArchivos1([]);
//     () => onFileChange();
//     () => onFileChange2();
//     setArchivos2([]);
//     setNombreCamara("");
//     setNombreRut("");
//   };

//   return (
//     <div>
//       <form onSubmit={(e) => Enviar(e)} className={contenedorForm}>
//         <div className={contenedorInput}>
//           <p className={nombreInput}>Adjuntar Registro Único Tributario</p>
//           <div className={contenedorArchivos}>
//             <label className={contenedorLabel}>
//               <FileInput
//                 label={" "}
//                 className={file}
//                 onGetFile={onFileChange}
//                 accept=".pdf"
//                 allowDrop={false}
//               ></FileInput>
//               <img src="/publicDir/btnAgregar.png" alt="" />
//             </label>
//           </div>

//           {archivos1[0] ? (
//             <label className={contenedorArchivosBasura}>
//               <h5>{nombreRut}</h5>

//               <button className={btnBasura} onClick={(e) => EliminarRut(e)}>
//                 <img src="/publicDir/basura25negra.png" />
//               </button>
//               {/* <img
//               onClick={() => setArchivos1("")}
//               src="/publicDir/basura.png"
//               alt=""
//             /> */}
//             </label>
//           ) : (
//             ""
//           )}
//         </div>

//         <div className={contenedorInput}>
//           <p className={nombreInput}>Adjuntar Cámara y Comercio</p>
//           <div className={contenedorArchivos}>
//             <label className={contenedorLabel}>
//               <FileInput
//                 label={" "}
//                 className={file}
//                 onGetFile={onFileChange2}
//                 accept=".pdf"
//                 allowDrop={false}
//               ></FileInput>
//               <img src="/publicDir/btnAgregar.png" alt="" />
//             </label>
//           </div>
//           {archivos2[0] ? (
//             <label className={contenedorArchivosBasura}>
//               <h5>{nombreCamara}</h5>

//               <button className={btnBasura} onClick={(e) => EliminarCamara(e)}>
//                 <img src="/publicDir/basura25negra.png" />
//               </button>
//               {/* <img
//               onClick={() => setArchivos1("")}
//               src="/publicDir/basura.png"
//               alt=""
//             /> */}
//             </label>
//           ) : (
//             ""
//           )}
//           {/* <h5>{nombreCamara}</h5> */}
//         </div>
//         <div></div>
//         <div className={contenedorBtns}>
//           <button disabled={disabledBtn} className={btnEnviar} type="submit">
//             Enviar
//           </button>
//           <button onClick={(e) => Cancelar(e)} className={btnCancelar}>
//             Cancelar
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CargarArchivos;
