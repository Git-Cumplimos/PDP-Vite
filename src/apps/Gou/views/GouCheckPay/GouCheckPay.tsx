import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useImgs } from "../../../../hooks/ImgsHooks";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetch,
  ErrorCustomFetchTimeout,
  ErrorCustomUseHookCode,
  FuctionEvaluateResponse,
  defaultParamsError,
  TempErrorFrontService,
  fetchCustomPdp,
  fetchCustomPdpCycle,
  ErrorCustomBackendPending,
  ErrorCustomBackendRehazada,
} from "../../../../utils/fetchCustomPdp";
import classes from "./GouCheckPay.module.css";
import useHookGouCheckPay from "../../hook/useHookGouCheckPay";
import {
  TypingDataComercioSimple,
  TypingSummaryTrx,
} from "../../utils/utils_typing";
import Button from "../../../../components/Base/Button";
import { TempErrorFrontUser } from "../../../../utils/fetchCustomPdp";

const { contendorBorder, contendorPago, contendorButton } = classes;
//FRAGMENT ******************** CONST *******************************
const constMsgTrx: { [key: string]: string } = {
  Search: "Estamos identificando tu transacción, por favor espera un momento",
  Unidentified:
    "Estamos identificando tu transacción, por favor espera un momento",
  Pendiente:
    "Estamos identificando tu transacción, por favor espera un momento",
  Aprobado: "Estamos identificando tu transacción, por favor espera un momento",
  Rechazado: "Su transacción ha sido rechazada",
};

//FRAGMENT ******************** TYPING *******************************
type TypingStatusTrx =
  | "Search"
  | "Unidentified"
  | "Pendiente"
  | "Aprobado"
  | "Rechazado";

type TypingTrx = {
  status: TypingStatusTrx;
  msg: string;
};

const GouCheckPay = () => {
  const { roleInfo }: any = useAuth();
  const { imgs } = useImgs();
  const { state } = useLocation();
  const params = useParams();
  const urlReturnFront = state?.urlReturnFront ?? "/";
  const validNavigate = useNavigate();
  const [summaryTrx, setSummaryTrx] = useState<TypingSummaryTrx>({});

  const [trx, setTrx] = useState<TypingTrx>({
    status: "Search",
    msg: constMsgTrx.Search,
  });
  const { loadingPeticion, loadingPeticionBlocking, PeticionCheckPay } =
    useHookGouCheckPay(setSummaryTrx);
  const dataComercioSimple: TypingDataComercioSimple = useMemo(() => {
    return {
      id_comercio: roleInfo?.id_comercio ?? 0,
      id_usuario: roleInfo?.id_usuario ?? 0,
      id_terminal: roleInfo?.id_usuario ?? 0,
    };
  }, [roleInfo]);

  useEffect(() => {
    const id_unique_vector = params.id_unique?.split("+") ?? [];
    if (id_unique_vector.length !== 4) {
      notifyError(
        TempErrorFrontUser.replace("%s", "id unico con formato incorrecto"),
        5000,
        {
          toastId: "notify-lot-format",
        }
      );
      return;
    }
    setSummaryTrx({
      summary_trx: {
        "Id transacción": parseInt(id_unique_vector[2]),
        id_uuid_trx: id_unique_vector[1],
      },
      valor_trx: 0,
    });
    notifyPending(
      PeticionCheckPay(dataComercioSimple, params.id_unique ?? "", "origin"),
      {
        render: () => {
          return "Procesando";
        },
      },
      {
        render: ({ data }) => {
          return "Pago aprobado";
        },
      },
      {
        render: ({ data: error }) => {
          if (
            error instanceof ErrorCustomApiGatewayTimeout &&
            error instanceof ErrorCustomFetchTimeout &&
            error instanceof ErrorCustomBackendPending &&
            error instanceof ErrorCustomBackendRehazada
          ) {
            setTrx({
              status: "Rechazado",
              msg: constMsgTrx.Rechazado,
            });
          }
          return error?.message ?? "Pago rechazado";
        },
      }
    );
  }, [params.id_unique, dataComercioSimple, PeticionCheckPay]);

  return (
    <Fragment>
      {Object.keys(summaryTrx).length > 0 && (
        <div className={contendorBorder}>
          <img className="mb-2" src={`${imgs?.LogoGou}`} alt={"LogoGou"} />
          <PaymentSummary
            title={trx.msg}
            subtitle={summaryTrx?.msg ?? undefined}
            summaryTrx={summaryTrx.summary_trx}
          >
            {trx.status === "Rechazado" && (
              <Fragment>
                <h1 className={contendorPago}>
                  <strong className="justify-self-end">Pago:</strong>
                  <p className="justify-self-start whitespace-pre-wrap">
                    {summaryTrx.valor_trx}
                  </p>
                </h1>
                {/* <h2
                  className={contendorPago}
                >{`Pago : $${summaryTrx.valor_trx}`}</h2> */}
              </Fragment>
            )}
            {/* <Button type="submit">Comprobante</Button> */}
          </PaymentSummary>
          {trx.status === "Rechazado" && (
            <div className="pt-10">
              <Button type="submit">Regresar al inicio</Button>
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default GouCheckPay;
