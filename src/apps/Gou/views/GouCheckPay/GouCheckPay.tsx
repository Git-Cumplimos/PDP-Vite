import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useImgs } from "../../../../hooks/ImgsHooks";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";

import classes from "./GouCheckPay.module.css";
import useHookGouCheckPay from "../../hook/useHookGouCheckPay";
import { TypingDataComercioSimple } from "../../utils/utils_typing";
import { TempErrorFrontUser } from "../../../../utils/fetchCustomPdp";

const { contendorBorder, contendorPago } = classes;
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
  const [summaryTrx, setSummaryTrx] = useState<{
    [key: string]: string | number;
  } | null>(null);
  const [trx, setTrx] = useState<TypingTrx>({
    status: "Search",
    msg: constMsgTrx.Search,
  });
  const [statusTrx, setStatusTrx] = useState<TypingStatusTrx>("Search");
  const {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    dataSeePay,
  } = useHookGouCheckPay();
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
      "Id transacción": parseInt(id_unique_vector[2]),
      id_uuid_trx: id_unique_vector[1],
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
          setTrx({
            status: "Rechazado",
            msg: constMsgTrx.Rechazado,
          });
          return error?.message ?? "Pago rechazado";
        },
      }
    );
  }, [params.id_unique, dataComercioSimple, PeticionCheckPay]);

  return (
    <Fragment>
      {summaryTrx && (
        <div className={contendorBorder}>
          <img className="mb-2" src={`${imgs?.LogoGou}`} alt={"LogoGou"} />
          <PaymentSummary title={trx.msg} summaryTrx={summaryTrx}>
            <></>
            {/* <h2 className={contendorPago}>Pago : 2000</h2> */}
            {/* <Button type="submit">Comprobante</Button> */}
          </PaymentSummary>
        </div>
      )}
    </Fragment>
  );
};

export default GouCheckPay;
