import { useCallback, useState, useEffect } from "react";
import Form from "../../../components/Base/Form/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import {
  // postConsultaDocumentosBd,
  postDescargarDocumentoValidacion,
} from "../hooks/fetchCreditoFacil";
import { notifyError, notify } from "../../../utils/notify";

const documentTypes = [
  { key: "pagareFirmado", label: "Pagaré Firmado" },
  { key: "cedulaRepresentante", label: "Cédula del Representante Legal" },
  { key: "estadoFinanciero", label: "Estados Financieros" },
  { key: "camaraComercio", label: "Cámara de Comercio" },
  { key: "contrato", label: "Contrato" },
  { key: "certificacionBancaria", label: "Certificación Bancaria" },
];

const FormActualizarDocumentos = ({
  setChecked,
  setShowModal2,
  setModifyFile,
  setNameRoute,
  setNameFile,
  estado,
  setFileDocuments,
  fileDocuments,
  handleClose,
  consultaDocumentos,
  validationStatus,
}) => {
  useEffect(() => {
    consultaDocumentos();
  }, []);

  const onChangeFile = useCallback((file, variable, inputElement) => {
    if (file) {
      const fileName = file.name.toLowerCase();
      const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
      if (
        extension === "pdf" ||
        ["jpg", "jpeg", "png", "gif"].includes(extension)
      ) {
        setFileDocuments((prevState) => ({ ...prevState, [variable]: file }));
      } else {
        setFileDocuments((prevState) => ({ ...prevState, [variable]: "" }));
        if (inputElement) inputElement.value = null;
        notifyError("Solo se permiten archivos PDF o imágenes.");
      }
    } else {
      setFileDocuments((prevState) => ({ ...prevState, [variable]: "" }));
    }
  }, []);

  const handleModify = (key) => {
    const name_file = key.split("/").pop();
    setNameFile(name_file);
    setNameRoute(key);
    setModifyFile(true);
    setShowModal2(true);
    setChecked(false);
  };

  const handleView = useCallback((key) => {
    const body = { filename: key };
    postDescargarDocumentoValidacion(body)
      .then((autoArr) => {
        if (autoArr?.status) {
          notify(autoArr?.msg);
          window.open(autoArr?.obj?.url);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <Form formDir="col">
        {fileDocuments.pagareFirmado !== "" && estado !== 0 && (
          <>
            <table style={{ width: "100%" }}>
              <thead>
                <tr className="text-xl">
                  <th style={{ width: "45%" }}>Archivo</th>
                  <th style={{ width: "17%" }}>Estado</th>
                  <th style={{ width: "38%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(fileDocuments).map((key) => (
                  <tr key={key}>
                    <td style={{ width: "45%" }}>
                      <h3 className="text-xl" style={{ width: "100%" }}>
                        {documentTypes.find((doc) => doc.key === key)?.label}
                      </h3>
                      {fileDocuments[key] ? (
                        <p className="text-l">
                          {fileDocuments[key].name === undefined
                            ? fileDocuments[key].split("/").pop()
                            : fileDocuments[key].name}
                        </p>
                      ) : (
                        <Input
                          type="file"
                          id={key}
                          name={key}
                          accept=".pdf,image/*"
                          onChange={(e) =>
                            onChangeFile(e.target.files[0], key, e.target)
                          }
                          required
                        />
                      )}
                    </td>
                    <td style={{ width: "17%" }}>
                      <p className="tex-xl font-semibold">
                        {validationStatus[key] === undefined &&
                        fileDocuments[key] !== ""
                          ? "En Validación"
                          : validationStatus[key]}
                      </p>
                    </td>
                    <td style={{ width: "38%" }}>
                      {fileDocuments[key] && (
                        <ButtonBar>
                          <Button
                            type="button"
                            design="primary"
                            onClick={() => handleModify(fileDocuments[key])}
                            disabled={validationStatus[key] === "Aprobado"}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            design="primary"
                            onClick={() => handleView(fileDocuments[key])}
                          >
                            Descargar
                          </Button>
                        </ButtonBar>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ButtonBar>
              <Button onClick={handleClose}>Volver</Button>
            </ButtonBar>
          </>
        )}
      </Form>
    </>
  );
};

export default FormActualizarDocumentos;
