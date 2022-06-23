import React, { Fragment, useCallback, useEffect, useState } from "react";
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

const URL = "http://127.0.0.1:5000/recargasMovistar/prepago";

const RecargasMovistar = () => {
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
  const [resPeticion, setResPeticion] = useState(null);
  const [resDataPeticion, setDataResPeticion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);

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

      if (result.obj?.[0].codigo_error == "00") {
        setResPeticion(1);
        setShowModal(true);
      } else {
        console.log("jj");
        setResPeticion(0);
        setShowModal(true);
      }
    });
  });

  useEffect(() => {
    console.log(resPeticion);
  }, [resPeticion]);

  const onMoneyChange = useCallback((e, valor) => {
    setInputValor(valor);
  });
  const limitesMontos = 10;
  return (
    <Fragment>
      <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
        <Input
          id="celular"
          name="celular"
          label="celular: "
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
        <div>
          {resPeticion == 1
            ? "Recarga exitosa"
            : "Recarga no exitosa  - error recarga: datos no correctos "}
        </div>
        {/* {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets />
            <ButtonBar>
              <Button>Imprimir</Button>
              <Button>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary>
            <ButtonBar>
              <Button type="submit" disabled={loadingCashIn}>
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingCashIn}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )} */}
      </Modal>
    </Fragment>
  );
};
export default RecargasMovistar;
