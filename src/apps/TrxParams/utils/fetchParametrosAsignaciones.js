import fetchData from "../../../utils/fetchData";

const urlParametrizacion =
  import.meta.env.VITE_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

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