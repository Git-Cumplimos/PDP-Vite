import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";

import Sellfundamujer from "../../../FundacionMujer/componentsmujer/sellFundamujer/SellFundamujer";
import SearchForm from "../SearchForm/SearchForm";
import { Usemujer } from "../../../FundacionMujer/componentsmujer/utils/mujerHooks";
import { toast } from "react-toastify";

const Desembolsos = () => {
  const {
    infoLoto: { respuestamujer, setRespuestamujer, setCustomer },
    consultapin,
    cancelarpin,
    desembolsospin,
  } = Usemujer();

  const [documento, setDocumento] = useState("");
  const [pin, setPin] = useState("");
  const [comercio, setComercio] = useState("");
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
  const notifyError = (msg) => {
    toast.error(msg, {
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
        console.log(res);
        setShowModal(true);
      })
      .catch(() => setDisabledBtns(false));
    //desembolso pin
    /*  desembolsospin()
      .then((res) => {
        setDisabledBtns(false);
        console.log(res);
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
  }, []);

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
          autoComplete="false"
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
          autoComplete="false"
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
