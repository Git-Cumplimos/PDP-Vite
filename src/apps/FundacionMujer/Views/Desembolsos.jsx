import { useCallback, useState, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";

import Sellfundamujer from "../components/sellFundamujer/SellFundamujer";
import SearchForm from "../components/SearchForm/SearchForm";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/AuthHooks";
import { normalize } from "path";
import { notifyError } from "../../../utils/notify";

const Desembolsos = () => {
  const {
    infoLoto: { respuestamujer, setRespuestamujer },
    consultarPines,
    cancelarpin,
    desembolsospin,
    cancelarDesembolso,
  } = useMujer();

  const { roleInfo } = useAuth();
  const [documento, setDocumento] = useState("");
  const [pin, setPin] = useState("");
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
    consultarPines(documento, pin, user)
      .then((res) => {
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
  }, [cancelarpin, desembolsospin, selected]);

  const Desembolsitos = () => {
    setSelected(false);
  };

  return (
    <>
      <Modal
        show={showModalAdvertencia}
        handleClose={() => closeModalAdvertencia()}
      >
        <div className="flex flex-col justify-center items-center">
          <h1 className="xl:text-center font-semibold">
            Recuerde verificar si tiene el dinero suficiente en caja para
            realizar la transacción !!!
          </h1>
          <Button
            onClick={() => {
              closeModalAdvertencia();
            }}
          >
            Cerrar
          </Button>
        </div>
      </Modal>
      <Form onSubmit={onSubmit} grid>
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
        <Input
          id="numpin"
          label="Numero de pin"
          type="text"
          required
          minLength="4"
          maxLength="4"
          autoComplete="off"
          value={pin}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setPin(num);
          }}
        />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar pin
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
              desembolsospin(respuestamujer?.obj, user)
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
export default Desembolsos;
