import fetchData from "../../../utils/fetchData";
import { fetchAutorizadores } from "./fetchRevalAutorizadores";

const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;
const urlAutorizadores = process.env.REACT_APP_URL_REVAL_AUTORIZADOR;

export const postConvenios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlConvenios}/convenio_unique`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const fetchConveniosMany = async (tags, page = 1) => {
  // if (!tags) {
  //   return { maxPages: 0, results: [] };
  // }
  try {
    const res = await fetchData(
      `${urlConvenios}/convenio_many`,
      "GET",
      {
        tags,
        page: isNaN(parseInt(page)) ? 1 : parseInt(page),
      },
      {},
      {},
      false
    );
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchConveniosUnique = async (id_convenio, ean13) => {
  if (!id_convenio && !ean13) {
    return { maxPages: 0, results: [] };
  }
  try {
    let args = {};
    if (id_convenio) {
      args = { id_convenio };
    }
    if (ean13) {
      args = { ean13 };
    }
    const res = await fetchData(`${urlConvenios}/convenio_unique`, "GET", args);
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchConvsPerAuto = async (tags, nombre_autorizador) => {
  try {
    const resConvs = await fetchConveniosMany(tags);
    const resAutos = await fetchAutorizadores(nombre_autorizador);
    const resConvsPerAuto = [];
    for (const { id_convenio, nombre_convenio } of resConvs.results) {
      const resCA = await fetchAutosPerConv(id_convenio);
      const resCAMapped = [
        ...resCA?.results.map(({ id_autorizador }) => {
          return id_autorizador;
        }),
      ];
      resAutos.results
        .filter(({ id_autorizador: el }) => resCAMapped.includes(el))
        .forEach((auto) => {
          resConvsPerAuto.push({
            Convenio: { id_convenio, nombre_convenio },
            Autorizador: auto,
          });
        });
      if (resCA?.status) {
      } else {
        console.error(resCA?.msg);
      }
    }
    return resConvsPerAuto;
  } catch (err) {
    throw err;
  }
};

export const fetchAutosPerConv = async (convenios_id_convenio) => {
  try {
    const resCA = await fetchData(`${urlAutorizadores}/autorizador`, "GET", {
      convenios_id_convenio,
    });
    if (resCA?.status) {
      return { ...resCA?.obj };
    } else {
      console.error(resCA?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const putConvenios = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  try {
    const res = await fetchData(
      `${urlConvenios}/convenio_unique`,
      "PUT",
      argsObj,
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
