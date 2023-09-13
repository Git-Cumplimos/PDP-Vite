import { Fragment, useState, useCallback } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import { notifyPending } from "../../../../../utils/notify";
import Select from "../../../../../components/Base/Select";
import TextArea from "../../../../../components/Base/TextArea";
import { useAuth } from "../../../../../hooks/AuthHooks";
import {
  buscarIdTrx,
  ReportFaltantesSobr,
} from "../../../utils/fetchCaja";

const ReporteSobranteFaltantes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ValorNovedad, setValorNovedad] = useState('');
  const [NumId, setNumId] = useState('');
  const id_user=useAuth().pdpUser.uuid

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData)).map(([key, val]) => {
          return [key,val];}));
      {body['pk_id_cajero']=id_user};
      notifyPending(
        buscarIdTrx(body),
        {
          render: () => {
            setIsLoading(true);
            return "Buscando ID de la transacción";
          },
        },
        {
          render: ({ data: response }) => {
            setIsLoading(false);
            if (response?.obj !== null) {
              ReportFaltantesSobr(body)
              return "Novedad Reportada";
            }else{
              return "Número de la transacción ingresado no corresponde a una transacción del comercio";
            }
          },
        },
      );
    },
    []
  );

  const handleChangeCurrenci = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '').slice(0, 7);
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const finalValue = `$${formattedValue}`;
    setValorNovedad(finalValue);
  };

  const handleChangeNum = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 20) {
      setNumId(value);
    }
  };
  
  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Reporte de sobrantes/faltantes</h1>
      <Form onSubmit={handleSubmit} grid>
        <Select
          id="pk_tipo_movimiento"
          name="pk_tipo_movimiento"
          label="Tipo de movimiento"
          options={[
            { value: "", label: "" },
            { value: "Sobrante", label: "Sobrante" },
            { value: "Faltante", label: "Faltante" },
          ]}
          onChange={(e) =>
              e.target.value === "1"
                ? false
                : e.target.value === "2"
                ? true
                : null
          }
          required
        />

        <Input
          id='pk_valor_novedad'
          name='pk_valor_novedad'
          label={"Valor de la novedad"}
          type="text"
          value={ValorNovedad}
          onChange={handleChangeCurrenci}
          placeholder="$0"
          maxLength={10}
          autoComplete='off'
          required
        />

        <Input
          id="pk_id_transaccion"
          name="pk_id_transaccion"
          label="Id Transacción"
          type="text"
          value={NumId}
          onChange={handleChangeNum}
          placeholder="Id de 20 caracteres numéricos"
        />

        <TextArea
          id="pk_observacion_novedad"
          name="pk_observacion_novedad"
          className="w-full place-self-stretch"
          autoComplete="off"
          maxLength={"300"}
          label="Observación novedades"
          required
        />

        <ButtonBar className="lg:col-span-2">
          <Button type="button" onClick={() => { setIsLoading(false) }}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            Reportar Novedad
            <p className="w-full whitespace-pre-wrap"></p>
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ReporteSobranteFaltantes;
