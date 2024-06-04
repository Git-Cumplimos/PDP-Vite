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
import { notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";

type Props = {
  showMassive: boolean;
  setShowMassive: Dispatch<React.SetStateAction<boolean>>;
  searchCommercesFn: () => void | Promise<void>;
};

const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
// const urlComercios = `http://localhost:5000`;

const CrearComerciosMasivo = ({
  showMassive,
  setShowMassive,
  searchCommercesFn,
}: Props) => {
  const { pdpUser } = useAuth();
  const [fileUpload, setFileUpload] = useState<File>();

  const currentUserId = useMemo(
    () => (pdpUser ?? { uuid: 0 })?.uuid,
    [pdpUser]
  );

  const handleClose = useCallback(() => {
    setShowMassive(false);
    setFileUpload(undefined);
  }, [setShowMassive]);

  const [downloadFormatCommerce] = useFetchDebounce(
    { url: `${urlComercios}/comercios/masivo`, autoDispatch: false },
    {
      onPending: useCallback(() => "Buscando formato", []),
      onSuccess: useCallback((res) => {
        for (let url of (res?.obj ?? [])) {
          window.open(url, "_blank");
        }
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

  const [uploadCommerceFile, loadingUploadFile] = useFetchDebounce(
    {
      url: `${urlComercios}/comercios/masivo`,
      autoDispatch: false,
      options: useMemo(() => {
        const formData = new FormData();
        formData.append("file", fileUpload as Blob);
        formData.append("usuario_ultima_actualizacion", `${currentUserId}`);
        return {
          method: "POST",
          body: formData,
        };
      }, [fileUpload, currentUserId]),
    },
    {
      onPending: useCallback(() => "Cargando archivo", []),
      onSuccess: useCallback(
        (response) => {
          if (!response.ok) {
            if (response.headers.get("Content-Type")?.includes("csv")) {
              response
                .blob()
                .then((blob: Blob) => {
                  const urlFile = URL.createObjectURL(blob);
                  try {
                    const filename = response.headers.get("Content-Disposition").split("; ")?.[1].split("=")?.[1] + ".csv";
                    const a = document.createElement("a");
                    a.href = urlFile;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    URL.revokeObjectURL(urlFile);
                    document.body.removeChild(a);

                  } catch {
                    window.open(urlFile, '_blank');
                  }
                })
                .catch((error: any) => console.error(error));
            } else {
              response
                .json()
                .then((res: any) => console.log(res))
                .catch((error: any) => console.error(error));
            }
            // throw new Error("Error con archivo cargado", { cause: "custom" });
            // notifyError("Error con archivo cargado");
            return "Error con archivo cargado";
            // return "Carga finalizada";
          }
          searchCommercesFn?.();
          handleClose();
          return "Carga satisfactoria";
        },
        [handleClose, searchCommercesFn]
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          // notifyError(error.message);
          return error.message;
        } else {
          console.error(error);
          return "Error cargando el archivo";
        }
      }, []),
    },
    { notify: true, checkStatus: false }
  );

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      uploadCommerceFile();
    },
    [uploadCommerceFile]
  );

  return (
    <Fragment>
      <Modal
        show={showMassive}
        handleClose={loadingUploadFile ? () => { } : handleClose}
      >
        <Form onSubmit={onSubmit}>
          <ButtonBar>
            <Button type="button" onClick={downloadFormatCommerce}>
              Descargar archivo de ejemplo
            </Button>
            <Button type="submit" disabled={!fileUpload || loadingUploadFile}>
              Subir archivo
            </Button>
          </ButtonBar>
          {!fileUpload && (
            <FileInput
              label={"Adjuntar archivo de comercios a cargar"}
              onGetFile={(files: Array<File>) => {
                // console.log(files);
                setFileUpload(files[0]);
              }}
              accept=".csv"
              allowDrop
            />
          )}
          {fileUpload && (
            <Fieldset legend={"Archivo cargado"}>
              <div>
                <div className="grid grid-cols-8 gap-4 justify-items-center">
                  <span className="text-3xl text-primary-light col-span-1 bi bi-file-earmark-plus-fill" />
                  <p className="col-span-6 self-center">{fileUpload.name}</p>
                  <span
                    className="text-3xl text-red-700 col-span-1 bi bi-trash-fill cursor-pointer"
                    onClick={
                      loadingUploadFile
                        ? () => { }
                        : () => setFileUpload(undefined)
                    }
                  />
                </div>
              </div>
            </Fieldset>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default CrearComerciosMasivo;
