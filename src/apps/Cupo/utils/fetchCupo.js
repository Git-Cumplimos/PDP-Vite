import fetchData from "../../../utils/fetchData";

const urlCupo = `${process.env.REACT_APP_URL_SERVICIOS_CUPO_COMERCIO}`;

export const getConsultaCupoComercio = async (pk_id_comercio, page, limit) => {
  console.log(urlCupo);
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
      `${urlCupo}/cupo/sindocumento`,
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
      `${urlCupo}/cupo/sindocumento`,
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
      `${urlCupo}/dtlcupo/sinpdf`,
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

export const getConsultaAsignacionCupoLimite = async (
  fk_id_comercio,
  page,
  limit
) => {
  const busqueda = { limit };
  if (fk_id_comercio) {
    busqueda.fk_id_comercio = fk_id_comercio;
  }
  if (page) {
    busqueda.page = page;
  }
  try {
    const res = await fetchData(
      `${urlCupo}/modcupo`,
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
      `${urlCupo}/cupo/sindocumento`,
      "PUT",
      argsObj,
      bodyObj
    );
    console.log(res?.obj);
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const PeticionDescargar = async (parametro) => {
  try {
    const response = await fetch(`${urlCupo}/cupo/documento${parametro}`);
    const contentType = response.headers.get("content-type");
    const nombreDocumento = response.headers
      .get("Content-Disposition")
      .slice(22, -1);
    if (
      contentType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const byts = await response.blob();
      // const blob = new Blob([byts], {
      //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // });
      const downloadUrl = URL.createObjectURL(byts);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${nombreDocumento}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (contentType === "application/json") {
      const json = await response.json();
      if (!json?.status) {
        console.error(json?.msg);
      }
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
    const response = await fetch(
      `${urlCupo}/dtlcupo/fpdf?fk_id_comercio=${parametro}${busqueda}`
    );
    const contentType = response.headers.get("content-type");
    const nombreDocumento = response.headers
      .get("Content-Disposition")
      .slice(22, -1);
    if (contentType === "application/pdf") {
      const byts = await response.blob();
      const downloadUrl = URL.createObjectURL(byts);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${nombreDocumento}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (contentType === "application/json") {
      const json = await response.json();
      if (!json?.status) {
        console.error(json?.msg);
      }
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
  console.log(urlCupo);
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
      `${urlCupo}/movimientos`,
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
    const res = await fetchData(`${urlCupo}/movimientos`, "POST", {}, bodyObj);
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};
