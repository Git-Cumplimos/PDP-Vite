import React, { useState } from "react";
import Modal from "../../../components/Base/Modal";
import Input from "../../../components/Base/Input";
import Button from "../../../components/Base/Button";
import MoneyInput from "../../../components/Base/MoneyInput";
import { pagarPrefactura } from "../utils/fetchCirculemos";

const Prefactura = ({ prefacturaInfo, numero }) => {
  const [payment, setPayment] = useState("");
  const [type, setType] = useState("");

  const paymentType = (e) => {
    setType(e);
  };
  const pagar = () => {
    console.log("Button");
    const body = {
      persona: {
        tipoIdentificacion: {
          codigo:
            prefacturaInfo?.prefacturas?.[0]?.solicitante
              ?.codigoTipoIdentificacion,
        },
        numeroDocumento:
          prefacturaInfo?.prefacturas?.[0]?.solicitante?.numeroIdentificacion,
        nombre1: "Esteban",
        apellido1: "Heredia",
      },
      tipoPago: {
        codigo: "01",
      },
      medioRecaudo: "2",
      numeroSoporte: "1010",
      numeroPrefactura: numero,
      valorPago: prefacturaInfo?.prefacturas?.[0]?.valorTotal,
      organismoTransito: {
        codigoOrganismo: "13001000",
      },
      origenTransaccion: 1,
      username: "usuario4",
      password: "ithfnc45",
      codigoOrganismo: "13001000",
      origen: "c1",
    };
    pagarPrefactura(body)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <h6>{JSON.stringify(prefacturaInfo)}</h6>
      <Button type="button" onClick={() => setPayment(true)}>
        Pagar
      </Button>
      <Modal show={payment} handleClose={() => setPayment(false)}>
        <h1>Metodos de pago</h1>
        <br />
        <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
          Efectivo
          <input
            id="Efectivo"
            value="efectivo"
            name="pago"
            type="radio"
            onChange={(e) => paymentType(e.target.value)}
          />
          Tarjeta débito/crédito
          <input
            id="tarjeta"
            value="tarjeta"
            name="pago"
            type="radio"
            onChange={(e) => paymentType(e.target.value)}
          />
        </div>
        {type === "efectivo" ? (
          <>
            <MoneyInput
              id="codigoTipoIdentificacion"
              label="Valor efectivo"
              type="text"
              autoComplete="off"
              value={prefacturaInfo?.prefacturas?.[0]?.valorTotal}
            />
            <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
              <Button type="button" onClick={pagar}>
                Finalizar transacción
              </Button>
            </div>
          </>
        ) : type === "tarjeta" ? (
          <>
            <h1>Datos voucher</h1>
            <Input
              id="codigoTipoIdentificacion"
              label="Data 1"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <br />
            <Input
              id="codigoTipoIdentificacion"
              label="Data 1"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <br />
            <Input
              id="codigoTipoIdentificacion"
              label="Data 1"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
              <Button type="button" onClick={pagar}>
                Finalizar transacción
              </Button>
            </div>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default Prefactura;
