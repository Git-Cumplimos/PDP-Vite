import React, { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import Select from "../../../components/Base/Select";
import { notify, notifyError } from "../../../utils/notify";
import { postDtlCambioLimiteCanje } from "../utils/fetchCupo";

const ModifiLimiteCanje = () => {
  const [cambioCupo, setCambioCupo] = useState(1);
  const [valor, setValor] = useState(null);
  const [idComercio, setIdComercio] = useState(null);
  const [usuario, setUsuario] = useState("juan");
  const onChange = useCallback((ev) => {
    // if (ev.target.name === "valor") {
    //   setValor(ev.target.value);
    // } else
    if (ev.target.name === "Id comercio") {
      setIdComercio(ev.target.value);
    }
  }, []);
  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();

      const body = {
        valor: valor,
        id_comercio: idComercio,
        usuario: usuario,
        id_tipo_cupo_modificado: cambioCupo,
      };
      postDtlCambioLimiteCanje(body)
        .then((res) => {
          if (!res?.status) {
            notifyError("Balance cupo es menor al nuevo limite de cupo");
            return;
          }
          notify("Modificacion exitosa");
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al modificar cupo");
        });
      console.log(body);
    },
    [cambioCupo, valor, idComercio]
  );
  const onMoneyChange = useCallback((e, valor) => {
    setValor("-" + valor);
  }, []);
  return (
    <div>
      <Fragment>
        <h1 className="text-3xl mt-6">Modificar cupo Comercios</h1>
        <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
          <Input
            id="Id comercio"
            name="Id comercio"
            label="Id comercio"
            type="number"
            autoComplete="off"
            // minLength={"10"}
            // maxLength={"10"}
            // value={""}
            onInput={() => {}}
            required
          />
          <MoneyInput
            id="valor"
            name="valor"
            label="Valor a cambiar"
            autoComplete="off"
            onInput={onMoneyChange}
            required
          />
          <Select
            label="Cupo a modificar"
            options={{
              "Limite de cupo": 1,
              "Cupo en canje": 2,
            }}
            value={cambioCupo}
            /* required={true} */
            onChange={(e) => {
              setCambioCupo(e.target.value);
            }}
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>Realizar cambio cupo</Button>
          </ButtonBar>
        </Form>
      </Fragment>
    </div>
  );
};

export default ModifiLimiteCanje;
