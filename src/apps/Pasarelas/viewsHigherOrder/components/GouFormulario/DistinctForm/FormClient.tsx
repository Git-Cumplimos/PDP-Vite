import React, { Fragment } from "react";
import Input from "../../../../../../components/Base/Input";
import Select from "../../../../../../components/Base/Select";
import {
  TypingFormClientDataInput,
  TypingFormClientInputs,
} from "../../../utils/utils_typing";
import {
  TypingDataInvalid,
  TypingFormClientDataInputCheck,
} from "../PasarelaFormulario";
import classes from "../PasarelaFormulario.module.css";

//FRAGMENT ********************* CSS *********************************
const { contendorFormClient } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsFormClient = {
  formClientInputs: TypingFormClientInputs;
  formClientDataInput: TypingFormClientDataInput;
  formClientDataInputCheck: TypingFormClientDataInputCheck;
  dataInvalid: TypingDataInvalid;
};

//FRAGMENT ******************** CONST ***********************************
const tipoDocumentoOptions: { [key: string]: string } = {
  CC: "Cedula de Ciudadanía",
  CE: "Cédula de Extranjería",
  TI: "Tarjeta de Identidad",
  NIT: "Número de Identificación Tributaria",
  RUT: "Registro Único Tributario",
};
const options_select: Array<{ value: string; label: string }> = Object.keys(
  tipoDocumentoOptions
).map((key_: string) => ({
  value: key_,
  label: tipoDocumentoOptions[key_],
}));

//FRAGMENT ******************** COMPONENT ***************************
const FormClient = ({
  formClientInputs,
  formClientDataInput,
  formClientDataInputCheck,
  dataInvalid,
}: PropsFormClient) => {
  return (
    <fieldset className={contendorFormClient}>
      <div
        className={
          formClientInputs?.nombres !== undefined &&
          formClientInputs?.apellidos !== undefined
            ? ""
            : "col-span-2"
        }
      >
        {formClientInputs?.nombres !== undefined && (
          <Input
            required
            id="nombres/text"
            name="nombres"
            label="Nombres"
            type="text"
            autoComplete="off"
            maxLength={20}
            disabled={
              formClientInputs?.nombres === true ||
              formClientInputs?.nombres === false
                ? true
                : false
            }
            value={formClientDataInput.nombres}
          />
        )}
      </div>

      <div
        className={
          formClientInputs?.nombres !== undefined &&
          formClientInputs?.apellidos !== undefined
            ? ""
            : "col-span-2"
        }
      >
        {formClientInputs?.apellidos !== undefined && (
          <Input
            required
            id="apellidos/text"
            name="apellidos"
            label="Apellidos"
            type="text"
            autoComplete="off"
            maxLength={20}
            disabled={
              formClientInputs?.apellidos === true ||
              formClientInputs?.apellidos === false
                ? true
                : false
            }
            value={formClientDataInput.apellidos ?? ""}
          />
        )}
      </div>

      <div
        className={
          formClientInputs?.tipo_documento !== undefined &&
          formClientInputs?.documento !== undefined
            ? ""
            : "col-span-2"
        }
      >
        {formClientInputs?.tipo_documento !== undefined && (
          <Select label="Tipo de documento" options={options_select} />
        )}
      </div>

      <div
        className={
          formClientInputs?.tipo_documento !== undefined &&
          formClientInputs?.documento !== undefined
            ? ""
            : "col-span-2"
        }
      >
        {formClientDataInput?.documento !== undefined && (
          <Input
            required
            id="documento/number"
            name="documento"
            label="Número de documento"
            type="text"
            autoComplete="off"
            minLength={5}
            maxLength={10}
            disabled={
              formClientInputs?.documento === true ||
              formClientInputs?.documento === false
                ? true
                : false
            }
            value={formClientDataInput.documento}
          />
        )}
      </div>

      {formClientInputs?.celular !== undefined && (
        <Fragment>
          <div
            className={
              formClientInputs.celular !== undefined &&
              formClientInputs?.["celular|confirmacion"] !== undefined
                ? ""
                : "col-span-2"
            }
          >
            <Input
              required
              id="celular/cel/celular|confirmacion=>celular"
              name="celular"
              label="Número de celular"
              type="text"
              autoComplete="off"
              minLength={10}
              maxLength={10}
              disabled={
                formClientInputs?.celular === true ||
                formClientInputs?.celular === false
                  ? true
                  : false
              }
              value={formClientDataInput.celular}
              invalid={dataInvalid.celular}
            />
          </div>

          {formClientInputs?.["celular|confirmacion"] !== undefined && (
            <Input
              required
              id="celular|confirmacion/cel/celular|confirmacion=>celular"
              name="celular|confirmacion"
              label="Confirmar número de celular"
              type="text"
              autoComplete="off"
              minLength={10}
              maxLength={10}
              value={formClientDataInputCheck["celular|confirmacion"]}
              invalid={dataInvalid["celular|confirmacion"]}
              onPaste={(ev) => ev.preventDefault()}
              onDrop={(ev) => ev.preventDefault()}
            />
          )}
        </Fragment>
      )}
      {formClientInputs?.correo !== undefined && (
        <Fragment>
          <div className="pt-5 col-span-2">
            <Input
              required
              id="correo/email/correo|confirmacion=>correo"
              name="correo"
              label="Correo electrónico"
              type="email"
              autoComplete="off"
              maxLength={100}
              disabled={
                formClientInputs?.correo === true ||
                formClientInputs?.correo === false
                  ? true
                  : false
              }
              value={formClientDataInput.correo}
            />
          </div>
          {formClientInputs?.["correo|confirmacion"] !== undefined && (
            <div className="col-span-2">
              <Input
                required
                id="correo|confirmacion/email/correo|confirmacion=>correo"
                name="correo|confirmacion"
                label="Confirmación de correo electrónico"
                type="email"
                autoComplete="off"
                maxLength={100}
                value={formClientDataInputCheck["correo|confirmacion"]}
                invalid={dataInvalid["correo|confirmacion"]}
                onPaste={(ev) => ev.preventDefault()}
                onDrop={(ev) => ev.preventDefault()}
              />
            </div>
          )}
        </Fragment>
      )}
    </fieldset>
  );
};

export default FormClient;
