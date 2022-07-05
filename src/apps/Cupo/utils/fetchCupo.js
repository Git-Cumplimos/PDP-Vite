import fetchData from "../../../utils/fetchData";

const urlCupo = `http://127.0.0.1:5000/servicio-cupo`;

export const getConsultaCupoComercio = async (pk_id_comercio, page) => {
  const busqueda = { page };
  if (pk_id_comercio) {
    busqueda.pk_id_comercio = pk_id_comercio;
  }
  try {
    const res = await fetchData(`${urlCupo}/cupo`, "GET", busqueda, {}, false);
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

export const getConsultaDtlMovCupo = async (
  fk_id_comercio,
  page,
  limit,
  date_end,
  date_ini,
  fk_tipo_de_movimiento,
  tipo_afectacion
) => {
  const busqueda = {
    fk_id_comercio,
    page,
    limit,
  };
  if (date_end && date_ini) {
    if (date_end >= date_ini) {
      busqueda.date_end = date_end;
      busqueda.date_ini = date_ini;
    } else {
    }
  }
  if (tipo_afectacion) {
    busqueda.tipo_afectacion = tipo_afectacion;
  }
  if (fk_tipo_de_movimiento) {
    busqueda.fk_tipo_de_movimiento = fk_tipo_de_movimiento;
  }
  try {
    const res = await fetchData(
      `${urlCupo}/dtlcupo`,
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

export const postDtlCambioLimiteCanje = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(`${urlCupo}/modcupo`, "POST", {}, bodyObj);
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
