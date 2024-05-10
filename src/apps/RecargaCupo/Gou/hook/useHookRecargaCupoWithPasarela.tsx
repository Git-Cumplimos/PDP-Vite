import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  TypingUseHookPasarelaSon,
  TypingOnChangeDataInputSon,
  TypingOnSubmitSchema,
  TypingDataInput,
  TypingPeticionPrePayBase,
  TypingFormDataInput,
  TypingFormClientDataInput,
  TypingFormTrxDataInput,
  TypingFormAddDataInput,
  TypingOutputErrorPrePayBase,
  TypingOutputPrePayBase,
} from "../../../Gou/viewsHigherOrder/utils/utils_typing";
import { notifyError } from "../../../../utils/notify";
import { hash } from "../../../../utils/hash";
import {
  TempErrorFrontService,
  fetchCustomPdp,
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
} from "../../../../utils/fetchCustomPdp";
import { TypingDataComercio } from "../../../../utils/TypingUtils";
import { v4 } from "uuid";
import { ErrorCustomPeticionPrePayBase } from "../../../Gou/viewsHigherOrder/utils/utils_exception";

//FRAGMENT ******************** TYPING *******************************
export type TypingOthers = { [key: string]: any };

//FRAGMENT ******************** HOOK ***********************************
const useHookRecargaCupoWithPasarela: TypingUseHookPasarelaSon = (
  destino: string,
  url_backend: string,
  dataComercio: TypingDataComercio,
  dataInitialAdd: { [key: string]: any } | undefined,
  formClientDataInput: TypingFormClientDataInput,
  setFormClientDataInput: Dispatch<SetStateAction<TypingFormClientDataInput>>,
  formTrxDataInput: TypingFormTrxDataInput,
  setFormTrxDataInput: Dispatch<SetStateAction<TypingFormTrxDataInput>>,
  formAddDataInput: TypingFormAddDataInput,
  setFormAddDataInput: Dispatch<SetStateAction<TypingFormAddDataInput>>
) => {
  const hook_name = "useHookRecargaCupoWithPasarela";
  useEffect(() => {
    const date_now = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const id_uuid_trx = v4();
    const referencia_array = id_uuid_trx.split("-");
    setFormTrxDataInput((old) => ({
      ...old,
      tipo_tramite: "Recargar Cupo",
      id_unico: id_uuid_trx,
      referencia: referencia_array.join(""),
      fecha: `${date_now.substring(6, 10)}-${date_now.substring(
        3,
        5
      )}-${date_now.substring(0, 2)}`,
    }));
  }, [setFormTrxDataInput]);

  const onSubmitSchema: TypingOnSubmitSchema = useCallback(() => {
    return [
      hash(formTrxDataInput.id_unico),
      true,
      [
        {
          Nombre: `${formClientDataInput.nombres} ${formClientDataInput.apellidos}`,
        },
      ],
    ];
  }, [
    formTrxDataInput.id_unico,
    formClientDataInput.nombres,
    formClientDataInput.apellidos,
  ]);

  const PeticionPrePayBase: TypingPeticionPrePayBase = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput
    ): Promise<TypingOutputPrePayBase> => {
      const function_name = "PeticionPrePayBase";
      const name_service = "Recargar Cupo Pago";
      let response;
      try {
        const ip_address_fetch: any = await fetch(
          `https://api.ipify.org?format=json`
        );
        const ip_address = ip_address_fetch?.ip
          ? ip_address_fetch?.ip
          : "127.0.0.1";
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
          id_uuid_trx: dataInput.id_unico,
          id_hash: hash(dataInput.id_unico),
          valor_trx: dataInput.valor_trx,
          ip_address: ip_address,
          referencia: dataInput.referencia,
          nombres: dataInput.nombres,
          apellidos: dataInput.apellidos,
          documento: dataInput.documento,
          tipo_documento: dataInput.tipo_documento,
          correo: dataInput.correo,
          celular: dataInput.celular,
        };
        response = await fetchCustomPdp(
          url_backend,
          "POST",
          name_service,
          {},
          body,
          120
        );
        // response = {
        //   codigo: 200,
        //   msg: "Inicio Recargar Cupo inicio gou (GOU) Exitosa",
        //   obj: {
        //     error_msg: {},
        //     error_status: false,
        //     ids: {
        //       id_hash:
        //         "c7d2133b1f80b50d1894c72a7bb633f04773412e1b33ddfadcb33888c78b7220",
        //       id_log: 23,
        //       id_trx: 437358,
        //       id_uuid_trx: "12982799-d876-4525-ab37-21838b38f025",
        //       pasarela_id_log: 6579,
        //       pasarela_id_request: 34598,
        //     },
        //     result: {
        //       asterisk: [
        //         {
        //           Nombre: "Alisson Dayana",
        //         },
        //       ],
        //       fecha: "09/05/2024 17:09:09",
        //       referencia: "12982799d8764525ab3721838b38f025",
        //       search: {
        //         Nombre: "Alisson Dayana",
        //       },
        //       url_process:
        //         "https://checkout.test.goupagos.com.co/spa/session/34598/d55055a7933a3553c5fd7b4ad8f86761",
        //       url_return:
        //         "https://cloudfront.puntodepagopruebas.com/check_pasarela_pay/c7d2133b1f80b50d1894c72a7bb633f04773412e1b33ddfadcb33888c78b7220",
        //       valor_trx: 10000.0,
        //     },
        //   },
        //   status: true,
        // };
        const res_obj = response?.obj ?? {};
        return {
          url_process: res_obj.result?.url_process,
          id_trx: res_obj?.ids?.id_trx,
          id_log: res_obj?.ids?.id_log,
          fecha: res_obj?.result?.fecha,
          asterisk: res_obj?.result?.asterisk,
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        }
        const outputPrePayBase: TypingOutputErrorPrePayBase = {};
        if (error?.res) {
          response = error?.res;
          outputPrePayBase.id_trx = response?.obj?.ids?.id_trx;
          outputPrePayBase.id_log = response?.obj?.ids?.id_log;
          outputPrePayBase.fecha = response?.obj?.result?.fecha;
          outputPrePayBase.asterisk = response?.obj?.result?.asterisk;
        }
        throw new ErrorCustomPeticionPrePayBase(
          error.message,
          error,
          outputPrePayBase
        );
      }
    },
    [url_backend]
  );

  return {
    formClientInputs: {
      nombres: null,
      apellidos: null,
      correo: null,
      celular: null,
      documento: null,
      tipo_documento: null,
      "correo|confirmacion": null,
      "celular|confirmacion": null,
    },
    formTrxInputs: {
      tipo_tramite: "",
      id_unico: "",
      referencia: "",
      fecha: "",
      valor_trx: null,
    },
    onSubmitSchema,
    PeticionPrePayBase,
    others: {},
  };
};

export default useHookRecargaCupoWithPasarela;
