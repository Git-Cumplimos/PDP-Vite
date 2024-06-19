import { notifyError } from "../../../utils/notify";

const calcularDigitoVerificacion = (myNit) => {
    let vpri, z;
  
    // Se limpia el Nit
    // Espacios - comas - puntos - guiones
    myNit = myNit.replace(/(\s)|(,)|(\.)|(-)/g, "");
  
    // Se valida el nit
    if (isNaN(myNit)) {
      notifyError("El nit '" + myNit + "' no es válido(a).");
      return "";
    }
  
    // Procedimiento
    vpri = [2, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    z = myNit.length;
  
    let x = 0;
    let y = 0;
    for (let i = 0; i < z; i++) {
      y = myNit.substr(i, 1);
      x += y * vpri[z - i];
    }
    y = x % 11;
    // console.log("RESP", y > 1 ? 11 - y : y)
    return y > 1 ? 11 - y : y;
  };

/**
 * On change for just number inputs
 * @param {*} ev
 * @returns digits in text
 */
export const onChangeNit = (ev) => {
    let caret_pos = ev.target.selectionStart ?? 0;
    const len = ev.target.value.length;
  
    ev.target.value = ((ev.target.value ?? "").match(/[\d-]/g) ?? []).join("");
  
    const matches = ev.target.value.match(/(\d{3})/g);
  
    let newStr = "";
    if (matches && matches[0]) {
      newStr = `${newStr}${matches[0]}.`;
      if (matches[1]) {
        newStr = `${newStr}${matches[1]}.`;
        if (matches[2] && ev.target.value.match(/(\d{3})/g)) {
          newStr = `${newStr}${matches[2]}-${calcularDigitoVerificacion(
            `${ev.target.value}-`
          )}`;
        } else {
          newStr = `${newStr}${ev.target.value.substring(6, 9)}`;
        }
      } else {
        newStr = `${newStr}${ev.target.value.substring(3)}`;
      }
  
      ev.target.value = newStr;
  
      ev.target.focus();
      caret_pos += ev.target.value.length - len;
      ev.target.setSelectionRange(caret_pos, caret_pos);
    }
    return ev.target.value;
  };