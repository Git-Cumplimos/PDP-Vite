import fetchData from "../../../../utils/fetchData";

const urlAval = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}`;

export const postConsultaTablaConveniosPaginado = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlAval}/grupo_aval_cb_recaudo/consulta_tabla_convenios_paginado`,
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
export const postConsultaTablaConveniosEspecifico = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlAval}/grupo_aval_cb_recaudo/consulta_tabla_convenios_especifico`,
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
export const postConsultaCodigoBarrasConveniosEspecifico = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlAval}/grupo_aval_cb_recaudo/codigo_barras`,
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
export const postConsultaConveniosAval = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlAval}/grupo_aval_cb_recaudo/consulta_recaudo_servicios_publicos_privados`,
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
export const postRecaudoConveniosAval = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlAval}/grupo_aval_cb_recaudo/recaudo_servicios_publicos_privados`,
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
