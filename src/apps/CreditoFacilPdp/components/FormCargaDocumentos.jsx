import { useCallback, useState, useEffect } from "react";
import Form from "../../../components/Base/Form/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import {
  postConsultaDocumentosBd,
  postDescargarDocumentoValidacion,
} from "../hooks/fetchCreditoFacil";
import { notifyError, notifyPending, notify} from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { postTerminosCondicionesCEACRC } from "../hooks/fetchCreditoFacil";
import { fetchCustom } from "../utils/fetchCreditoFacil";

const URL_CARGA_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/carga-documentos-creditos`;
const URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/actualizacion-documentos`;

const initialFileState = {
  pagareFirmado: "",
  cedulaRepresentante: "",
  estadoFinanciero: "",
  camaraComercio: "",
  contrato: "",
  certificacionBancaria: "",
};

const documentTypes = [
  { key: "pagareFirmado", label: "Pagaré Firmado" },
  { key: "cedulaRepresentante", label: "Cédula del Representante Legal" },
  { key: "estadoFinanciero", label: "Estados Financieros" },
  { key: "camaraComercio", label: "Cámara de Comercio" },
  { key: "contrato", label: "Contrato" },
  { key: "certificacionBancaria", label: "Certificación Bancaria" },
];

const initialStatusFile = {
  pagareFirmado: "",
  cedulaRepresentante: "",
  estadoFinanciero: "",
  camaraComercio: "",
  contrato: "",
  certificacionBancaria: "",
};

const FormCargaDocumentos = ({
  setModalOpen,
  consultaCreditos,
  dataCredito,
  setFormCarga,
}) => {
  const [isChecked, setChecked] = useState(false);
  const [isModalOpenPDF, setModalOpenPDF] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { roleInfo } = useAuth();
  const [url, setUrl] = useState("");
  const [estado, setEstado] = useState(0);
  const [validationStatus, setValidationStatus] = useState(initialStatusFile);
  const [fileDocuments, setFileDocuments] = useState(initialFileState);
  const [loadingPeticionGuardarDocumentos, peticionGuardarDocumentos] =
    useFetch(
      fetchCustom(
        URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS,
        "POST",
        "Guardar documentos"
      )
    );

  useEffect(() => {
    consultaDocumentos();
  }, []);

  const consultaDocumentos = useCallback(() => {
    const body = { numero_solicitud: dataCredito?.NroSolicitud };
    postConsultaDocumentosBd(body)
      .then((autoArr) => {
        const consultaDocumentosBD = autoArr?.obj?.archivos;
        if (Object.keys(consultaDocumentosBD).length > 0) {
          setEstado(1);
        }
        setFileDocuments({
          pagareFirmado: consultaDocumentosBD?.pagare?.archivo
            ? consultaDocumentosBD?.pagare?.archivo
            : "",
          cedulaRepresentante: consultaDocumentosBD?.cedulaRepresentante
            ? consultaDocumentosBD?.cedulaRepresentante?.archivo
            : "",
          estadoFinanciero: consultaDocumentosBD?.estadoFinanciero
            ? consultaDocumentosBD?.estadoFinanciero?.archivo
            : "",
          camaraComercio: consultaDocumentosBD?.camaraComercio
            ? consultaDocumentosBD?.camaraComercio?.archivo
            : "",
          contrato: consultaDocumentosBD?.contrato
            ? consultaDocumentosBD?.contrato?.archivo
            : "",
          certificacionBancaria: consultaDocumentosBD?.certificacionBancaria
            ? consultaDocumentosBD?.certificacionBancaria?.archivo
            : "",
        });
        setValidationStatus({
          pagareFirmado: consultaDocumentosBD?.pagare?.estadoValidacion,
          cedulaRepresentante:
            consultaDocumentosBD?.cedulaRepresentante?.estadoValidacion,
          estadoFinanciero:
            consultaDocumentosBD?.estadoFinanciero?.estadoValidacion,
          camaraComercio:
            consultaDocumentosBD?.camaraComercio?.estadoValidacion,
          contrato: consultaDocumentosBD?.contrato?.estadoValidacion,
          certificacionBancaria:
            consultaDocumentosBD?.certificacionBancaria?.estadoValidacion,
        });
      })
      .catch((err) => console.error(err));
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

  const cargar_documentos = useCallback(
    async (e) => {
      e.preventDefault();
      const data = {
        id_comercio: roleInfo?.id_comercio,
        numero_solicitud: dataCredito?.NroSolicitud,
        archivos: {
          pagare: fileDocuments?.pagareFirmado?.name,
          cedulaRepresentante: fileDocuments?.cedulaRepresentante?.name,
          estadoFinanciero: fileDocuments?.estadoFinanciero?.name,
          camaraComercio: fileDocuments?.camaraComercio?.name,
          contrato: fileDocuments?.contrato?.name,
          certificacionBancaria: fileDocuments?.certificacionBancaria?.name,
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
          setModalOpenPDF(false);
        } else {
          let respuestaFile = respuesta?.obj;
          let allFilesUploaded = true;
          const filesToUpload = {
            pagare: respuestaFile?.pagare,
            cedulaRepresentante: respuestaFile?.cedulaRepresentante,
            estadoFinanciero: respuestaFile?.estadoFinanciero,
            camaraComercio: respuestaFile?.camaraComercio,
            contrato: respuestaFile?.contrato,
            certificacionBancaria: respuestaFile?.certificacionBancaria,
          };

          const archivos = {
            pagare: fileDocuments?.pagareFirmado,
            cedulaRepresentante: fileDocuments?.cedulaRepresentante,
            estadoFinanciero: fileDocuments?.estadoFinanciero,
            camaraComercio: fileDocuments?.camaraComercio,
            contrato: fileDocuments?.contrato,
            certificacionBancaria: fileDocuments?.certificacionBancaria,
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
                pagare: {
                  archivo: respuestaFile?.pagare?.fields?.key,
                  estadoValidacion:
                    validationStatus.pagareFirmado === undefined
                      ? "En Validación"
                      : validationStatus.pagareFirmado,
                },
                cedulaRepresentante: {
                  archivo: respuestaFile?.cedulaRepresentante?.fields?.key,
                  estadoValidacion:
                    validationStatus.cedulaRepresentante === undefined
                      ? "En Validación"
                      : validationStatus.cedulaRepresentante,
                },
                estadoFinanciero: {
                  archivo: respuestaFile?.estadoFinanciero?.fields?.key,
                  estadoValidacion:
                    validationStatus.estadoFinanciero === undefined
                      ? "En Validación"
                      : validationStatus.estadoFinanciero,
                },
                camaraComercio: {
                  archivo: respuestaFile?.camaraComercio?.fields?.key,
                  estadoValidacion:
                    validationStatus.camaraComercio === undefined
                      ? "En Validación"
                      : validationStatus.camaraComercio,
                },
                contrato: {
                  archivo: respuestaFile?.contrato?.fields?.key,
                  estadoValidacion:
                    validationStatus.contrato === undefined
                      ? "En Validación"
                      : validationStatus.contrato,
                },
                certificacionBancaria: {
                  archivo: respuestaFile?.certificacionBancaria?.fields?.key,
                  estadoValidacion:
                    validationStatus.certificacionBancaria === undefined
                      ? "En Validación"
                      : validationStatus.certificacionBancaria,
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
                  consultaCreditos();
                  setModalOpenPDF(false);
                  setModalOpen(false);
                  setFormCarga(false);
                  setEstado(0);
                  return "Carga de documentos exitosa";
                },
              },
              {
                render: ({ data: error }) => {
                  if (error?.message) {
                    consultaCreditos();
                    setModalOpenPDF(false);
                    return error?.message;
                  } else {
                    consultaCreditos();
                    setEstado(0);
                    setModalOpenPDF(false);
                    return "Carga de documentos fallida";
                  }
                },
              }
            );
          }
        }
      } catch (err) {
        consultaCreditos();
        setModalOpenPDF(false);
        setEstado(0);
        notifyError("Error al cargar Datos");
      }
    },
    [roleInfo, fileDocuments]
  );

  const openModal = useCallback(() => {
    if (isChecked) {
      setChecked(!isChecked);
    } else {
      postTerminosCondicionesCEACRC().then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setUrl(res?.obj?.url);
          setModalOpenPDF(true);
          setShowModal(true);
        }
      });
    }
  }, [isChecked]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setFormCarga(false);
    setEstado(0);
    consultaCreditos();
  }, []);

  const handleCloseTerminos = useCallback(() => {
    setModalOpenPDF(false);
  }, []);

  const handleAccept = useCallback(() => {
    setModalOpenPDF(false);
    setChecked(true);
  }, []);

  // Dentro de tu componente
  const handleModify = (key) => {
    // Lógica para manejar la acción de modificar el documento con la clave 'key'
    console.log("Modificando documento con clave:", key);
    // Por ejemplo, podrías abrir un modal o navegar a una nueva página para permitir la modificación del documento
  };

  // const handleView = (key) => {

  //   // Lógica para manejar la acción de ver el documento con la clave 'key'
  //   console.log("Viendo documento con clave:", key);
  //   // Por ejemplo, podrías abrir una vista previa del documento en una ventana modal
  // };

  const handleView = useCallback((key) => {
    console.log("Viendo documento con clave:", key);
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
      <Form formDir="col" onSubmit={cargar_documentos}>
        <h1 className="text-3xl text-center mb-10 mt-5">
          Cargue Documentos Crédito
        </h1>
        <h2 className="text-xl text-center mb-10">
          Por favor realice el cargue de cada documento
        </h2>
        {fileDocuments.pagareFirmado !== "" && estado !== 0 && (
          <table>
            <thead>
              <tr className="text-xl">
                <th>Archivo</th>
                <th>Acciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(fileDocuments).map((key) => (
                <tr key={key}>
                  <td>
                    <h3 className="text-xl">
                      {documentTypes.find((doc) => doc.key === key)?.label}
                    </h3>
                    {fileDocuments[key] ? (
                      <p className="text-xl">
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
                  <td>
                    {fileDocuments[key] && (
                      <ButtonBar>
                        <Button type="submit" onClick={() => handleModify(key)}>
                          Modificar
                        </Button>
                        <Button
                          type="submit"
                          onClick={() => handleView(fileDocuments[key])}
                        >
                          Ver
                        </Button>
                      </ButtonBar>
                    )}
                  </td>
                  <td>
                    <p className="tex-xl font-semibold">
                      {validationStatus[key] === undefined &&
                      fileDocuments[key] !== ""
                        ? "En Validación"
                        : validationStatus[key]}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
          </>
        )}
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
        <br />
        {isModalOpenPDF && (
          <Modal
            show={showModal}
            handleClose={handleCloseTerminos}
            className="flex align-middle"
          >
            <object
              title="PDF Viewer"
              data={url}
              type="application/pdf"
              width="100%"
              height="500vh"
            ></object>
            <ButtonBar>
              <Button type="submit" onClick={handleAccept}>
                Aceptar
              </Button>
            </ButtonBar>
          </Modal>
        )}
        <ButtonBar>
          <Button onClick={handleClose}>Cancelar</Button>
          {isChecked && (
            <ButtonBar>
              <Button
                type="submit"
                disabled={loadingPeticionGuardarDocumentos}
                onClick={() => {
                  setShowModal(true);
                }}
              >
                Aceptar
              </Button>
            </ButtonBar>
          )}
        </ButtonBar>
      </Form>
    </>
  );
};

export default FormCargaDocumentos;
