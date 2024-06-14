import { useCallback, useEffect} from "react";
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
  { key: "Pagare", label: "Pagaré Firmado" },
  { key: "CedulaRepresentante", label: "Cédula del Representante Legal" },
  { key: "EstadoFinanciero", label: "Estados Financieros" },
  { key: "CamaraComercio", label: "Cámara de Comercio" },
  { key: "Contrato", label: "Contrato" },
  { key: "CertificacionBancaria", label: "Certificación Bancaria" },
];

const ModalCambioEstadoDocumentos = ({
  setModifyFile,
  setShowModal2,
  showModal2,
  nameFile,
  file,
  setModalOpenPDF,
  nameRoute,
  dataCredito,
  setEstado,
  estadoDocumento,
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


  const handleCloseModify = useCallback(() => {
    setModifyFile(false);
    setShowModal2(false);
  }, []);

  useEffect(() => {
    consultaDocumentos();
  }, []);

  const handleModificar = useCallback(
    async (e) => {
      e.preventDefault();
      const nombre_archivo = nameFile.replace(/\.[^.]+$/, "");
      const data = {
        nombre_archivo: nombre_archivo,
        numero_solicitud: dataCredito?.NroSolicitud,
        nuevo_estado: estadoDocumento,
      };
      notifyPending(
        peticionActualizarDocumento({}, data),
        {
          render: () => "Procesando actualización estado documento",
        },
        {
          render: ({ data: res }) => {
            setShowModal2(false);
            consultaDocumentos();
            return "Actualización estado de documento exitoso";
          },
        },
        {
          render: ({ data: error }) => {
            if (error?.message) {
              consultaDocumentos();
              setModalOpenPDF(false);
              setModifyFile(false);
              return error?.message;
            } else {
              consultaDocumentos();
              setEstado(0);
              setModalOpenPDF(false);
              setModifyFile(false);
              return "Actualización estado de documento fallido";
            }
          },
        }
      );
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
          {estadoDocumento === "Aprobado" ? (
            <h1 className="text-xl text-center mt-2 font-semibold">
              ¿Está seguro de aprobar el documento{" "}
              {documentTypes.find((doc) => nameFile.includes(doc.key))?.label}?
            </h1>
          ) : (
            <h1 className="text-xl text-center mt-2 font-semibold">
              ¿Está seguro de rechazar el documento{" "}
              {documentTypes.find((doc) => nameFile.includes(doc.key))?.label}?
            </h1>
          )}

          <br />
          <ButtonBar>
            <Button onClick={() => setShowModal2(false) }>Cancelar</Button>
            <ButtonBar>
              <Button
                type="submit"
                disabled={loadingPeticionActualizarDocumento}
              >
                Aceptar
              </Button>
            </ButtonBar>
          </ButtonBar>
        </Modal>
      </Form>
    </>
  );
};

export default ModalCambioEstadoDocumentos;
