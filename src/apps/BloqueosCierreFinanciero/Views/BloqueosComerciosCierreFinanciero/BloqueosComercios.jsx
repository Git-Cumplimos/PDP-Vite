import { useNavigate } from "react-router-dom";
import { Fragment, useCallback, useMemo, useState } from "react";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import ConsultaComerciosBloqueados from "../../components/ConsultaComerciosBloqueados/ConsultaComerciosBloqueados";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { descargarCSV } from "../../utils/functions";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import {
  updateComercioMassive, 
  verifyFileComerceMassive
} from "../../utils/fetchComerciosCierreFinanciero"
import { notifyError,notify } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";

const BloqueoComerciosCierre = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { pdpUser } = useAuth();
  const [showMainModal, setShowMainModal] = useState(false);
  const typoArchivos = ["text/csv"];
  const [showModalErrors, setShowModalErrors] = useState(false);
  const [file, setFile] = useState(null);
  const [filerror, setFilerror] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  let fechaActual = new Date();
  let fechaIso = fechaActual.toISOString();
  let fechaHoraFormateada = fechaIso.replace(/[-:T.]/g, "").slice(0, 14);
  const createdfile = true
  const [showModalReport, setShowModalReport] = useState(false);
  const [reloadComercios, setReloadComercios] = useState(false);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setShowMainModal(false);
    setShowModalErrors(false);
  }, []);

  const CargarArchivo = useCallback(
    async (e) => {
      e.preventDefault();
      if (!typoArchivos.includes(file.type)) {
        notifyError("Tipo de archivo incorrecto");
        return;
      }
      const nombreArchivo = `Reporte_bloqueos_${fechaHoraFormateada}.xlsx`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("usuario_ultima_actualizacion", pdpUser?.uuid);
      formData.append("fecha_actual_ft", fechaHoraFormateada);
      setIsUploading(true);
      updateComercioMassive(formData)
        .then(async (res) => {
          if (res.status !== 504) {
            const filename = res.headers
              .get("Content-Disposition")
              .split("; ")?.[1]
              .split("=")?.[1];
            if (filename !== nombreArchivo) {
              setFilerror(res);
              setShowModalErrors(true);
              setShowModalReport(false);
              notifyError("Archivo erróneo");
              setIsUploading(false);
            } else {
              setFilerror(res);
              setShowModalErrors(true);
              setShowModalReport(true);
              notify("Registros actualizados exitosamente");
              setIsUploading(false);
              setReloadComercios((prev) => !prev);
            }
          } else {
            while (createdfile) {
              try {
                const verificationResponse = await verifyFileComerceMassive({
                  filename: nombreArchivo,
                });
                if (verificationResponse?.obj !== false) {
                  window.open(verificationResponse?.obj);
                  setIsUploading(false);
                  handleClose();
                  notify("Registros actualizados exitosamente");
                  setReloadComercios((prev) => !prev);
                  break;
                }
              } catch (error) {
                console.error(error);
                handleClose();
                notifyError("Errores al crear masivo");
                setIsUploading(false);
                break;
              }
              await wait(7000);
              notify("Procesando los registros...")
            }
          }
        })
        .catch((err) => {
          console.error(err);
          notifyError("No se pudo conectar al servidor");
          setIsUploading(false);
        });
    },
    [handleClose, pdpUser?.uuid , file, fechaHoraFormateada, createdfile]
  );

  async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const [res] = useState([
    [
      "ID COMERCIO",
      "TIPO DE MOVIMIENTO 1 INACTIVAR 2 ACTIVAR",
    ],
    [
      "59",
      "1",
    ],
    [
      "12529",
      "1",
    ],
    [
      "23525",
      "2",
    ],
    [
      "123547",
      "2",
    ],
  ]);

  const descargarPlantilla = useCallback(() => {
    descargarCSV("Formato Bloqueo Comercio Cierre Financiero", res);
  }, [res]);

  const DescargarErrores = useCallback(async () => {
    const contentDisposition = filerror.headers.get("Content-Disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : 'error_file.xlsx';
      filerror.blob().then((blob) => {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          const exportUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = exportUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(exportUrl);
          document.body.removeChild(a);
        }
      });
    } else {
      console.error("Sin archivo de errores para descargar.");
      notifyError("Sin archivo de errores para descargar.");
    }
    handleClose();
  }, [filerror, handleClose]);

  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl mt-6">Bloqueo Comercios Por Cierre Financiero</h1>
      <ButtonBar>
        <Button onClick={() => navigate("crear")} type='submit'>
          Bloquear Comercio
        </Button>
        <Button  type='submit' onClick={() => {setShowModal(true);}}>
          Bloqueo - Desbloqueo Masivo
        </Button>
      </ButtonBar>
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="mx-auto mb-4 text-3xl text-center">
          Bloqueo - Desbloqueo Masivo de Comercios
        </h2>
        <ButtonBar>
          <Button
            onClick={() => {
              descargarPlantilla();
            }}
          >
            Descargar formato de archivo
          </Button>
          <Button
            onClick={() => {
              setShowMainModal(true);
            }}
          >
            Seleccionar archivo
          </Button>
        </ButtonBar>
      </Modal>
      <Modal show={showMainModal} handleClose={handleClose}>
        <h2 className="mx-auto mb-4 text-3xl text-center">
          Bloqueo - Desbloqueo Masivo de Comercios
        </h2>
        <Form onSubmit={CargarArchivo}>
          <Input
            type="file"
            autoComplete="off"
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
            accept=".csv"
            required
          />
          <ButtonBar>
            <Button type="submit">Subir archivo</Button>
          </ButtonBar>
        </Form>
      </Modal>
      <Modal show={showModalErrors} handleClose={handleClose}>
        <h2 className="mx-auto mb-4 text-2xl text-center">
          {showModalReport ? "Reporte de bloqueos" : "Errores en el archivo"}
        </h2>
        <ButtonBar>
          <Button
            onClick={() => {
              DescargarErrores();
            }}
          >
            {showModalReport
              ? "Descargar Reporte de bloqueos"
              : "Descargar errores del archivo"}
          </Button>
        </ButtonBar>
      </Modal>
      <ConsultaComerciosBloqueados navigate={navigate} key={reloadComercios} />
    </Fragment>
  );
};

export default BloqueoComerciosCierre;