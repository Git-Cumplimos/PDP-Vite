import { useCallback, useState } from "react";
import { fetchCustom, EvaluateResponse } from "../utils/fetchMovistarGeneral";

const sleep = (millisecons) => {
  return new Promise((resolve) => setTimeout(resolve, millisecons));
};

const sleepEvent = (millisecons) => {
  return new Promise((resolve, reject) => {
    if (false) {
      setTimeout(() => resolve("ok"), 5000);
    } else {
      reject("whoops!");
    }
  });
};

export const useFetchMovistar = (url_ = "", name_ = "") => {
  const [state, setState] = useState(false);

  const fetchPaso1 = fetchCustom(url_, "POST", `'crear ${name_}'`);
  const fetchPaso2 = fetchCustom(url_, "PUT", `'modificar ${name_}'`);
  const fetchPaso3 = fetchCustom(url_, "GET", `'consultar ${name_}'`);
  let PeticionPaso1;
  let PeticionPaso2;
  let PeticionPaso3;
  let banderaPaso3 = false;
  let response;

  const fetchMovistarTrx = useCallback(
    async (data_ = {}) => {
      setState(true);
      // paso 1
      try {
        PeticionPaso1 = await fetchPaso1({}, data_);
      } catch (error) {
        setState(false);
        throw error;
      }
      //paso 2
      try {
        PeticionPaso2 = await fetchPaso2({}, PeticionPaso1?.obj?.result);
        response = PeticionPaso2;
      } catch (error) {
        setState(false);
        if (error.name == "ErrorCustomTimeout") {
          banderaPaso3 = true;
        } else {
          throw error;
        }
      }
      //paso 3
      if (banderaPaso3) {
        //esperar un tiempo
        await sleep(10000);

        //realizar peticion de consulta
        try {
          //PeticionPaso2?.obj?.result?.transaccion_ptopago
          PeticionPaso3 = await fetchPaso3({ id_trx: 26515 }, {});
        } catch (error) {
          setState(false);
          throw error;
        }

        //evaluar respuesta de la consulta
        try {
          response = EvaluateResponse(PeticionPaso3?.obj?.result);
        } catch (error) {
          setState(false);
          throw error;
        }
      }
      setState(false);
      return response;
    },
    [setState, url_, name_]
  );

  return [state, fetchMovistarTrx];
};
