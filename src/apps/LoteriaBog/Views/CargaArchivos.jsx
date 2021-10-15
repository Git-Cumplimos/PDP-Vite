import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import AWS from "aws-sdk";
import ProgressBar from "../../../components/Base/ProgressBar/ProgressBar";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const CargaArchivos = () => {
  const options = [
    { value: "", label: "" },
    { value: "PlanDePremios", label: "Plan de premios" },
    { value: "Asignacion", label: "Asignacion" },
    { value: "Resultados", label: "Resultados" },
    { value: "Liquidacion", label: "Liquidacion de premios" },
    { value: "PagoDePremios", label: "Pago de premios" },
  ];
  const [archivo, setArchivo] = useState("");
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");

  const [progress, setProgress] = useState(0);

  const S3_BUCKET = process.env.REACT_APP_BUCKET;
  const REGION = process.env.REACT_APP_REGION;

  const bucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });

  const saveFile = () => {
    const f = new Date();
    const params = {
      ACL: "public-read",
      Body: file,
      Bucket: S3_BUCKET,
      Key: `${archivo}/${f.getDate()}${
        f.getMonth() + 1
      }${f.getFullYear()}${fileName}`,
    };
    console.log(
      f.getDate() + "" + (f.getMonth() + 1) + "" + f.getFullYear() + fileName
    );
    bucket
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      })
      .send((err) => {
        if (err) console.error("Error upluading the file", err);
      });
  };

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const onChange = (files) => {
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

  const onSubmit = (event) => {
    event.preventDefault();
    saveFile();
  };

  return (
    <div>
      <Select
        id="archivos"
        label="Archivo a subir"
        options={options}
        value={archivo}
        onChange={(e) => setArchivo(e.target.value)}
      />
      {archivo !== "" ? (
        <Form formDir="col" onSubmit={onSubmit}>
          <ToastContainer />
          <Input
            id={`archivo_${archivo}`}
            label={`Elegir archivo: ${
              options.find(({ value }) => {
                return value === archivo;
              }).label
            }`}
            type="file"
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
    </div>
  );
};

export default CargaArchivos;
