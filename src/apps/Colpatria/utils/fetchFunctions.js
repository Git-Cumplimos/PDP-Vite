import fetchData from "../../../utils/fetchData";
import { fetchSecure } from "../../../utils/functions";

const urlColpatriaTrx = `${process.env.REACT_APP_URL_COLPATRIA}/trx`;
// const urlColpatriaParams = `${process.env.REACT_APP_URL_COLPATRIA}/params`;
const urlColpatriaParams = `http://localhost:5000/params`;

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
    const res = await fetchData(
      `${urlColpatriaTrx}/venta-pines`,
      "POST",
      {},
      bodyDep
    );
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

const buildGetFunction = (url) => {
  return async (args = {}) => {
    try {
      const res = await fetchData(url, "GET", args);
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
          throw new Error(res?.msg, { cause: "custom" });
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
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

export const getErrorList = buildGetFunction(
  `${urlColpatriaParams}/error-table`
);
export const modErrorList = buildPutFunction(
  `${urlColpatriaParams}/error-table`
);

export const getConveniosPinesList = buildGetFunction(
  `${urlColpatriaParams}/convenios-pines`
);
export const addConveniosPinesList = buildPostFunction(
  `${urlColpatriaParams}/convenios-pines`
);
export const modConveniosPinesList = buildPutFunction(
  `${urlColpatriaParams}/convenios-pines`
);

export const addConveniosPinesListMassive = buildPostFunction(
  `${urlColpatriaParams}/convenios-pines-masivo`
);

export const getConveniosPinesTiposValores = buildGetFunction(
  `${urlColpatriaParams}/tipos-valores-pines`
);
export const addConveniosPinesTiposValores = buildPostFunction(
  `${urlColpatriaParams}/tipos-valores-pines`
);
export const modConveniosPinesTiposValores = buildPutFunction(
  `${urlColpatriaParams}/tipos-valores-pines`
);

export const getConveniosPinesListMassive = async (args = {}) => {
  try {
    const _args = Object.entries(args)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    const response = await fetchSecure(
      `${urlColpatriaParams}/convenios-pines-masivo?${_args}`
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
