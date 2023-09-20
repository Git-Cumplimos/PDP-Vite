import { useState } from "react";
import { notify, notifyError } from "../../../../utils/notify";

export const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const useTimerCustom = () => {
  let timerInterval: any;
  let timerTimeout: any;

  const startTimer = () => {
    timerInterval = setInterval(() => {
      notifyError("Estamos procesando la transacción, por favor espere", 5000, {
        toastId: "notify-lot-esperar",
      });
    }, 15000);
  };

  const stopTimer = () => {
    clearInterval(timerInterval); //reiniciar contador
    clearTimeout(timerTimeout); //reiniciar contador
  };

  return [startTimer, stopTimer] as const;
};
