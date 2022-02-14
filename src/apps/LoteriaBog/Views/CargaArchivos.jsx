import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Form from "../../../components/Base/Form/Form";
import InputX from "../../../components/Base/InputX/InputX";
import Select from "../../../components/Base/Select/Select";
import AWS, { CostExplorer } from "aws-sdk";
import ProgressBar from "../../../components/Base/ProgressBar/ProgressBar";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import CargarForm from "../components/CargarForm/CargarForm";
import { useLoteria } from "../utils/LoteriaHooks";
import SubPage from "../../../components/Base/SubPage/SubPage";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const CargaArchivos = ({ route }) => {
  const { label } = route;
  const options = [
    { value: "", label: "" },
    { value: "PlanDePremios", label: "Plan de premios" },
    { value: "Asignacion", label: "Asignacion" },
    { value: "Resultados", label: "Resultados" },
    { value: "Liquidacion", label: "Liquidacion de premios" },
  ];

  const optionsTipoSorteo = [
    { value: "", label: "" },
    { value: "Ordinario/", label: "Sorteo Ordinario" },
    { value: "Extra/", label: "Sorteo Extraordinario" },
  ];

  
  const [archivo, setArchivo] = useState("");
  const [tipoSorteo, setTipoSorteo] = useState("");
  const [fisiVirtual, setFisiVirtual] = useState("");
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");

  const optionsFisiVir = [
    { value: "", label: "" },
    { value: "Fisico/", label: `${archivo} Fisicos` },
    { value: "Virtual/", label: `${archivo} Virtuales`},
  ];

  const [showModal, setShowModal] = useState(false);

  const [progress, setProgress] = useState(0);

  const S3_BUCKET = process.env.REACT_APP_BUCKET;
  const REGION = process.env.REACT_APP_REGION;
  //console.log(S3_BUCKET)
  const bucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });
  console.log(`${tipoSorteo}${archivo}/${fisiVirtual}`);
  const saveFile = () => {
    setDisabledBtns(true);
    const f = new Date();
    const params = {
      ACL: "public-read",
      Body: file,
      Bucket: S3_BUCKET,
      Key: `${tipoSorteo}${archivo}/${fisiVirtual}${f.getDate()}${
        f.getMonth() + 1
      }${f.getFullYear()}${fileName}`,
    };
    bucket
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
        setTimeout(() => {
          closeModal();
          EstadoArchivos().then((res) => {
            if (typeof res != Object) {
              if ("Motivo" in res?.[0]) {
                if (res[0]["Estado"] === 1) {
                  notify(res[0]["Motivo"]);
                } else {
                  notifyError(res[0]["Motivo"]);
                }
              }
            }
          });
        }, 3000);
      })
      .send((err) => {
        if (err) notifyError("Error en la conexión a la base de datos", err);
        console.log(err);
      });
  };

  const { EstadoArchivos } = useLoteria();

  const notifyError = (msg) => {
    toast.warn(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  if (progress === 100) {
  }
  const onChange = (files) => {
    console.log(file);
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        // console.log(m_file);
        setFile(m_file);
        setFileName(m_file.name);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  const [disabledBtns, setDisabledBtns] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    //saveFile();
    setShowModal(true);
    setDisabledBtns(false);
  };

  useEffect(() => {
    setProgress(0);
    setFile("");
    setFileName("");
  }, [archivo]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setProgress(0);
    setFile("");
    setFileName("");
  }, []);

  console.log(file && progress === 0);
  return (
    <>
      <div>
        <Select
          id="archivos"
          label="Archivo a subir"
          options={options}
          disabled={progress !== 0 && progress !== 100}
          value={archivo}
          onChange={(e) => {
            setArchivo(e.target.value);
            setProgress(0);
            setTipoSorteo("");
            setFisiVirtual("");
          }}
        />
        {archivo === "PlanDePremios" || archivo === "Asignacion" || archivo === "Resultados"? (
          <Select
            id="tip_sorteo"
            label={`Tipo de sorteo para ${archivo}`}
            options={optionsTipoSorteo}
            disabled={progress !== 0 && progress !== 100}
            value={tipoSorteo}
            onChange={(e) => {
              setTipoSorteo(e.target.value);
            }}
          />
        ) : (
          ""
        )}
        {archivo !== "PlanDePremios" && tipoSorteo !== "" ? (
          <Select
            id="FisiVir"
            label={`${archivo} fisicos/Virtuales`}
            options={optionsFisiVir}
            disabled={progress !== 0 && progress !== 100}
            value={fisiVirtual}
            onChange={(e) => {
              setFisiVirtual(e.target.value);
            }}
          />
        ) : (
          ""
        )}
        {
        (archivo === "PlanDePremios" && tipoSorteo !== "") ||
        fisiVirtual !== "" ? (
          <Form formDir="col" onSubmit={onSubmit}>
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
          </Form>
        ) : (
          ""
        )}
        {file ? (
          <>
            <h1>
              {fileName} -{" "}
              {progress === 0
                ? "Listo para subir"
                : progress === 100
                ? "Subido"
                : "Subiendo"}
            </h1>
            <ProgressBar value={progress} max="100"></ProgressBar>
          </>
        ) : (
          ""
        )}
        <Modal show={showModal} handleClose={() => closeModal()}>
          <CargarForm
            selected={archivo}
            file={fileName}
            disabledBtns={disabledBtns}
            closeModal={closeModal}
            handleSubmit={() => {
              saveFile();
            }}
          />
        </Modal>
      </div>
    </>
  );
};

export default CargaArchivos;
