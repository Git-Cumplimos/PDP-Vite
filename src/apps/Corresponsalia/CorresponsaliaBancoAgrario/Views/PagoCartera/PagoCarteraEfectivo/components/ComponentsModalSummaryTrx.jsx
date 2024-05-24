import { useState } from "react";
import Button from "../../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import MoneyInput, {
  formatMoney,
} from "../../../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../../../components/Compound/PaymentSummary";
import Select from "../../../../../../../components/Base/Select/Select";
import { notify } from "../../../../../../../utils/notify";
import Form from "../../../../../../../components/Base/Form";
import { enumParametrosBancoAgrario } from "../../../../utils/enumParametrosBancoAgrario";
export const ComponentsModalSummaryTrx = ({
  documento,
  numero_obligacion,
  numeroPagoCartera,
  numero_cedula,
  summary,
  loadingPeticion,
  peticion,
  handleClose,
  posicion,
}) => {
  const [labelSeleccionado, setLabelSeleccionado] = useState({
    label: "Otro Valor",
    seleccion: "0",
  });
  const [pagoTotal, setPagoTotal] = useState(0);
  const [choice_numero_obligacion, setChoicePagoTotal] = useState(
    summary[posicion]?.numero_obligacion
  );
  return (
    <PaymentSummary
      title="¿Está seguro de realizar la transacción?"
      subtitle="Resumen de transacción"
      summaryTrx={{
        "Valor a pagar para fecha de corte": formatMoney.format(
          summary[posicion]?.valor_pagar_fechaCorte
        ),
        ["Número de obligación"]: summary[posicion]?.numero_obligacion,
        "Valor total de la deuda": formatMoney.format(
          summary[posicion]?.valor_deuda
        ),
        "Valor total vencido": formatMoney.format(
          summary[posicion]?.valor_vencido
        ),
        "Valor total vigente": formatMoney.format(
          summary[posicion]?.valor_vigente
        ),
        "Estado del crédito": summary[posicion]?.estado_credito,
        "Tipo de crédito": summary[posicion]?.tipo_credito,
        "Fecha de corte": summary[posicion]?.fecha_corte,
        "Indique el tipo de abono": (
          <Select
            required
            className="place-self-stretch"
            id="searchBySorteo"
            name="id_tipo_transaccion"
            options={[
              {
                value: "0",
                label: `Otro Valor`,
              },
              {
                value: "1",
                label: `Valor total deuda`,
              },
              {
                value: "2",
                label: `Valor a fecha de corte`,
              },
            ]}
            value={labelSeleccionado.seleccion}
            onChange={(ev) => {
              const valorSeleccion = ev.target.value;
              const selectedOption = ev.target.options[ev.target.selectedIndex];
              if (valorSeleccion === "1")
                setPagoTotal(summary[posicion]?.valor_deuda);
              if (valorSeleccion === "2")
                setPagoTotal(summary[posicion]?.valor_pagar_fechaCorte);
              setLabelSeleccionado((old) => ({
                ...old,
                label: selectedOption.label,
                seleccion: valorSeleccion,
              }));
            }}
          />
        ),
      }}
    >
      {!loadingPeticion ? (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (pagoTotal !== 0) {
              peticion(
                e,
                pagoTotal,
                choice_numero_obligacion,
                labelSeleccionado.label
              );
            } else {
              notify("Seleccione el tipo de abono");
            }
          }}
          grid
        >
          {labelSeleccionado.label === "Otro Valor" && (
            <MoneyInput
              id="valCashOut"
              name="valCashOut"
              label="Valor a pagar"
              type="text"
              min={enumParametrosBancoAgrario.MIN_PAGO_CARTERA_AGRARIO}
              max={enumParametrosBancoAgrario.MAX_PAGO_CARTERA_AGRARIO}
              autoComplete="off"
              equalError={false}
              equalErrorMin={false}
              maxLength={"9"}
              value={pagoTotal}
              onInput={(e, val) => {
                setPagoTotal(val);
              }}
              required
            />
          )}
          <ButtonBar>
            <Button disabled={loadingPeticion} onClick={handleClose}>
              Cancelar
            </Button>
            <Button type={"submit"} disabled={loadingPeticion}>
              Realizar Pago
            </Button>
          </ButtonBar>
        </Form>
      ) : (
        <h1 className="text-2xl font-semibold">Procesando . . .</h1>
      )}
    </PaymentSummary>
  );
};
