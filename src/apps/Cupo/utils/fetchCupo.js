import fetchData from "../../../utils/fetchData";
import { Auth } from "@aws-amplify/auth";
import { notify, notifyError } from "../../../utils/notify";

const urlCupo = `${process.env.REACT_APP_URL_SERVICIOS_CUPO_COMERCIO}`;
// const urlCupo = `http://127.0.0.1:5080`;

export const getConsultaCupoComercio = async (pk_id_comercio, page, limit) => {
  const busqueda = {};
  if (pk_id_comercio) {
    busqueda.pk_id_comercio = pk_id_comercio;
  }
  if (page) {
    busqueda.page = page;
  }
  if (limit) {
    busqueda.limit = limit;
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/cupo-paginated`,
      "GET",
      busqueda,
      {},
      false
    );
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const postCupoComercio = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/gestion-cupo`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};


export const postDtlCambioLimiteCanje = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/modificacion-cupo`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const getConsultaAsignacionCupoLimite = async (
  fk_id_comercio,
  page,
  limit
) => {
  const busqueda = { limit };
  busqueda.sortBy = "fecha_afectacion";
  busqueda.sortDir = "DESC";
  if (fk_id_comercio) {
    busqueda.fk_id_comercio = fk_id_comercio;
  }
  if (page) {
    busqueda.page = page;
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/modificacion-cupo`,
      "GET",
      busqueda,
      {},
      false
    );
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const putAjusteCupo = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos url ni body");
    });
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/gestion-cupo`,
      "PUT",
      argsObj,
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
 
export const PeticionDescargar = async (parametro = "") => {
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/reporte-cupo${parametro}`,
    );
    if (!res?.status) {
      notifyError(res?.msg);
      return res;
    } else {
      notify(res?.msg);
      window.open(res?.obj?.url, "_self")
    }

  } catch (error) {
    console.log("Error con fetch - no conecta al servicio");
  }
};

export const PeticionDescargarPdf = async (
  parametro,
  date_end,
  date_ini,
  fk_tipo_de_movimiento,
  tipo_afectacion
) => {
  let busqueda = "";
  if (date_end && date_ini) {
    busqueda += `&date_end=${date_end}&date_ini=${date_ini}`;
  }
  if (fk_tipo_de_movimiento) {
    busqueda += `&fk_tipo_de_movimiento=${fk_tipo_de_movimiento}`;
  }
  if (tipo_afectacion) {
    busqueda += `&tipo_afectacion=${tipo_afectacion}`;
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/dtlcupo/fpdf?fk_id_comercio=${parametro}${busqueda}`,
    );
    if (!res?.status) {
      notifyError(res?.msg);
      return res;
    } else {
      notify(res?.msg);
      window.open(res?.obj?.url, "_self")
    }

  } catch (error) {
    console.log("Error con fetch - no conecta al servicio");
  }
};

export const getTipoMovimientosCupo = async (
  pk_id_tipo_movimiento,
  page,
  limit,
  nombre
) => {
  const busqueda = {};
  if (pk_id_tipo_movimiento) {
    busqueda.pk_id_tipo_movimiento = pk_id_tipo_movimiento;
  }
  if (page) {
    busqueda.page = page;
  }
  if (limit) {
    busqueda.limit = limit;
  }
  if (nombre) {
    busqueda.nombre = nombre;
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/movimientos-cupo`,
      "GET",
      busqueda,
      {},
      false
    );
    if (res?.status) {
      return { ...res?.obj };
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const postTipoMovimientosCupo = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlCupo}/servicio-cupo/movimientos-cupo`,
      "POST",
      {},
      bodyObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
