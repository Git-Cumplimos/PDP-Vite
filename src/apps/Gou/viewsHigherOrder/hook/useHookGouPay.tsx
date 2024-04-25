import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { TypingDataComercio } from "../../../../utils/TypingUtils";
import {
  TypingDataInput,
  TypingDataModalAdd,
  TypingPeticionUrlProcessBaseOutput,
  TypingPeticionCheckUrlProcessOutput,
  TypingPeticionPayBase,
  TypingDataPay,
} from "../utils/utils.typing";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetchTimeout,
  ErrorCustomBackendRechazada,
  ErrorCustomFetch,
  ErrorCustomUseHookCode,
  ErrorCustomRaise,
  sleep,
  TempErrorFrontService,
  fetchCustomPdp,
  FuctionEvaluateResponseConsultTrx,
  fetchCustomPdpCycle,
  defaultParamsError,
  ErrorCustomBackendPending,
  ErrorCustomBackend,
} from "../../../../utils/fetchCustomPdp";
import {
  TypingCheckPay,
  TypingDataSettingTimeCheckPay,
  TypingDataSettingTimeCheckUrlProcess,
  TypingStatusTrx,
  TypingSummaryTrx,
  TypingTrx,
} from "../../utils/utils_typing";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { constMsgTrx, constRelationshipSummary } from "../../utils/utils_const";
import { ajust_tam_see } from "../../utils/utils_function";

//FRAGMENT ******************** CONST *******************************
// const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
const URL_GOU = `http://127.0.0.1:5000`;

//FRAGMENT ******************** TYPING *******************************

//FRAGMENT ******************** HOOK *******************************
const useHookWithGouPay = (
  type_operation: number,
  PeticionPayBase: TypingPeticionPayBase
) => {
  const hook_name = "useHookWithGouPay";
  const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
  const [loadingPeticionBlocking, setloadingPeticionBlocking] =
    useState<boolean>(false);
  const [summaryTrx, setSummaryTrx] = useState<TypingSummaryTrx>({});
  const [trx, setTrx] = useState<TypingTrx>({
    status: "Search",
    msg: constMsgTrx.Search,
  });

  const PeticionCheckUrlProcessBase = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      name_service: string
    ): Promise<TypingPeticionUrlProcessBaseOutput> => {
      const function_name = "PeticionUrlProcessBase";
      const url_check_url_process = `${URL_GOU}/services_gou/check_pay/check_url_process`;
      let response;
      const body = {
        comercio: {
          id_comercio: dataComercio.id_comercio,
          id_usuario: dataComercio.id_usuario,
          id_terminal: dataComercio.id_terminal,
        },
        id_uuid_trx: dataInput.id_uuid_trx,
        type_operation: type_operation,
      };
      //SECUENCIA ---------------Paso 1-------------------------------
      try {
        response = await fetchCustomPdp(
          url_check_url_process,
          "POST",
          name_service,
          {},
          body,
          35,
          defaultParamsError,
          FuctionEvaluateResponseConsultTrx
        );

        if (!response?.obj?.result?.url_process)
          throw new ErrorCustomRaise(
            TempErrorFrontService.replace("%s", name_service),
            "url_process no viene en la respuesta",
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        return {
          url_process: response?.obj?.result?.url_process,
          id_trx: response?.obj?.ids?.id_trx,
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
        throw error;
      }
    },
    [type_operation]
  );

  const PeticionCheckUrlProcess = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInputAuto: TypingDataInput,
      time_check_url_process: TypingDataSettingTimeCheckUrlProcess,
      time_check_url_process_timeout_max: number
    ): Promise<TypingPeticionCheckUrlProcessOutput> => {
      const function_name = "PeticionCheckUrlProcess";
      const name_service = "Obtener url de pago";
      let id_trx: number | undefined = undefined;

      await sleep(5);

      //?-----Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion
      let seconds_ = 1;
      let timerSecondsMaxClock: NodeJS.Timeout;
      let timerSecondsClock: NodeJS.Timer;
      timerSecondsMaxClock = setTimeout(() => {
        seconds_ += time_check_url_process_timeout_max;
        clearTimeout(timerSecondsMaxClock);
        clearInterval(timerSecondsClock);
      }, 1000 * time_check_url_process_timeout_max);
      timerSecondsClock = setInterval(() => {
        seconds_ += 1;
      }, 1000);
      //?--------------------------------------------------------------------
      let error_save: any = new ErrorCustomRaise(
        TempErrorFrontService.replace("%s", name_service),
        "proceso de la peticion indefinido",
        `${hook_name} - ${function_name}`,
        "notifyError",
        true
      );
      try {
        do {
          try {
            const resCheckUrlProcess: TypingPeticionUrlProcessBaseOutput =
              await PeticionCheckUrlProcessBase(
                dataComercio,
                dataInputAuto,
                name_service
              );
            id_trx = resCheckUrlProcess.id_trx;
            setSummaryTrx((old) => ({
              ...old,
              id_trx: resCheckUrlProcess.id_trx,
            }));
            return {
              url_process: resCheckUrlProcess.url_process,
              what_service: function_name,
            };
          } catch (error: any) {
            if (!(error instanceof ErrorCustomFetch))
              throw new ErrorCustomUseHookCode(
                TempErrorFrontService.replace("%s", name_service),
                error.message,
                `${hook_name} - ${function_name}`,
                "notifyError",
                true
              );
            error_save = error;
            const res_obj = error?.res?.obj ?? {};
            if (Object.keys(res_obj).length > 0) {
              if (!id_trx) {
                id_trx = res_obj?.ids?.id_trx;
                setSummaryTrx((old) => ({
                  ...old,
                  id_log: res_obj?.ids?.id_log,
                  id_trx: res_obj?.ids?.id_trx,
                }));
              } else {
                setSummaryTrx((old) => ({
                  ...old,
                  id_log: res_obj?.ids?.id_log,
                }));
              }
            }
            if (
              !(error instanceof ErrorCustomApiGatewayTimeout) &&
              !(error instanceof ErrorCustomFetchTimeout) &&
              !(error instanceof ErrorCustomBackendPending)
            )
              throw error;

            if (error instanceof ErrorCustomBackendPending) {
              const configuration = res_obj?.result?.configuration ?? {};
              if (typeof configuration?.time_front_timeout === "number") {
                if (
                  configuration?.time_front_timeout !==
                  time_check_url_process.timeout
                ) {
                  time_check_url_process.timeout =
                    configuration?.time_front_timeout;
                }
              }
              if (typeof configuration?.time_front_delay === "number") {
                if (
                  configuration?.time_front_delay !==
                  time_check_url_process.delay
                ) {
                  time_check_url_process.delay =
                    configuration?.time_front_delay;
                }
              }
            }
            const time_front_faltante = Math.abs(
              Math.min(
                time_check_url_process_timeout_max,
                time_check_url_process.timeout
              ) - seconds_
            );
            const time_front_delay =
              time_check_url_process.delay >= time_front_faltante
                ? time_front_faltante - 3
                : time_check_url_process.delay;

            await sleep(time_front_delay);
          }
        } while (
          seconds_ <=
          Math.min(
            time_check_url_process_timeout_max,
            time_check_url_process.timeout
          )
        );
        throw error_save;
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
        throw error;
      } finally {
        clearTimeout(timerSecondsMaxClock);
        clearInterval(timerSecondsClock);
      }
    },
    [PeticionCheckUrlProcessBase]
  );

  const PeticionPay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput
    ): Promise<TypingDataPay> => {
      const function_name = "PeticionPay";
      const name_service = "Recargar Cupo Pago";
      let response;
      try {
        response = await PeticionPayBase(dataComercio, dataInput);
        return response;
      } catch (error: any) {
        if (error?.res?.msg)
          setSummaryTrx((old) => ({ ...old, msg: error?.res?.msg }));

        if (!(error instanceof ErrorCustomFetch)) {
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        }
        throw error;
      }
    },
    [PeticionPayBase]
  );

  const ArmDataOutput = useCallback(
    (res: { [key: string]: any }, status?: TypingStatusTrx) => {
      if (status === undefined) {
        status = "Desconocida";
      }
      let is_change = false;
      const res_obj = res?.obj ?? {};
      const res_obj_result = res_obj?.result ?? {};
      if (Object.keys(res_obj).length !== 0) {
        if (!summaryTrx?.id_trx) {
          setSummaryTrx((old) => ({
            ...old,
            id_trx: res_obj?.ids?.id_trx ? res_obj?.ids?.id_trx : undefined,
            id_log: res.obj?.ids?.id_log,
          }));
          is_change = true;
        }
        if (!summaryTrx?.summary_trx_asterisk) {
          setSummaryTrx((old) => ({
            ...old,
            summary_trx_asterisk: res_obj_result?.asterisk
              ? res_obj_result?.asterisk
              : undefined,
            id_log: res.obj?.ids?.id_log,
          }));
          is_change = true;
        }
        if (is_change === false) {
          setSummaryTrx((old) => ({
            ...old,
            id_log: res.obj?.ids?.id_log,
          }));
        }
      }
      setTrx({
        status: status,
        msg: constMsgTrx[status],
      });
    },
    [summaryTrx?.id_trx, summaryTrx?.summary_trx_asterisk]
  );

  const PeticionConsultForPay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      dataSettingTime: TypingDataSettingTimeCheckPay
    ): Promise<TypingCheckPay> => {
      const function_name = "PeticionConsultForPay";
      const url_consult_for_pay = `${URL_GOU}/services_gou/check_pay/check_pay_with_pdp/origin`;
      const name_service = "Verificando Pago";
      let response;
      try {
        const body = {
          comercio: {
            id_comercio: dataComercio.id_comercio,
            id_usuario: dataComercio.id_usuario,
            id_terminal: dataComercio.id_terminal,
          },
          id_uuid_trx: dataInput.id_uuid_trx,
          type_operation: type_operation,
        };
        //SECUENCIA ---------------Paso 2-------------------------------
        response = await fetchCustomPdpCycle(
          url_consult_for_pay,
          "POST",
          name_service,
          {},
          body,
          dataSettingTime.retries,
          dataSettingTime.delay
        );
        ArmDataOutput(response, "Aprobada");
        return {
          ticket: response.obj?.result?.ticket,
          tipo_tramite: response.obj?.result?.tipo_tramite ?? "",
        };
      } catch (error: any) {
        if (!(error instanceof ErrorCustomFetch)) {
          ArmDataOutput(error.res ?? {});
          throw new ErrorCustomUseHookCode(
            TempErrorFrontService.replace("%s", name_service),
            error.message,
            `${hook_name} - ${function_name}`,
            "notifyError",
            true
          );
        } else if (error instanceof ErrorCustomBackendRechazada) {
          ArmDataOutput(error.res ?? {}, "Rechazada");
        } else if (error instanceof ErrorCustomBackend) {
          if (error?.res?.status_ === "pendienteout") {
            ArmDataOutput(error.res ?? {}, "Pendiente.");
          } else {
            ArmDataOutput(error.res ?? {});
          }
        } else if (error instanceof ErrorCustomBackendPending) {
          ArmDataOutput(error.res ?? {}, "Pendiente");
        } else {
          ArmDataOutput(error.res ?? {});
        }
        throw error;
      }
    },
    [ArmDataOutput, type_operation]
  );

  const PeticionCheckPay = useCallback(
    async (
      dataComercio: TypingDataComercio,
      dataInput: TypingDataInput,
      dataModalAdd: TypingDataModalAdd
    ): Promise<TypingCheckPay> => {
      const function_name = "PeticionPay";
      const name_service = "Servicio Gou";
      setloadingPeticion(true);
      setloadingPeticionBlocking(true);

      let status: TypingStatusTrx = "Pendiente";
      let go_url_process = false;
      setSummaryTrx({
        id_unico: ajust_tam_see(dataInput.id_unico_modal, 50),
        summary_trx_asterisk: dataModalAdd,
        summary_trx_own: {
          tipo_tramite: dataInput.tipo_tramite,
          referencia: dataInput.referencia,
          fecha: dataInput.fecha,
        },
        valor_trx: parseInt(dataInput.valor_trx),
      });
      setTrx({
        status: status,
        msg: constMsgTrx.Pendiente,
      });

      let response: any;
      const time_url_process: TypingDataSettingTimeCheckUrlProcess = {
        timeout: 80,
        delay: 10,
      };

      try {
        try {
          //SECUENCIA ---------------Paso 1-------------------------------
          response = await Promise.race([
            PeticionPay(dataComercio, dataInput),
            PeticionCheckUrlProcess(
              dataComercio,
              dataInput,
              time_url_process,
              35
            ),
          ]);
          if (response?.what_service === "PeticionCheckUrlProcess") {
            window.open(response.url_process);
            go_url_process = true;
          }
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
          if (error instanceof ErrorCustomBackend) {
            status = "Rechazada";
            setTrx({ status: status, msg: constMsgTrx.Rechazada });
            throw error;
          }
          if (error instanceof ErrorCustomBackendRechazada) {
            status = "Rechazada";
            throw error;
          }
        }
        try {
          //SECUENCIA ---------------Paso 2-------------------------------
          if (status === "Pendiente" && go_url_process === false) {
            response = await Promise.race([
              PeticionCheckUrlProcess(
                dataComercio,
                dataInput,
                time_url_process,
                150
              ),
              PeticionConsultForPay(dataComercio, dataInput, {
                delay: 30,
                retries: 6,
              }),
            ]);
            if (response?.what_service === "PeticionCheckUrlProcess") {
              window.open(response.url_process);
            }
          }
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
          throw error;
        }
        try {
          //SECUENCIA ---------------Paso 3-------------------------------
          response = await PeticionConsultForPay(dataComercio, dataInput, {
            delay: 30,
            retries: 6,
          });
          return response;
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
          throw error;
        }
      } catch (error: any) {
        throw error;
      } finally {
        setloadingPeticion(false);
        setloadingPeticionBlocking(false);
      }
    },
    [PeticionCheckUrlProcess, PeticionConsultForPay, PeticionPay]
  );

  return {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    summaryTrx,
    trx,
  };
  // as const;
};

export default useHookWithGouPay;
