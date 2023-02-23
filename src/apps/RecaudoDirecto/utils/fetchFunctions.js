import fetchData from "../../../utils/fetchData";

const url = `http://127.0.0.1:8000`;

const buildGetFunction = (url) => {
  return async (args = {}) => {
    try {
      const res = await fetchData(url, "GET", args);
      // if (!res?.status) {
      //   if (res?.msg) {
      //     throw new Error(res?.msg, { cause: "custom" });
      //   }

      //   throw new Error(res, { cause: "custom" });
      // }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

export const getRecaudosList = buildGetFunction(
  `${url}/api/convenio/lista-recaudo`
);
export const getRetirosList = buildGetFunction(
  `${url}/api/convenio/lista-retiro`
);

export const searchConveniosRecaudoList = buildGetFunction(
  `${url}/api/convenios/`
);