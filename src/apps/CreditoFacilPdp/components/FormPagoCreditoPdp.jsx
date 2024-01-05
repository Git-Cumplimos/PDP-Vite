import { useCallback, useMemo, useState } from "react";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import Form from "../../../components/Base/Form";
import Fieldset from "../../../components/Base/Fieldset";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { enumParametrosCreditosPDP } from "../utils/enumParametrosCreditosPdp";
import { useFetch } from "../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import { notifyPending } from "../../../utils/notify";

const URL_PAGO_CREDITO = `http://127.0.0.1:5000/pago-credito-facil/consulta-credito`;
// const URL_CONSULTA_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-credito`;

const FormPagoCreditoPdp = ({ dataCreditoUnique, closeModule }) => {
  const [dataInput, setDataInput] = useState({
    valor: 0,
    observaciones: "",
  });
  const [loadingPeticionPagoCredito, peticionPagoCredito] = useFetch(
    fetchCustom(URL_PAGO_CREDITO, "POST", "Pago credito")
  );
  const pagoCredito = useCallback(() => {
    const data = {
      // id_comercio: roleInfo?.id_comercio,
      id_comercio: 10166,
    };
    notifyPending(
      peticionPagoCredito({}, data),
      {
        render: () => {
          return "Procesando pago";
        },
      },
      {
        render: ({ data: res }) => {
          const dataTemp = res.obj.data;
          return "Pago satisfactorio";
        },
      },
      {
        render: ({ data: error }) => {
          closeModule();
          return error?.message ?? "Consulta fallida";
        },
      }
    );
  }, []);
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataInput((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeFormatNum = useCallback((ev, val) => {
    if (!isNaN(val)) {
      setDataInput((old) => {
        return { ...old, [ev.target.name]: val };
      });
    }
  }, []);

  return (
    <Form onSubmit={() => {}} grid>
      <Fieldset legend="Datos del credito" className="lg:col-span-2">
        <Input
          id="Id"
          name="Id"
          label={"No. de crédito"}
          type="text"
          autoComplete="off"
          minLength={0}
          maxLength={20}
          value={dataCreditoUnique?.Id}
          onChange={() => {}}
          disabled
          required
        />
        <Input
          id="Fechadesembolso"
          name="Fechadesembolso"
          label={"Fecha de desembolso"}
          type="text"
          autoComplete="off"
          minLength={0}
          maxLength={20}
          value={new Date(
            dataCreditoUnique?.Fechadesembolso
          ).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          onChange={() => {}}
          disabled
          required
        />
        <MoneyInput
          id="Valordesembolso"
          name="Valordesembolso"
          label={"Valor del crédito"}
          type="tel"
          autoComplete="off"
          minLength={0}
          maxLength={20}
          value={dataCreditoUnique?.Valordesembolso ?? ""}
          onChange={() => {}}
          disabled
          required
        />
        <Input
          id="Estado"
          name="Estado"
          label={"Estado"}
          type="text"
          autoComplete="off"
          minLength={0}
          maxLength={20}
          value={dataCreditoUnique?.Estado ?? ""}
          onChange={() => {}}
          disabled
          required
        />
        <MoneyInput
          id="valor"
          name="valor"
          label={"Valor a pagar"}
          type="tel"
          minLength={5}
          maxLength={10}
          autoComplete="off"
          min={enumParametrosCreditosPDP?.MINPAGOCREDITOPDP}
          max={enumParametrosCreditosPDP?.MAXPAGOCREDITOPDP}
          value={dataInput?.valor ?? ""}
          onInput={onChangeFormatNum}
          disabled={loadingPeticionPagoCredito}
          required
        />
        <Input
          id="observaciones"
          name="observaciones"
          label={"Observaciones"}
          type="text"
          autoComplete="off"
          minLength={0}
          maxLength={20}
          value={dataInput?.observaciones ?? ""}
          onChange={onChangeFormat}
          disabled={loadingPeticionPagoCredito}
          required
        />
      </Fieldset>
      <ButtonBar className="lg:col-span-2">
        <Button
          type="button"
          onClick={() => closeModule()}
          disabled={loadingPeticionPagoCredito}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loadingPeticionPagoCredito}>
          Realizar pago
        </Button>
      </ButtonBar>
    </Form>
  );
};

export default FormPagoCreditoPdp;
