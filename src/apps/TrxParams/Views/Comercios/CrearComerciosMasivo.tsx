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

type Props = {
  showMassive: boolean;
  setShowMassive: Dispatch<React.SetStateAction<boolean>>;
};

// const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
const urlComercios = `http://localhost:5000`;

const CrearComerciosMasivo = ({ showMassive, setShowMassive }: Props) => {
  const [fileUpload, setFileUpload] = useState<File>();

  const handleClose = useCallback(() => {
    setShowMassive(false);
    setFileUpload(undefined);
  }, [setShowMassive]);

  const [downloadFormatCommerce] = useFetchDebounce(
    { url: `${urlComercios}/comercios/masivo`, autoDispatch: false },
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

  const [uploadCommerceFile] = useFetchDebounce(
    {
      url: `${urlComercios}/comercios/masivo`,
      autoDispatch: false,
      options: useMemo(() => {
        const formData = new FormData();
        formData.append("file", fileUpload as Blob);
        return {
          method: "POST",
          body: formData,
        };
      }, [fileUpload]),
    },
    {
      onPending: useCallback(() => "Cargando archivo", []),
      onSuccess: useCallback((response) => {
        if (!response.ok) {
          console.log(
            "Has csv",
            response.headers.get("Content-Type")?.includes("csv")
          );
          console.log(
            "Has json",
            response.headers.get("Content-Type")?.includes("json")
          );
          if (response.headers.get("Content-Type")?.includes("csv")) {
            response
              .blob()
              .then((blob: Blob) => {
                const urlFile = URL.createObjectURL(blob);
                window.open(urlFile, "_blank");
              })
              .catch((error: any) => console.error(error));
          } else {
            response
              .json()
              .then((res: any) => console.log(res))
              .catch((error: any) => console.error(error));
          }
          return "Error con archivo cargado";
        }
        return "Carga satisfactoria";
      }, []),
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
      <Modal show={showMassive} handleClose={handleClose}>
        <ButtonBar>
          <Button type="button" onClick={downloadFormatCommerce}>
            Descargar archivo de comercios
          </Button>
          <Button type="button" onClick={handleClose}>
            Cancelar
          </Button>
        </ButtonBar>
        <Form onSubmit={onSubmit}>
          <FileInput
            label={"Adjuntar archivo de comercios a cargar"}
            onGetFile={(files: Array<File>) => {
              console.log(files);
              setFileUpload(files[0]);
            }}
            accept=".csv"
            allowDrop
          />
          {fileUpload && (
            <Fieldset legend={"Archivo cargado"}>
              <div>
                <div className="grid grid-cols-8 gap-4 justify-items-center">
                  <span className="text-3xl text-primary-light col-span-1 bi bi-file-earmark-plus-fill" />
                  <p className="col-span-6 self-center">{fileUpload.name}</p>
                  <span
                    className="text-3xl text-red-700 col-span-1 bi bi-trash-fill cursor-pointer"
                    onClick={() => setFileUpload(undefined)}
                  />
                </div>
              </div>
            </Fieldset>
          )}
          <ButtonBar>
            <Button type="submit">Subir archivo</Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default CrearComerciosMasivo;
