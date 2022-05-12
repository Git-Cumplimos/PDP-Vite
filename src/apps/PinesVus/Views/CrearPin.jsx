import { useCallback, useState, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";

import Sellfundamujer from "../components/sellFundamujer/SellFundamujer";
import SearchForm from "../components/SearchForm/SearchForm";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/AuthHooks";
import { normalize } from "path";
import { notifyError } from "../../../utils/notify";

const CrearPin = () => {
  const {
    infoLoto: { respuestamujer, setRespuestamujer },
    crearPinVus,
    cancelarpin,
    CrearPinpin,
    cancelarDesembolso,
  } = usePinesVus();

  const { roleInfo } = useAuth();
  const [documento, setDocumento] = useState("");
  const [num_tramite, setNum_tramite] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(true);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [showModalAdvertencia, setShowModalAdvertencia] = useState(false);
  const [respPago, setRespPago] = useState("");

  useEffect(() => {
    setShowModalAdvertencia(true);
  }, []);

  const closeModalAdvertencia = (e) => {
    setShowModalAdvertencia(false);
  };

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const user = useMemo(() => {
    return {
      Tipo: roleInfo?.tipo_comercio,
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      Depto: roleInfo?.codigo_dane?.slice(0, 2),
      Municipio: roleInfo?.codigo_dane?.slice(2),
      nombre_comercio: roleInfo?.["nombre comercio"],
    };
  }, [roleInfo]);

  //const submit
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);

    /// consultar pin
    crearPinVus(documento, num_tramite, user)
      .then((res) => {
        console.log(res);
        setDisabledBtns(false);
        if (res?.status === false) {
          notifyError(res?.msg);
        } else {
          if (res?.obj?.CodRespuesta !== 0) {
            notifyError(res?.obj?.Mensaje);
          } else {
            console.log(res);
            setRespuestamujer(res);
            setShowModal(true);
            setDisabledBtns(false);
            notifyError(
              "Recuerde verificar si tiene el dinero suficiente en caja para continuar el desembolso"
            );
          }
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtns(false);
    console.log(selected);
    if (selected === true) {
      ///cancelar un pin
      cancelarDesembolso(respuestamujer?.obj, user)
        .then((res) => {
          setDisabledBtns(false);
          if (res?.status === false) {
            notifyError(res?.msg);
          } else {
            if (res?.obj?.CodRespuesta !== 0) {
              notifyError(res?.obj?.Mensaje);
            } else {
              console.log(res);
            }
          }
        })
        .catch(() => setDisabledBtns(false));
    }
    setSelected(true);
  }, [cancelarpin, CrearPinpin, selected]);

  const Desembolsitos = () => {
    setSelected(false);
  };

  return (
    <>
      <h1 className="text-3xl">Datos creación de Pin</h1>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numTramite"
          label="No. Tramite"
          type="text"
          required
          // minLength="5"
          // maxLength="12"
          autoComplete="off"
          value={num_tramite}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setNum_tramite(num);
          }}
        />
        <Input
          id="numDocumento"
          label="Documento"
          type="text"
          required
          minLength="5"
          maxLength="12"
          autoComplete="off"
          value={documento}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setDocumento(num);
          }}
        />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Crear pin
          </Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={() => closeModal()}>
        {selected ? (
          <SearchForm
            selected={respuestamujer}
            closeModal={closeModal}
            handleSubmit={(event) => {
              event.preventDefault();
              setDisabledBtns(true);
              CrearPinpin(respuestamujer?.obj, user)
                .then((res) => {
                  setDisabledBtns(false);
                  if (res?.status === false) {
                    notifyError(res?.msg);
                  } else {
                    if (res?.obj?.CodRespuesta !== 0) {
                      notifyError(res?.obj?.Mensaje);
                    } else {
                      console.log(res);
                      setRespPago(res);
                      // setShowModal(true);
                      Desembolsitos();
                    }
                  }
                })
                .catch(() => setDisabledBtns(false));
            }}
            disabledBtns={disabledBtns}
          />
        ) : (
          <Sellfundamujer
            respPago={respPago?.obj}
            setRespPago={setRespPago}
            closeModal={closeModal}
          />
        )}
      </Modal>
    </>
  );
};
export default CrearPin;
