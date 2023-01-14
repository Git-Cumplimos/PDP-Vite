import { useCallback, useState } from "react";
import { notify } from "../../../../utils/notify";
import { fetchCustom, EvaluateResponse } from "../utils/fetchMovistarGeneral";

const sleep = (millisecons) => {
  return new Promise((resolve) => setTimeout(resolve, millisecons));
};

// const sleepEvent = (millisecons) => {
//   return new Promise((resolve, reject) => {
//     if (false) {
//       setTimeout(() => resolve("ok"), 5000);
//     } else {
//       reject("whoops!");
//     }
//   });
// };

export const useFetchMovistar = (url_ = "", name_ = "") => {
  const [state, setState] = useState(false);

  const fetchMovistarTrx = useCallback(
    async (data_ = {}) => {
      const fetchPaso1 = fetchCustom(url_, "POST", `'crear ${name_}'`);
      const fetchPaso2 = fetchCustom(url_, "PUT", `'modificar ${name_}'`);
      const fetchPaso3 = fetchCustom(url_, "GET", `'consultar ${name_}'`);
      let PeticionPaso1;
      let PeticionPaso2;
      let PeticionPaso3;
      let banderaPaso3 = false;
      let response;
      setState(true);

      //Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion
      let cantTimerInterval = 0;
      let timerInterval = setInterval(() => {
        cantTimerInterval += 1;
        switch (cantTimerInterval) {
          case 1:
            notify(
              "Estamos procesando la transacción, puede tardar hasta 50 segundos"
            );
            break;
          case 3:
            notify("Continuamos procesando la transacción, por favor esperar");
            break;
          default:
            if (cantTimerInterval >= 5) {
              notify(
                "Se prolongó el proceso de la transacción, por favor esperar"
              );
              break;
            }
        }
      }, 10000);

      //Paso 1
      try {
        PeticionPaso1 = await fetchPaso1({}, data_);
      } catch (error) {
        clearInterval(timerInterval);
        setState(false);
        throw error;
      }
      //Paso 2
      try {
        PeticionPaso2 = await fetchPaso2({}, PeticionPaso1?.obj?.result);
        response = PeticionPaso2;
      } catch (error) {
        if (error.name === "ErrorCustomTimeout") {
          banderaPaso3 = true;
        } else {
          clearInterval(timerInterval);
          setState(false);
          throw error;
        }
      }
      //Paso 3
      if (banderaPaso3) {
        //esperar un tiempo
        await sleep(12000);

        //realizar peticion de consulta
        try {
          PeticionPaso3 = await fetchPaso3(
            { id_trx: PeticionPaso1?.obj?.result?.id_trx },
            {}
          );
        } catch (error) {
          clearInterval(timerInterval);
          setState(false);
          throw error;
        }

        //evaluar respuesta de la consulta
        try {
          response = EvaluateResponse(PeticionPaso3?.obj?.result);
        } catch (error) {
          clearInterval(timerInterval);
          setState(false);
          throw error;
        }
      }
      clearInterval(timerInterval);
      setState(false);
      return response;
    },
    [setState, url_, name_]
  );

  return [state, fetchMovistarTrx];
};
