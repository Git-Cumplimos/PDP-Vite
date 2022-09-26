import fetchData from "../../../../utils/fetchData";

const urlGrupoAval = `${process.env.REACT_APP_URL_CORRESPONSALIA_AVAL}`;
const urlParametrizacion = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}`;

export const consultaCostoGrupoAval = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlGrupoAval}/grupo_aval_cb_deposito_retiro/consultaCostoCB`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const depositoCorresponsalGrupoAval = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlGrupoAval}/grupo_aval_cb_deposito_retiro/depositoCorresponsal`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const retiroCorresponsalGrupoAval = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlGrupoAval}/grupo_aval_cb_deposito_retiro/retiroCorresponsal`,
      "POST",
      {},
      bodyObj,
      {},
      {},
      40000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const consultarMensajePublicitarioDavivienda = async () => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}//mensajes_publicitarios/consultar`,
      "POST",
      {},
      {
        nombreMensaje: "Mensaje Davivienda CB",
        autorizador: "Davivienda CB",
      },
      {},
      true
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res.obj;
  } catch (err) {
    throw err;
  }
};
