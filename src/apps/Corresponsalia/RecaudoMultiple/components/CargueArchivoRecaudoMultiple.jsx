import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import { notify, notifyError } from "../../../../utils/notify";
import fetchData from "../../../../utils/fetchData";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import Form from "../../../../components/Base/Form/Form";
import InputX from "../../../../components/Base/InputX/InputX";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";

const url_cargueS3 = `${process.env.REACT_APP_RECAUDO_MULTIPLE}/cargue-archivo-recaudo-multiple`;

const CargueArchivoRecaudoMultiple = ({
  setIsUploading,
  setEstadoTrx,
  roleInfo,
  setFileName,
  pdpUser,
}) => {
  const [file, setFile] = useState({});

  const onChangeFile = (files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        setFile(m_file);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  //------------------Funcion Para Subir El Formulario---------------------//
  const saveFile = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const query = {
        contentType: "application/text",
        filename: `archivo_recaudo_multiple/${file.name}`,
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          nombre_comercio: roleInfo?.["nombre comercio"],
          nombre_usuario: pdpUser?.uname ?? "",
          is_oficina_propia:
            roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
            roleInfo?.tipo_comercio === "KIOSCO"
              ? true
              : false,
        },
        ubicacion: {
          address: roleInfo?.direccion,
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.ciudad,
        },
      };
      fetchData(url_cargueS3, "POST", {}, query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
            setIsUploading(false);
          } else {
            // setEstadoForm(true);
            const formData2 = new FormData();
            if (file) {
              const resFormData = respuesta?.obj?.url;
              for (const property in resFormData?.fields) {
                formData2.set(
                  `${property}`,
                  `${resFormData?.fields[property]}`
                );
              }
              formData2.set("file", file);
              fetch(`${resFormData?.url}`, {
                method: "POST",
                body: formData2,
              })
                .then(async (res) => {
                  if (res?.ok) {
                    notify("Se ha subido exitosamente el archivo");
                    setFileName(respuesta?.obj?.fileName);
                    setEstadoTrx(1);
                    setIsUploading(false);
                  } else {
                    notifyError("No fue posible conectar con el Bucket");
                  }
                  setIsUploading(false);
                })
                .catch((err) => {
                  notifyError("Error al cargar el archivo");
                  console.error(err);
                  setIsUploading(false);
                }); /* notify("Se ha comenzado la carga"); */
            }
          }
        })
        .catch((err) => {
          notifyError("Error al cargar Datos");
          setIsUploading(false);
        }); /* notify("Se ha comenzado la carga"); */
    },
    [file, roleInfo]
  );
  return (
    <>
      <Form formDir='col' onSubmit={saveFile}>
        <Fieldset legend='Archivo Recaudo Múltiple' className='lg:col-span-2'>
          <h1 className='text-2xl text-center mb-10 mt-5'>
            Cargue archivo recaudo múltiple
          </h1>
          <InputX
            id={`archivo`}
            label={file.name ? "Cambiar archivo" : `Elegir archivo`}
            type='file'
            // disabled={progress !== 0}
            accept='.csv'
            onGetFile={onChangeFile}
          />
          {file.name ? (
            <>
              <h2 className='text-l text-center mt-5'>
                {`Archivo seleccionado: ${file.name}`}
              </h2>
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    setFile({});
                  }}>
                  Cancelar
                </Button>
                <Button type='submit'>Subir</Button>
              </ButtonBar>
            </>
          ) : (
            ""
          )}
        </Fieldset>
      </Form>
    </>
  );
};

export default CargueArchivoRecaudoMultiple;
