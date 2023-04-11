import Button from "../../../../components/Base/Button";
import FileInput from "../../../../components/Base/FileInput";
import classes from "./FileInputX.module.css";
import { useCallback, useState } from "react";
import { Presigned, Presigned_validar } from "../../utils/fetchBucket";
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import { Validar_archivo } from "../../utils/fetchValidarArchivo";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Modal from "../../../../components/Base/Modal";
import Fieldset from "../../../../components/Base/Fieldset";
import LogoPDP from "../../../../components/Base/LogoPDP";

const FileInputX = ({ banco }) => {
  const [showModal, setShowModal] = useState(true);
  const [errors, setErrors] = useState([]);
  const banco_minuscula = banco.charAt(0).toLowerCase() + banco.slice(1);
  // console.log(banco_minuscula);
  const urlAssets = process.env.REACT_APP_ASSETS_URL;
  const {
    contendorPrincipalFormulario,
    contenedorForm,
    titulo,
    contenedorInput,
    nombreInput,
    contenedorArchivos,
    contenedorBtns,
    nombreArchivo,
    contendorLista,
    nombreArchivoStyle,
    fileInput,
    contenedorLabel,
    btnBasura,
    divsuperior,
    divinferior,
    nombreLabel,
    contenedorArchivosBasura,
  } = classes;

  const [nombreDocumento, setNombreDocumento] = useState("");
  const [archivo, setArchivo] = useState([]);
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [procesandoValidacion, setProcesandoValidacion] = useState(false);
  const [type1, setType1] = useState([]);

  //------------------Guardar Archivos PDF---------------------//
  const onFileChange = useCallback(
    (files) => {
      if (Array.isArray(Array.from(files))) {
        files = Array.from(files);
        setArchivo(files);
        setNombreDocumento(files[0]?.name);
        setDisabledBtn(false);
        const tipo_archivo = files[0]?.type.toString();
        console.log(tipo_archivo);
        // console.log(!/^.*\.fil$/.test(files[0].name));
        if (tipo_archivo !== "text/csv" && banco_minuscula === "davivienda") {
          // Muestra una notificación si la extensión del archivo es diferente de ".fil" o ".csv"
          document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
          setArchivo([]);
          setNombreDocumento("");
          notifyError("La extensión del archivo debe ser de tipo csv");
          return;
        } else if (
          tipo_archivo !== "text/plain" &&
          !/^.*\.fil$/.test(files[0].name) &&
          banco_minuscula === "bancolombia"
        ) {
          document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
          setArchivo([]);
          setNombreDocumento("");
          notifyError("La extensión del archivo debe ser de tipo .fil");
          return;
        }
      }
    },
    [banco_minuscula]
  );
  const EliminarDocumento = (e) => {
    e.preventDefault();
    document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
    setArchivo([]);
    setNombreDocumento("");
    setDisabledBtn(true);
  };

  const EnviarArchivos = async (e) => {
    e.preventDefault();
    setDisabledBtn(true);

    if (!archivo[0]) {
      notifyError("Por favor adjunte el archivo de contingencia.");
      setDisabledBtn(false);
      return;
    }

    try {
      setProcesandoValidacion(true);
      const presignedData = await Presigned_validar(
        archivo[0],
        banco_minuscula
      );
      const nombreArchivoS3 = presignedData.nombre_archivo;

      if (!nombreArchivoS3) {
        notifyError("Error, no se recibio el archivo.");
        setProcesandoValidacion(false);
        document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
        setArchivo([]);
        setNombreDocumento("");
        setDisabledBtn(false);
        return;
      }

      Validar_archivo(banco_minuscula, nombreArchivoS3).then((res) => {
        console.log("RESPUESTA VALIDAR", res);
        if (res?.codigo == 400) {
          // setShowModal(true);
          setErrors(res?.obj);
          window.open(res?.url, "_self");
        }
        setProcesandoValidacion(false);
        document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
        setProcesandoValidacion(false);
        setArchivo([]);
        setNombreDocumento("");
        setDisabledBtn(false);
      });
    } catch (error) {
      console.error(error);
      document.getElementById("contingencia").value = ""; // <- limpia el valor del campo de archivo
      setDisabledBtn(false);
    }
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  // const EnviarArchivos = async (e) => {
  //   e.preventDefault();
  //   setDisabledBtn(true);

  //   if (!archivo[0]) {
  //     notifyError("Por favor adjunte el archivo de contingencia.");
  //     setDisabledBtn(false);
  //     return;
  //   }

  //   try {
  //     setProcesandoValidacion(true);
  //     const presignedData = await Presigned_validar(
  //       archivo[0],
  //       banco_minuscula
  //     );
  //     const nombreArchivoS3 = presignedData.nombre_archivo;

  //     if (!nombreArchivoS3) {
  //       notifyError("Error, no se recibio el archivo.");
  //       setProcesandoValidacion(false);
  //       setArchivo([]);
  //       setNombreDocumento("");
  //       setDisabledBtn(false);
  //       return;
  //     }

  //     const res = await Validar_archivo(banco_minuscula, nombreArchivoS3);

  //     setProcesandoValidacion(false);
  //     notifyPending(
  //       Promise.resolve(res),
  //       {},
  //       { render: ({ data }) => `Success ${JSON.stringify(data)}` },
  //       { render: ({ data }) => `Error ${data.message}` }
  //     );

  //     setArchivo([]);
  //     setNombreDocumento("");
  //     setDisabledBtn(false);
  //   } catch (error) {
  //     console.error(error);
  //     setDisabledBtn(false);
  //   }
  // };

  // const EnviarArchivos = (e) => {
  //   e.preventDefault();
  //   setDisabledBtn(true);
  //   if (archivo[0]) {
  //     console.log("ARCHIVO[0]", archivo[0]);
  //     setProcesandoValidacion(true);
  //     Presigned_validar(archivo[0], banco_minuscula)
  //       .then((res) => {
  //         setNombreArchivoS3(res?.nombre_archivo);

  //         if (res?.nombre_archivo) {
  //           notifyPending(
  //             new Promise((resolve, reject) => {
  //               setTimeout(() => {
  //                 Validar_archivo(banco_minuscula, res?.nombre_archivo)
  //                   .then((res) => {
  //                     setProcesandoValidacion(false);
  //                     resolve(res);
  //                   })
  //                   .catch((err) => {
  //                     setProcesandoValidacion(false);
  //                     reject(err);
  //                   });
  //               }, 3000);
  //             }),
  //             {},
  //             { render: ({ data }) => `Success ${JSON.stringify(data)}` },
  //             { render: ({ data }) => `Error ${data.message}` },

  //           );
  //           // setTimeout(
  //           //   () =>
  //           //     Validar_archivo(banco_minuscula, res?.nombre_archivo).then(
  //           //       (res) => {
  //           //         setProcesandoValidacion(false);
  //           //         notify(res);
  //           //       }
  //           //     ),
  //           //   3000
  //           // );
  //         } else {
  //           notifyError("Error, no se recibio el archivo.");
  //           setProcesandoValidacion(false);
  //         }
  //         setArchivo([]);
  //         setNombreDocumento("");
  //         setDisabledBtn(false);
  //       })
  //       .catch((err) => console.error(err));
  //   } else {
  //     if (!archivo[0]) {
  //       notifyError("Por favor adjunte el archivo de contingencia.");
  //       setDisabledBtn(false);
  //     }
  //   }
  // };

  return (
    <div className={contendorPrincipalFormulario}>
      <SimpleLoading show={procesandoValidacion}></SimpleLoading>
      <form onSubmit={(e) => EnviarArchivos(e)} className={contenedorForm}>
        <div className={contenedorInput}>
          <h2 className={titulo}>
            {`Cargar archivo de contingencia ${banco}`}
          </h2>
          <p className={nombreInput}>Adjuntar archivo de contingencia</p>
          <div className={contenedorArchivos}>
            <label className={contenedorLabel}>
              <div className={divinferior}>
                <FileInput
                  id="contingencia"
                  label={" "}
                  className={fileInput}
                  onGetFile={onFileChange}
                  accept=".fil, .csv"
                  allowDrop={false}
                ></FileInput>
                <div className={divsuperior}></div>
              </div>

              <img src={`${urlAssets}/assets/img/btnAgregar.png`} alt="" />
            </label>
          </div>
          {archivo[0] ? (
            <label className={contenedorArchivosBasura}>
              <div className={nombreArchivoStyle}>
                <h5 className={nombreLabel}>{nombreDocumento}</h5>
              </div>

              <button
                className={btnBasura}
                onClick={(e) => EliminarDocumento(e)}
              >
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
        </div>
      </form>

      {errors?.length > 0 ? (
        <Modal show={showModal} handleClose={handleClose}>
          <LogoPDP xsmall></LogoPDP>
          <Fieldset legend="Archivo con errores">
            <ul className={contendorLista}>
              {errors.map((error, index) => (
                <li key={index}>
                  {index + 1}) <li>Error: {error.error}</li>
                  <li> Línea: {error.line}</li>
                </li>
              ))}
            </ul>
          </Fieldset>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default FileInputX;
