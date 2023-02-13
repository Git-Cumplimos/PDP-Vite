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

const CargueArchivoRecaudoMultiple = ({setIsUploading, setEstadoTrx, roleInfo}) => {
  const [file, setFile] = useState({});

  const onChangeFile = (files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        // console.log(m_file);
        setFile(m_file);
        // setFileName(m_file.name);
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
        filename: `archivo_convenios_aval/${file.name}`,
        "comercio":{
            "id_comercio": roleInfo?.id_comercio,
            "id_usuario": roleInfo?.id_usuario,
            "id_terminal": roleInfo?.id_dispositivo,
            "nombre_comercio": roleInfo?.["nombre comercio"]
        },
        "ubicacion":{
            "address": roleInfo?.direccion,
            "dane_code": roleInfo?.codigo_dane,
            "city":roleInfo?.ciudad
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
              for (const property in respuesta?.obj?.fields) {
                formData2.set(
                  `${property}`,
                  `${respuesta?.obj?.fields[property]}`
                );
              }
              formData2.set("file", file);
              fetch(`${respuesta?.obj?.url}`, {
                method: "POST",
                body: formData2,
              })
                .then(async (res) => {
                  if (res?.ok) {
                    notify(
                      "Se ha subido exitosamente el archivo, espere un momento se esta realizando el cargue a la base de datos"
                    );
                    for (let i = 0; i < 3; i++) {
                      try {
                        const prom = await new Promise((resolve, reject) =>
                          setTimeout(() => {
                            // postCheckEstadoConveniosAval({
                            //   uuid: uniqueId,
                            // })
                            //   .then((res) => {
                            //     if (
                            //       res?.msg !==
                            //       "Error respuesta PDP: (No ha terminado la operación)"
                            //     ) {
                            //       if (res?.status) {
                            //         setIsUploading(false);
                            //         notify(res?.msg);
                            //         resolve(true);
                            //       } else {
                            //         notifyError(res?.msg ?? res?.message ?? "");
                            //         resolve(true);
                            //       }
                            //     } else {
                            //       notifyError(res?.msg ?? res?.message ?? "");
                            //       // setIsUploading(false);
                            //       // hideModal();
                            //       resolve(false);
                            //     }
                            //   })
                            //   .catch((err) => {
                            //     setIsUploading(false);
                            //     // notifyError("No se ha podido conectar al servidor");
                            //     console.error(err);
                            //   });
                          }, 15000)
                        );
                        if (prom === true) {
                          setIsUploading(false);
                          break;
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }
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
    [file]
  );
  return (
    <>
      <Form formDir="col" onSubmit={saveFile}>
        <Fieldset legend="Archivo recaudo multiple" className="lg:col-span-2">
          <h1 className="text-2xl text-center mb-10 mt-5">Archivo recaudo multiple</h1>
          <InputX
            id={`archivo`}
            label={file.name ? "Cambiar archivo" : `Elegir archivo`}
            type="file"
            // disabled={progress !== 0}
            accept=".csv"
            onGetFile={onChangeFile}
          />
          {file.name ? (
            <>
              <h2 className="text-l text-center mt-5">
                {`Archivo seleccionado: ${file.name}`}
              </h2>
              <ButtonBar>
                <Button type="button" onClick={() => {}}>
                  Cancelar
                </Button>
                <Button type="submit">Subir</Button>
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
