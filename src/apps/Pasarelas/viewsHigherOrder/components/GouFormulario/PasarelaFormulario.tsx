import React, {
  ChangeEvent,
  Dispatch,
  FunctionComponent,
  MouseEvent,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";

import ModalInfoClient from "./ModalInfoClient/ModalInfoClient";
import {
  TypingOnChangeDataInputSon,
  TypingDataSettingValor,
  TypingFormClientDataInput,
  TypingFormClientInputs,
  TypingFormTrxInputs,
  TypingFormTrxDataInput,
  TypingFormDataInput,
  TypingFormAddDataInput,
  TypingInfoClient,
} from "../../utils/utils_typing";
import classes from "./PasarelaFormulario.module.css";
import { do_compare, get_value } from "../../../utils/utils_function";
import FormClient from "./DistinctForm/FormClient";
import FormTrx from "./DistinctForm/FormTrx";
import { notifyError } from "../../../../../utils/notify";

//FRAGMENT ********************* CSS *********************************
const { contendorFather } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsPasarelaFormulario = {
  ComponentLogo: FunctionComponent;
  infoClient: TypingInfoClient;
  dataSettingValor: TypingDataSettingValor;
  onChangeDataInputSon?: TypingOnChangeDataInputSon;
  onSubmitCheckPrePay: (ev: MouseEvent<HTMLFormElement>) => void;
  formClientInputs: TypingFormClientInputs;
  formTrxInputs: TypingFormTrxInputs;
  formClientDataInput: TypingFormClientDataInput;
  setFormClientDataInput: Dispatch<SetStateAction<TypingFormClientDataInput>>;
  formTrxDataInput: TypingFormTrxDataInput;
  setFormTrxDataInput: Dispatch<SetStateAction<TypingFormTrxDataInput>>;
  formAddDataInput: TypingFormAddDataInput;
  setFormAddDataInput: Dispatch<SetStateAction<TypingFormAddDataInput>>;
  children: ReactNode;
};
export type TypingFormClientDataInputCheck = {
  "correo|confirmacion"?: string;
  "celular|confirmacion"?: string;
};

export type TypingDataInvalid = {
  "correo|confirmacion": string;
  celular: string;
  "celular|confirmacion": string;
};

//FRAGMENT ******************** CONST ***********************************
export const formClientDataInputCheckInitial: TypingFormClientDataInputCheck = {
  "correo|confirmacion": "",
  "celular|confirmacion": "",
};
export const dataInvalidInitial: TypingDataInvalid = {
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
};

//FRAGMENT ******************** COMPONENT ***************************
const PasarelaFormulario = ({
  ComponentLogo,
  infoClient,
  dataSettingValor,
  onChangeDataInputSon,
  onSubmitCheckPrePay,
  formClientInputs,
  formTrxInputs,
  formClientDataInput,
  setFormClientDataInput,
  formTrxDataInput,
  setFormTrxDataInput,
  formAddDataInput,
  setFormAddDataInput,
  children,
}: PropsPasarelaFormulario) => {
  const [formClientDataInputCheck, setFormClientDataInputCheck] =
    useState<TypingFormClientDataInputCheck>(formClientDataInputCheckInitial);
  const [dataInvalid, setDataInvalid] =
    useState<TypingDataInvalid>(dataInvalidInitial);

  const onChangeDataInputBase = useCallback(
    (
      ev: ChangeEvent<HTMLFormElement>,
      formDataInput_: TypingFormDataInput,
      dataInvalid_: TypingDataInvalid,
      formClientDataInputCheck_: TypingFormClientDataInputCheck
    ) => {
      const structure_get_value = ev.target.id.split("/")[1];
      if (structure_get_value) {
        const [value, is_change, msg_invalid_get_value] = get_value(
          structure_get_value,
          ev.target.value ?? ""
        );
        if (is_change) {
          if (formDataInput_.formClientDataInput.hasOwnProperty(ev.target.name))
            formDataInput_.setFormClientDataInput((old) => ({
              ...old,
              [ev.target.name]: value,
            }));
          if (formClientDataInputCheck_.hasOwnProperty(ev.target.name))
            setFormClientDataInputCheck((old) => ({
              ...old,
              [ev.target.name]: value,
            }));
          if (formDataInput_.formTrxDataInput.hasOwnProperty(ev.target.name)) {
            formDataInput_.setFormTrxDataInput((old) => ({
              ...old,
              [ev.target.name]: value,
            }));
            return;
          }
        }
        if (dataInvalid_.hasOwnProperty(ev.target.name)) {
          setDataInvalid((old) => ({
            ...old,
            [ev.target.name]: msg_invalid_get_value,
          }));
        }
        const structure_compare = ev.target.id.split("/")[2];
        if (structure_compare) {
          const [, key_change, msg_invalid_do_compare] = do_compare(
            {
              ...formDataInput_.formClientDataInput,
              ...formClientDataInputCheck_,
            },
            ev.target.name,
            value,
            structure_compare
          );
          if (
            dataInvalid_.hasOwnProperty(key_change) &&
            msg_invalid_get_value === ""
          ) {
            setDataInvalid((old) => ({
              ...old,
              [key_change]: msg_invalid_do_compare,
            }));
          }
        }
      }
    },
    []
  );

  const onChangeDataInput = useCallback(
    (
      ev: ChangeEvent<HTMLFormElement>,
      formDataInput_: TypingFormDataInput,
      dataInvalid_: TypingDataInvalid,
      formClientDataInputCheck_: TypingFormClientDataInputCheck
    ) => {
      const cant = (ev.target.id ?? "").split("/");
      if (ev.target.name === undefined && cant.length === 0) {
        if (onChangeDataInputSon) onChangeDataInputSon(ev, formDataInput_);
        return;
      }
      if (formClientInputs.hasOwnProperty(ev.target.name)) {
        const formClientInputs_: { [key: string]: any } = {
          ...formClientInputs,
        };
        if (formClientInputs_?.[ev.target.name] === null)
          onChangeDataInputBase(
            ev,
            formDataInput_,
            dataInvalid_,
            formClientDataInputCheck_
          );
        else {
          if (onChangeDataInputSon) onChangeDataInputSon(ev, formDataInput_);
          return;
        }
      } else if (formTrxInputs.hasOwnProperty(ev.target.name)) {
        const formTrxInputs_: { [key: string]: any } = {
          ...formClientInputs,
        };
        if (formTrxInputs_?.[ev.target.name] === null)
          onChangeDataInputBase(
            ev,
            formDataInput_,
            dataInvalid_,
            formClientDataInputCheck_
          );
        else {
          if (onChangeDataInputSon) onChangeDataInputSon(ev, formDataInput_);
          return;
        }
      } else {
        onChangeDataInputBase(
          ev,
          formDataInput_,
          dataInvalid_,
          formClientDataInputCheck_
        );
      }
    },
    [
      onChangeDataInputBase,
      formClientInputs,
      formTrxInputs,
      onChangeDataInputSon,
    ]
  );

  const onSubmitSchemaForm = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      if (
        formClientInputs.celular !== undefined &&
        formClientInputs["celular|confirmacion"] !== undefined
      ) {
        if (
          formClientDataInput.celular !==
          formClientDataInputCheck["celular|confirmacion"]
        ) {
          notifyError("Verifique el número de celular", 5000, {
            toastId: "notify-lot",
          });
          return;
        }
      }
      if (
        formClientInputs.correo !== undefined &&
        formClientInputs["correo|confirmacion"] !== undefined
      ) {
        if (
          formClientDataInput.correo !==
          formClientDataInputCheck["correo|confirmacion"]
        ) {
          notifyError("Verifique el correo electrónico", 5000, {
            toastId: "notify-lot",
          });
          return;
        }
      }
      onSubmitCheckPrePay(ev);
    },
    [
      formClientInputs,
      formClientDataInput.celular,
      formClientDataInput.correo,
      formClientDataInputCheck,
      onSubmitCheckPrePay,
    ]
  );

  return (
    <div>
      <form
        onChange={(ev: ChangeEvent<HTMLFormElement>) =>
          onChangeDataInput(
            ev,
            {
              formClientDataInput,
              setFormClientDataInput,
              formTrxDataInput,
              setFormTrxDataInput,
              formAddDataInput,
              setFormAddDataInput,
            },
            dataInvalid,
            formClientDataInputCheck
          )
        }
        onSubmit={onSubmitSchemaForm}
        className="grid grid-cols-1 place-content-center place-items-center"
      >
        <fieldset className={contendorFather}>
          <ComponentLogo></ComponentLogo>
          {formClientDataInput && (
            <FormClient
              formClientInputs={formClientInputs}
              formClientDataInput={formClientDataInput}
              formClientDataInputCheck={formClientDataInputCheck}
              dataInvalid={dataInvalid}
            ></FormClient>
          )}
          {formTrxDataInput && (
            <FormTrx
              dataSettingValor={dataSettingValor}
              formTrxInputs={formTrxInputs}
              formTrxDataInput={formTrxDataInput}
              setFormTrxDataInput={setFormTrxDataInput}
            ></FormTrx>
          )}
          <ModalInfoClient
            infoClient={infoClient}
            valueReplace={{
              "{{{valor_costo_trx}}}":
                dataSettingValor.valor_costo_trx.toString(),
            }}
          ></ModalInfoClient>
        </fieldset>
        <div className="grid grid-cols-2">
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>Realizar Pago</Button>
            {/* <Button onClick={() => handleCloseNinguno(true, routeInicial)}>
              Cancelar
            </Button> */}
          </ButtonBar>
        </div>
      </form>
    </div>
  );
};

export default PasarelaFormulario;
