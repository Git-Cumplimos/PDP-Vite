import React, { Fragment, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Modal from "../../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../../components/Compound/PaymentSummary";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import { formatMoney } from "../../../../../../components/Base/MoneyInput";
import { notifyError } from "../../../../../../utils/notify";
import { TypeInfTicket } from "../../../../../../utils/TypingUtils";

import TicketsGou from "../../../../components/TicketsGou";
import {
  TypingDataPath,
  TypingSummaryTrx,
  TypingTrx,
} from "../../../../utils/utils_typing";
import { ajust_tam_see } from "../../../../utils/utils_function";
import classes from "./GouCheckPayOrigin.module.css";

//FRAGMENT ******************** CONST *******************************
const { contendorIdLog, contendorPago, labelHash } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsGouCheckPayOrigin = {
  imgs: any;
  dataPath: TypingDataPath | null;
  summaryTrx: TypingSummaryTrx;
  trx: TypingTrx;
  loadingPeticion: boolean;
  ticket: TypeInfTicket | null;
};
//FRAGMENT ******************** COMPONENT *******************************
const GouChecPayOrigin = ({
  imgs,
  dataPath,
  summaryTrx,
  loadingPeticion,
  trx,
  ticket,
}: PropsGouCheckPayOrigin) => {
  const validNavigate = useNavigate();
  const printDiv = useRef(null);

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
        {dataPath && trx.status !== "Aprobada" && (
          <Fragment>
            {summaryTrx.id_log && (
              <label className={contendorIdLog}>{summaryTrx.id_log}</label>
            )}
            <img
              className={summaryTrx.id_log ? "pl-20 mb-5" : "pl-20 mb-5"}
              src={`${imgs?.LogoGou}`}
              alt={"LogoGou"}
            />

            <PaymentSummary
              title={trx.msg}
              subtitle={summaryTrx?.msg ?? ""}
              summaryTrx={summaryTrx.summary_trx}
            >
              <div className={labelHash}>
                {dataPath?.id_hash &&
                  summaryTrx?.summary_trx?.["Id transacción"] === undefined && (
                    <label>{ajust_tam_see(dataPath.id_hash, 50)}</label>
                  )}
              </div>

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
            <TicketsGou ticket={ticket} refPrint={printDiv} />
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
