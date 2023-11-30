import { useCallback, useState } from "react";
import {
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  descriptionErrorFront,
  fetchCustom,
} from "../utils/fetchUtils";

const url = `${process.env.REACT_APP_URL_RECAUDO_GENERICO}/backend/recaudo-generico/transaciciones`;

export type TypeConfiguracion = {
  modificar_valor: boolean;
  valor_menor: number;
  valor_mayor: number;
  realizar_consulta: boolean;
};

export type TypeConvenio = {
  convenio_name: string;
  pk_fk_id_convenio: number;
  id_convenio_autorizador: number;
};

export type TypeInformacionTransaccionConsultaInput = {
  referencia: string; //string de solo numeros
};

export type TypeTransaccionConsultaOutput = {
  referencia: string; //string de solo numeros
  valor_total_trx?: number;
  convenio: TypeConvenio;
  id_trx?: number;
  configuracion: TypeConfiguracion;
  datos_adicionales: { [key: string]: any };
};

export type TypeInformacionTransaccionPagoInput = {
  referencia: string; //string de solo numeros
  id_convenio_autorizador: number;
  convenio_name: string;
  id_trx?: number;
  valor_total_trx?: number;
  datos_adicionales: { [key: string]: any };
};

export type TypeInfTicket = { [key: string]: any };

export type TypeTransaccionPagoOutput = {
  status: boolean;
  ticket: TypeInfTicket;
};

export type TypeLocation = {
  address: string;
  dane_code: string;
  city: string;
};

export type TypeComercio = {
  id_comercio: number;
  id_terminal: number;
  id_usuario: number;
  nombre_comercio: string;
  nombre_usuario: string;
  oficina_propia: boolean;
  location: TypeLocation;
};

export type TypeBackendRecaudoGenerico = {
  id_uuid_trx: string;
  comercio: TypeComercio;
};

export const useBackendRecaudoGenerico = (
  common: TypeBackendRecaudoGenerico
) => {
  const hook_name = "useBackendRecaudoGenerico";
  const [loadingPeticionConsulta, setloadingPeticionConsulta] =
    useState<boolean>(false);
  const [loadingPeticionPago, setloadingPeticionPago] =
    useState<boolean>(false);

  const PeticionConsulta = useCallback(
    async (
      pk_fk_id_convenio: number,
      info_transaccion: TypeInformacionTransaccionConsultaInput
    ): Promise<TypeTransaccionConsultaOutput> => {
      const function_name = "PeticionConsulta";
      setloadingPeticionConsulta(true);
      const name_service = "Recaudo Generico - consulta";
      let response;
      const body = { ...common, info_transaccion: info_transaccion };
      try {
        response = await fetchCustom(
          `${url}/consulta/${pk_fk_id_convenio}`,
          "POST",
          name_service,
          {},
          body
        );
        const result = response?.obj?.result ?? {};
        const ids = response?.obj?.ids ?? {};
        const dataResponse: TypeTransaccionConsultaOutput = {
          referencia: result?.referencia ?? "",
          convenio: {
            convenio_name: result?.convenio?.convenio_name ?? "",
            pk_fk_id_convenio: result?.convenio?.pk_fk_id_convenio ?? 0,
            id_convenio_autorizador:
              result?.convenio?.id_convenio_autorizador ?? 0,
          },
          datos_adicionales: result?.datos_adicionales ?? {},
          configuracion: result?.configuracion,
        };

        if (result?.valor_total_trx) {
          dataResponse.valor_total_trx = result?.valor_total_trx;
        }
        if (ids?.autorizador?.id_trx) {
          if (ids?.autorizador?.id_trx !== null) {
            dataResponse.id_trx = ids?.autorizador?.id_trx;
          }
        }

        return dataResponse;
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        }
        throw error;
      } finally {
        setloadingPeticionConsulta(false);
      }
    },
    [common]
  );

  const PeticionPago = useCallback(
    async (
      pk_fk_id_convenio: number,
      info_transaccion: TypeInformacionTransaccionPagoInput
    ): Promise<TypeTransaccionPagoOutput> => {
      const function_name = "PeticionPago";
      setloadingPeticionPago(true);
      const name_service = "Recaudo Generico - Pago";
      let response;
      const body = { ...common, info_transaccion: info_transaccion };
      try {
        response = await fetchCustom(
          `${url}/pago/${pk_fk_id_convenio}`,
          "POST",
          name_service,
          {},
          body
        );
        return {
          status: response?.status,
          ticket: response?.obj?.result?.ticket ?? {},
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        }
        throw error;
      } finally {
        setloadingPeticionPago(false);
      }
    },
    [common]
  );

  return [
    loadingPeticionConsulta,
    PeticionConsulta,
    loadingPeticionPago,
    PeticionPago,
  ] as const;
};
