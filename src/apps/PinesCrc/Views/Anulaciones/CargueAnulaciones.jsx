import React, { Fragment } from "react";
import Button from "../../../../components/Base/Button/Button";
import FileInput from "../../../../components/Base/FileInput/FileInput";
import classes from "./FileInputX.module.css";
import { useCallback, useState } from "react";
import { Presigned_validar } from "../../utils/fetchBucket";
import { notify, notifyError} from "../../../../utils/notify";
import { Validar_archivo } from "../../utils/fetchValidarArchivo";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";


const FileInputX = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const urlAssets = import.meta.env.VITE_ASSETS_URL;
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
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [procesandoValidacion, setProcesandoValidacion] = useState(false);
  const [type1, setType1] = useState([]);
  const file_name = `${import.meta.env.VITE_CARPETA_BUCKET_PINES}`
  const { pdpUser } = useAuth();

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
        if (tipo_archivo !== "text/csv") {
          document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
          setArchivo([]);
          setNombreDocumento("");
          notifyError("La extensión del archivo debe ser de tipo csv");
          return;
        }
      }
    },
    []
  );
  const EliminarDocumento = (e) => {
    e.preventDefault();
    document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
    setArchivo([]);
    setNombreDocumento("");
    setDisabledBtn(true);
  };
  const CancelarDocumento = (e) => {
    e.preventDefault();
    setShowModal(false);
    notifyError("El usuario canceló el proceso de anulacion");
    navigate("/GestionTransaccional/AnulacionesPinesCRC/CargueArchivo");
    document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
    setArchivo([]);
    setNombreDocumento("");
    setDisabledBtn(true);
  };

  const EnviarArchivos = async (e) => {
    e.preventDefault();
    setShowModal(false);
    setDisabledBtn(true);

    if (!archivo[0]) {
      notifyError("Por favor adjunte el archivo de anulaciones.");
      setDisabledBtn(false);
      return;
    }
    const f = new Date();
    try {
      setProcesandoValidacion(true);
      const presignedData = await Presigned_validar(
        archivo[0],
        `${file_name}anulaciones/${f.getFullYear()}-${f.getMonth() + 1}-${f.getDate()}-${f.getHours()}-${f.getMinutes()}-${f.getSeconds()}-archivoAnulaciones.csv`
      );
      const nombreArchivoS3 = presignedData.nombre_archivo;

      if (!nombreArchivoS3) {
        notifyError("Error, no se recibio el archivo.");
        setProcesandoValidacion(false);
        document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
        setArchivo([]);
        setNombreDocumento("");
        setDisabledBtn(false);
        return;
      }

      Validar_archivo(nombreArchivoS3).then((res) => {
        console.log("RESPUESTA VALIDAR", res);
        if (res?.codigo == 400) {
          // setShowModal(true);
          // setErrors(res?.obj);
          window.open(res?.url, "_self");
        }
        setProcesandoValidacion(false);
        document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
        setProcesandoValidacion(false);
        setArchivo([]);
        setNombreDocumento("");
        setDisabledBtn(false);
      });
    } catch (error) {
      notifyError('Error')
      console.error(error);
      setProcesandoValidacion(false);
      document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
      setDisabledBtn(false);
    }
  };

  // const handleClose = useCallback(() => {
  //   setShowModal(false);
  //   notifyError("El usuario canceló el proceso de anulacion");
  //   navigate("/GestionTransaccional/AnulacionesPinesCRC/CargueArchivo");
  //   document.getElementById("anulaciones").value = ""; // <- limpia el valor del campo de archivo
  //   setArchivo([]);
  //   setNombreDocumento("");
  //   setDisabledBtn(true);
  // }, []);



  return (
    <div className={contendorPrincipalFormulario}>
      <SimpleLoading show={procesandoValidacion}></SimpleLoading>
      <form className={contenedorForm}>
        <div className={contenedorInput}>
          <h2 className={titulo}>
            {`Cargar archivo de anulaciones`}
          </h2>
          <p className={nombreInput}>Adjuntar archivo de anulaciones</p>
          <div className={contenedorArchivos}>
            <label className={contenedorLabel}>
              <div className={divinferior}>
                <FileInput
                  id="anulaciones"
                  label={" "}
                  className={fileInput}
                  onGetFile={onFileChange}
                  accept=".csv"
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
      </form>
      <div className={contenedorBtns}>
        <Button
          disabled={disabledBtn}
          onClick={(e) => setShowModal(true)}
        >
          Cargar archivo
        </Button>
      </div>
      <Modal show={showModal} > 
        {/* <br />
        <h1 className="text-xl font-semibold">
          ¿Está seguro de cargar el archivo de anulaciones?
        </h1> */}
      <Fragment>
        <PaymentSummary
          title=""
          subtitle="¿Está seguro de cargar el archivo de anulaciones?"
        >
          <ButtonBar>
            <Button type="submit" onClick={(e) => EnviarArchivos(e)}>
              Aceptar
            </Button>
            <Button onClick={(e) => CancelarDocumento(e)}>Cancelar</Button>
          </ButtonBar>
        </PaymentSummary>
      </Fragment>
      </Modal>
    </div>
  );
};

export default FileInputX;
