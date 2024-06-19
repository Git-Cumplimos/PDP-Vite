import React, { Fragment, useCallback, useMemo, useState } from "react";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import FileInput from "../../../../components/Base/FileInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import { PermissionsIAM } from "../../permissions";
import Modal from "../../../../components/Base/Modal";
import { notifyError } from "../../../../utils/notify";
import { toast } from "react-toastify";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Fieldset from "../../../../components/Base/Fieldset";

type Props = {};

const urlIam = `${process.env.REACT_APP_URL_IAM_PDP}`;
// const urlIam = `http://localhost:5000`;

const toastIdCarga = "carga-archivo-123";
const toastDoneOptions = {
  isLoading: false,
  autoClose: 5000,
  closeButton: true,
  draggable: true,
  closeOnClick: true,
};

const IAMRecoverQRMassive = (props: Props) => {
  const { userPermissions, pdpUser } = useAuth();

  const [loadFile, setLoadFile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fileUpload, setFileUpload] = useState<File>();

  const currentUserId = useMemo(
    () => (pdpUser ?? { uuid: 0 })?.uuid,
    [pdpUser]
  );

  const listaPermisos = useMemo(
    () =>
      userPermissions
        .map(({ id_permission }) => id_permission)
        .filter((id_permission) => id_permission === PermissionsIAM.reset_mfa),
    [userPermissions]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setLoadFile(false);
    setFileUpload(undefined);
  }, []);

  const [downloadFormatCommerce] = useFetchDebounce(
    { url: `${urlIam}/user-reset-masivo`, autoDispatch: false },
    {
      onPending: useCallback(() => "Buscando formato", []),
      onSuccess: useCallback((response) => {
        if (response.headers.get("Content-Type")?.includes("csv")) {
          response
            .blob()
            .then((blob: Blob) => {
              const urlFile = URL.createObjectURL(blob);
              try {
                const filename = response.headers
                  .get("Content-Disposition")
                  .split("; ")?.[1]
                  .split("=")?.[1];

                const a = document.createElement("a");
                a.href = urlFile;
                a.download = filename.replace(/"/g, "");
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(urlFile);
                document.body.removeChild(a);
              } catch {
                window.open(urlFile, "_blank");
              }
            })
            .catch((error: any) => console.error(error));
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
    { notify: true, checkStatus: false }
  );

  const [uploadCommerceFile, loadingUploadFile] = useFetchDebounce(
    {
      url: `${urlIam}/user-reset-masivo`,
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
      onPending: useCallback(
        () => toast.loading("Cargando archivo", { toastId: toastIdCarga }),
        []
      ),
      onSuccess: useCallback(
        async (response) => {
          if (response.headers.get("Content-Type")?.includes("zip")) {
            response
              .blob()
              .then((blob: Blob) => {
                const urlFile = URL.createObjectURL(blob);
                try {
                  const filename =
                    response.headers
                      .get("Content-Disposition")
                      .split("; ")?.[1]
                      .split("=")?.[1];
                  const a = document.createElement("a");
                  a.href = urlFile;
                  a.download = filename.replace(/"/g, "");
                  document.body.appendChild(a);
                  a.click();
                  URL.revokeObjectURL(urlFile);
                  document.body.removeChild(a);
                } catch {
                  window.open(urlFile, "_blank");
                }
              })
              .catch((error: any) => console.error(error));
          } else {
            const res = await response.json();

            if (res && "msg" in res) {
              toast.update(toastIdCarga, {
                render: res?.msg,
                type: "warning",
                ...toastDoneOptions,
              });
              return;
            }
          }
          if (!response.ok) {
            toast.update(toastIdCarga, {
              render: "Error con archivo cargado",
              type: "warning",
              ...toastDoneOptions,
            });
            return;
          }
          handleClose();
          toast.update(toastIdCarga, {
            render: "Carga satisfactoria",
            type: "info",
            ...toastDoneOptions,
          });
        },
        [handleClose]
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          toast.update(toastIdCarga, {
            render: error.message,
            type: "warning",
            ...toastDoneOptions,
          });
        } else {
          console.error(error);
          toast.update(toastIdCarga, {
            render: "Error cargando el archivo",
            type: "warning",
            ...toastDoneOptions,
          });
        }
      }, []),
    },
    { checkStatus: false }
  );

  if (!listaPermisos.length) {
    return <Fragment />;
  }

  return (
    <Fragment>
      <Button
        type={"submit"}
        onClick={() => {
          setShowModal(true);
        }}
      >
        Recuperación de QR Masiva
      </Button>
      <Modal show={showModal} handleClose={null}>
        <h1 className="text-2xl text-center">
          {!loadFile
            ? "Gestión de archivo masivo recuperación de QR y contraseña"
            : "Cargue de archivo masivo recuperación de QR y contraseña"}
        </h1>
        <Form onSubmit={(ev) => ev.preventDefault()} grid>
          {!loadFile ? (
            <ButtonBar>
              <Button onClick={downloadFormatCommerce}>
                Descargar formato de archivo
              </Button>
              <Button type="submit" onClick={() => setLoadFile(true)}>
                Cargar archivo
              </Button>
              <Button onClick={handleClose} disabled={loadingUploadFile}>
                Cancelar
              </Button>
            </ButtonBar>
          ) : (
            <Fragment>
              {!fileUpload && (
                <FileInput
                  label={"Adjuntar archivo"}
                  onGetFile={(files: Array<File>) => {
                    if (files[0].type !== "text/csv") {
                      notifyError(
                        "Solo se permite un archivo separado por comas (csv)"
                      );
                      return;
                    }
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
                      <p className="col-span-6 self-center">
                        {fileUpload.name}
                      </p>
                      <span
                        className="text-3xl text-red-700 col-span-1 bi bi-trash-fill cursor-pointer"
                        onClick={
                          loadingUploadFile
                            ? () => {}
                            : () => setFileUpload(undefined)
                        }
                      />
                    </div>
                  </div>
                </Fieldset>
              )}
              <ButtonBar>
                <Button
                  type="submit"
                  onClick={uploadCommerceFile}
                  disabled={!fileUpload || loadingUploadFile}
                >
                  Cargar archivo
                </Button>
                <Button
                  onClick={() => {
                    handleClose();
                    notifyError("Cargue masivo cancelado por el usuario");
                  }}
                  disabled={loadingUploadFile}
                >
                  Cancelar
                </Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default IAMRecoverQRMassive;
