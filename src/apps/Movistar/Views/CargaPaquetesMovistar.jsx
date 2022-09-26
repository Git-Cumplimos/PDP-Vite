import React, { Fragment, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useFetch } from "../../../hooks/useFetch";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchUploadFileCustom,
  ErrorCustom,
  ErrorCustomBackendUser,
  ErrorCustomBackend,
  msgCustomBackend,
} from "../utils/fetchPaquetesMovistar";

const url_carga_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/carga-paquetes/subir-archivo`;

const CargaPaquetesMovistar = () => {
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const [file, setFile] = useState(null);
  const [nameFile, setNameFile] = useState("");
  const [errorUser, setErrorUser] = useState("");
  const validNavigate = useNavigate();
  const [loadingCargarPaquete, PeticionCargarPaquete] = useFetch(
    fetchUploadFileCustom
  );

  const summaryFile = (e) => {
    e.preventDefault();
    if (file == null) {
      notifyError("Adjuntar archivo xlsx");
      return;
    }
    setNameFile(file.name);
    setTypeInfo("SummaryFile");
    setShowModal(true);
  };

  const uploadFile = (e) => {
    PeticionCargarPaquete(url_carga_paquetes, file, "carga-paquetes")
      .then((response) => {
        console.log(response);
        if (response?.status == true) {
          notify("se cargo de archivo de paquetes exitosamente");
          HandleCloseSecond();
        }
      })
      .catch((error) => {
        if (error instanceof ErrorCustom) {
          HandleCloseFirst();
        } else if (error instanceof ErrorCustomBackendUser) {
          setErrorUser(error.message);
          setTypeInfo("ErrorCustomFileBackendUser");
        } else if (error instanceof ErrorCustomBackend) {
          notifyError(
            `no se pudo cargar el archivo de paquetes: ${error.message}`
          );
          HandleCloseFirst();
        } else if (error instanceof msgCustomBackend) {
          notify(`${error.message}`);
          HandleCloseFirst();
        } else {
          notifyError(`no se pudo cargar el archivo de paquetes`);
          HandleCloseFirst();
        }
      });
  };

  const HandleCloseFirst = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
  }, []);

  const HandleCloseSecond = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setNameFile("");
    setFile(null);
    validNavigate("/movistar/operador-pdp");
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Cargar paquetes al sistema</h1>
      <Form onSubmit={summaryFile}>
        <Input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
          }}
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Cargar archivo</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={HandleCloseFirst}>
        {/******************************SummaryFile*******************************************************/}
        {typeInfo == "SummaryFile" && (
          <PaymentSummary
            title="¿Está seguro de cargar archivo? "
            subtitle="Resumen"
            summaryTrx={{ "Nombre del archivo": nameFile }}
          >
            {!loadingCargarPaquete ? (
              <>
                <ButtonBar>
                  <Button onClick={uploadFile}>Cargar</Button>
                  <Button onClick={HandleCloseFirst}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        )}
        {/******************************SummaryFile*******************************************************/}

        {/******************************ErrorCustomFileBackendUser*******************************************************/}
        {typeInfo == "ErrorCustomFileBackendUser" && (
          <PaymentSummary
            title="No se pudo cargar el archivo de paquetes movistar"
            subtitle="Resumen"
            summaryTrx={{ "Nombre del archivo": nameFile }}
          >
            <label className="whitespace-pre-line">{errorUser}</label>
            <ButtonBar>
              <Button onClick={HandleCloseFirst}>Aceptar</Button>
            </ButtonBar>
          </PaymentSummary>
        )}
        {/******************************ErrorCustomFileBackendUser*******************************************************/}
      </Modal>
    </Fragment>
  );
};

export default CargaPaquetesMovistar;
