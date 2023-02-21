import fetchData from "../../../utils/fetchData";

const urlRecaudo = `http://localhost:5000/recaudos`;

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
export const getRecaudosList = buildGetFunction(
    `${urlRecaudo}/convenios/recaudo`
  );