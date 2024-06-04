import React, {
  Fragment,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import Button from "../../../../../components/Base/Button";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { notifyError } from "../../../../../utils/notify";

import { TypingTrx } from "../../../utils/utils_typing";
import {
  ajust_tam_see,
  dict_segun_order,
  dict_summary_trx_own,
  list_a_dict_segun_order,
} from "../../../utils/utils_function";
import {
  constOrderSummary,
  constRelationshipSummary,
} from "../../../utils/utils_const";
import classes from "./PasarelaCheckPayOrigin.module.css";
import { TypingOutputPrePay } from "../../utils/utils_typing";

//FRAGMENT ******************** CSS *******************************
const { contendorIdLog, contendorPago, labelHash, contenedorButton } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsPasarelaCheckPayOrigin = {
  destino: string;
  componentLogo: ReactNode;
  url_return_front: string;
  summaryTrx: any;
  trx: TypingTrx;
  loadingPeticion: boolean;
  outputPrePay: TypingOutputPrePay | null;
};
//FRAGMENT ******************** COMPONENT *******************************
const PasarelaChecPayOrigin = ({
  destino,
  componentLogo,
  url_return_front,
  summaryTrx,
  loadingPeticion,
  trx,
  outputPrePay,
}: PropsPasarelaCheckPayOrigin) => {
  const validNavigate = useNavigate();
  const [disabledButton, setDisabledButton] = useState<boolean>(false);

  const handleCloseModal = useCallback(() => {
    if (loadingPeticion) {
      notifyError(
        "La transacción continua en verificación, por favor esperar un momento",
        5000,
        {
          toastId: "notify-lot",
        }
      );
      return;
    }
    validNavigate(url_return_front);
  }, [loadingPeticion, validNavigate, url_return_front]);

  const onSubmitContinuar = useCallback(() => {
    window.open(outputPrePay?.url_process);
    setDisabledButton(true);
  }, [outputPrePay?.url_process]);

  return (
    <Fragment>
      <Modal show={true} handleClose={handleCloseModal}>
        {/*************** Trx Search **********************/}
        {trx.status !== "Aprobada" && (
          <Fragment>
            {summaryTrx.id_log && (
              <label className={contendorIdLog}>{summaryTrx.id_log}</label>
            )}
            <div className={destino === "GOU" ? "grid justify-center" : ""}>
              {componentLogo}
            </div>

            <PaymentSummary
              title={trx.msg}
              subtitle={
                !disabledButton
                  ? summaryTrx?.msg ?? ""
                  : "Por favor continuar el pago, con el link de pago generado"
              }
              summaryTrx={{
                ...list_a_dict_segun_order(
                  [...summaryTrx?.summary_trx_asterisk] ?? []
                ),
                ...dict_segun_order(
                  constOrderSummary,
                  dict_summary_trx_own(constRelationshipSummary, {
                    ...({ ...summaryTrx?.summary_trx_own } ?? {}),
                    status: trx.status,
                    id_trx: summaryTrx?.id_trx,
                  })
                ),
              }}
            >
              {summaryTrx.valor_trx && (
                <Fragment>
                  <h1 className={contendorPago}>
                    <strong className="justify-self-end">Pago:</strong>
                    <p className="justify-self-start whitespace-pre-wrap">
                      {`${formatMoney.format(summaryTrx.valor_trx)} COP`}
                    </p>
                  </h1>
                </Fragment>
              )}
              <div className={labelHash}>
                {!summaryTrx?.id_trx && !summaryTrx?.id_log && (
                  <label>{ajust_tam_see(summaryTrx.id_unico, 50)}</label>
                )}
              </div>
            </PaymentSummary>
            {!loadingPeticion && (
              <div className={contenedorButton}>
                {outputPrePay?.url_process && (
                  <Button
                    type={"submit"}
                    onClick={onSubmitContinuar}
                    disabled={disabledButton}
                  >
                    {!disabledButton
                      ? "Generar link de pago"
                      : "Ya se generó link de pago"}
                  </Button>
                )}
                {/* {!disabledButton && (
                  <Button design="danger" onClick={() => {}}>
                    Cancelar Transacción
                  </Button>
                )} */}
                <Button
                  onClick={() =>
                    validNavigate(
                      !disabledButton ? url_return_front : "../transacciones"
                    )
                  }
                >
                  {!disabledButton
                    ? "Regresar al inicio"
                    : "Modulo de transacciones"}
                </Button>
              </div>
            )}
          </Fragment>
        )}
        {/*************** Trx Search **********************/}
      </Modal>
    </Fragment>
  );
};

export default PasarelaChecPayOrigin;
