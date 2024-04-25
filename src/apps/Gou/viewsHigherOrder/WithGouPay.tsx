import React, {
  Fragment,
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 } from "uuid";
import { useImgs } from "../../../hooks/ImgsHooks";
import { notifyPending } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { TypeInfTicket, TypingDataComercio } from "../../../utils/TypingUtils";

import GouFormulario from "./components/GouFormulario";
import GouCheckPayOrigin from "./components/GouCheckPayOrigin";
import useHookWithGouPay from "./hook/useHookWithGouPay";
import {
  TypingUseHookGouFormularioAdd,
  TypingDataInputOrigin,
  TypingDataInputOriginAuto,
  TypingDataModalAdd,
  TypingOutputUseHookWithGouPay,
  TypingOutputUseHookGouFormularioAdd,
  PropsGouFormularioAdd,
  TypingDataSettingValor,
} from "./utils/utils.typing";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { useNavigate } from "react-router-dom";

//FRAGMENT ******************** TYPING *******************************

//FRAGMENT ******************** CONST ***********************************
const dataInputOriginInitial: TypingDataInputOrigin = {
  valor_trx: "",
};

//FRAGMENT ******************** COMPONENT *******************************
const WithGouPay = (
  ComponectFormAdd: FunctionComponent<PropsGouFormularioAdd>,
  ComponectTicket: FunctionComponent<any>,
  useHookGouFormularioAdd: TypingUseHookGouFormularioAdd,
  type_operation: number,
  url_return_front: string
): JSX.Element => {
  const goNavigate = useNavigate();
  const { roleInfo, pdpUser }: any = useAuth();
  const { imgs } = useImgs();
  const printDiv = useRef(null);
  const [dataInputOrigin, setDataInputOrigin] = useState<TypingDataInputOrigin>(
    dataInputOriginInitial
  );
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);
  const [dataSettingValor, setDataSettingValor] =
    useState<TypingDataSettingValor | null>(null);

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
  }: TypingOutputUseHookGouFormularioAdd = useHookGouFormularioAdd(
    dataComercio,
    dataInputOriginAuto
  );

  const {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionSetting,
    PeticionCheckPay,
    summaryTrx,
    trx,
  }: TypingOutputUseHookWithGouPay = useHookWithGouPay(
    type_operation,
    PeticionPayBase
  );

  useEffect(() => {
    notifyPending(
      PeticionSetting(),
      {
        render: () => {
          return "Procesando configuración";
        },
      },
      {
        render: ({ data }: { data: TypingDataSettingValor }) => {
          setDataSettingValor(data);
          return "Consulta Configuración exitosa";
        },
      },
      {
        render: ({ data: error }) => {
          goNavigate(url_return_front);
          return error?.message ?? "Consulta Configuración Rechazada";
        },
      }
    );
  }, [PeticionSetting, goNavigate, url_return_front]);

  const onSubmitCheckPay = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      return;
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
    <Fragment>
      <SimpleLoading show={loadingPeticionBlocking}></SimpleLoading>
      {dataSettingValor && (
        <GouFormulario
          logoGou={imgs?.LogoGou}
          dataSettingValor={dataSettingValor}
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
      )}

      {trx.status !== "Search" && (
        <GouCheckPayOrigin
          logoGou={imgs?.LogoGou}
          summaryTrx={summaryTrx}
          trx={trx}
          loadingPeticion={loadingPeticion}
          printDiv={printDiv}
        >
          <ComponectTicket ticket={ticket} refPrint={printDiv} />
        </GouCheckPayOrigin>
      )}
    </Fragment>
  );
};

export default WithGouPay;
