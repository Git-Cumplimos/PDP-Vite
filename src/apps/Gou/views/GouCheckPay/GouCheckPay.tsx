import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useImgs } from "../../../../hooks/ImgsHooks";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { TypeInfTicket } from "../../../../utils/TypingUtils";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { TempErrorFrontUser } from "../../../../utils/fetchCustomPdp";
import classes from "./GouCheckPay.module.css";
import useHookGouCheckPay from "../../hook/useHookGouCheckPay";
import {
  TypingCheckPay,
  TypingDataComercioSimple,
  TypingDataPath,
} from "../../utils/utils_typing";
import TicketsGou from "../../components/TicketsGou";
//FRAGMENT ******************** CONST *******************************
const { contendorBorder, contendorPago, contendorIdLog } = classes;

//FRAGMENT ******************** COMPONENT *******************************
const GouCheckPay = () => {
  const { roleInfo }: any = useAuth();
  const { imgs } = useImgs();
  const printDiv = useRef(null);
  const params = useParams();
  const validNavigate = useNavigate();
  const [dataPath, setDataPath] = useState<TypingDataPath | null>(null);
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const {
    loadingPeticion,
    PeticionCheckPay,
    DetectionInitial,
    trx,
    summaryTrx,
  } = useHookGouCheckPay();

  const dataComercioSimple: TypingDataComercioSimple = useMemo(() => {
    return {
      id_comercio: roleInfo?.id_comercio ?? 0,
      id_usuario: roleInfo?.id_usuario ?? 0,
      id_terminal: roleInfo?.id_usuario ?? 0,
    };
  }, [roleInfo]);

  useEffect(() => {
    const validPath = (): string | null => {
      if (
        params.type_setting_time !== "origin" &&
        params.type_setting_time !== "cross"
      ) {
        return "url incorrecta 'type_setting_time'";
      }
      if (params.id_unique === undefined) {
        return "url incorrecta 'id_unique'";
      }
      if (params.id_unique === ":id_unique") {
        return "url incorrecta 'id_unique'";
      }
      const id_unique_vector = params.id_unique?.split("+") ?? [];
      if (id_unique_vector.length !== 3) {
        return "id unico con formato incorrecto";
      }
      DetectionInitial(parseInt(id_unique_vector[2]), id_unique_vector[1]);
      setDataPath({
        type_setting_time: params.type_setting_time,
        id_unique: params.id_unique,
      });
      return null;
    };
    const error_msg = validPath();
    if (error_msg) {
      notifyError(TempErrorFrontUser.replace("%s", error_msg), 3000, {
        toastId: "notify-lot-format",
      });
      return;
    }
  }, [params.id_unique, params.type_setting_time, DetectionInitial]);

  useEffect(() => {
    if (dataPath === null) {
      return;
    }
    notifyPending(
      PeticionCheckPay(dataComercioSimple, dataPath),
      {
        render: () => {
          return "Procesando";
        },
      },
      {
        render: ({ data }: { data: TypingCheckPay }) => {
          setTicket(data.ticket);
          return `${data.tipo_tramite} Aprobada`;
        },
      },
      {
        render: ({ data: error }) => {
          return error?.message ?? "Se desconoce el estado de la transacción";
        },
      }
    );
  }, [dataComercioSimple, PeticionCheckPay, dataPath]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      {Object.keys(summaryTrx).length > 0 && (
        <div className={contendorBorder}>
          {summaryTrx.id_log && (
            <label className={contendorIdLog}>{summaryTrx.id_log}</label>
          )}
          <img
            className={summaryTrx.id_log ? "mb-2" : "mb-2 mt-8"}
            src={`${imgs?.LogoGou}`}
            alt={"LogoGou"}
          />

          <PaymentSummary
            title={trx.msg}
            subtitle={summaryTrx?.msg ?? undefined}
            summaryTrx={summaryTrx.summary_trx}
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
            <div>
              <Button onClick={() => validNavigate("../")}>
                Regresar al inicio
              </Button>
            </div>
          )}
        </div>
      )}
      <Modal show={showModal && ticket} handleClose={() => setShowModal(false)}>
        {/**************** Trx Exitosa **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          <TicketsGou ticket={ticket} refPrint={printDiv} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ButtonBar>
        </div>
        {/*************** Trx Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default GouCheckPay;
