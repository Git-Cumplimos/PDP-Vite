import React, {
  Dispatch,
  MouseEvent,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

import Input from "../../../../../components/Base/Input";
import MoneyInput from "../../../../../components/Base/MoneyInput";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";

import ModalExterno from "./ModalInfoClient/ModalExterno";
import {
  TypingDataInputRequired,
  TypingDataInputOrigin,
  TypingDataInputOriginAuto,
  TypingOnChangeDataInputAdd,
} from "../../utils/utils.typing";
import { TypingShowModalInfoClient } from "./ModalInfoClient/TypingModalInfoClient";
import classes from "./GouFormulario.module.css";

//FRAGMENT ********************* CSS *********************************
const { contendorFather, contendorSoon, contendorSoonTrx } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsGouFormulario = {
  logoGou: any;
  dataInputOrigin: TypingDataInputOrigin;
  dataInputOriginAuto: TypingDataInputOriginAuto;
  dataInputRequired: TypingDataInputRequired;
  setDataInputOrigin: Dispatch<SetStateAction<TypingDataInputOrigin>>;
  onChangeDataInputAdd: TypingOnChangeDataInputAdd;
  onSubmitCheckPay: (ev: MouseEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

//FRAGMENT ******************** COMPONENT ***************************
const GouFormulario = ({
  logoGou,
  dataInputOrigin,
  dataInputOriginAuto,
  dataInputRequired,
  setDataInputOrigin,
  onChangeDataInputAdd,
  onSubmitCheckPay,
  children,
}: PropsGouFormulario) => {
  const [showModalInfoClient, setShowModalInfoClient] =
    useState<TypingShowModalInfoClient>(null);
  const [acepto, setAcepto] = useState<boolean>(false);

  return (
    <div>
      <form
        onChange={onChangeDataInputAdd}
        onSubmit={onSubmitCheckPay}
        className="grid grid-cols-1 place-content-center place-items-center"
      >
        <fieldset className={contendorFather}>
          <img className={"mb-2 mt-8"} src={`${logoGou}`} alt={"LogoGou"} />
          <div className={contendorSoon}>{children}</div>
          <fieldset className={contendorSoonTrx}>
            <legend className="font-bold text-xl">
              Descripción de la transacción
            </legend>
            <Input
              label="Tipo de trámite"
              type="text"
              autoComplete="off"
              value={dataInputRequired.tipo_tramite}
              required
              disabled
            />
            <Input
              label="Id único"
              type="text"
              autoComplete="off"
              value={dataInputRequired.id_unico_form}
              required
              disabled
            />
            <Input
              label="Número de referencia"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInputRequired.referencia}
              required
              disabled
            />
            <Input
              label="Fecha"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInputOriginAuto.fecha}
              required
              disabled
            />
            <MoneyInput
              name="valor_trx"
              label="Valor a pagar"
              // decimalDigits={2} //No Se usa este por que es con decimales
              equalError={false}
              equalErrorMin={false}
              autoComplete="off"
              min={10000}
              maxLength={11}
              // defaultValue={inputData.valor_total_trx} //No Se usa este por que es con decimales
              value={dataInputOrigin.valor_trx} //se usa este por que es con decimales
              onInput={(ev: any, valor: any) => {
                setDataInputOrigin((old) => ({
                  ...old,
                  [ev.target.name]: valor,
                }));
              }}
              required
            />
            <label className="px-5 pt-6 text-xl font-medium text-center">
              Señor usuario tenga en cuenta que esta transacción tiene un costo
              de $500 el cual será debitado de su cupo
            </label>
          </fieldset>
          <ButtonBar>
            <Button onClick={() => setShowModalInfoClient("Questions")}>
              Preguntas frecuentes
            </Button>
            <Button onClick={() => setShowModalInfoClient("Comunication")}>
              Canales de comunicación
            </Button>
          </ButtonBar>
          <Input
            type="checkbox"
            label="Acepta Términos y Condiciones"
            required
            value={"acepto"}
            onChange={() =>
              setAcepto((old) => {
                if (!old) {
                  setShowModalInfoClient("AceptarTerminos");
                  return old;
                } else {
                  return false;
                }
              })
            }
            checked={acepto}
          />
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
      {showModalInfoClient && (
        <ModalExterno
          showModalInfoClient={showModalInfoClient}
          setShowModalInfoClient={setShowModalInfoClient}
          setAcepto={setAcepto}
        ></ModalExterno>
      )}
    </div>
  );
};

export default GouFormulario;
