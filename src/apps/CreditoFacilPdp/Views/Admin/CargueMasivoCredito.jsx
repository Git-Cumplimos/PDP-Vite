import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending, notify } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosCreditosPDP } from "../../utils/enumParametrosCreditosPdp";
import { useReactToPrint } from "react-to-print";
import Select from "../../../../components/Base/Select/Select";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCreditoFacil";
import {
  postConsultaCreditosCEACRC,
  useFetchCreditoFacil,
} from "../../hooks/fetchCreditoFacil";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import fetchData from "../../../../utils/fetchData";
import InputX from "../../../../components/Base/InputX/InputX";

const url_cargueS3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/carga-archivo`;
const url_guardar = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/creacion-credito`;

const CargueMasivoCredito = () => {
  const [file, setFile] = useState({});
  const { roleInfo, pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(true);

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
      const query = {
        contentType: "application/text",
        filename: `archivo_recaudo_multiple/${file.name}`,
      };
      fetchData(url_cargueS3, "POST", {}, query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
          } else {
            let name_file = respuesta?.obj?.fileName;
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
                    console.log(respuesta?.obj?.fields);
                    const query2 = {
                      filename: name_file,
                      comercio: {
                        id_comercio: roleInfo?.id_comercio,
                        id_usuario: roleInfo?.id_usuario,
                        id_terminal: roleInfo?.id_dispositivo,
                        nombre_comercio: roleInfo?.["nombre comercio"],
                        nombre_usuario: pdpUser?.uname,
                      },
                    };
                    console.log("data", query2);
                    fetchData(url_guardar, "POST", {}, query2)
                      .then((respuesta2) => {
                        if (!respuesta2?.status) {
                          notifyError(respuesta2?.msg);
                        } else {
                          notify(respuesta2?.msg);
                        }
                      })
                      .catch((err) => {
                        notifyError("Error al cargar Datos");
                      });
                  } else {
                    notifyError("No fue posible conectar con el Bucket");
                  }
                })
                .catch((err) => {
                  notifyError("Error al cargar el archivo");
                  console.error(err);
                });
            }
          }
        })
        .catch((err) => {
          notifyError("Error al cargar Datos");
        });
    },
    [file]
  );
  return (
    <>
      <Modal show={showModal}>
        <Form formDir="col" onSubmit={saveFile}>
          <Fieldset legend="Archivo Recaudo Múltiple" className="lg:col-span-2">
            <h1 className="text-2xl text-center mb-10 mt-5">
              Cargue archivo recaudo múltiple
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
                  <Button type="submit">Subir</Button>
                </ButtonBar>
              </>
            ) : (
              ""
            )}
          </Fieldset>
        </Form>
      </Modal>
    </>
  );
};

export default CargueMasivoCredito;
