import fetchData from "../../../utils/fetchData";

const urlDaviplata = `${process.env.REACT_APP_URL_REVAL_CONEXION}/daviplata-reval`;

export const postCashIn = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/cash-in`,
      "POST",
      {},
      bodyObj,
      {},
      false
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
}

export const postCashOut = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchData(
      `${urlDaviplata}/cash-out`,
      "POST",
      {},
      bodyObj,
      {},
      false
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
}
