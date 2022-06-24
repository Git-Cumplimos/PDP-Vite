import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { PeticionRecarga, RealizarPeticionPro } from "../utils/fetchMovistar";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import Tickets from "../../../components/Base/Tickets";
import { useFetch } from "../../../hooks/useFetch";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const URL = "http://127.0.0.1:5000/recargasMovistar/prepago";

const RecargasMovistar = () => {
  const navigate = useNavigate();
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
  const [resPeticion, setResPeticion] = useState(null);
  const [resDataPeticion, setDataResPeticion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);

  const printDiv = useRef();

  const postCashIn = async (bodyObj) => {
    if (!bodyObj) {
      return new Promise((resolve, reject) => {
        resolve("Sin datos body");
      });
    }
    try {
      const res = await fetchData(`${URL}`, "POST", {}, bodyObj);
      if (!res?.status) {
        console.error(res?.msg);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
  const [loadingCashIn, fetchCashIn] = useFetch(postCashIn);

  const handleClose = useCallback(() => {
    setResPeticion(0);
    setShowModal(false);
  }, []);
  const { roleInfo } = useAuth();

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const onChange = useCallback((e) => {
    if (e.target.name == "celular") {
      const formData = new FormData(e.target.form);
      const phone = ((formData.get("celular") ?? "").match(/\d/g) ?? []).join(
        ""
      );
      setInputCelular(phone);
    }
  });

  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
    const data = {
      celular: inputCelular,
      valor: inputValor,
      codigo_comercio: roleInfo.id_comercio,
      identificador_region: roleInfo.direccion,
    };

    PeticionRecarga(URL, data).then((result) => {
      setDataResPeticion(result);
      //   setResPeticion(result.obj[0].codigo_error);
      //   if(result.obj[0].codigo_error == ""){

      if (result.obj?.[0].codigo_error == "00") {
        setResPeticion(1);
        setShowModal(true);
        setPaymentStatus(true);
      } else {
        console.log("jj");
        setResPeticion(0);
        setShowModal(true);
        setPaymentStatus(false);
      }
    });
  });

  useEffect(() => {
    console.log(resPeticion);
  }, [resPeticion]);

  const onMoneyChange = useCallback((e, valor) => {
    setInputValor(valor);
  });

  const onShowModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const limitesMontos = 10;
  return (
    <Fragment>
      <Form onSubmit={onShowModal} onChange={onChange} grid>
        <Input
          id="celular"
          name="celular"
          label="Celular: "
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular ?? ""}
          onInput={() => {}}
          required
        />

        <MoneyInput
          id="valor"
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={"1000"}
          max={"9999999999"}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          paymentStatus ? () => {} : loadingCashIn ? () => {} : handleClose
        }
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary>
            <ButtonBar>
              <Button
                type="button"
                disabled={loadingCashIn}
                onClick={onSubmitDeposit}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingCashIn}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};
export default RecargasMovistar;
