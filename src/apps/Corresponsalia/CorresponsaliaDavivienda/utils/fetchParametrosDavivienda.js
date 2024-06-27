import fetchData from "../../../../utils/fetchData";

const urlComercios = `${import.meta.env.VITE_URL_SERVICE_COMMERCE}`;

export const postConsultaTotalDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/comercios/consultar_id_total_davivienda`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
