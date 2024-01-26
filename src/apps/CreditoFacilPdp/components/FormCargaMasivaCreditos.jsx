import { useCallback, useState } from "react";
import { v4 } from "uuid";
import Form from "../../../components/Base/Form/Form";
import Fieldset from "../../../components/Base/Fieldset";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import InputX from "../../../components/Base/InputX/InputX";
import { notifyError, notifyPending } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetchCreditoFacil } from "../hooks/fetchCreditoFacil";

const URL_CARGA_ARCHIVO_S3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/carga-archivo`;
const URL_GUARDAR_CREDITOS_TBL_MOVIMIENTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/creacion-credito`;
const URL_CONSULTAR_ESTADO_SIMULACION = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/check-estado-credito-facil`;

const FormCargaMasivaCreditos = ({ setModalOpen, consultaCreditos }) => {
  const [file, setFile] = useState({});
  const [estado, setEstado] = useState(false);
  const { roleInfo, pdpUser } = useAuth();
  const uniqueId = v4();

  const onChangeFile = (files) => {
    const selectedFile = files[0];
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
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith(".csv")) {
        notifyError("El archivo seleccionado no es un archivo CSV.");
        setFile({});
      }
    }
  };

  const [loadingPeticionGuardarCreditos, peticionGuardarCreditos] =
    useFetchCreditoFacil(
      URL_GUARDAR_CREDITOS_TBL_MOVIMIENTOS,
      URL_CONSULTAR_ESTADO_SIMULACION,
      "Guardar creditos"
    );

  const cargar_creditos = useCallback(
    (e) => {
      setEstado(true);
      e.preventDefault();
      const query = {
        contentType: "application/text",
        filename: `archivo_recaudo_multiple/${file.name}`,
      };
      fetchData(URL_CARGA_ARCHIVO_S3, "POST", {}, query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
            consultaCreditos();
            setModalOpen(false);
          } else {
            let name_file = respuesta?.obj?.fileName;
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
                    const data = {
                      filename: name_file,
                      comercio: {
                        // id_comercio: roleInfo?.id_comercio,
                        id_usuario: pdpUser?.uuid,
                        // id_terminal: roleInfo?.id_dispositivo,
                        // nombre_comercio: roleInfo?.["nombre comercio"],
                        nombre_usuario: pdpUser?.uname,
                      },
                    };
                    const dataAditional = {
                      id_uuid_trx: uniqueId,
                    };
                    notifyPending(
                      peticionGuardarCreditos(data, dataAditional),
                      {
                        render: () => {
                          return "Procesando creación de créditos";
                        },
                      },
                      {
                        render: ({ data: res }) => {
                          consultaCreditos();
                          setModalOpen(false);
                          return "Cargue de créditos exitoso";
                        },
                      },
                      {
                        render: ({ data: error }) => {
                          if (error?.message) {
                            consultaCreditos();
                            setModalOpen(false);
                            return error?.message;
                          } else {
                            consultaCreditos();
                            setModalOpen(false);
                            return "Cargue de créditos fallido";
                          }
                        },
                      }
                    );
                  } else {
                    consultaCreditos();
                    setModalOpen(false);
                    notifyError("No fue posible conectar con el Bucket");
                  }
                })
                .catch((err) => {
                  consultaCreditos();
                  setModalOpen(false);
                  notifyError("Error al cargar el archivo");
                  console.error(err);
                });
            }
          }
        })
        .catch((err) => {
          consultaCreditos();
          setModalOpen(false);
          notifyError("Error al cargar Datos");
        });
    },
    [file, roleInfo, pdpUser]
  );

  return (
    <>
      <Form formDir="col" onSubmit={cargar_creditos}>
        <Fieldset legend="Cargue Masivo de Créditos" className="lg:col-span-2">
          <h1 className="text-2xl text-center mb-10 mt-5">
            Cargue archivo de créditos
          </h1>
          <InputX
            id={`archivo`}
            label={file.name ? "Cambiar archivo" : `Elegir archivo`}
            type="file"
            accept=".csv"
            onGetFile={onChangeFile}
          />
          {file.name ? (
            <>
              <h2 className="text-l text-center mt-5">
                {`Archivo seleccionado: ${file.name}`}
              </h2>
              <ButtonBar>
                <Button type="submit" disabled={estado || loadingPeticionGuardarCreditos}>
                  Subir
                </Button>
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

export default FormCargaMasivaCreditos;
