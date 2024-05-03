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
import { notifyError, notifyPending, notify } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { postTerminosCondicionesCEACRC } from "../hooks/fetchCreditoFacil";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import Fieldset from "../../../components/Base/Fieldset";

const URL_CARGA_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/carga-documentos-creditos`;
const URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/actualizacion-documentos`;
const URL_ACTUALIZAR_DOCUMENTO_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/actualizacion-documento-guardado`;
const URL_MODIFICAR_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/carga-documentos-modificar`;

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

const FormAceptarTerminosCEACRC = ({
  setModalOpenPDF,
  url,
  showModal,
  setChecked,
}) => {
  // const [isChecked, setChecked] = useState(false);
  // const [isModalOpenPDF, setModalOpenPDF] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  // const [modifyFile, setModifyFile] = useState(false);
  // const [nameRoute, setNameRoute] = useState("");
  // const [file, setFile] = useState({});
  // const [nameFile, setNameFile] = useState("");
  // const { roleInfo } = useAuth();
  // const [url, setUrl] = useState("");
  // const [estado, setEstado] = useState(0);
  // const [validationStatus, setValidationStatus] = useState(initialStatusFile);
  // const [fileDocuments, setFileDocuments] = useState(initialFileState);
  // const [loadingPeticionGuardarDocumentos, peticionGuardarDocumentos] =
  //   useFetch(
  //     fetchCustom(
  //       URL_GUARDAR_DOCUMENTOS_TBL_MOVIMIENTOS,
  //       "POST",
  //       "Guardar documentos"
  //     )
  //   );

  // const [loadingPeticionActualizarDocumento, peticionActualizarDocumento] =
  //   useFetch(
  //     fetchCustom(
  //       URL_ACTUALIZAR_DOCUMENTO_TBL_MOVIMIENTOS,
  //       "POST",
  //       "Actualizar documento"
  //     )
  //   );

  // useEffect(() => {
  //   consultaDocumentos();
  // }, []);

  // const consultaDocumentos = useCallback(() => {
  //   const body = { numero_solicitud: dataCredito?.NroSolicitud };
  //   postConsultaDocumentosBd(body)
  //     .then((autoArr) => {
  //       const consultaDocumentosBD = autoArr?.obj?.archivos;
  //       if (Object.keys(consultaDocumentosBD).length > 0) {
  //         setEstado(1);
  //       }
  //       setFileDocuments({
  //         pagareFirmado: consultaDocumentosBD?.Pagare?.archivo
  //           ? consultaDocumentosBD?.Pagare?.archivo
  //           : "",
  //         cedulaRepresentante: consultaDocumentosBD?.CedulaRepresentante
  //           ? consultaDocumentosBD?.CedulaRepresentante?.archivo
  //           : "",
  //         estadoFinanciero: consultaDocumentosBD?.EstadoFinanciero
  //           ? consultaDocumentosBD?.EstadoFinanciero?.archivo
  //           : "",
  //         camaraComercio: consultaDocumentosBD?.CamaraComercio
  //           ? consultaDocumentosBD?.CamaraComercio?.archivo
  //           : "",
  //         contrato: consultaDocumentosBD?.Contrato
  //           ? consultaDocumentosBD?.Contrato?.archivo
  //           : "",
  //         certificacionBancaria: consultaDocumentosBD?.CertificacionBancaria
  //           ? consultaDocumentosBD?.CertificacionBancaria?.archivo
  //           : "",
  //       });
  //       setValidationStatus({
  //         pagareFirmado: consultaDocumentosBD?.Pagare?.estadoValidacion,
  //         cedulaRepresentante:
  //           consultaDocumentosBD?.CedulaRepresentante?.estadoValidacion,
  //         estadoFinanciero:
  //           consultaDocumentosBD?.EstadoFinanciero?.estadoValidacion,
  //         camaraComercio:
  //           consultaDocumentosBD?.CamaraComercio?.estadoValidacion,
  //         contrato: consultaDocumentosBD?.Contrato?.estadoValidacion,
  //         certificacionBancaria:
  //           consultaDocumentosBD?.CertificacionBancaria?.estadoValidacion,
  //       });
  //     })
  //     .catch((err) => console.error(err));
  // }, []);

  // const onChangeFile = useCallback((file, variable, inputElement) => {
  //   if (file) {
  //     const fileName = file.name.toLowerCase();
  //     const extension = fileName.substring(fileName.lastIndexOf(".") + 1);
  //     if (
  //       extension === "pdf" ||
  //       ["jpg", "jpeg", "png", "gif"].includes(extension)
  //     ) {
  //       setFileDocuments((prevState) => ({ ...prevState, [variable]: file }));
  //       setFile({ [variable]: file });
  //     } else {
  //       setFileDocuments((prevState) => ({ ...prevState, [variable]: "" }));
  //       if (inputElement) inputElement.value = null;
  //       notifyError("Solo se permiten archivos PDF o imágenes.");
  //     }
  //   } else {
  //     setFileDocuments((prevState) => ({ ...prevState, [variable]: "" }));
  //   }
  // }, []);

  // const cargar_documentos = useCallback(
  //   async (e) => {
  //     e.preventDefault();
  //     const data = {
  //       id_comercio: roleInfo?.id_comercio,
  //       numero_solicitud: dataCredito?.NroSolicitud,
  //       archivos: {
  //         Pagare: fileDocuments?.pagareFirmado?.name,
  //         CedulaRepresentante: fileDocuments?.cedulaRepresentante?.name,
  //         EstadoFinanciero: fileDocuments?.estadoFinanciero?.name,
  //         CamaraComercio: fileDocuments?.camaraComercio?.name,
  //         Contrato: fileDocuments?.contrato?.name,
  //         CertificacionBancaria: fileDocuments?.certificacionBancaria?.name,
  //       },
  //     };
  //     try {
  //       const respuesta = await fetchData(
  //         URL_CARGA_ARCHIVO_S3,
  //         "POST",
  //         {},
  //         data
  //       );
  //       if (!respuesta?.status) {
  //         notifyError(respuesta?.msg);
  //         consultaCreditos();
  //         setModalOpenPDF(false);
  //       } else {
  //         let respuestaFile = respuesta?.obj;
  //         let allFilesUploaded = true;
  //         const filesToUpload = {
  //           Pagare: respuestaFile?.Pagare,
  //           CedulaRepresentante: respuestaFile?.CedulaRepresentante,
  //           EstadoFinanciero: respuestaFile?.EstadoFinanciero,
  //           CamaraComercio: respuestaFile?.CamaraComercio,
  //           Contrato: respuestaFile?.Contrato,
  //           CertificacionBancaria: respuestaFile?.CertificacionBancaria,
  //         };

  //         const archivos = {
  //           Pagare: fileDocuments?.pagareFirmado,
  //           CedulaRepresentante: fileDocuments?.cedulaRepresentante,
  //           EstadoFinanciero: fileDocuments?.estadoFinanciero,
  //           CamaraComercio: fileDocuments?.camaraComercio,
  //           Contrato: fileDocuments?.contrato,
  //           CertificacionBancaria: fileDocuments?.certificacionBancaria,
  //         };

  //         for (const archivoKey in archivos) {
  //           const file = archivos[archivoKey];
  //           if (file) {
  //             const resFormData = filesToUpload[archivoKey];
  //             if (resFormData) {
  //               const formData2 = new FormData();
  //               for (const property in resFormData?.fields) {
  //                 formData2.set(
  //                   `${property}`,
  //                   `${resFormData?.fields[property]}`
  //                 );
  //               }
  //               formData2.set("file", file);
  //               try {
  //                 const res = await fetch(resFormData?.url, {
  //                   method: "POST",
  //                   body: formData2,
  //                 });
  //                 if (!res.ok) {
  //                   throw new Error(`Error al subir el archivo ${archivoKey}`);
  //                 }
  //               } catch (error) {
  //                 console.error(error);
  //                 throw new Error(`Error al subir el archivo ${archivoKey}`);
  //               }
  //             } else {
  //               console.error(
  //                 `No se encontró la URL de carga para el archivo ${archivoKey}`
  //               );
  //             }
  //           }
  //         }

  //         if (allFilesUploaded) {
  //           const data = {
  //             archivos: {
  //               Pagare: {
  //                 archivo: respuestaFile?.Pagare?.fields?.key,
  //                 estadoValidacion:
  //                   validationStatus.pagareFirmado === undefined
  //                     ? "En Validación"
  //                     : validationStatus.pagareFirmado,
  //               },
  //               CedulaRepresentante: {
  //                 archivo: respuestaFile?.CedulaRepresentante?.fields?.key,
  //                 estadoValidacion:
  //                   validationStatus.cedulaRepresentante === undefined
  //                     ? "En Validación"
  //                     : validationStatus.cedulaRepresentante,
  //               },
  //               EstadoFinanciero: {
  //                 archivo: respuestaFile?.EstadoFinanciero?.fields?.key,
  //                 estadoValidacion:
  //                   validationStatus.estadoFinanciero === undefined
  //                     ? "En Validación"
  //                     : validationStatus.estadoFinanciero,
  //               },
  //               CamaraComercio: {
  //                 archivo: respuestaFile?.CamaraComercio?.fields?.key,
  //                 estadoValidacion:
  //                   validationStatus.camaraComercio === undefined
  //                     ? "En Validación"
  //                     : validationStatus.camaraComercio,
  //               },
  //               Contrato: {
  //                 archivo: respuestaFile?.Contrato?.fields?.key,
  //                 estadoValidacion:
  //                   validationStatus.contrato === undefined
  //                     ? "En Validación"
  //                     : validationStatus.contrato,
  //               },
  //               CertificacionBancaria: {
  //                 archivo: respuestaFile?.CertificacionBancaria?.fields?.key,
  //                 estadoValidacion:
  //                   validationStatus.certificacionBancaria === undefined
  //                     ? "En Validación"
  //                     : validationStatus.certificacionBancaria,
  //               },
  //             },
  //             numero_solicitud: dataCredito?.NroSolicitud,
  //           };

  //           notifyPending(
  //             peticionGuardarDocumentos({}, data),
  //             {
  //               render: () => "Procesando carga de documentos",
  //             },
  //             {
  //               render: ({ data: res }) => {
  //                 consultaCreditos();
  //                 setModalOpenPDF(false);
  //                 setModalOpen(false);
  //                 setFormCarga(false);
  //                 setEstado(0);
  //                 return "Carga de documentos exitosa";
  //               },
  //             },
  //             {
  //               render: ({ data: error }) => {
  //                 if (error?.message) {
  //                   consultaCreditos();
  //                   setModalOpenPDF(false);
  //                   return error?.message;
  //                 } else {
  //                   consultaCreditos();
  //                   setEstado(0);
  //                   setModalOpenPDF(false);
  //                   return "Carga de documentos fallida";
  //                 }
  //               },
  //             }
  //           );
  //         }
  //       }
  //     } catch (err) {
  //       consultaCreditos();
  //       setModalOpenPDF(false);
  //       setEstado(0);
  //       notifyError("Error al cargar Datos");
  //     }
  //   },
  //   [roleInfo, fileDocuments]
  // );

  // const openModal = useCallback(() => {
  //   if (isChecked) {
  //     setChecked(!isChecked);
  //   } else {
  //     postTerminosCondicionesCEACRC().then((res) => {
  //       if (!res?.status) {
  //         notifyError(res?.msg);
  //       } else {
  //         setUrl(res?.obj?.url);
  //         setModalOpenPDF(true);
  //         setShowModal(true);
  //       }
  //     });
  //   }
  // }, [isChecked]);

  // const handleClose = useCallback(() => {
  //   setModalOpen(false);
  //   setFormCarga(false);
  //   setEstado(0);
  //   consultaCreditos();
  // }, []);

  const handleCloseTerminos = useCallback(() => {
    setModalOpenPDF(false);
  }, []);

  // const handleCloseModify = useCallback(() => {
  //   setModifyFile(false);
  //   setShowModal(false);
  // }, []);

  const handleAccept = useCallback(() => {
    setModalOpenPDF(false);
    setChecked(true);
  }, []);

  // const handleModify = (key) => {
  //   setNameFile(key.split("/").pop());
  //   setNameRoute(key);
  //   setModifyFile(true);
  //   setShowModal(true);
  //   setChecked(false);
  // };

  // const handleModificar = useCallback(async (e) => {
  //   e.preventDefault();
  //   const nombre_archivo = nameFile.replace(/\.[^.]+$/, "");
  //   const data = {
  //     archivo: file?.[nombre_archivo]?.name,
  //     ruta_name: nameRoute,
  //     file_modify: nombre_archivo,
  //   };

  //   try {
  //     const respuesta = await fetchData(
  //       URL_MODIFICAR_ARCHIVO_S3,
  //       "POST",
  //       {},
  //       data
  //     );
  //     if (!respuesta?.status) {
  //       notifyError(respuesta?.msg);
  //       consultaCreditos();
  //       setModalOpenPDF(false);
  //     } else {
  //       let respuestaFile = respuesta?.obj;
  //       let allFilesUploaded = true;
  //       const _file = file?.[nombre_archivo];
  //       if (_file) {
  //         const resFormData = respuestaFile[nombre_archivo];
  //         if (resFormData) {
  //           const formData2 = new FormData();
  //           for (const property in resFormData?.fields) {
  //             formData2.set(`${property}`, `${resFormData?.fields[property]}`);
  //           }
  //           formData2.set("file", _file);
  //           try {
  //             const res = await fetch(resFormData?.url, {
  //               method: "POST",
  //               body: formData2,
  //             });
  //             if (!res.ok) {
  //               throw new Error(`Error al subir el archivo ${nombre_archivo}`);
  //             }
  //           } catch (error) {
  //             console.error(error);
  //             throw new Error(`Error al subir el archivo ${nombre_archivo}`);
  //           }
  //         } else {
  //           console.error(
  //             `No se encontró la URL de carga para el archivo ${nombre_archivo}`
  //           );
  //         }
  //       }
  //       if (allFilesUploaded) {
  //         const data = {
  //           nombre_archivo: nombre_archivo,
  //           numero_solicitud: dataCredito?.NroSolicitud,
  //           nueva_ruta: respuestaFile?.[nombre_archivo]?.fields?.key,
  //           nuevo_estado: "En Validación",
  //         };
  //         notifyPending(
  //           peticionActualizarDocumento({}, data),
  //           {
  //             render: () => "Procesando actualización de documento",
  //           },
  //           {
  //             render: ({ data: res }) => {
  //               consultaCreditos();
  //               setModalOpenPDF(false);
  //               setModalOpen(false);
  //               setFormCarga(false);
  //               setEstado(0);
  //               return "Actualización de documento exitosa";
  //             },
  //           },
  //           {
  //             render: ({ data: error }) => {
  //               if (error?.message) {
  //                 consultaCreditos();
  //                 setModalOpenPDF(false);
  //                 return error?.message;
  //               } else {
  //                 consultaCreditos();
  //                 setEstado(0);
  //                 setModalOpenPDF(false);
  //                 return "Actualización de documento fallida";
  //               }
  //             },
  //           }
  //         );
  //       }
  //     }
  //   } catch (err) {
  //     consultaCreditos();
  //     setModalOpenPDF(false);
  //     setEstado(0);
  //     notifyError("Error al cargar Datos");
  //   }
  // }, []);

  // const handleView = useCallback((key) => {
  //   const body = { filename: key };
  //   postDescargarDocumentoValidacion(body)
  //     .then((autoArr) => {
  //       if (autoArr?.status) {
  //         notify(autoArr?.msg);
  //         window.open(autoArr?.obj?.url);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <>
      {/* <div className="text-center">
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
      </div> */}
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
          <Button type="button" design="primary" onClick={handleAccept}>
            Aceptar
          </Button>
        </ButtonBar>
      </Modal>
    </>
  );
};

export default FormAceptarTerminosCEACRC;
