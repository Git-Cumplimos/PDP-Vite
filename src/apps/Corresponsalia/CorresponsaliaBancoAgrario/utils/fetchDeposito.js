import { fetchDataTotp } from "../../../../utils/MFA";
const url_banco_agrario = `${process.env.REACT_APP_URL_BANCO_AGRARIO}`;

// export ValidationRetiroEfectivo

export const depositoBancoAgrario = async (bodyObj) => {
  if (!bodyObj) {
    return new Promise((resolve, reject) => {
      resolve("Sin datos body");
    });
  }
  try {
    const res = await fetchDataTotp(
      `${url_banco_agrario}/banco-agrario/depositoCorresponsal`,
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