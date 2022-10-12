import fetchData from "../../../../utils/fetchData";

const urlDaviplata = `${process.env.REACT_APP_URL_CORRESPONSALIA_DAVIVIENDA}`;

export const postConsultaTablaConveniosPaginado = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/consulta_tabla_convenios_paginado`,
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
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/consulta_tabla_convenios_especifico`,
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
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/codigo_barras`,
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
export const postConsultaConveniosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/consulta_recaudo_servicios_publicos_privados`,
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
// export const postRecaudoConveniosDavivienda = async (bodyObj) => {
//   if (!bodyObj) {
//     return "Sin datos body";
//   }
//   try {
//     const res = await fetchData(
//       `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/prueba`,
//       "POST",
//       {},
//       bodyObj,
//       {},
//       true,
//       80000
//     );
//     if (!res?.status) {
//       console.error(res?.msg ?? res?.message ?? "");
//     }
//     return res;
//   } catch (err) {
//     console.log("error api gateway");
//     throw err;
//   }
// };

export const postCheckReintentoRecaudoConveniosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/check_reintento_recaudo_servicios_publicos_privados`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      80000
    );
    if (!res?.status) {
      console.error(res?.msg ?? res?.message ?? "");
    }
    return res;
  } catch (err) {
    console.log("error api gateway");
    throw err;
  }
};

export const postRecaudoConveniosDavivienda = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}davivienda_recaudo_servicios_publicos_privados/recaudo_servicios_publicos_privados`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      80000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
