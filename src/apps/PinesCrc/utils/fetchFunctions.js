import fetchData from "../../../utils/fetchData";
import { fetchSecure } from "../../../utils/functions";

const urlColpatriaTrx = `${import.meta.env.VITE_URL_COLPATRIA}/trx`;
const urlColpatriaParams = `${import.meta.env.VITE_URL_COLPATRIA}/params`;
const urlPinesVus = `${import.meta.env.VITE_URL_PinesVus}`


export const makeDeposit = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de deposito", { cause: "custom" });
  }

  try {
    const res = await fetchData(
      `${urlColpatriaTrx}/deposito`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const makePagoGiro = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de pin de pago", { cause: "custom" });
  }

  try {
    const res = await fetchData(
      `${urlColpatriaTrx}/pago-de-giro`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const makePinDePago = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de pin de pago", { cause: "custom" });
  }

  try {
    const res = await fetchData(
      `${urlColpatriaTrx}/pin-de-pago`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
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
    const res = await fetchData(
      `${urlColpatriaTrx}/venta-pines`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const makeInquiryPin = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de venta de pin", { cause: "custom" });
  }

  try {
    const res = await fetchData(
      `${urlColpatriaTrx}/consulta-venta-pines`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const makeSellRecaudo = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de venta de pin", { cause: "custom" });
  }

  try {
    const res = await fetchData(
      `${urlColpatriaTrx}/recaudo`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const makeInquiryRecaudo = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("sin datos de venta de pin", { cause: "custom" });
  }

  try {
    const res = await fetchData(
      `${urlColpatriaTrx}/consulta-recaudo`,
      "POST",
      {},
      bodyDep
    );
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(
          res?.obj?.error_user_msg ?? res?.msg ?? "",
          { cause: "custom" }
        );
      }

      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};

const buildGetFunction = (url) => {
  return async (args = {}) => {
    console.log("PINES", args)
    try {
      const res = await fetchData(url, "GET", args);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(
            res?.obj?.error_user_msg ?? res?.msg ?? "",
            { cause: "custom" }
          );
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};
const buildPostFunction = (url) => {
  return async (body) => {
    if (!body) {
      throw new Error("Sin datos en el body", { cause: "custom" });
    }
    try {
      const res = await fetchData(url, "POST", {}, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(
            res?.obj?.error_user_msg ?? res?.msg ?? "",
            { cause: "custom" }
          );
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};
const buildPutFunction = (url) => {
  return async (args, body) => {
    if (!args || !body) {
      throw new Error("Sin datos de busqueda y/o modificacion", {
        cause: "custom",
      });
    }
    try {
      const res = await fetchData(url, "PUT", args, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(
            res?.obj?.error_user_msg ?? res?.msg ?? "",
            { cause: "custom" }
          );
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

export const searchConveniosPinesList = buildGetFunction(
  `${urlColpatriaTrx}/consulta/pines`
);
export const searchConveniosRecaudoList = buildGetFunction(
  `${urlColpatriaTrx}/consulta/recaudo`
);
export const searchConveniosRecaudoBarras = buildPostFunction(
  `${urlColpatriaTrx}/consulta-barras`
);

export const getErrorList = buildGetFunction(
  `${urlColpatriaParams}/error-table`
);
export const modErrorList = buildPutFunction(
  `${urlColpatriaParams}/error-table`
);

export const getConveniosPinesList = buildGetFunction(
  `${urlColpatriaParams}/convenios/pines`
);
export const addConveniosPinesList = buildPostFunction(
  `${urlColpatriaParams}/convenios/pines`
);
export const modConveniosPinesList = buildPutFunction(
  `${urlColpatriaParams}/convenios/pines`
);

export const addConveniosPinesListMassive = buildPostFunction(
  `${urlColpatriaParams}/convenios-masivo/pines`
);

export const getConveniosRecaudoList = buildGetFunction(
  `${urlColpatriaParams}/convenios/recaudo`
);
export const addConveniosRecaudoList = buildPostFunction(
  `${urlColpatriaParams}/convenios/recaudo`
);
export const modConveniosRecaudoList = buildPutFunction(
  `${urlColpatriaParams}/convenios/recaudo`
);

export const addConveniosRecaudoListMassive = buildPostFunction(
  `${urlColpatriaParams}/convenios-masivo/recaudo`
);

export const getTiposValores = buildGetFunction(
  `${urlColpatriaParams}/tipos-valores`
);
export const addTiposValores = buildPostFunction(
  `${urlColpatriaParams}/tipos-valores`
);
export const modTiposValores = buildPutFunction(
  `${urlColpatriaParams}/tipos-valores`
);

export const getConveniosPinesListMassive = async (args = {}) => {
  try {
    const _args = Object.entries(args)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    const response = await fetchSecure(
      `${urlColpatriaParams}/convenios-masivo/pines?${_args}`
    );

    if (response.ok) {
      return response;
    }

    const res = await response.json();
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    throw new Error({ message: "Unhandled error" }, { cause: "custom" });
    // return res;
  } catch (err) {
    throw err;
  }
};

export const getConveniosRecaudoListMassive = async (args = {}) => {
  try {
    const _args = Object.entries(args)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    const response = await fetchSecure(
      `${urlColpatriaParams}/convenios-masivo/recaudo?${_args}`
    );

    if (response.ok) {
      return response;
    }

    const res = await response.json();
    if (!res?.status) {
      if (res?.msg) {
        throw new Error(res?.msg, { cause: "custom" });
      }

      throw new Error(res, { cause: "custom" });
    }
    throw new Error({ message: "Unhandled error" }, { cause: "custom" });
    // return res;
  } catch (err) {
    throw err;
  }
};


export const getPinesExamenesFetch = buildGetFunction(
  `${urlPinesVus}/pines_examenes`
);

export const peticionCancelacion = buildPutFunction(
  `${urlPinesVus}/pines_examenes`
);