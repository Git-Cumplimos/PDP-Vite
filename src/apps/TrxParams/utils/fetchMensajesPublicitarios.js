import fetchData from "../../../utils/fetchData";

const urlComercios = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}`;

export const postConsultaMensajesPublicitarios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/mensajes_publicitarios/consultar`,
      "POST",
      {},
      bodyObj,
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res?.obj;
  } catch (err) {
    throw err;
  }
};
export const postCrearMensajesPublicitarios = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/mensajes_publicitarios/crear`,
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
export const putModificarMensajesPublicitarios = async (obj, bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/mensajes_publicitarios/editar`,
      "PUT",
      obj,
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
