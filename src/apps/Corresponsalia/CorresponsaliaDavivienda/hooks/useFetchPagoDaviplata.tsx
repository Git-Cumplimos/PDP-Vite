import { useCallback, useState } from "react";
import {
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  descriptionErrorFront,
  fetchCustom,
} from "../utils/fetchUtils";
import {
  TypingDataComercio,
  TypingDataConsult,
  TypingDataInput,
  TypingDataPay,
} from "../utils/typingPagoDaviplata";

//FRAGMENT--------- Constantes ------------------
const urlDaviplata = `${process.env.REACT_APP_URL_CORRESPONSALIA_DAVIVIENDA}`;

//FRAGMENT ----------- hook ------------------
export const useFetchPagoDaviplata = () => {
  const name_hook = "useFetchPagoDaviplata";
  const [loadingPeticion, setLoadingPeticion] = useState<boolean>(false);

  const PeticionConsult = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput
    ): Promise<TypingDataConsult> => {
      setLoadingPeticion(true);
      const name_service = "Consulta Otp Daviplata";
      let Peticion;
      try {
        const body = {
          ...dataComercio,
          valor_total_trx: dataInput.valor_total_trx,
          Datos: {
            numeroIdentificacion: dataInput.numeroIdentificacion,
            tipoDocumento: dataInput.tipoDocumento,
          },
        };
        Peticion = await fetchCustom(
          `${urlDaviplata}boton_daviplata/consulta_saldo_daviplata`,
          "POST",
          name_service,
          {},
          body
        );
        return {
          idSessionToken: Peticion.obj?.idSessionToken ?? "0",
          id_trx: Peticion.obj?.id_trx ?? 0,
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            `${name_hook} - ${name_service}`
          );
        }
        throw error;
      } finally {
        setLoadingPeticion(false);
      }
    },
    []
  );

  const PeticionPay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      dataConsult: TypingDataConsult
    ): Promise<TypingDataPay> => {
      setLoadingPeticion(true);
      const name_service = "Pago Daviplata";
      let Peticion;
      try {
        const body = {
          ...dataComercio,
          valor_total_trx: dataInput.valor_total_trx,
          id_trx: dataConsult.id_trx,
          Datos: {
            otp: dataInput.otp,
            idSessionToken: dataConsult.idSessionToken,
            numeroIdentificacion: dataInput.numeroIdentificacion,
            tipoDocumento: dataInput.tipoDocumento,
          },
        };
        Peticion = await fetchCustom(
          `${urlDaviplata}boton_daviplata/pago_daviplata`,
          "POST",
          name_service,
          {},
          body
        );
        return {
          ticket: Peticion.obj?.ticket,
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            descriptionErrorFront.replace("%s", name_service),
            error.message,
            `${name_hook} - ${name_service}`
          );
        }
        throw error;
      } finally {
        setLoadingPeticion(false);
      }
    },
    []
  );

  return [loadingPeticion, PeticionConsult, PeticionPay] as const;
};

export const useTimerCustom = (seconds: number) => {
  const [timerTimeout, setTimerTimeout] = useState<any>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);
  const [errorTimeout, setErrorTimeout] = useState<boolean>(false);

  const startTimer = () => {
    setLoadingTimeout(true);
    const timerTimeout_ = setTimeout(() => {
      setErrorTimeout(true);
      setLoadingTimeout(false);
      clearTimeout(timerTimeout_); //reiniciar contador
    }, seconds * 1000);
    setTimerTimeout(timerTimeout_);
  };

  const stopTimer = () => {
    clearTimeout(timerTimeout); //reiniciar contado
    setErrorTimeout(false);
    setLoadingTimeout(false);
  };

  return [startTimer, stopTimer, loadingTimeout, errorTimeout] as const;
};
