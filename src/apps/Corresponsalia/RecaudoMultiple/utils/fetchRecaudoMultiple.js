import fetchData from "../../../../utils/fetchData";

const urlRecaudoMultiple = `${process.env.REACT_APP_RECAUDO_MULTIPLE}`;

export const postConsultaRecaudoMultiple = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlRecaudoMultiple}/lectura-archivo-recaudo-multiple`,
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
