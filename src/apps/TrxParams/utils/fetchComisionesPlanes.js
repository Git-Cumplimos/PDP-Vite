import fetchData from "../../../utils/fetchData";

const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;

const urlComisiones = process.env.REACT_APP_URL_BACK_COMISIONES;

export const postComisionesPlan = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-planes-comisiones/crear-planes-comision`,
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

export const getComisionesPlanes = async () => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-planes-comisiones/consultar-planes-comision`,
      "GET",
      {}
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

export const getComisionesPlanesUnique = async ({ id_plan_comision }) => {
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-planes-comisiones/consultar-planes-comision?pk_planes_comisiones=${id_plan_comision}`,
      "GET",
      {}
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

export const putComisionesPlanes = async (obj) => {
  const { id_plan_comision, ...bodyObj } = obj;
  try {
    const res = await fetchData(
      `${urlComisiones}/servicio-planes-comisiones/actualizar-planes-comision?pk_planes_comisiones=${id_plan_comision}`,
      "PUT",
      {},
      bodyObj
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

// export const fetchConveniosUnique = async (id_convenio, ean13) => {
//   if (!id_convenio && !ean13) {
//     return { maxPages: 0, results: [] };
//   }
//   try {
//     let args = {};
//     if (id_convenio) {
//       args = { id_convenio };
//     }
//     if (ean13) {
//       args = { ean13 };
//     }
//     const res = await fetchData(`${urlConvenios}/convenio_unique`, "GET", args);
//     if (res?.status) {
//       return { ...res?.obj };
//     } else {
//       console.error(res?.msg);
//       return { maxPages: 0, results: [] };
//     }
//   } catch (err) {
//     throw err;
//   }
// };
// export const putComisionesCobrada = async (argsObj, bodyObj) => {
//   if (!argsObj || !bodyObj) {
//     return "Sin datos de url ni body";
//   }
//   try {
//     const res = await fetchData(
//       `${urlComisiones}/comisiones_cobradas/modificar`,
//       "PUT",
//       argsObj,
//       bodyObj
//     );
//     if (!res?.status) {
//       console.error(res?.msg);
//     }
//     return res;
//   } catch (err) {
//     throw err;
//   }
// };
