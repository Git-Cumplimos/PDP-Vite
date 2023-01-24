import fetchData from "../../../utils/fetchData";

const urlBroker = "http://localhost:8000/api";

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

export const consultarConvenio = buildPostFunction(
  `${urlBroker}/recaudo/consulta-convenio`
);
export const consultarConvenioBarras = buildPostFunction(
  `${urlBroker}/recaudo/consulta-convenio-codigo-barras`
);
export const consultarRecaudo = buildPostFunction(
  `${urlBroker}/recaudo/consulta-recaudo`
);
export const transaccionConvenio = buildPostFunction(
  `${urlBroker}/recaudo/transaccion`
);
