import React, { Fragment, useState } from "react";
import Button from "../../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../../../components/Base/MoneyInput";
import PaymentSummary from "../../../../../../../components/Compound/PaymentSummary";
import Select from "../../../../../../../components/Base/Select/Select";
import classes from "../../../Runt/PagarRunt.module.css"
import { notify } from "../../../../../../../utils/notify";
const { styleComponents } = classes;
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
  const [labelSeleccionado, setLabelSeleccionado] = useState('');
  const [pagoTotal, setPagoTotal] = useState(false);
  const [choice_numero_obligacion, setChoicePagoTotal] = useState(summary[posicion]?.numero_obligacion);
  return (
      <PaymentSummary
        title="¿Está seguro de realizar la transacción?"
        subtitle="Resumen de transacción"
      summaryTrx={{          
        "Valor a pagar para fecha de corte": formatMoney.format(summary[posicion]?.valor_pagar_fechaCorte),
        [documento === "LecturaNumeroObligacion" ? "Número de Obligación" : documento === "LecturaNumeroCedula" ? "Número de Cédula" : ""]: summary[posicion]?.numero_obligacion,
        "Valor total de la deuda": formatMoney.format(summary[posicion]?.valor_deuda),
        "Valor total vencido": formatMoney.format(summary[posicion]?.valor_vencido),
        "Valor total vigente": formatMoney.format(summary[posicion]?.valor_vigente),
        "Estado del crédito": (summary[posicion]?.estado_credito),
        "Tipo de crédito": (summary[posicion]?.tipo_credito),
        "Fecha de corte": (summary[posicion]?.fecha_corte),
          "Indique el tipo de abono": (
            <Select
              required
              className="place-self-stretch"
              id="searchBySorteo"
              name="id_tipo_transaccion"
              options={[
                { value: "", label: "" },
                {
                  value: summary[posicion]?.valor_deuda,
                  label: `Valor total deuda`,
                },
                {
                  value: summary[posicion]?.valor_pagar_fechaCorte,
                  label: `Valor a fecha de corte`,
                },
              ]}
              value={pagoTotal}
              onChange={(ev) => {
                setPagoTotal(ev.target.value);
                const selectedOption = ev.target.options[ev.target.selectedIndex];
                setLabelSeleccionado(selectedOption.label);
              }}
            />
          ),
        }}
      >
        {!loadingPeticion ? (
          <>
            <ButtonBar>
            <Button type={"submit"} disabled={loadingPeticion} onClick={(e) => {
              e.preventDefault(); 
              if (pagoTotal !== false) {
                peticion(e, pagoTotal, choice_numero_obligacion, labelSeleccionado)
              } else { 
                notify("Seleccione el tipo de abono")
              }
            }}>
                Pagar
              </Button>
              <Button onClick={handleClose}>Cancelar</Button>
            </ButtonBar>
          </>
        ) : (
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        )}
      </PaymentSummary>
  );
};
