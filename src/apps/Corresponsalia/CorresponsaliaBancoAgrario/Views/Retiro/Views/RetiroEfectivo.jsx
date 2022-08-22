import React, { Fragment, useCallback, useState } from "react";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Form from "../../../../../../components/Base/Form";
import Input from "../../../../../../components/Base/Input";
import MoneyInput from "../../../../../../components/Base/MoneyInput";
import Select from "../../../../../../components/Base/Select";

const RetiroEfectivo = () => {
  const [tipoDeCuenta, setTipoDeCuenta] = useState("");

  const [limitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });
  const onMoneyChange = useCallback((e, valor) => {
    // console.log(valor);
  }, []);
  const options = [
    { value: "Ahorros", label: "Cuenta Ahorros" },
    { value: "Corriente", label: "Cuenta Corriente" },
  ];
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiro en efectivo</h1>
      <Form grid>
        <Select
          id="typeNumbers"
          label="Tipo de cuenta"
          options={options}
          value={tipoDeCuenta}
          onChange={(e) => {
            setTipoDeCuenta(e.target.value);
          }}
        />
        <Input
          id="Cuenta"
          name="Cuenta"
          label="Cuenta"
          type="number"
          minLength="6"
          maxLength="6"
          autoComplete="off"
          // value={""}
          onChange={() => {}}
          required
        />
        <Input
          id="OTP"
          name="OTP"
          label="Token de retiro"
          type="text"
          minLength="6"
          maxLength="6"
          autoComplete="off"
          // value={otp ?? ""}
          onChange={() => {}}
          required
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor a retirar"
          autoComplete="off"
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button>Retiro</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default RetiroEfectivo;
