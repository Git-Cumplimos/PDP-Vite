import React, { useCallback, useState } from "react";
import Button from "../../../../../components/Base/Button";
import FileInput from "../../../../../components/Base/FileInput";
import { notify, notifyError } from "../../../../../utils/notify";
import classes from "./CargarArchivos.module.css";
const CargarArchivos = () => {
  const urlAssets = process.env.REACT_APP_ASSETS_URL;
  const {
    contendorPrincipalFormulario,
    contenedorForm,
    titulo,
    contenedorInput,
    nombreInput,
    contenedorSecundarioInput,
    styleInput,
    contenedorArchivos,
    contenedorBtns,
    file,
    nombreArchivo,
    fileInput,
    contenedorLabel,
    btnCancelar,
    btnEnviar,
    contenedorLabelbasura,
    btnBasura,
    divsuperior,
    divinferior,
    contenedorArchivosBasura,
  } = classes;

  const [archivos1, setArchivos1] = useState([]);
  const [archivos2, setArchivos2] = useState([]);
  const [nombreRut, setNombreRut] = useState("");
  const [nombreCamara, setNombreCamara] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);

  //------------------Guardar Archivos PDF---------------------//
  const onFileChange = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      setArchivos1(files);
      setNombreCamara(files[0]?.name);
    }
  }, []);

  const Enviar = useCallback(
    (e) => {
      e.preventDefault();

      setDisabledBtn(true);
      //   const datos = {
      //     nombre: `${nombre}`,
      //     apellido: `${apellido}`,
      //     tipo_id: `${tipoDocumento}`,
      //     identificacion: `${identificacion}`,
      //     direccion: `${direccion}`,
      //     estado: "pendiente",
      //     celular: `${celular}`,
      //     URL: "https://archivos-vinculacion-comercios.s3.amazonaws.com/",
      //   };

      //   if (archivos1[0] && archivos2[0]) {
      //     fetch(`${urlBackend}/formulario`, {
      //       method: "POST",
      //       headers: {
      //         "Content-type": "application/json",
      //       },
      //       body: JSON.stringify(datos),
      //     })
      //       .then((response) => response.json())
      //       .then((data) => {
      //         /*   console.log("primer fetch", data); */
      //         const formData = new FormData();
      //         formData.set("id_proceso", data.obj.id_comercio_vinculado);
      //         fetch(
      //           `${urlBackend}/uploadfile2?id_proceso=${data.obj.id_comercio_vinculado}`,
      //           {
      //             method: "GET",
      //             mode: "cors",
      //           }
      //         )
      //           .then((response) => response.json())
      //           .then((data2) => {
      //             console.log(data2);
      //             if (!data2?.status) {
      //               notifyError(data2?.msg);
      //             } else {
      //               /* console.log(data2?.obj); */
      //               // setEstadoForm(true);
      //               const formData2 = new FormData();
      //               const formData3 = new FormData();
      //               if (archivos1 && archivos2) {
      //                 var cont_rut = 0;
      //                 for (const datosS3 of data2?.obj) {
      //                   if (cont_rut == 0) {
      //                     for (const property in datosS3.fields) {
      //                       /*  console.log(datosS3.fields[property]); */
      //                       formData2.set(
      //                         `${property}`,
      //                         `${datosS3.fields[property]}`
      //                       );
      //                     }
      //                   }
      //                   cont_rut += 1;
      //                 }
      //                 formData2.set("file", archivos1[0]);
      //                 fetch(`${data2?.obj[0]?.url}`, {
      //                   method: "POST",
      //                   mode: "no-cors",
      //                   body: formData2,
      //                 })
      //                   .then((resrut) => {
      //                     resrut?.status;
      //                   })
      //                   .catch((err) => {
      //                     {
      //                       notifyError(
      //                         "Error al cargar el Registro Único Tributario."
      //                       );
      //                       setDisabledBtn(false);
      //                     }
      //                   });

      //                 //------fetch cc----//
      //                 var cont_Cc = 0;
      //                 for (const datosS3 of data2?.obj) {
      //                   if (cont_Cc == 1) {
      //                     for (const property in datosS3.fields) {
      //                       /* console.log(datosS3.fields[property]); */
      //                       formData3.set(
      //                         `${property}`,
      //                         `${datosS3.fields[property]}`
      //                       );
      //                     }
      //                   }
      //                   cont_Cc += 1;
      //                 }
      //                 formData3.set("file", archivos2[0]);
      //                 fetch(`${data2?.obj[1]?.url}`, {
      //                   method: "POST",
      //                   body: formData3,
      //                   mode: "no-cors",
      //                 })
      //                   .then((res) => {
      //                     // console.log("res", res);
      //                     /*  if (res) {
      //                       setFetchCamara(true);
      //                     } */
      //                     // setModalOpen(true);
      //                     notify("Formulario enviado con éxito.");
      //                     setDisabledBtn(false);
      //                     setNombre("");
      //                     setApellido("");
      //                     setTipoDocumento("");
      //                     setIdentificacion("");
      //                     setDireccion("");
      //                     setCelular("");
      //                     setArchivos1([]);
      //                     setArchivos2([]);
      //                     setNombreCamara("");
      //                     setNombreRut("");
      //                     // {
      //                     //   () => onFileChange();
      //                     // }
      //                     // {
      //                     //   () => onFileChange2();
      //                     // }
      //                     /*                         setArchivos1([]);
      //                     setArchivos2([]); */
      //                   })
      //                   .catch((err) => {
      //                     {
      //                       notifyError("Error al cargar la Camara y Comercio.");
      //                       setDisabledBtn(false);
      //                     }
      //                   });
      //               }
      //             }
      //           })
      //           .catch((err) => {
      //             {
      //               notifyError("Error al almacenar los documentos.");
      //               setDisabledBtn(false);
      //             }
      //           });
      //       })
      //       .catch((err) => {
      //         {
      //           notifyError("Error al enviar el formulario.");
      //           setDisabledBtn(false);
      //         }
      //       });

      //     // setModalOpen(true);
      //   } else {
      //     if (!archivos1[0] && archivos2[0]) {
      //       notifyError("Por favor adjunte el archivo Rut.");
      //       setDisabledBtn(false);
      //     } else {
      //       if (archivos1[0] && !archivos2[0]) {
      //         notifyError("Por favor adjunte el archivo Camara y Comercio.");
      //         setDisabledBtn(false);
      //       } else {
      //         if (!archivos1[0] && !archivos2[0]) {
      //           notifyError(
      //             "Por favor adjunte los archivos Rut, Camara y Comercio."
      //           );
      //           setDisabledBtn(false);
      //         }
      //       }
      //     }
      //   }
    },
    [archivos1, onFileChange]
  );

  const EliminarCamara = (e) => {
    e.preventDefault();
    setArchivos1([]);
    // () => onFileChange();
    setNombreCamara("");
  };

  const Cancelar = (e) => {
    // e.preventDefault();
    // setArchivos1([]);
    // () => onFileChange();
    // () => onFileChange2();
    // setArchivos2([]);
    // setNombreCamara("");
    // setNombreRut("");
  };

  return (
    <div className={contendorPrincipalFormulario}>
      <form onSubmit={(e) => Enviar(e)} className={contenedorForm}>
        <div className={contenedorInput}>
          <h2 className={titulo}>Cargar archivo de contingencia</h2>
          <p className={nombreInput}>Adjuntar Registro Único Tributario</p>
          <div className={contenedorArchivos}>
            <label className={contenedorLabel}>
              <div className={divinferior}>
                <FileInput
                  label={" "}
                  className={fileInput}
                  onGetFile={onFileChange}
                  accept=".pdf"
                  allowDrop={false}
                ></FileInput>
                <div className={divsuperior}></div>
              </div>

              <img src={`${urlAssets}/assets/img/btnAgregar.png`} alt="" />
            </label>
          </div>
          {archivos1[0] ? (
            <label className={contenedorArchivosBasura}>
              <div className={nombreArchivo}> {nombreCamara} </div>

              <button className={btnBasura} onClick={(e) => EliminarCamara(e)}>
                <img src={`${urlAssets}/assets/img/basura25negra.png`} />
              </button>
            </label>
          ) : (
            ""
          )}
        </div>
        <div></div>
        <div className={contenedorBtns}>
          <Button
            disabled={disabledBtn}
            /*  className={btnEnviar} */ type="submit"
          >
            Cargar
          </Button>
          {/*    <button onClick={(e) => Cancelar(e)} className={btnCancelar}>
            Cancelar
          </button> */}
        </div>
      </form>
    </div>
  );
};

export default CargarArchivos;
