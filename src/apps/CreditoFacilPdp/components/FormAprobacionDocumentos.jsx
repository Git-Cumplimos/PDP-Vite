import { useCallback, useEffect } from "react";
import Form from "../../../components/Base/Form/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { postDescargarDocumentoValidacion } from "../hooks/fetchCreditoFacil";
import { notify } from "../../../utils/notify";

const documentTypes = [
  { key: "pagareFirmado", label: "Pagaré Firmado" },
  { key: "cedulaRepresentante", label: "Cédula del Representante Legal" },
  { key: "estadoFinanciero", label: "Estados Financieros" },
  { key: "camaraComercio", label: "Cámara de Comercio" },
  { key: "contrato", label: "Contrato" },
  { key: "certificacionBancaria", label: "Certificación Bancaria" },
];

const FormAprobacionDocumentos = ({
  setChecked,
  setShowModal2,
  setModifyFile,
  setNameRoute,
  setNameFile,
  estado,
  fileDocuments,
  handleClose,
  setEstadoDocumento,
  consultaDocumentos,
  validationStatus,
  validateDate,
  usuarioCargue,
}) => {
  useEffect(() => {
    consultaDocumentos();
  }, []);

  const handleModify = (key, status) => {
    const name_file = key.split("/").pop();
    setNameFile(name_file);
    setNameRoute(key);
    setModifyFile(true);
    setShowModal2(true);
    setChecked(false);
    if (status === "Aprobado") {
      setEstadoDocumento("Aprobado");
    } else if (status === "Rechazado") {
      setEstadoDocumento("Rechazado");
    }
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
        {fileDocuments.pagareFirmado !== "" && estado !== 0 ? (
          <>
            <h1 className="text-3xl text-center mb-10 mt-5">
              Validación de Documentos Cargados
            </h1>
            <table style={{ width: "100%" }}>
              <thead>
                <tr className="text-xl">
                  <th style={{ width: "20%" }}>Tipo de Documento</th>
                  <th style={{ width: "20%" }}>Nombre del Archivo</th>
                  <th style={{ width: "15%" }}>Estado</th>
                  <th style={{ width: "15%" }}>Usuario Carga</th>
                  <th style={{ width: "15%" }}>Fecha Cargue</th>
                  <th style={{ width: "15%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(fileDocuments).map((key) => (
                  <tr
                    key={key}
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    <td style={{ width: "20%" }}>
                      <h3 className="text-xl">
                        {documentTypes.find((doc) => doc.key === key)?.label}
                      </h3>
                    </td>
                    <td style={{ width: "20%" }}>
                      {fileDocuments[key] && (
                        <p className="text-xl">
                          {fileDocuments[key].name === undefined
                            ? fileDocuments[key].split("/").pop()
                            : fileDocuments[key].name}
                        </p>
                      )}
                    </td>
                    <td style={{ width: "15%" }}>
                      <p className="tex-xl">
                        {validationStatus[key] === undefined &&
                        fileDocuments[key] !== ""
                          ? "En Validación"
                          : validationStatus[key]}
                      </p>
                    </td>
                    <td style={{ width: "15%" }}>
                      <p className="tex-xl">{usuarioCargue}</p>
                    </td>
                    <td style={{ width: "15%" }}>
                      <p className="tex-xl">
                        {validateDate[key] === undefined &&
                        fileDocuments[key] !== ""
                          ? ""
                          : new Date(validateDate[key]).toLocaleDateString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                      </p>
                    </td>
                    <td style={{ width: "15%" }}>
                      {fileDocuments[key] && (
                        <div>
                          <Button
                            type="button"
                            style={{
                              backgroundColor: "green",
                              color: "white",
                            }}
                            onClick={() =>
                              handleModify(fileDocuments[key], "Aprobado")
                            }
                            disabled={
                              validationStatus[key] === "Aprobado" ||
                              validationStatus[key] === "Rechazado"
                            }
                          >
                            Aprobar
                          </Button>
                          <Button
                            type="button"
                            design="danger"
                            onClick={() =>
                              handleModify(fileDocuments[key], "Rechazado")
                            }
                            disabled={
                              validationStatus[key] === "Aprobado" ||
                              validationStatus[key] === "Rechazado"
                            }
                          >
                            Rechazar
                          </Button>
                          <Button
                            type="button"
                            design="primary"
                            onClick={() => handleView(fileDocuments[key])}
                          >
                            Descargar
                          </Button>
                        </div>
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
        ) : (
          <>
            <h1 className="text-3xl text-center mb-10 mt-5">
              El comercio aún no ha subido los documentos requeridos.
            </h1>
            <ButtonBar>
              <Button onClick={handleClose}>Volver</Button>
            </ButtonBar>
          </>
        )}
      </Form>
    </>
  );
};

export default FormAprobacionDocumentos;
