import React, {
  Fragment,
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { notifyPending } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";

import PasarelaFormulario from "./components/GouFormulario";
import PasarelaCheckPayOrigin from "./components/PasarelaCheckPayOrigin";
import useHookWithPasarelaPay from "./hook/useHookWithPasarelaPay";
import {
  TypingUseHookPasarelaSon,
  TypingDataModalAdd,
  TypingOutputUseHookWithPasarelaPay,
  TypingOutputUseHookPasarelaSon,
  PropsFormAdd,
  TypingDataSettingValor,
  TypingFormClientDataInput,
  TypingFormTrxDataInput,
  TypingFormAddDataInput,
  TypingInfoClient,
  TypingOutputPrePay,
} from "./utils/utils_typing";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { useNavigate } from "react-router-dom";
import { TypingDataComercio } from "../../../utils/TypingUtils";

//FRAGMENT ******************** TYPING *******************************

//FRAGMENT ******************** CONST ***********************************
const formClientDataInputInitial: TypingFormClientDataInput = {
  nombres: "",
  apellidos: "",
  documento: "",
  celular: "",
  correo: "",
  tipo_documento: "CC", //inicializarlo
};

const formTrxDataInputInitial: TypingFormTrxDataInput = {
  tipo_tramite: "",
  id_unico: "",
  referencia: "",
  fecha: "",
  valor_trx: "",
};

//FRAGMENT ******************** COMPONENT *******************************
const WithPasarelaPay = (
  destino: string,
  url_backend: string,
  type_operation: number,
  dataInitialAdd: { [key: string]: any } | undefined,
  useHookPasarelaSon: TypingUseHookPasarelaSon,
  ComponentLogo: FunctionComponent,
  infoClient: TypingInfoClient,
  url_return_front: string,
  ComponectFormAdd?: FunctionComponent<PropsFormAdd>
): JSX.Element => {
  const goNavigate = useNavigate();
  const { roleInfo, pdpUser }: any = useAuth();

  const [formClientDataInput, setFormClientDataInput] =
    useState<TypingFormClientDataInput>(formClientDataInputInitial);

  const [formTrxDataInput, setFormTrxDataInput] =
    useState<TypingFormTrxDataInput>(formTrxDataInputInitial);

  const [formAddDataInput, setFormAddDataInput] =
    useState<TypingFormAddDataInput>({});

  const [outputPrePay, setOutputPrePay] = useState<TypingOutputPrePay | null>(
    null
  );

  const [dataSettingValor, setDataSettingValor] =
    useState<TypingDataSettingValor | null>(null);

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
    formClientInputs,
    formTrxInputs,
    onChangeDataInputSon,
    onSubmitSchema,
    PeticionPrePayBase,
    others,
  }: TypingOutputUseHookPasarelaSon = useHookPasarelaSon(
    destino,
    url_backend,
    dataComercio,
    dataInitialAdd,
    formClientDataInput,
    setFormClientDataInput,
    formTrxDataInput,
    setFormTrxDataInput,
    formAddDataInput,
    setFormAddDataInput
  );

  const {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionSetting,
    PeticionCheckPrePay,
    summaryTrx,
    trx,
  }: TypingOutputUseHookWithPasarelaPay = useHookWithPasarelaPay(
    type_operation,
    PeticionPrePayBase
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

  const onSubmitCheckPrePay = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const [id_unico_modal, is_schema, dataModalAdd]: [
        string,
        boolean,
        TypingDataModalAdd
      ] = onSubmitSchema();
      if (!is_schema) {
        return;
      }
      notifyPending(
        PeticionCheckPrePay(
          id_unico_modal,
          dataComercio,
          { ...formClientDataInput, ...formTrxDataInput, ...formAddDataInput },
          dataModalAdd
        ),
        {
          render: () => {
            return "Procesando";
          },
        },
        {
          render: ({ data }: { data: TypingOutputPrePay }) => {
            setOutputPrePay(data);
            return "Generar el link de pago";
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
      PeticionCheckPrePay,
      onSubmitSchema,
      dataComercio,
      formClientDataInput,
      formTrxDataInput,
      formAddDataInput,
    ]
  );

  return (
    <Fragment>
      <SimpleLoading show={loadingPeticionBlocking}></SimpleLoading>
      {dataSettingValor && (
        <PasarelaFormulario
          ComponentLogo={ComponentLogo}
          infoClient={infoClient}
          dataSettingValor={dataSettingValor}
          onChangeDataInputSon={onChangeDataInputSon}
          onSubmitCheckPrePay={onSubmitCheckPrePay}
          formClientInputs={formClientInputs}
          formTrxInputs={formTrxInputs}
          formClientDataInput={formClientDataInput}
          setFormClientDataInput={setFormClientDataInput}
          formTrxDataInput={formTrxDataInput}
          setFormTrxDataInput={setFormTrxDataInput}
          formAddDataInput={formAddDataInput}
          setFormAddDataInput={setFormAddDataInput}
        >
          {ComponectFormAdd && (
            <ComponectFormAdd others={others}></ComponectFormAdd>
          )}
        </PasarelaFormulario>
      )}

      {trx.status !== "Search" && (
        <PasarelaCheckPayOrigin
          destino={destino}
          ComponentLogo={ComponentLogo}
          url_return_front={url_return_front}
          summaryTrx={summaryTrx}
          trx={trx}
          loadingPeticion={loadingPeticion}
          outputPrePay={outputPrePay}
        ></PasarelaCheckPayOrigin>
      )}
    </Fragment>
  );
};

export default WithPasarelaPay;
