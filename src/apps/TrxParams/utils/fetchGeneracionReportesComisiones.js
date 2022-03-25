import fetchData from "../../../utils/fetchData";
const urlComisiones = process.env.REACT_APP_URL_COMISIONES;

export const reportGenerationGeneralComisions = async (obj) => {
  // if (!nombre_autorizador) {
  //   return { maxPages: 0, results: [] };
  // }
  try {
    const res = await fetchData(
      `${urlComisiones}/reportes_comisiones/comisiones_general`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
