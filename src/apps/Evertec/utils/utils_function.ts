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

export const ajust_tam_see = (value: string, minCant: number): string => {
  if (value.length <= minCant) return value;

  const tam = Math.ceil(value.length / minCant);
  let value_vector = [];
  let value_final = "";
  for (let i = 0; i < tam; i++) {
    let fin = (i + 1) * minCant;
    if (fin > value.length) fin = value.length;
    value_vector.push(value.substring(i * minCant, fin));
    value_final = value_vector.join(" ");
  }
  return value_final;
};

export const ajust_tam_see_obj = (
  valueObj: { [key: string]: string },
  minCant: number
): { [key: string]: string } => {
  const valueObjNew: { [key: string]: string } = {};
  Object.keys(valueObj).map((key) => {
    valueObjNew[key] = ajust_tam_see(valueObj[key].toString(), minCant);
    return key;
  });
  return valueObjNew;
};

export const ajust_point_see = (value: string, minCant: number): string => {
  if (value.length <= minCant) return value;
  return `${value.substring(0, minCant - 4)} ...`;
};

export const list_a_dict_segun_order = (
  summary: Array<{ [key: string]: string | number | null }>
): { [key: string]: string | number } => {
  let summary_new: { [key: string]: string | number } = {};
  summary.map((kargs) => {
    const value = Object.values(kargs)[0];
    const key: string = Object.keys(kargs)[0];
    if (value !== null) {
      summary_new = { ...summary_new, [key]: value };
    }
    return kargs;
  });
  return summary_new;
};

export const dict_segun_order = (
  order: Array<string>,
  summary: { [key: string]: any }
): { [key: string]: string | number } => {
  let summary_new: { [key: string]: string | number } = {};
  order.map((value_string, index) => {
    const value = summary[value_string];
    if (value) {
      summary_new = { ...summary_new, [value_string]: value };
    }
    return index;
  });
  return summary_new;
};

export const dict_summary_trx_own = (
  relationshipSummary: { [key: string]: string },
  summary_trx_own: { [key: string]: any }
): { [key: string]: string | number } => {
  let summary_trx_own_new: { [key: string]: any } = {};
  Object.keys(relationshipSummary).map((key, index) => {
    const arg = summary_trx_own[key];
    if (arg) {
      summary_trx_own_new = {
        ...summary_trx_own_new,
        [relationshipSummary[key]]: arg,
      };
    }
    return index;
  });
  return summary_trx_own_new;
};
