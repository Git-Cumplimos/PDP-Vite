import Button from "../../../../components/Base/Button";
import FileInput from "../../../../components/Base/FileInput";
import classes from "./FileInputX.module.css";
import { useCallback, useState } from "react";
import { Presigned } from "../../utils/fetchBucket";
import { notifyError } from "../../../../utils/notify";

const FileInputX = ({ banco }) => {
  const banco_minuscula = banco.charAt(0).toLowerCase() + banco.slice(1);
  console.log(banco_minuscula);
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
    fileInput,
    contenedorLabel,
    btnBasura,
    divsuperior,
    divinferior,
    contenedorArchivosBasura,
  } = classes;

  const [nombreDocumento, setNombreDocumento] = useState("");
  const [archivo, setArchivo] = useState([]);
  const [disabledBtn, setDisabledBtn] = useState(true);

  //------------------Guardar Archivos PDF---------------------//
  const onFileChange = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      setArchivo(files);
      setNombreDocumento(files[0]?.name);
      setDisabledBtn(false);
    }
  }, []);
  const EliminarDocumento = (e) => {
    e.preventDefault();
    setArchivo([]);
    setNombreDocumento("");
    setDisabledBtn(true);
  };

  const EnviarArchivos = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    if (archivo[0]) {
      console.log("ARCHIVO[0]", archivo[0]);
      Presigned(archivo[0], banco_minuscula)
        .then((res) => {
          setArchivo([]);
          setNombreDocumento("");
          setDisabledBtn(false);
        })
        .catch((err) => console.error(err));
    } else {
      if (!archivo[0]) {
        notifyError("Por favor adjunte el archivo de contingencia.");
        setDisabledBtn(false);
      }
    }
  };

  return (
    <div className={contendorPrincipalFormulario}>
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
                  label={" "}
                  className={fileInput}
                  onGetFile={onFileChange}
                  accept=".xlsx"
                  allowDrop={false}
                ></FileInput>
                <div className={divsuperior}></div>
              </div>

              <img src={`${urlAssets}/assets/img/btnAgregar.png`} alt="" />
            </label>
          </div>
          {archivo[0] ? (
            <label className={contenedorArchivosBasura}>
              <div className={nombreArchivo}> {nombreDocumento} </div>

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
    </div>
  );
};

export default FileInputX;
