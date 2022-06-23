import React, { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { PeticionRecarga, RealizarPeticionPro } from "../utils/fetchMovistar";
// import Modal from "../../../components/Base/Modal";
// import PaymentSummary from "../../../components/Compound/PaymentSummary";
// import Tickets from "../../../components/Base/Tickets";
// import { useFetch } from "../../../hooks/useFetch";
// import fetchData from "../../../utils/fetchData";

const URL = "http://127.0.0.1:5000/recargasMovistar/prepago";

const RecargasMovistar = () => {
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
  // const [showModal, setShowModal] = useState(false);
  // const [paymentStatus, setPaymentStatus] = useState(false);
 
  // const postCashIn = async (bodyObj) => {
  //   if (!bodyObj) {
  //     return new Promise((resolve, reject) => {
  //       resolve("Sin datos body");
  //     });
  //   }
  //   try {
  //     const res = await fetchData(
  //       `${URL}`,
  //       "POST",
  //       {},
  //       bodyObj
  //     );
  //     if (!res?.status) {
  //       console.error(res?.msg);
  //     }
  //     return res;
  //   } catch (err) {
  //     throw err;
  //   }
  // }
  // const [loadingCashIn, fetchCashIn] = useFetch(postCashIn);

  

  // const handleClose = useCallback(() => {
  //   setShowModal(false);
  // }, []);
  const { roleInfo } = useAuth();
  const l = "";
  const onChange = useCallback((e) => {
    if (e.target.name == "celular") {
      setInputCelular(e.target.value);
    }
    if (e.target.name == "valor") {
      let p = e.target.value.replaceAll(".", "");
      p = parseInt(p.slice(2));

      setInputValor(p);
    }
  });

  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
    const data = {
      celular: inputCelular,
      valor: inputValor,
      codigo_comercio: "0679977",
      identificador_region: "CIUDADELA",
    };
    console.log(data);
    PeticionRecarga(URL, data).then((return_) => {});
  });

  const onMoneyChange = useCallback(() => {});
  const limitesMontos = 10;
  return (
    <Fragment>
      <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
        <Input
          id="celular"
          name="celular"
          label="celular: "
          type="number"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          onInput={() => {}}
          required
        />

        <MoneyInput
          id="valor"
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={"1"}
          max={"10"}
          onInput={onMoneyChange}
          required
        />

        <Button type={"submit"} className={"lg:col-span-2"}>
          Realizar deposito
        </Button>
      </Form>
      {/* <Modal
        show={showModal}
        handleClose={
          paymentStatus ? () => {} : loadingCashIn ? () => {} : handleClose
        }
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets />
            <ButtonBar>
              <Button >Imprimir</Button>
              <Button >Cerrar</Button>
            </ButtonBar>
          </div>
        ):
         (
          <PaymentSummary >
            <ButtonBar>
              <Button
                type="submit"
                disabled={loadingCashIn}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingCashIn}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )
        }
      </Modal> */}
    </Fragment>
  );
};
export default RecargasMovistar;
