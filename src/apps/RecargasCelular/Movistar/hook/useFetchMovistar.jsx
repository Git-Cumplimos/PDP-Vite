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

export const useFetchMovistar = (
  url_trx_ = "",
  url_consulta_ = "",
  name_ = "",
  time_seg_trx = 15, //tiempo en segundos, debe ser numerico
  time_seg_notify = 10 //tiempo en segundos, debe ser numerico
) => {
  const [state, setState] = useState(false);

  const fetchMovistarTrx = useCallback(
    async (data_ = {}, data_additional_ = {}) => {
      const fetchPaso1 = fetchCustom(url_trx_, "POST", `'crear ${name_}'`);
      const fetchPaso2 = fetchCustom(url_trx_, "PUT", `'modificar ${name_}'`);
      const fetchPaso3 = fetchCustom(
        url_consulta_,
        "PUT",
        `'consultar ${name_}'`
      );

      let PeticionPaso1;
      let PeticionPaso2;
      let PeticionPaso3;
      let banderaPaso2 = false;
      let banderaPaso3 = false;
      let id_trx = null;
      let id_movistar = null;
      let response;
      setState(true);

      //?-----Iniciar intervalo para la alertas del usuario debido a la demora de la transaccion
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
      }, time_seg_notify * 1000);
      //?--------------------------------------------------------------------

      //SECUENCIA ---------------Paso 1-------------------------------
      try {
        let data_inicio = {
          celular: data_.celular,
          valor: data_.valor,
          id_comercio: data_.id_comercio,
          tipo_comercio: data_.tipo_comercio,
          id_terminal: data_.id_terminal,
          id_usuario: data_.id_usuario,
          direccion: data_.direccion,
          ciudad: data_.ciudad,
          codigo_dane: data_.codigo_dane,
        };

        Object.keys(data_additional_).map(
          (value, index) => (data_inicio[value] = data_additional_[value])
        );

        PeticionPaso1 = await fetchPaso1({}, data_inicio);
      } catch (error) {
        banderaPaso2 = true;
        if (error.name === "ErrorCustomTimeout") {
          banderaPaso3 = true;
        } else {
          clearInterval(timerInterval); //reiniciar contador
          setState(false);
          throw error;
        }
      }

      //SECUENCIA ---------------Paso 2-------------------------------
      if (!banderaPaso2) {
        try {
          id_trx = PeticionPaso1?.obj?.result?.id_trx;
          id_movistar = PeticionPaso1?.obj?.result?.id_movistar;
          let data_trx = {
            celular: data_.celular,
            valor: data_.valor,
            id_comercio: data_.id_comercio,
            id_terminal: data_.id_terminal,
            id_usuario: data_.id_usuario,
            id_trx: id_trx,
            id_movistar: id_movistar,
          };

          Object.keys(data_additional_).map(
            (value, index) => (data_trx[value] = data_additional_[value])
          );

          PeticionPaso2 = await fetchPaso2({}, data_trx);
          response = PeticionPaso2;
        } catch (error) {
          if (error.name === "ErrorCustomTimeout") {
            banderaPaso3 = true;
          } else {
            clearInterval(timerInterval); //reiniciar contador
            setState(false);
            throw error;
          }
        }
      }

      //SECUENCIA ---------------Paso 3-------------------------------
      if (banderaPaso3) {
        //esperar un tiempo
        await sleep(time_seg_trx * 1000);

        //realizar peticion de consulta
        try {
          if (id_trx == null) {
            id_trx = PeticionPaso2?.obj?.result?.id_trx;
          }
          if (id_movistar == null) {
            id_movistar = PeticionPaso2?.obj?.result?.id_movistar;
          }

          let data_consulta = {
            reason: "timeout api gateway",
            id_comercio: data_.id_comercio,
            id_terminal: data_.id_terminal,
            id_usuario: data_.id_usuario,
            id_trx: id_trx,
            id_movistar: id_movistar,
          };

          PeticionPaso3 = await fetchPaso3({}, data_consulta);
        } catch (error) {
          clearInterval(timerInterval);
          setState(false);
          throw error;
        }

        //evaluar respuesta de la consulta
        try {
          response = EvaluateResponse(PeticionPaso3?.obj?.result?.result_trx);
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
    [setState, url_trx_, url_consulta_, name_, time_seg_trx, time_seg_notify]
  );

  return [state, fetchMovistarTrx];
};
