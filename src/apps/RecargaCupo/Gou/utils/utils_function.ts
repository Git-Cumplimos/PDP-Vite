export const get_value = (structure: string, value_: string) => {
  const type = structure;
  let value = "";
  let is_change = false;
  let msg_invalid = "";
  switch (type) {
    case "letters": {
      if (value_.match(/^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/g)) {
        is_change = true;
        value = (value_.match(/^[ a-zA-ZñÑáéíóúÁÉÍÓÚ]+$/g) ?? []).join("");
        msg_invalid = "";
      } else {
        msg_invalid = "solo se bebe ingresar letras";
      }
      break;
    }
    case "email": {
      is_change = true;
      value = value_;
      break;
    }
    case "cel": {
      is_change = true;
      if (value_[0] === "3") {
        value = (value_.match(/\d/g) ?? []).join("");
        msg_invalid = "";
      } else {
        msg_invalid = "debe iniciar con el digito '3'";
      }
      break;
    }
    case "number": {
      is_change = true;
      value = (value_.match(/\d/g) ?? []).join("");
      break;
    }
    case "text": {
      is_change = true;
      value = value_;
      break;
    }
  }
  return [value, is_change, msg_invalid] as const;
};

export const do_compare = (
  dataOrigin: { [key: string]: any },
  keyCurrent: string,
  valueCurrent: string,
  structure: string
) => {
  let is_equal = true;
  let msg_invalid = "";
  const between = structure.split("=>");
  const key_origin = between[1];
  const key_change = between[0];
  if (keyCurrent === key_origin) {
    const value_change_ = dataOrigin[key_change];
    const value_change = value_change_.substring(0, value_change_.length);
    const value_origin_ = valueCurrent;
    const value_origin = value_origin_.substring(0, value_change_.length);
    if (value_change !== value_origin) {
      is_equal = false;
      msg_invalid = "No coincide";
    } else {
      msg_invalid = "";
    }
    return [is_equal, key_change, msg_invalid] as const;
  }
  if (keyCurrent === key_change) {
    const value_origin_ = dataOrigin[key_origin];
    const value_origin = value_origin_.substring(0, valueCurrent.length);
    const value_change = valueCurrent;
    if (value_change !== value_origin) {
      is_equal = false;
      msg_invalid = "No coincide";
    } else {
      msg_invalid = "";
    }
    return [is_equal, key_change, msg_invalid] as const;
  }

  return [is_equal, key_change, msg_invalid] as const;
};
