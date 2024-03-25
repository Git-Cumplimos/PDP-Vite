import { useCallback, useState, useEffect } from "react";
import Form from "../../../components/Base/Form/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notifyError, notifyPending } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { useAuth } from "../../../hooks/AuthHooks";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import {
  postTerminosCondicionesCEACRC,
  postConsultaDocumentosBd,
} from "../hooks/fetchCreditoFacil";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import { useFetch } from "../../../hooks/useFetch";

const URL_CARGA_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/carga-documentos-creditos`;
const URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/actualizacion-documentos`;

const FormCargaDocumentos = ({
  setModalOpen,
  consultaCreditos,
  dataCredito,
  setFormCarga,
}) => {
  const [isModalOpenPDF, setModalOpenPDF] = useState(false);
  const { roleInfo } = useAuth();
  const [isChecked, setChecked] = useState(false);
  const [url, setUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fileDocuments, setFileDocuments] = useState({
    pagareFirmado: "",
    cedulaRepresentante: "",
    estadoFinanciero: "",
    camaraComercio: "",
    contrato: "",
    certificacionBancaria: "",
  });
  const [dataConsultaDocumentos, setDataConsultaDocumentos] = useState(false);

  useEffect(() => {
    consultaDocumentos();
  }, []);

  const consultaDocumentos = useCallback(() => {
    const body = {
      numero_solicitud: dataCredito?.NroSolicitud,
    };
    postConsultaDocumentosBd(body)
      .then((autoArr) => {
        console.log("Aquiiiiii", autoArr);
        const consultaDocumentosBD = autoArr?.obj?.archivos;
        setFileDocuments({
          pagareFirmado:
            consultaDocumentosBD?.pagare !== "" ? "Pagare.pdf" : "",
          cedulaRepresentante: consultaDocumentosBD?.cedulaRepresentante
            ? "CedulaRepresentante.pdf"
            : "",
          estadoFinanciero: consultaDocumentosBD?.estadoFinanciero
            ? "EstadoFinanciero.pdf"
            : "",
          camaraComercio: consultaDocumentosBD?.camaraComercio
            ? "CamaraComercio.pdf"
            : "",
          contrato: consultaDocumentosBD?.contrato ? "Contrato.pdf" : "",
          certificacionBancaria: consultaDocumentosBD?.certificacionBancaria
            ? "CertificacionBancaria.pdf"
            : "",
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const onChangeFile = (file, variable, inputElement) => {
    // Validación de la extensión del archivo
    if (file) {
      const fileName = file.name.toLowerCase();
      const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
      if (
        extension === "pdf" ||
        ["jpg", "jpeg", "png", "gif"].includes(extension)
      ) {
        setFileDocuments((prevState) => ({
          ...prevState,
          [variable]: file,
        }));
      } else {
        setFileDocuments((prevState) => ({
          ...prevState,
          [variable]: "",
        }));
        if (inputElement) {
          inputElement.value = null;
        }
        notifyError("Solo se permiten archivos PDF o Imágenes.");
      }
    } else {
      setFileDocuments((prevState) => ({
        ...prevState,
        [variable]: "",
      }));
    }
  };

  const [loadingPeticionGuardarDocumentos, peticionGuardarDocumentos] =
    useFetch(
      fetchCustom(
        URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS,
        "POST",
        "Guardar documentos"
      )
    );

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
                pagare: respuestaFile?.pagare?.fields?.key,
                cedulaRepresentante:
                  respuestaFile?.cedulaRepresentante?.fields?.key,
                estadoFinanciero: respuestaFile?.estadoFinanciero?.fields?.key,
                camaraComercio: respuestaFile?.camaraComercio?.fields?.key,
                contrato: respuestaFile?.contrato?.fields?.key,
                certificacionBancaria:
                  respuestaFile?.certificacionBancaria?.fields?.key,
              },
              numero_solicitud: dataCredito?.NroSolicitud,
            };
            console.log(data);
            notifyPending(
              peticionGuardarDocumentos({}, data),
              {
                render: () => {
                  return "Procesando cague de documentos";
                },
              },
              {
                render: ({ data: res }) => {
                  consultaCreditos();
                  setModalOpenPDF(false);
                  return "Cargue de documentos exitoso";
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
                    setModalOpenPDF(false);
                    return "Cargue de documentos fallido";
                  }
                },
              }
            );
          }
        }
      } catch (err) {
        consultaCreditos();
        setModalOpenPDF(false);
        notifyError("Error al cargar Datos");
      }
    },
    [roleInfo, fileDocuments]
  );

  const openModal = async () => {
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
  };

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setFormCarga(false);
    consultaCreditos();
  }, []);

  const handleCloseTerminos = useCallback(() => {
    setModalOpenPDF(false);
  }, []);

  const handleAccept = useCallback(() => {
    setModalOpenPDF(false);
    setChecked(true);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label
            htmlFor="pagare"
            className="text-xl"
            style={{ width: "250px", marginRight: "20px" }}
          >
            Pagaré Firmado
          </label>
          <Input
            type="file"
            id="pagare"
            name="pagare"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              onChangeFile(file, "pagareFirmado", e.target);
            }}
            required
          />
          {fileDocuments?.pagareFirmado !== "" ? (
            <>
              <div>{"Archivo guardado: "}{fileDocuments?.pagareFirmado}</div>
              <label
                htmlFor="pagare"
                className="text-xl"
                style={{ width: "250px", marginRight: "20px" }}
              >
                En validación
              </label>
            </>
          ) : (
            <></>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label
            htmlFor="cedula"
            className="text-xl"
            style={{ width: "250px", marginRight: "20px" }}
          >
            Cédula del Representante Legal
          </label>
          <Input
            type="file"
            id="cedula"
            name="cedula"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              onChangeFile(file, "cedulaRepresentante", e.target);
            }}
            required
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label
            htmlFor="estadosFinancieros"
            className="text-xl"
            style={{ width: "250px", marginRight: "20px" }}
          >
            Estados Financieros
          </label>
          <Input
            type="file"
            id="estadosFinancieros"
            name="estadosFinancieros"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              onChangeFile(file, "estadoFinanciero", e.target);
            }}
            required
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label
            htmlFor="camaraComercio"
            className="text-xl"
            style={{ width: "250px", marginRight: "20px" }}
          >
            Cámara de Comercio
          </label>
          <Input
            type="file"
            id="camaraComercio"
            name="camaraComercio"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              onChangeFile(file, "camaraComercio", e.target);
            }}
            required
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label
            htmlFor="contrato"
            className="text-xl"
            style={{ width: "250px", marginRight: "20px" }}
          >
            Contrato
          </label>
          <Input
            type="file"
            id="contrato"
            name="contrato"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              onChangeFile(file, "contrato", e.target);
            }}
            required
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label
            htmlFor="certificacionBancaria"
            className="text-xl"
            style={{ width: "250px", marginRight: "20px" }}
          >
            Certificación Bancaria
          </label>
          <Input
            type="file"
            id="certificacionBancaria"
            name="certificacionBancaria"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              onChangeFile(file, "certificacionBancaria", e.target);
            }}
            required
          />
        </div>
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
