import React, { Fragment, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PaymentSummary from "../../../../../../components/Compound/PaymentSummary";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Modal from "../../../../../../components/Base/Modal";
import { TypeInfTicket } from "../../../../../../utils/TypingUtils";
import { formatMoney } from "../../../../../../components/Base/MoneyInput";

import TicketsGou from "../../../../components/TicketsGou";
import {
  TypingDataPath,
  TypingSummaryTrx,
  TypingTrx,
} from "../../../../utils/utils_typing";
import {
  ajust_tam_see,
  dict_segun_order,
  dict_summary_trx_own,
  list_a_dict_segun_order,
} from "../../../../utils/utils_function";
import classes from "./GouCheckPayCross.module.css";
import {
  constOrderSummary,
  constRelationshipSummary,
} from "../../../../utils/utils_const";

//FRAGMENT ******************** CONST *******************************
const { contendorBorder, contendorIdLog, contendorPago } = classes;

//FRAGMENT ******************** TYPING *******************************
type PropsGouCheckPayCross = {
  imgs: any;
  dataPath: TypingDataPath | null;
  summaryTrx: TypingSummaryTrx;
  trx: TypingTrx;
  loadingPeticion: boolean;
  ticket: TypeInfTicket | null;
};

//FRAGMENT ******************** COMPONENT *******************************
const GouCheckPayCross = ({
  imgs,
  dataPath,
  summaryTrx,
  trx,
  loadingPeticion,
  ticket,
}: PropsGouCheckPayCross) => {
  const validNavigate = useNavigate();
  const printDiv = useRef(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      {dataPath && (
        <div className={contendorBorder}>
          {summaryTrx.id_log && (
            <label className={contendorIdLog}>{summaryTrx.id_log}</label>
          )}
          <img
            className={summaryTrx.id_log ? "mb-5" : "mb-5 mt-8"}
            src={`${imgs?.LogoEvertec}`}
            alt={"LogoEvertec"}
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
                  status: trx.status !== "Search" ? trx.status : undefined,
                  id_trx: summaryTrx?.id_trx,
                })
              ),
            }}
          >
            {dataPath?.id_hash && !summaryTrx?.id_trx && (
              <label>{ajust_tam_see(dataPath.id_hash, 50)}</label>
            )}

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
          {!loadingPeticion && trx.status === "Aprobada" && (
            <Fragment>
              <br />
              <Button type="submit" onClick={() => setShowModal(true)}>
                Descargar comprobante de pago
              </Button>
            </Fragment>
          )}
          {!loadingPeticion && (
            <div className={trx.status !== "Aprobada" ? "pt-4" : ""}>
              <Button onClick={() => validNavigate("../")}>
                Regresar al inicio
              </Button>
            </div>
          )}
        </div>
      )}
      <Modal show={showModal && ticket} handleClose={() => setShowModal(false)}>
        {/**************** Trx Aprobada **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          <TicketsGou ticket={ticket} refPrint={printDiv} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ButtonBar>
        </div>
        {/**************** Trx Aprobada **********************/}
      </Modal>
    </Fragment>
  );
};

export default GouCheckPayCross;
