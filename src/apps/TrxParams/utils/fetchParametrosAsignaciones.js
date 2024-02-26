import fetchData from "../../../utils/fetchData";

const urlParametrizacion =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const postAssign = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/asignaciones/update`,
      "POST",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};