import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useImgs } from "../../../../hooks/ImgsHooks";
import {
  ErrorCustomBackendRechazada,
  TempErrorFrontUser,
} from "../../../../utils/fetchCustomPdp";

import {
  TypingDataInputAuto,
  TypingPeticionCheckUrlProcessOutput,
} from "./utils_typing";
import { TypingDataComercioSimple, TypingTrx } from "../../utils/utils_typing";
import { constMsgTrx } from "../../utils/utils_const";
import classes from "./GouCheckUrlProcess.module.css";

//FRAGMENT ******************** CONST *******************************

const state: any = {
  id_uuid_trx: "e70cbe98-cfea-480d-bc58-85290c6ae134",
  type_operation: 235,
};

//FRAGMENT ******************** COMPONENT *******************************
const GouCheckUrlProcess = () => {
  // const { state } = useLocation();
  const { roleInfo }: any = useAuth();
  const { imgs } = useImgs();
  const goNavigate = useNavigate();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [trx, setTrx] = useState<TypingTrx>({
    status: "Search",
    msg: constMsgTrx.Search,
  });
  const dataInputAuto: TypingDataInputAuto | null = useMemo(() => {
    let error_msg = "";
    let cant_error = 0;
    if (state === null) {
      error_msg = "Datos de entrata faltantes";
      cant_error += 1;
    } else {
      if (typeof state?.id_uuid_trx !== "string") {
        error_msg =
          "Dato de entrata 'id_uuid_trx' faltante o tiene formato incorrecto";
        cant_error += 1;
      } else {
        if (state?.id_uuid_trx.toString().trim() === "") {
          error_msg = "Dato de entrata 'id_uuid_trx' tiene formato incorrecto";
          cant_error += 1;
        }
      }
      if (typeof state?.type_operation !== "number") {
        error_msg =
          "Dato de entrata 'type_operation' faltante o tiene formato incorrecto";
        cant_error += 1;
      }
    }
    if (cant_error > 0) {
      notifyError(TempErrorFrontUser.replace("%s", error_msg), 3000, {
        toastId: "notify-lot-format",
      });
      return null;
    }
    setShowModal(true);
    return {
      id_uuid_trx: state?.id_uuid_trx,
      type_operation: state?.type_operation,
    };
  }, []);

  const handleCloseModal = useCallback(() => {
    // if (loadingPeticion) {
    //   notifyError(
    //     "La transacción continua en verificación, por favor esperar un momento",
    //     5000,
    //     {
    //       toastId: "notify-lot",
    //     }
    //   );
    //   return;
    // }
    goNavigate("../");
  }, [goNavigate]);

  return (
    <Fragment>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {/*************** Trx Search **********************/}
        {dataInputAuto && (
          <Fragment>
            {/* {summaryTrx.id_log && (
              <label className={contendorIdLog}>{summaryTrx.id_log}</label>
            )}
            <img
              className={summaryTrx.id_log ? "pl-20 mb-5" : "pl-20 mb-5"}
              src={`${imgs?.LogoGou}`}
              alt={"LogoGou"}
            /> */}
            <PaymentSummary title={"Obteniendo url de pago"} subtitle={trx.msg}>
              <div>
                {dataInputAuto?.id_uuid_trx && (
                  <label>{dataInputAuto.id_uuid_trx}</label>
                )}
              </div>
            </PaymentSummary>
            {/* {!loadingPeticion && trx.status === "Indefinite" && (
              <div className="pt-4">
                <ButtonBar>
                  <Button onClick={() => goNavigate("../")}>
                    Regresar al inicio
                  </Button>
                </ButtonBar>
              </div>
            )} */}
          </Fragment>
        )}
        {/*************** Trx Search **********************/}
      </Modal>
    </Fragment>
  );
};

export default GouCheckUrlProcess;
