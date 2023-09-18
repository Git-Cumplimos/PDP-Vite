import { useState } from "react";
import { notify } from "../../../../utils/notify";

export const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const useTimerCustom = () => {
  let timerInterval: any;
  let timerTimeout: any;

  const startTimer = () => {
    let cantTimerInterval = 0;
    timerInterval = setInterval(() => {
      cantTimerInterval += 1;
      if (cantTimerInterval <= 1) {
        notify(
          "Estamos procesando la transacción, puede tardar hasta 2 minutos"
        );
      } else if (cantTimerInterval > 1 && cantTimerInterval <= 4) {
        notify("Se prolongó el proceso de la transacción, por favor esperar");
      } else {
        notify("Se prolongó el proceso de la transacción, por favor esperar");
      }
    }, 15000);
  };

  const stopTimer = () => {
    clearInterval(timerInterval); //reiniciar contador
    clearTimeout(timerTimeout); //reiniciar contador
  };

  return [startTimer, stopTimer] as const;
};
