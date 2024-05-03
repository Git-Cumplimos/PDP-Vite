import { useCallback } from "react";
import Form from "../../../components/Base/Form/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notifyError, notifyPending } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { fetchCustom } from "../utils/fetchCreditoFacil";

const URL_CARGA_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/carga-documentos-creditos`;
const URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/actualizacion-documentos`;

const documentTypes = [
  { key: "pagareFirmado", label: "Pagaré Firmado" },
  { key: "cedulaRepresentante", label: "Cédula del Representante Legal" },
  { key: "estadoFinanciero", label: "Estados Financieros" },
  { key: "camaraComercio", label: "Cámara de Comercio" },
  { key: "contrato", label: "Contrato" },
  { key: "certificacionBancaria", label: "Certificación Bancaria" },
];

const FormCargaDocumentos = ({
  consultaCreditos,
  dataCredito,
  isChecked,
  estado,
  setFileDocuments,
  fileDocuments,
  openModal,
  handleClose,
}) => {
  const { roleInfo } = useAuth();
  const [loadingPeticionGuardarDocumentos, peticionGuardarDocumentos] =
    useFetch(
      fetchCustom(
        URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS,
        "POST",
        "Guardar documentos"
      )
    );

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

  const cargar_documentos = useCallback(
    async (e) => {
      e.preventDefault();
      const data = {
        id_comercio: roleInfo?.id_comercio,
        numero_solicitud: dataCredito?.NroSolicitud,
        archivos: {
          Pagare: fileDocuments?.pagareFirmado?.name,
          CedulaRepresentante: fileDocuments?.cedulaRepresentante?.name,
          EstadoFinanciero: fileDocuments?.estadoFinanciero?.name,
          CamaraComercio: fileDocuments?.camaraComercio?.name,
          Contrato: fileDocuments?.contrato?.name,
          CertificacionBancaria: fileDocuments?.certificacionBancaria?.name,
        },
      };
      try {
        const respuesta = await fetchData(
          URL_CARGA_ARCHIVO_S3,
          "POST",
          {},
          data
        );
        if (!respuesta?.status) {
          notifyError(respuesta?.msg);
          consultaCreditos();
          handleClose();
        } else {
          let respuestaFile = respuesta?.obj;
          let allFilesUploaded = true;
          const filesToUpload = {
            Pagare: respuestaFile?.Pagare,
            CedulaRepresentante: respuestaFile?.CedulaRepresentante,
            EstadoFinanciero: respuestaFile?.EstadoFinanciero,
            CamaraComercio: respuestaFile?.CamaraComercio,
            Contrato: respuestaFile?.Contrato,
            CertificacionBancaria: respuestaFile?.CertificacionBancaria,
          };

          const archivos = {
            Pagare: fileDocuments?.pagareFirmado,
            CedulaRepresentante: fileDocuments?.cedulaRepresentante,
            EstadoFinanciero: fileDocuments?.estadoFinanciero,
            CamaraComercio: fileDocuments?.camaraComercio,
            Contrato: fileDocuments?.contrato,
            CertificacionBancaria: fileDocuments?.certificacionBancaria,
          };

          for (const archivoKey in archivos) {
            const file = archivos[archivoKey];
            if (file) {
              const resFormData = filesToUpload[archivoKey];
              if (resFormData) {
                const formData2 = new FormData();
                for (const property in resFormData?.fields) {
                  formData2.set(
                    `${property}`,
                    `${resFormData?.fields[property]}`
                  );
                }
                formData2.set("file", file);
                try {
                  const res = await fetch(resFormData?.url, {
                    method: "POST",
                    body: formData2,
                  });
                  if (!res.ok) {
                    throw new Error(`Error al subir el archivo ${archivoKey}`);
                  }
                } catch (error) {
                  console.error(error);
                  throw new Error(`Error al subir el archivo ${archivoKey}`);
                }
              } else {
                console.error(
                  `No se encontró la URL de carga para el archivo ${archivoKey}`
                );
              }
            }
          }

          if (allFilesUploaded) {
            const data = {
              archivos: {
                Pagare: {
                  archivo: respuestaFile?.Pagare?.fields?.key,
                  estadoValidacion: "En Validación",
                },
                CedulaRepresentante: {
                  archivo: respuestaFile?.CedulaRepresentante?.fields?.key,
                  estadoValidacion: "En Validación",
                },
                EstadoFinanciero: {
                  archivo: respuestaFile?.EstadoFinanciero?.fields?.key,
                  estadoValidacion: "En Validación",
                },
                CamaraComercio: {
                  archivo: respuestaFile?.CamaraComercio?.fields?.key,
                  estadoValidacion: "En Validación",
                },
                Contrato: {
                  archivo: respuestaFile?.Contrato?.fields?.key,
                  estadoValidacion: "En Validación",
                },
                CertificacionBancaria: {
                  archivo: respuestaFile?.CertificacionBancaria?.fields?.key,
                  estadoValidacion: "En Validación",
                },
              },
              numero_solicitud: dataCredito?.NroSolicitud,
            };

            notifyPending(
              peticionGuardarDocumentos({}, data),
              {
                render: () => "Procesando carga de documentos",
              },
              {
                render: ({ data: res }) => {
                  handleClose();
                  consultaCreditos();
                  return "Carga de documentos exitosa";
                },
              },
              {
                render: ({ data: error }) => {
                  if (error?.message) {
                    handleClose();
                    consultaCreditos();
                    return error?.message;
                  } else {
                    handleClose();
                    consultaCreditos();
                    return "Carga de documentos fallida";
                  }
                },
              }
            );
          }
        }
      } catch (err) {
        handleClose();
        consultaCreditos();
        notifyError("Error al cargar Datos");
      }
    },
    [roleInfo, fileDocuments, dataCredito]
  );

  return (
    <>
      <Form formDir="col" onSubmit={cargar_documentos}>
        <h1 className="text-3xl text-center mb-10 mt-5">
          Cargue Documentos Crédito
        </h1>
        <h2 className="text-xl text-center mb-10">
          Por favor realice el cargue de cada documento
        </h2>
        {estado === 0 && (
          <>
            {Object.keys(fileDocuments).map((key) => (
              <div key={key}>
                <h3 className="text-2xl mb-2">
                  {documentTypes.find((doc) => doc.key === key)?.label}
                </h3>
                {fileDocuments[key] ? (
                  <div style={{ display: "flex", marginLeft: "auto" }}>
                    <input
                      type="text"
                      value={
                        fileDocuments[key].name === undefined
                          ? fileDocuments[key].split("/").pop()
                          : fileDocuments[key].name
                      }
                      readOnly
                      style={{ width: "60%", height: "7vh" }}
                      className="text-l"
                    />
                    <button
                      style={{
                        marginLeft: "auto",
                        backgroundColor: "#E1E1DF",
                        border: "1px solid #ccc",
                        borderRadius: "15px",
                        color: "#333",
                        height: "38px",
                        lineHeight: "35px",
                        padding: "0 15px",
                      }}
                      type="button"
                      onClick={() =>
                        document.getElementById(key + "-file").click()
                      }
                    >
                      Cambiar archivo
                    </button>
                    <input
                      type="file"
                      id={key + "-file"}
                      name={key}
                      accept=".pdf,image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        onChangeFile(e.target.files[0], key, e.target)
                      }
                      onClick={(e) => (e.target.value = null)}
                    />
                  </div>
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
              </div>
            ))}
            <div className="text-center">
              <label className="text-xl">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onClick={openModal}
                  onChange={() => {}}
                  required
                />
                <span className="ml-2">Acepta Términos y Condiciones</span>
              </label>
            </div>
            <ButtonBar>
              <Button onClick={handleClose}>Cancelar</Button>
              {isChecked && (
                <ButtonBar>
                  <Button
                    type="submit"
                    disabled={loadingPeticionGuardarDocumentos}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              )}
            </ButtonBar>
          </>
        )}
      </Form>
    </>
  );
};

export default FormCargaDocumentos;
