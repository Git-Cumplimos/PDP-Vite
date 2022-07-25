import fetchData from "../../../utils/fetchData";

const urlColpatriaTrx = `${process.env.REACT_APP_URL_COLPATRIA}/trx`;
const urlColpatriaParams = `${process.env.REACT_APP_URL_COLPATRIA}/params`;

export const makeDeposit = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de deposito", { cause: "custom" });
  }

  try {    
    const res = await fetchData(`${urlColpatriaTrx}/deposito`, "POST", {}, bodyDep);
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const makeSellPin = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de venta de pin", { cause: "custom" });
  }

  try {    
    const res = await fetchData(`${urlColpatriaTrx}/venta-pines`, "POST", {}, bodyDep);
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};


export const getErrorList = async (args = {}) => {
  // if (!args) {
  //   throw new Error("Si", { cause: "custom" });
  // }

  try {    
    const res = await fetchData(`${urlColpatriaParams}/error-table`, "GET", args);
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};
export const modErrorList = async (args, body) => {
  if (!args || !body) {
    throw new Error("Sin datos de busqueda y/o modificacion", { cause: "custom" });
  }

  try {    
    const res = await fetchData(`${urlColpatriaParams}/error-table`, "PUT", args, body);
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};
