import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  TypeUseHookGouFormularioAdd,
  TypingDataInputAdd,
  TypingDataInputRequired,
  TypingDataInputOriginAuto,
  TypingOnChangeDataInputAdd,
  TypingOnSubmitSchema,
  TypingDataInputAddAuto,
  TypingDataInput,
  TypingDataPay,
  TypingPeticionPayBase,
} from "../../../Gou/viewsHigherOrder/utils/utils.typing";
import { notifyError } from "../../../../utils/notify";
import { hash } from "../../../../utils/hash";
import { fetchCustomPdp } from "../../../../utils/fetchCustomPdp";
import { TypingDataComercio } from "../../../../utils/TypingUtils";
import { do_compare, get_value } from "../../../Gou/utils/utils_function";

//FRAGMENT ******************** TYPING *******************************
type TypingDataInputAddOwn = {
  nombre_completo: string;
  correo: string;
  "correo|confirmacion": "";
  celular: string;
  "celular|confirmacion": "";
  documento: string;
};

type TypingDataInvalid = {
  "correo|confirmacion": string;
  celular: string;
  "celular|confirmacion": string;
};

export type TypingOthers = {
  dataInvalid: TypingDataInputAddOwn;
  dataInputAddOwn: TypingDataInvalid;
};

//FRAGMENT ******************** CONST **********************************
// const URL_RECARGARCUPO_EVERTEC = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
const URL_RECARGARCUPO_EVERTEC = `http://127.0.0.1:5000`;

export const dataInputAddOwnInitial: TypingDataInputAddOwn = {
  nombre_completo: "",
  correo: "",
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
  documento: "",
};

export const dataInvalidInitial: TypingDataInvalid = {
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
};

//FRAGMENT ******************** HOOK ***********************************
const useHookRecargaCupoConGou: TypeUseHookGouFormularioAdd = (
  dataComercio: TypingDataComercio,
  dataInputOriginAuto: TypingDataInputOriginAuto
) => {
  const [dataInputAdd, setDataInputAdd] = useState<TypingDataInputAdd>({});
  const [dataInputAddOwn, setDataInputAddOwn] = useState<TypingDataInputAddOwn>(
    dataInputAddOwnInitial
  );
  const [dataInvalid, setDataInvalid] =
    useState<TypingDataInvalid>(dataInvalidInitial);

  useEffect(() => {
    setDataInputAdd({
      nombre_completo: dataInputAddOwn.nombre_completo,
      correo: dataInputAddOwn.correo,
      celular: dataInputAddOwn.celular,
      documento: dataInputAddOwn.documento,
    });
  }, [
    setDataInputAdd,
    dataInputAddOwn.nombre_completo,
    dataInputAddOwn.correo,
    dataInputAddOwn.celular,
    dataInputAddOwn.documento,
  ]);

  const dataInputAddAuto: TypingDataInputAddAuto = useMemo(() => {
    return {
      id_uuid_trx_hash: hash(dataInputOriginAuto.id_uuid_trx),
    };
  }, [dataInputOriginAuto.id_uuid_trx]);

  const dataInputRequired: TypingDataInputRequired = useMemo(() => {
    return {
      tipo_tramite: "Recarga Cupo",
      id_unico_form: dataInputOriginAuto.id_uuid_trx,
      id_unico_modal: dataInputAddAuto.id_uuid_trx_hash,
      referencia: dataComercio.id_comercio.toString(),
    };
  }, [
    dataInputOriginAuto.id_uuid_trx,
    dataInputAddAuto.id_uuid_trx_hash,
    dataComercio.id_comercio,
  ]);

  const onChangeDataInputAdd: TypingOnChangeDataInputAdd = useCallback(
    (ev: ChangeEvent<HTMLFormElement>) => {
      if (ev.target.name === undefined && ev.target.id === undefined) return;
      const structure_get_value = ev.target.id.split("/")[1];
      if (structure_get_value) {
        const [value, is_change, msg_invalid_get_value] = get_value(
          structure_get_value,
          ev.target.value ?? ""
        );
        if (is_change) {
          setDataInputAddOwn((old) => ({ ...old, [ev.target.name]: value }));
        }
        if (dataInvalid.hasOwnProperty(ev.target.name)) {
          setDataInvalid((old) => ({
            ...old,
            [ev.target.name]: msg_invalid_get_value,
          }));
        }
        const structure_compare = ev.target.id.split("/")[2];
        if (structure_compare) {
          const [, key_change, msg_invalid_do_compare] = do_compare(
            { ...dataInputAddOwn },
            ev.target.name,
            value,
            structure_compare
          );
          if (
            dataInvalid.hasOwnProperty(key_change) &&
            msg_invalid_get_value === ""
          ) {
            setDataInvalid((old) => ({
              ...old,
              [key_change]: msg_invalid_do_compare,
            }));
          }
        }
      }
    },
    [dataInvalid, dataInputAddOwn, setDataInputAddOwn]
  );

  const onSubmitSchema: TypingOnSubmitSchema = useCallback(() => {
    if (dataInputAddOwn.celular !== dataInputAddOwn["celular|confirmacion"]) {
      notifyError("Verifique el numero celular", 2000, {
        toastId: "notify-validate-dataInput",
      });
      return [false, undefined];
    }
    if (dataInputAddOwn.correo !== dataInputAddOwn["correo|confirmacion"]) {
      notifyError("Verifique el correo", 2000, {
        toastId: "notify-validate-dataInput",
      });
      return [false, undefined];
    }
    return [true, [{ Nombre: dataInputAddOwn.nombre_completo }]];
  }, [dataInputAddOwn]);

  const PeticionPayBase: TypingPeticionPayBase = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput
    ): Promise<TypingDataPay> => {
      const url_pay = `${URL_RECARGARCUPO_EVERTEC}/services_evertec/recargarcupo/pago`;
      const name_service = "Recargar Cupo Pago";
      let response;

      const body = {
        comercio: {
          id_comercio: dataComercio.id_comercio,
          id_usuario: dataComercio.id_usuario,
          id_terminal: dataComercio.id_terminal,
          nombre_comercio: dataComercio.nombre_comercio,
          nombre_usuario: dataComercio.nombre_usuario,
          oficina_propia: dataComercio.oficina_propia,
          location: {
            address: dataComercio.location.address,
            dane_code: dataComercio.location.dane_code,
            city: dataComercio.location.city,
            country: dataComercio.location.country,
          },
        },
        id_uuid_trx: dataInput.id_uuid_trx,
        id_uuid_trx_hash: dataInputAddAuto.id_uuid_trx_hash,
        valor_trx: dataInput.valor_trx,
        referencia: dataInput.referencia,
        ip_address: "127.0.0.1",
        asterisk: {
          correo: dataInputAddOwn.correo,
          nombre_completo: dataInputAddOwn.nombre_completo,
          documento: dataInputAddOwn.documento,
          tipo_documento: "cc",
          celular: dataInputAddOwn.celular,
        },
      };
      response = await fetchCustomPdp(
        url_pay,
        "POST",
        name_service,
        {},
        body,
        120
      );
      return {
        ticket: response?.obj?.result?.ticket,
      };
    },
    [
      dataInputAddAuto.id_uuid_trx_hash,
      dataInputAddOwn.correo,
      dataInputAddOwn.nombre_completo,
      dataInputAddOwn.documento,
      dataInputAddOwn.celular,
    ]
  );

  return {
    dataInputRequired,
    dataInputAdd,
    dataInputAddAuto,
    onChangeDataInputAdd,
    onSubmitSchema,
    PeticionPayBase,
    others: {
      dataInputAddOwn: dataInputAddOwn,
      dataInvalid: dataInvalid,
    },
  };
};

export default useHookRecargaCupoConGou;
