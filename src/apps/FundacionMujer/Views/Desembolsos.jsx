import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";

import Sellfundamujer from "../components/sellFundamujer/SellFundamujer";
import SearchForm from "../components/SearchForm/SearchForm";
import { Usemujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";

const Desembolsos = () => {
  const {
    infoLoto: { respuestamujer, setRespuestamujer },
    consultapin,
    cancelarpin,
    desembolsospin,
  } = Usemujer();

  const [documento, setDocumento] = useState("");
  const [pin, setPin] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(true);
  const [disabledBtns, setDisabledBtns] = useState(false);

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
  //const submit
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    /// consultar pin
    consultapin(documento, pin)
      .then((res) => {
        setDisabledBtns(false);
        if ("msg" in res) {
          notify("datos confirmados");
        }
        setRespuestamujer(res);
        setShowModal(true);
      })
      .catch(() => setDisabledBtns(false));
    //desembolso pin
    /*  desembolsospin()
     en((res) => {
        setDisabledBtns(false);
        console.log(res); .th
      })
      .catch(() => setDisabledBtns(false)); */
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
    ///cancelar un pin
    console.log("servicio cancelado");
    await cancelarpin("TFM102")
      .then((res) => {
        setDisabledBtns(false);
        if ("msg" in res) {
          notify("  servicio cancelado");
        }
        console.log(res);
      })
      .catch(() => setDisabledBtns(false));
    setDocumento("");
    setPin("");
    consultapin("");
    desembolsospin("");
  }, [cancelarpin, consultapin, desembolsospin]);

  const Desembolsitos = () => {
    setSelected(false);
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numDocumento"
          label="Documento"
          type="text"
          required
          minLength="10"
          maxLength="16"
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
              desembolsospin();
              Desembolsitos();
            }}
          />
        ) : (
          <Sellfundamujer
            respuestamujer={respuestamujer}
            setRespuestamujer={setRespuestamujer}
            closeModal={closeModal}
          />
        )}
      </Modal>
    </>
  );
};
export default Desembolsos;
