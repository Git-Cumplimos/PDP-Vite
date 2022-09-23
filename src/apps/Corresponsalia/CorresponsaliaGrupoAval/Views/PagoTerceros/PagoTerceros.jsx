import React, { Fragment } from "react";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";

const PagoTerceros = () => {
  return (
    <Fragment>
      <h1>Pago de terceros</h1>
      <Form>
        <Input
          name="numeroIdentificacion"
          label="Número de identificación"
          type="text"
          minLength="1"
          maxLength="12"
          autoComplete="off"
          requerid
        ></Input>
        <Input
          name="numeroCelular"
          label="Número celular"
          type="text"
          minLength="10"
          maxLength="10"
          autoComplete="off"
          requerid
        ></Input>
        <Input
          name="numeroOTP"
          label="Número de OTP"
          type="text"
          minLength="1"
          maxLength="12"
          autoComplete="off"
          requerid
        ></Input>
        <Input
          name="valorPago"
          label="Valor del pago"
          type="text"
          minLength="5"
          maxLength="10"
          autoComplete="off"
          requerid
        ></Input>
      </Form>
    </Fragment>
  );
};

export default PagoTerceros;
