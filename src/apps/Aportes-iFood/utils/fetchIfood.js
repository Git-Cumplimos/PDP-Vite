import fetchData from "../../../utils/fetchData";

const urls = {
  subirArchivo: process.env.REACT_APP_APORTES_IFOOD,
};

export const cargaArchivosS3 = async (queryParam) => {
  if (!queryParam) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos query");
    });
  }
  try {
    const res = await fetchData(
      urls.subirArchivo,
      "GET",
      queryParam,
      {},
      {},
      true
    );
    return res;
  } catch (err) {
    throw err;
  }
};
