import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useImgs } from "../../../../hooks/ImgsHooks";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { TypeInfTicket } from "../../../../utils/TypingUtils";

import { TempErrorFrontUser } from "../../../../utils/fetchCustomPdp";
import useHookGouCheckPay from "./hook/useHookGouCheckPay";
import {
  TypingCheckPay,
  TypingDataComercioSimple,
  TypingDataPath,
} from "../../utils/utils_typing";
import GouCheckPayCross from "./components/GouCheckPayCross";

//FRAGMENT ******************** COMPONENT *******************************
const GouCheckPay = () => {
  const { roleInfo }: any = useAuth();
  const { imgs } = useImgs();
  const params = useParams();
  const [dataPath, setDataPath] = useState<TypingDataPath | null>(null);
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);
  const { loadingPeticion, PeticionCheckPay, trx, summaryTrx } =
    useHookGouCheckPay();

  const dataComercioSimple: TypingDataComercioSimple = useMemo(() => {
    return {
      id_comercio: roleInfo?.id_comercio ?? 0,
      id_usuario: roleInfo?.id_usuario ?? 0,
      id_terminal: roleInfo?.id_dispositivo ?? 0,
    };
  }, [roleInfo?.id_comercio, roleInfo?.id_usuario, roleInfo?.id_dispositivo]);

  useEffect(() => {
    const validPath = (): string | null => {
      if (params.id_hash === undefined) {
        return "url incorrecta 'id_hash'";
      }
      if (params.id_hash === ":id_hash") {
        return "url incorrecta 'id_hash'";
      }
      setDataPath({
        id_hash: params.id_hash,
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
  }, [params.id_hash, params.type_setting_time]);

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

  return (
    <Fragment>
      <GouCheckPayCross
        imgs={imgs}
        dataPath={dataPath}
        summaryTrx={summaryTrx}
        trx={trx}
        loadingPeticion={loadingPeticion}
        ticket={ticket}
      ></GouCheckPayCross>
    </Fragment>
  );
};

export default GouCheckPay;
