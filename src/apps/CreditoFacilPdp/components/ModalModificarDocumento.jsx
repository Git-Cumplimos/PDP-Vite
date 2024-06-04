import { useCallback } from "react";
import Form from "../../../components/Base/Form/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { useFetch } from "../../../hooks/useFetch";
import { notifyError, notifyPending } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import Fieldset from "../../../components/Base/Fieldset";

const URL_ACTUALIZAR_DOCUMENTO_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/actualizacion-documento-guardado`;
const URL_MODIFICAR_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/validacion-documentos/carga-documentos-modificar`;

const documentTypes = [
  { key: "Pagare.pdf", label: "Pagaré Firmado" },
  { key: "CedulaRepresentante.pdf", label: "Cédula del Representante Legal" },
  { key: "EstadoFinanciero.pdf", label: "Estados Financieros" },
  { key: "CamaraComercio.pdf", label: "Cámara de Comercio" },
  { key: "Contrato.pdf", label: "Contrato" },
  { key: "CertificacionBancaria.pdf", label: "Certificación Bancaria" },
];

const ModalModificarDocumento = ({
  setModifyFile,
  setShowModal2,
  showModal2,
  setFile,
  nameFile,
  consultaCreditos,
  file,
  setModalOpenPDF,
  nameRoute,
  dataCredito,
  setEstado,
  consultaDocumentos,
}) => {
  const [loadingPeticionActualizarDocumento, peticionActualizarDocumento] =
    useFetch(
      fetchCustom(
        URL_ACTUALIZAR_DOCUMENTO_TBL_MOVIMIENTOS,
        "POST",
        "Actualizar documento"
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
        setFile({ [variable]: file });
      } else {
        if (inputElement) inputElement.value = null;
        notifyError("Solo se permiten archivos PDF o imágenes.");
      }
    } else {
      setFile({ [variable]: "" });
    }
  }, []);

  const handleCloseModify = useCallback(() => {
    setModifyFile(false);
    setShowModal2(false);
  }, []);

  const handleModificar = useCallback(
    async (e) => {
      e.preventDefault();
      const nombre_archivo = nameFile.replace(/\.[^.]+$/, "");
      const data = {
        archivo: file?.[nombre_archivo]?.name,
        ruta_name: nameRoute,
        file_modify: nombre_archivo,
      };

      try {
        const respuesta = await fetchData(
          URL_MODIFICAR_ARCHIVO_S3,
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
          const _file = file?.[nombre_archivo];
          if (_file) {
            const resFormData = respuestaFile[nombre_archivo];
            if (resFormData) {
              const formData2 = new FormData();
              for (const property in resFormData?.fields) {
                formData2.set(
                  `${property}`,
                  `${resFormData?.fields[property]}`
                );
              }
              formData2.set("file", _file);
              try {
                const res = await fetch(resFormData?.url, {
                  method: "POST",
                  body: formData2,
                });
                if (!res.ok) {
                  throw new Error(
                    `Error al subir el archivo ${nombre_archivo}`
                  );
                }
              } catch (error) {
                console.error(error);
                throw new Error(`Error al subir el archivo ${nombre_archivo}`);
              }
            } else {
              console.error(
                `No se encontró la URL de carga para el archivo ${nombre_archivo}`
              );
            }
          }
          if (allFilesUploaded) {
            const data = {
              nombre_archivo: nombre_archivo,
              numero_solicitud: dataCredito?.NroSolicitud,
              nueva_ruta: respuestaFile?.[nombre_archivo]?.fields?.key,
              nuevo_estado: "En Validación",
            };
            notifyPending(
              peticionActualizarDocumento({}, data),
              {
                render: () => "Procesando actualización de documento",
              },
              {
                render: ({ data: res }) => {
                  setShowModal2(false);
                  consultaDocumentos();
                  return "Actualización de documento exitosa";
                },
              },
              {
                render: ({ data: error }) => {
                  if (error?.message) {
                    consultaCreditos();
                    setModalOpenPDF(false);
                    setModifyFile(false);
                    return error?.message;
                  } else {
                    consultaCreditos();
                    setEstado(0);
                    setModalOpenPDF(false);
                    setModifyFile(false);
                    return "Actualización de documento fallida";
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
    [dataCredito, nameFile, nameRoute, file]
  );

  return (
    <>
      <Form formDir="col" onSubmit={handleModificar}>
        <Modal
          show={showModal2}
          handleClose={handleCloseModify}
          className="flex align-middle"
        >
          <br />
          <Fieldset className="lg:col-span-2">
            <h1 className="text-2xl text-center mt-5">
              {documentTypes.find((doc) => doc.key === nameFile)?.label}
            </h1>
            <Input
              type="file"
              id={nameFile}
              name={nameFile}
              accept=".pdf,image/*"
              onChange={(e) =>
                onChangeFile(
                  e.target.files[0],
                  nameFile.replace(/\.[^.]+$/, ""),
                  e.target
                )
              }
              required
            />
          </Fieldset>
          <ButtonBar>
            <Button onClick={() => setShowModal2(false)}>Cancelar</Button>
            <ButtonBar>
              <Button
                type="submit"
                disabled={loadingPeticionActualizarDocumento}
              >
                Modificar
              </Button>
            </ButtonBar>
          </ButtonBar>
        </Modal>
      </Form>
    </>
  );
};

export default ModalModificarDocumento;
