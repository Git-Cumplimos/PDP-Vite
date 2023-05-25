import fetchData from "../../../utils/fetchData";

// const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
const urlComercios = `http://localhost:5000`;

export const postConsultaTipoNivelComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/tipo_nivel/consultar`,
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
export const postCrearTipoNivelComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/tipo_nivel/crear`,
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
export const putModificarTipoNivelComercio = async (pkTipoNivel, bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/tipo_nivel/modificar?pk_tipo_nivel=${pkTipoNivel}`,
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
export const postConsultaComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/comercios/consultar`,
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
export const postCrearComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/comercios/crear`,
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
export const putModificarComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/comercios/modificar`,
      "PUT",
      {},
      bodyObj,
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
export const postCambiarComercioGrupoComercio = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComercios}/comercios/modificar-comercio-grupo-comercio`,
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
