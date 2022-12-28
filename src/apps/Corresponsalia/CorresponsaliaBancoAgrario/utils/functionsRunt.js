import { useCallback, useEffect, useState, useMemo } from "react";
import { notifyError } from "../../../../utils/notify";

//FUNCION PARA MOSTRAR LOS VALORES NUMERICOS DEL RECIBO DE PAGO QUITANDO ]C1
export const validarEntradaScanner = (validarNum) => {
  const noValido = /\s/;

  if (noValido.test(validarNum)) {
    // se chequea el regex de que el string no tenga espacio
    notifyError("La contraseña no puede contener espacios en blanco");
    return "";
  } else {
    if (validarNum[0] === "]") {
      // console.log(validarNum.replace("]C1", ""));
      return validarNum.replace("]C1", "");
    } else {
      return validarNum;
    }
  }
};
