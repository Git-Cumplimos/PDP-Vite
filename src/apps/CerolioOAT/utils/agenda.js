import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const fetchGetHorariosByIdComercio = async (fecha, comercio) => {
  try {
    const res = await fetchData(
      `${urlCerolio}/citas/get-horarios?fecha_consulta_disponibilidad=${fecha} 01:00:00&comercio=${comercio}`,
      "GET",
      {}
    );
    if (res) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};
