import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import {
  TypingUseHookPasarelaSon,
  TypingOnSubmitSchema,
  TypingDataInput,
  TypingPeticionPrePayBase,
  TypingFormClientDataInput,
  TypingFormTrxDataInput,
  TypingFormAddDataInput,
  TypingOutputErrorPrePayBase,
  TypingOutputPrePayBase,
} from "../../../Pasarelas/viewsHigherOrder/utils/utils_typing";
import { hash } from "../../../../utils/hash";
import {
  TempErrorFrontService,
  fetchCustomPdp,
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
} from "../../../../utils/fetchCustomPdp";
import { TypingDataComercio } from "../../../../utils/TypingUtils";
import { v4 } from "uuid";
import { ErrorCustomPeticionPrePayBase } from "../../../Pasarelas/viewsHigherOrder/utils/utils_exception";

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
          Nombre:
            formClientDataInput.tipo_documento !== "NIT"
              ? `${formClientDataInput.nombres} ${formClientDataInput.apellidos}`
              : `${formClientDataInput.company}`,
        },
      ],
    ];
  }, [
    formTrxDataInput.id_unico,
    formClientDataInput.nombres,
    formClientDataInput.apellidos,
    formClientDataInput.company,
    formClientDataInput.tipo_documento,
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
        const ip_address_json = await ip_address_fetch.json();
        const ip_address = ip_address_json?.ip
          ? ip_address_json?.ip
          : "127.0.0.1";
        const body: { [key: string]: any } = {
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
          documento: dataInput.documento,
          tipo_documento: dataInput.tipo_documento,
          correo: dataInput.correo,
          celular: dataInput.celular,
        };
        if (dataInput.tipo_documento !== "NIT") {
          body.nombres = dataInput.nombres;
          body.apellidos = dataInput.apellidos;
        } else {
          body.company = dataInput.company;
        }
        response = await fetchCustomPdp(
          url_backend,
          "POST",
          name_service,
          {},
          body,
          120
        );
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
      company: null,
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
