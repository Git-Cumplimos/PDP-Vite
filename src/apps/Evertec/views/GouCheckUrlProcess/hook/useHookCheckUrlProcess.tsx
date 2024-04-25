import { useCallback, useState } from "react";
import {
  ErrorCustomApiGatewayTimeout,
  ErrorCustomFetch,
  ErrorCustomFetchTimeout,
  ErrorCustomUseHookCode,
  defaultParamsError,
  TempErrorFrontService,
  fetchCustomPdp,
  ErrorCustomBackendPending,
  ErrorCustomRaise,
  FuctionEvaluateResponseConsultTrx,
  sleep,
} from "../../../../../utils/fetchCustomPdp";
import {
  TypingDataComercioSimple,
  TypingSummaryTrx,
} from "../../../utils/utils_typing";
import {
  TypingDataInputAuto,
  TypingPeticionCheckUrlProcessOutput,
} from "../utils_typing";

// //FRAGMENT ******************** TYPING *******************************
export type TypeUseHookCheckUrlProcess = () => {
  loadingPeticion: boolean;
  loadingPeticionBlocking: boolean;
  PeticionCycleCheckUrlProcess: (
    dataComercioSimple: TypingDataComercioSimple,
    dataInputAuto: TypingDataInputAuto
  ) => Promise<TypingPeticionCheckUrlProcessOutput>;
  summaryTrx: TypingSummaryTrx;
};
export type TypeTimeCheckUrlProcess = {
  time_front_timeout: number;
  time_front_delay: number;
};

// //FRAGMENT ******************** CONST *******************************
// // const URL_GOU = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}`;
// const URL_GOU = `http://127.0.0.1:5000`;
const TIME_CHECK_URL_PROCESS_TIMEOUT_MAX = 90;
const TIME_CHECK_URL_PROCESS_DEFAULT: TypeTimeCheckUrlProcess = {
  time_front_timeout: TIME_CHECK_URL_PROCESS_TIMEOUT_MAX,
  time_front_delay: 10,
};

// //FRAGMENT ******************** HOOK *******************************
// const useHookCheckUrlProcess: TypeUseHookCheckUrlProcess = () => {
//   const [loadingPeticion, setloadingPeticion] = useState<boolean>(false);
//   const [loadingPeticionBlocking, setloadingPeticionBlocking] =
//     useState<boolean>(false);
//   const [summaryTrx, setSummaryTrx] = useState<TypingSummaryTrx>({});

//   const PeticionCheckUrlProcess = useCallback(
//     async (
//       dataComercioSimple: TypingDataComercioSimple,
//       dataInputAuto: TypingDataInputAuto,
//       name_service: string
//     ): Promise<TypingPeticionCheckUrlProcessOutput> => {
//       const function_name = "PeticionCheckUrlProcess";
//       const url_check_url_process = `${URL_GOU}/services_gou/check_pay/check_url_process`;
//       let response;
//       const body = {
//         comercio: {
//           ...dataComercioSimple,
//         },
//         id_uuid_trx: dataInputAuto.id_uuid_trx,
//         type_operation: dataInputAuto.type_operation,
//       };
//       //SECUENCIA ---------------Paso 1-------------------------------
//       try {
//         response = await fetchCustomPdp(
//           url_check_url_process,
//           "POST",
//           name_service,
//           {},
//           body,
//           40,
//           defaultParamsError,
//           FuctionEvaluateResponseConsultTrx
//         );

//         if (!response?.obj?.result?.url_process)
//           throw new ErrorCustomRaise(
//             TempErrorFrontService.replace("%s", name_service),
//             "url_process no viene en la respuesta",
//             `${hook_name} - ${function_name}`,
//             "notifyError",
//             true
//           );
//         return {
//           url_process: response?.obj?.result?.url_process,
//         };
//       } catch (error: any) {
//         if (!(error instanceof ErrorCustomFetch)) {
//           throw new ErrorCustomUseHookCode(
//             TempErrorFrontService.replace("%s", name_service),
//             error.message,
//             `${hook_name} - ${function_name}`,
//             "notifyError",
//             true
//           );
//         }
//         throw error;
//       }
//     },
//     []
//   );

//   const PeticionCycleCheckUrlProcess = useCallback(
//     async (
//       dataComercioSimple: TypingDataComercioSimple,
//       dataInputAuto: TypingDataInputAuto
//     ): Promise<TypingPeticionCheckUrlProcessOutput> => {
//       const function_name = "PeticionCycleCheckUrlProcess";
//       const name_service = "Obtener url de pago";
//       setloadingPeticion(true);
//       setloadingPeticionBlocking(true);
//       let time_check_url_process: TypeTimeCheckUrlProcess =
//         TIME_CHECK_URL_PROCESS_DEFAULT;

//       //?-----Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion
//       let seconds_ = 1;
//       let timerSecondsMaxClock: NodeJS.Timeout;
//       let timerSecondsClock: NodeJS.Timer;
//       timerSecondsMaxClock = setTimeout(() => {
//         seconds_ += TIME_CHECK_URL_PROCESS_TIMEOUT_MAX;
//         clearTimeout(timerSecondsMaxClock);
//         clearInterval(timerSecondsClock);
//       }, 1000 * TIME_CHECK_URL_PROCESS_TIMEOUT_MAX);
//       timerSecondsClock = setInterval(() => {
//         seconds_ += 1;
//       }, 1000);
//       //?--------------------------------------------------------------------
//       let error_save: any = new ErrorCustomRaise(
//         TempErrorFrontService.replace("%s", name_service),
//         "proceso de la peticion indefinido",
//         `${hook_name} - ${function_name}`,
//         "notifyError",
//         true
//       );
//       try {
//         do {
//           try {
//             const resCheckUrlProcess: TypingPeticionCheckUrlProcessOutput =
//               await PeticionCheckUrlProcess(
//                 dataComercioSimple,
//                 dataInputAuto,
//                 name_service
//               );
//             return resCheckUrlProcess;
//           } catch (error: any) {
//             if (!(error instanceof ErrorCustomFetch))
//               throw new ErrorCustomUseHookCode(
//                 TempErrorFrontService.replace("%s", name_service),
//                 error.message,
//                 `${hook_name} - ${function_name}`,
//                 "notifyError",
//                 true
//               );
//             error_save = error;
//             const res_obj = error?.res?.obj ?? {};
//             if (res_obj?.ids?.id_log)
//               setSummaryTrx({
//                 id_log: res_obj?.ids?.id_log,
//               });

//             if (
//               !(error instanceof ErrorCustomApiGatewayTimeout) &&
//               !(error instanceof ErrorCustomFetchTimeout) &&
//               !(error instanceof ErrorCustomBackendPending)
//             )
//               throw error;

//             if (error instanceof ErrorCustomBackendPending) {
//               const configuration = res_obj?.result?.configuration ?? {};
//               if (typeof configuration?.time_front_timeout === "number") {
//                 if (
//                   configuration?.time_front_timeout !==
//                   time_check_url_process.time_front_timeout
//                 ) {
//                   time_check_url_process.time_front_timeout =
//                     configuration?.time_front_timeout;
//                 }
//               }
//               if (typeof configuration?.time_front_delay === "number") {
//                 if (
//                   configuration?.time_front_delay !==
//                   time_check_url_process.time_front_delay
//                 ) {
//                   time_check_url_process.time_front_delay =
//                     configuration?.time_front_delay;
//                 }
//               }
//             }
//             const time_front_faltante = Math.abs(
//               Math.min(
//                 TIME_CHECK_URL_PROCESS_TIMEOUT_MAX,
//                 time_check_url_process.time_front_timeout
//               ) - seconds_
//             );
//             const time_front_delay =
//               time_check_url_process.time_front_delay >= time_front_faltante
//                 ? time_front_faltante - 3
//                 : time_check_url_process.time_front_delay;

//             await sleep(time_front_delay);
//           }
//         } while (
//           seconds_ <=
//           Math.min(
//             TIME_CHECK_URL_PROCESS_TIMEOUT_MAX,
//             time_check_url_process.time_front_timeout
//           )
//         );
//         throw error_save;
//       } catch (error: any) {
//         if (!(error instanceof ErrorCustomFetch)) {
//           throw new ErrorCustomUseHookCode(
//             TempErrorFrontService.replace("%s", name_service),
//             error.message,
//             `${hook_name} - ${function_name}`,
//             "notifyError",
//             true
//           );
//         }
//         throw error;
//       } finally {
//         clearTimeout(timerSecondsMaxClock);
//         clearInterval(timerSecondsClock);
//         setloadingPeticion(false);
//         setloadingPeticionBlocking(false);
//       }
//     },
//     [PeticionCheckUrlProcess]
//   );

//   return {
//     loadingPeticion,
//     loadingPeticionBlocking,
//     PeticionCycleCheckUrlProcess,
//     summaryTrx,
//   };
//   // as const;
// };
