import React, { Fragment, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Modal from "../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { notifyError } from "../../../../../utils/notify";

import { TypingTrx } from "../../../utils/utils_typing";
import {
  dict_segun_order,
  dict_summary_trx_own,
  list_a_dict_segun_order,
} from "../../../utils/utils_function";
import classes from "./GouCheckPayOrigin.module.css";
import {
  constOrderSummary,
  constRelationshipSummary,
} from "../../../utils/utils_const";

//FRAGMENT ******************** CSS *******************************
const { contendorIdLog, contendorPago, labelHash } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsGouCheckPayOrigin = {
  logoGou: any;
  summaryTrx: any;
  trx: TypingTrx;
  loadingPeticion: boolean;
  printDiv: any;
  children: ReactNode;
};
//FRAGMENT ******************** COMPONENT *******************************
const GouChecPayOrigin = ({
  logoGou,
  summaryTrx,
  loadingPeticion,
  trx,
  printDiv,
  children,
}: PropsGouCheckPayOrigin) => {
  const validNavigate = useNavigate();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

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
    validNavigate("../");
  }, [loadingPeticion, validNavigate]);

  return (
    <Fragment>
      <Modal show={true} handleClose={handleCloseModal}>
        {/*************** Trx Search **********************/}
        {trx.status !== "Aprobada" && (
          <Fragment>
            {summaryTrx.id_log && (
              <label className={contendorIdLog}>{summaryTrx.id_log}</label>
            )}
            <img
              className={summaryTrx.id_log ? "pl-20 mb-5" : "pl-20 mb-5"}
              src={`${logoGou}`}
              alt={"LogoGou"}
            />

            <PaymentSummary
              title={trx.msg}
              subtitle={summaryTrx?.msg ?? ""}
              summaryTrx={{
                ...list_a_dict_segun_order(
                  summaryTrx?.summary_trx_asterisk ?? []
                ),
                ...dict_segun_order(
                  constOrderSummary,
                  dict_summary_trx_own(constRelationshipSummary, {
                    ...(summaryTrx?.summary_trx_own ?? {}),
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
                      {formatMoney.format(summaryTrx.valor_trx)}
                    </p>
                  </h1>
                </Fragment>
              )}
              <div className={labelHash}>
                {!summaryTrx?.id_trx && <label>{summaryTrx.id_unico}</label>}
              </div>
            </PaymentSummary>
            {!loadingPeticion && (
              <div className={!summaryTrx?.summary_trx ? "pt-4" : ""}>
                <ButtonBar>
                  <Button onClick={() => validNavigate("../")}>
                    Regresar al inicio
                  </Button>
                </ButtonBar>
              </div>
            )}
          </Fragment>
        )}
        {/*************** Trx Search **********************/}
        {/**************** Trx Aprobada **********************/}
        {trx.status === "Aprobada" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            {children}
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={() => validNavigate("../")}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Trx Aprobada **********************/}
      </Modal>
    </Fragment>
  );
};

export default GouChecPayOrigin;
