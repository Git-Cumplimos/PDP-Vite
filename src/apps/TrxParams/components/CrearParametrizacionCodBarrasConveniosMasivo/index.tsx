import React, {
  Dispatch,
  Fragment,
  useCallback,
  useMemo,
  useState,
} from "react";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Form from "../../../../components/Base/Form";
import FileInput from "../../../../components/Base/FileInput";
import Modal from "../../../../components/Base/Modal";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Fieldset from "../../../../components/Base/Fieldset";
import { notifyPending } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useFetchCargueMasivo } from "../../hooks/fetchCargueMasivo";

type Props = {
  showMassive: boolean;
  setShowMassive: Dispatch<React.SetStateAction<boolean>>;
};

const urlConvenios =
  import.meta.env.VITE_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
const URL_CARGUE_ARCHIVO_PARAM = `${import.meta.env.VITE_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/convenios-pdp/parametrizar-codigos-barras-convenios-masivo`;
const URL_ESTADO_CARGUE_ARCHIVO_PARAM = `${import.meta.env.VITE_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/convenios-pdp/comprobar-cargue-archivo-param-cod-barras`;
// const urlConvenios = `http://localhost:5000`;

const CrearParametrizacionCodBarrasConveniosMasivo = ({
  showMassive,
  setShowMassive,
}: Props) => {
  const validNavigate = useNavigate();
  const { pdpUser } = useAuth();
  const [uuidTemp, setUuidTemp] = useState(v4());
  const [fileUpload, setFileUpload] = useState<File>();
  const [loadingPeticionConsulta, peticionCargueMasivo] = useFetchCargueMasivo(
    URL_CARGUE_ARCHIVO_PARAM,
    URL_ESTADO_CARGUE_ARCHIVO_PARAM,
    "Cargue masivo parametrización código de barras"
  );
  const currentUserId = useMemo(
    () => (pdpUser ?? { uuid: 0 })?.uuid,
    [pdpUser]
  );

  const handleClose = useCallback(() => {
    setShowMassive(false);
    setFileUpload(undefined);
    setUuidTemp(v4());
  }, [setShowMassive]);

  const [downloadFormatParam] = useFetchDebounce(
    {
      url: `${urlConvenios}/convenios-pdp/parametrizar-codigos-barras-convenios-masivo`,
      autoDispatch: false,
    },
    {
      onPending: useCallback(() => "Buscando formato", []),
      onSuccess: useCallback((res) => {
        window.open(res?.obj, "_blank");
        return "Formato obtenido";
      }, []),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          // notifyError(error.message);
          return error.message;
        } else {
          console.error(error);
          return "Error buscando el formato";
        }
      }, []),
    },
    { notify: true }
  );
  const realizarCargueMasivo = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData();
      formData.append("file", fileUpload as Blob);
      formData.append("usuario_ultima_actualizacion", `${currentUserId}`);
      formData.append("uuid_proceso_archivo", uuidTemp);
      const dataAditional = {
        id_uuid_trx: uuidTemp,
      };
      if (typeof peticionCargueMasivo === "function") {
        notifyPending(
          peticionCargueMasivo(formData, dataAditional),
          {
            render: () => {
              return "Cargando archivo";
            },
          },
          {
            render: ({ data: res }) => {
              handleClose();
              validNavigate(-1);
              return "Carga satisfactoria";
            },
          },
          {
            render: ({ data: error }) => {
              if (error.hasOwnProperty("optionalObject")) {
                if (error.optionalObject.hasOwnProperty("archivoErrores")) {
                  const urlFile = URL.createObjectURL(
                    error.optionalObject.archivoErrores
                  );
                  const a = document.createElement("a");
                  a.href = urlFile;
                  const actualDate = new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    second: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: false,
                  }).format(new Date());
                  a.download =
                    `Errores_parametrizacion_masiva_convenios_${actualDate}`.replace(
                      ",",
                      ""
                    );
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              }
              validNavigate(-1);
              handleClose();
              return error?.message ?? "Error cargando el archivo";
            },
          }
        );
      }
    },
    [fileUpload, uuidTemp, currentUserId]
  );

  return (
    <Fragment>
      <Modal
        show={showMassive}
        handleClose={loadingPeticionConsulta ? () => {} : handleClose}
      >
        <Form onSubmit={realizarCargueMasivo}>
          <ButtonBar>
            <Button
              type="button"
              onClick={downloadFormatParam}
              disabled={fileUpload}
            >
              Descargar archivo de ejemplo
            </Button>
          </ButtonBar>
          {!fileUpload && (
            <FileInput
              label={"Adjuntar archivo de parametrizaciones a cargar"}
              onGetFile={(files: Array<File>) => {
                setFileUpload(files[0]);
              }}
              accept=".csv"
              allowDrop
            />
          )}
          {fileUpload && (
            <>
              <Fieldset legend={"Archivo cargado"}>
                <div>
                  <div className="grid grid-cols-8 gap-4 justify-items-center">
                    <span className="text-3xl text-primary-light col-span-1 bi bi-file-earmark-plus-fill" />
                    <p className="col-span-6 self-center">{fileUpload.name}</p>
                    <span
                      className="text-3xl text-red-700 col-span-1 bi bi-trash-fill cursor-pointer"
                      onClick={
                        loadingPeticionConsulta
                          ? () => {}
                          : () => setFileUpload(undefined)
                      }
                    />
                  </div>
                </div>
              </Fieldset>
              <ButtonBar>
                <Button
                  type="submit"
                  disabled={!fileUpload || loadingPeticionConsulta}
                >
                  Subir archivo
                </Button>
              </ButtonBar>
            </>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default CrearParametrizacionCodBarrasConveniosMasivo;
