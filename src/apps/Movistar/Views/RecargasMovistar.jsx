import React, { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { PeticionRecarga, RealizarPeticionPro } from "../utils/fetchMovistar";

const URL = "http://127.0.0.1:5000/recargasMovistar/prepago";

const RecargasMovistar = () => {
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
  const [resPeticion, setResPeticion] = useState(null);
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
      //   setResPeticion(result.obj[0].codigo_error);
      console.log(result.obj);
      //   if(result.obj[0].codigo_error == ""){

      //   }
    });
  });

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
    </Fragment>
  );
};
export default RecargasMovistar;
