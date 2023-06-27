import fetchData from "../../../utils/fetchData"

const urlPowwi = `${process.env.REACT_APP_URL_CORRESPONSALIA_POWWI}`;

export const consultaCosto = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlPowwi}/consultaCostoPowwi`,
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

// export const depositoCorresponsal = async (bodyObj) => {
//   if (!bodyObj) {
//     return "Sin datos body";
//   }
//   try {
//     const res = await fetchData(
//       `${urlPowwi}movii-pdp/cash-out`,
//       "POST",
//       {},
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

export const retiroCorresponsal = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlPowwi}/retiroCorresponsalPowwi`,
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

