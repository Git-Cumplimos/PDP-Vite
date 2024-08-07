import fetchData from "../../../../utils/fetchData";

const urlBancoAgrario = `${import.meta.env.VITE_URL_BANCO_AGRARIO}`;

export const postConsultaTablaConveniosPaginado = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/consulta_tabla_convenios_paginado`,
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
export const postConsultaTablaConveniosPaginadoTotal = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/consulta_tabla_convenios_paginado_total`,
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
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/consulta_tabla_convenios_especifico`,
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
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/codigo_barras`,
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

export const postRecaudoConveniosAgrario = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/recaudo_servicios_publicos_privados`,
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
export const postCrearConvenio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/crear_convenio`,
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
export const putModificarConvenio = async (pkConvenio, bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/actualizar_convenio?pk_tbl_convenios_banco_agrario=${pkConvenio}`,
      "PUT",
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
export const postCheckEstadoConveniosAgrario = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlBancoAgrario}/banco-agrario/banco_agrario_cb_recaudo/comprobar_cargue_archivo`,
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
