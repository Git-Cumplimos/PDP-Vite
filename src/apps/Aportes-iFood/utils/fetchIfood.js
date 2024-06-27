import fetchData from "../../../utils/fetchData";

const urls = {
  subirArchivo: import.meta.env.VITE_APORTES_IFOOD,
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
