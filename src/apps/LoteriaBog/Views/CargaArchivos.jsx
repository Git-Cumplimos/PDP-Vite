import { useState } from "react";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";

const CargaArchivos = () => {
  const [options, setOptions] = useState([
    { value: "", label: "" },
    { value: "plan-de-premios", label: "Plan de premios" },
    { value: "asignacion", label: "Asignacion" },
    { value: "resultados", label: "Resultados" },
    { value: "liquidacion-de-premios", label: "Liquidacion de premios" },
    { value: "pago-de-premios", label: "Pago de premios" },
  ]);
  const [archivo, setArchivo] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");

  console.log(
    options.find(({ value }) => {
      return value === archivo;
    })
  );

  const saveFile = () => {
    Storage.put(fileName, file)
      .then(() => {
        console.log("Successfully saved!");
        setFileUrl("");
        setFile("");
        setFileName("");
        alert("Archivo guardado");
      })
      .catch((err) => {
        console.error("Error upluading the file", err);
      });
  };

  const onChange = (event) => {
    const m_file = event.target.files[0];
    setFileUrl(URL.createObjectURL(m_file));
    setFile(m_file);
    setFileName(m_file.name);
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
        <Form onSubmit={onSubmit}>
          <Input
            id={`archivo_${archivo}`}
            label={`Archivo a subir: ${
              options.find(({ value }) => {
                return value === archivo;
              }).label
            }`}
            type="file"
            accept="image/*,video/*"
            onChange={onChange}
          />
        </Form>
      ) : (
        ""
      )}
    </div>
  );
};

export default CargaArchivos;
