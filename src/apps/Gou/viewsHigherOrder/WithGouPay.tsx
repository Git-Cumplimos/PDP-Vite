import React, {
  ChangeEvent,
  FunctionComponent,
  MouseEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import GouFormulario from "./components/GouFormulario";
import { useAuth } from "../../../hooks/AuthHooks";
import { TypeInfTicket, TypingDataComercio } from "../../../utils/TypingUtils";
import {
  TypeUseHookGouFormularioAdd,
  TypingDataInputAdd,
  TypingDataInputRequired,
  TypingDataInputOrigin,
  TypingDataInputOriginAuto,
  TypingOnChangeDataInputAdd,
  TypingDataModalAdd,
} from "./utils/utils.typing";
import { v4 } from "uuid";
import { useImgs } from "../../../hooks/ImgsHooks";
import { notifyPending } from "../../../utils/notify";
import useHookWithGouPay from "./hook/useHookGouPay";
import GouCheckPayOrigin from "./components/GouCheckPayOrigin";
import { hash } from "../../../utils/hash";

//FRAGMENT ******************** TYPING *******************************

//FRAGMENT ******************** CONST ***********************************
const dataInputOriginInitial: TypingDataInputOrigin = {
  valor_trx: "",
};

//FRAGMENT ******************** COMPONENT *******************************
const WithGouPay = (
  ComponectFormAdd: FunctionComponent<any>,
  useHookGouFormularioAdd: TypeUseHookGouFormularioAdd,
  type_operation: number
) => {
  const { roleInfo, pdpUser }: any = useAuth();
  const { imgs } = useImgs();
  const [dataInputOrigin, setDataInputOrigin] = useState<TypingDataInputOrigin>(
    dataInputOriginInitial
  );
  const dataInputOriginAuto: TypingDataInputOriginAuto = useMemo(() => {
    const date_now = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    return {
      id_uuid_trx: v4(),
      fecha: `${date_now.substring(6, 10)}-${date_now.substring(
        3,
        5
      )}-${date_now.substring(0, 2)}`,
    };
  }, []);

  const dataComercio: TypingDataComercio = useMemo(() => {
    const tipo_comercio = roleInfo?.tipo_comercio ?? "";
    return {
      id_comercio: roleInfo?.id_comercio ?? 0,
      id_usuario: roleInfo?.id_usuario ?? 0,
      id_terminal: roleInfo?.id_dispositivo ?? 0,
      nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
      nombre_usuario: pdpUser?.uname ?? "",
      oficina_propia:
        tipo_comercio.search("KIOSCO") >= 0 ||
        tipo_comercio.search("OFICINAS PROPIAS") >= 0
          ? true
          : false,
      location: {
        address: roleInfo?.direccion ?? "",
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
        country: "CO",
      },
    };
  }, [roleInfo, pdpUser?.uname]);

  const {
    dataInputRequired,
    dataInputAdd,
    dataInputAddAuto,
    onChangeDataInputAdd,
    onSubmitSchema,
    PeticionPayBase,
    others,
  } = useHookGouFormularioAdd(dataComercio, dataInputOriginAuto);
  const { loadingPeticion, PeticionCheckPay, summaryTrx, trx } =
    useHookWithGouPay(type_operation, PeticionPayBase);
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);

  const onSubmitCheckPay = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const [is_schema, dataModalAdd]: [boolean, TypingDataModalAdd] =
        onSubmitSchema();

      if (!is_schema) {
        return;
      }
      notifyPending(
        PeticionCheckPay(
          dataComercio,
          {
            ...dataInputOrigin,
            ...dataInputOriginAuto,
            ...dataInputAdd,
            ...dataInputRequired,
            ...dataInputAddAuto,
          },
          dataModalAdd
        ),
        {
          render: () => {
            return "Procesando";
          },
        },
        {
          render: ({ data }: { data: any }) => {
            setTicket(data.ticket);
            return "Pago aprobado";
          },
        },
        {
          render: ({ data: error }) => {
            // handleCloseNinguno(false, routeInicial);
            return error?.message ?? "Pago rechazado";
          },
        }
      );
    },
    [
      PeticionCheckPay,
      onSubmitSchema,
      dataComercio,
      dataInputOrigin,
      dataInputOriginAuto,
      dataInputAdd,
      dataInputRequired,
      dataInputAddAuto,
    ]
  );

  return (
    <div>
      <GouFormulario
        logoGou={imgs?.LogoGou}
        dataInputOrigin={dataInputOrigin}
        dataInputOriginAuto={dataInputOriginAuto}
        dataInputRequired={dataInputRequired}
        setDataInputOrigin={setDataInputOrigin}
        onChangeDataInputAdd={onChangeDataInputAdd}
        onSubmitCheckPay={onSubmitCheckPay}
      >
        <ComponectFormAdd
          dataInputAdd={dataInputAdd}
          others={others}
        ></ComponectFormAdd>
      </GouFormulario>
      {trx.status !== "Search" && (
        <GouCheckPayOrigin
          logoGou={imgs?.LogoGou}
          summaryTrx={summaryTrx}
          trx={trx}
          loadingPeticion={loadingPeticion}
          ticket={ticket}
        ></GouCheckPayOrigin>
      )}
    </div>
  );
};

export default WithGouPay;
