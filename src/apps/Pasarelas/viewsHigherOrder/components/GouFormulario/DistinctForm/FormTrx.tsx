import React, { Dispatch, SetStateAction } from "react";
import Input from "../../../../../../components/Base/Input";
import MoneyInput, {
  formatMoney,
} from "../../../../../../components/Base/MoneyInput";
import classes from "../PasarelaFormulario.module.css";
import {
  TypingDataSettingValor,
  TypingFormTrxDataInput,
  TypingFormTrxInputs,
} from "../../../utils/utils_typing";

//FRAGMENT ********************* CSS *********************************
const { contendorFormTrx } = classes;
//FRAGMENT ******************** TYPING *******************************
type PropsFormTrx = {
  dataSettingValor: TypingDataSettingValor;
  formTrxInputs: TypingFormTrxInputs;
  formTrxDataInput: TypingFormTrxDataInput;
  setFormTrxDataInput: Dispatch<SetStateAction<TypingFormTrxDataInput>>;
};

//FRAGMENT ******************** COMPONENT ***************************
const FormTrx = ({
  dataSettingValor,
  formTrxInputs,
  formTrxDataInput,
  setFormTrxDataInput,
}: PropsFormTrx) => {
  return (
    <fieldset className={contendorFormTrx}>
      <legend className="font-bold text-xl">
        Descripción de la transacción
      </legend>
      {formTrxInputs?.tipo_tramite !== undefined && (
        <Input
          label="Tipo de trámite"
          type="text"
          autoComplete="off"
          value={formTrxDataInput.tipo_tramite}
          required
          disabled={
            formTrxInputs?.tipo_tramite === true ||
            formTrxInputs?.tipo_tramite === false
              ? true
              : false
          }
        />
      )}
      {formTrxInputs?.id_unico !== undefined && (
        <Input
          label="Id único"
          type="text"
          autoComplete="off"
          value={formTrxDataInput.id_unico}
          required
          disabled={
            formTrxInputs?.id_unico === true ||
            formTrxInputs?.id_unico === false
              ? true
              : false
          }
        />
      )}

      {formTrxInputs?.referencia !== undefined && (
        <Input
          label="Número de referencia"
          type="text"
          autoComplete="off"
          maxLength={70}
          value={formTrxDataInput.referencia}
          required
          disabled={
            formTrxInputs?.referencia === true ||
            formTrxInputs?.referencia === false
              ? true
              : false
          }
        />
      )}

      {formTrxInputs?.fecha !== undefined && (
        <Input
          label="Fecha"
          type="text"
          autoComplete="off"
          maxLength={12}
          value={formTrxDataInput.fecha}
          required
          disabled={
            formTrxInputs?.fecha === true || formTrxInputs?.fecha === false
              ? true
              : false
          }
        />
      )}
      {formTrxInputs?.valor_trx !== undefined && (
        <MoneyInput
          name="valor_trx"
          label="Valor a pagar"
          // decimalDigits={2} //No Se usa este por que es con decimales
          equalError={dataSettingValor?.valor_trx_maximo_exacto ? false : true}
          equalErrorMin={
            dataSettingValor?.valor_trx_minimo_exacto ? false : true
          }
          autoComplete="off"
          min={
            dataSettingValor?.valor_trx_minimo_exacto ??
            dataSettingValor?.valor_trx_minimo
          }
          max={
            dataSettingValor?.valor_trx_maximo_exacto ??
            dataSettingValor?.valor_trx_maximo
          }
          maxLength={dataSettingValor.cant_valor_trx_maximo}
          // defaultValue={inputData.valor_total_trx} //No Se usa este por que es con decimales
          value={formTrxDataInput.valor_trx} //se usa este por que es con decimales
          onInput={(ev: any, valor: any) => {
            setFormTrxDataInput((old) => ({
              ...old,
              [ev.target.name]: valor,
            }));
          }}
          required
          disabled={
            formTrxInputs?.valor_trx === true ||
            formTrxInputs?.valor_trx === false
              ? true
              : false
          }
        />
      )}

      <label className="px-5 pt-6 text-xl font-medium text-center">
        {`Señor usuario tenga en cuenta que esta transacción tiene un costo
    de ${formatMoney.format(
      dataSettingValor.valor_costo_trx ?? 0
    )} el cual será debitado de su cupo`}
      </label>
    </fieldset>
  );
};

export default FormTrx;
