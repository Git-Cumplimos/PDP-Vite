import fetchData from "../../../utils/fetchData";

const urlComissions = process.env.REACT_APP_URL_REVAL_COMISIONES;

export const postComission = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  console.log(bodyObj);
  try {
    const res = await fetchData(
      `${urlComissions}/comisiones_pagadas`,
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
}

export const fetchComissions = async (argsObj) => {
  if (!argsObj) {
    return {
      maxPages: 0,
      results: {
        type: "",
        ranges: {},
      },
    };
  }
  try {
    const res = await fetchData(
      `${urlComissions}/${
        Object.keys(argsObj).includes("autorizador_id_autorizador")
          ? "comisiones_cobradas"
          : "comisiones_pagadas"
      }`,
      "GET",
      argsObj
    );
    if (res?.status) {
      return {
        maxPages: res?.obj?.maxPages,
        results: {
          type: res?.obj?.results[0]?.type,
          ranges: res?.obj?.results?.[0]?.range?.map(
            ({ Fija, Maximo, Minimo, Porcentaje }) => {
              return {
                "Rango minimo": Minimo,
                "Rango maximo": Maximo === -1 ? "" : Maximo,
                "Comision porcentual": parseFloat(Porcentaje * 100),
                "Comision fija": parseFloat(Fija),
              };
            }
          ),
        },
        info: res?.obj?.results[1]?.info,
      };
    } else {
      console.error(res?.msg);
      return {
        maxPages: 0,
        results: {
          type: "",
          ranges: {},
        },
        info: "",
      };
    }
  } catch (err) {
    throw err;
  }
};

export const putComissions = async (argsObj, bodyObj) => {
  if (!argsObj || !bodyObj) {
    return "Sin datos de url ni body";
  }
  bodyObj = {
    [`${
      Object.keys(argsObj).includes("autorizador_id_autorizador")
        ? "comision_cobrada"
        : "comision_pagada"
    }`]: bodyObj,
  };
  console.log(bodyObj);
  try {
    const res = await fetchData(
      `${urlComissions}/${
        Object.keys(argsObj).includes("autorizador_id_autorizador")
          ? "comisiones_cobradas"
          : "comisiones_pagadas"
      }`,
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
