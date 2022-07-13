import fetchData from "../../../utils/fetchData";

const urlDaviplata = `${process.env.REACT_APP_URL_COLPATRIA}/trx`;

export const makeDeposit = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("", { cause: "custom" });
  }

  try {    
    const res = await fetchData(`${urlDaviplata}/deposito`, "POST", {}, bodyDep);
    if (!res?.status) {
      throw new Error(res?.msg, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};
