import fetchData from "../../../utils/fetchData";

const urlBackend = `${process.env.REACT_APP_URL_PinesVus}`;
//const urlBackend = `${process.env.REACT_APP_BASE_API}/cert/pinesVus`;


export const Presigned_validar = async (archivo, filename) => {
  try {
    const res = await fetchData(
      `${urlBackend}/CargueS3?filename=${filename}`,
      "GET",
      {},
      {},
      {},
      true
    );
    console.log("RES", res)
    const formData = new FormData();
    const url = res.obj?.url;
    const fields = res.obj?.fields;
    const nombre_archivo = fields?.key;

    for (const property in fields) {
      formData.set(`${property}`, `${fields[property]}`);
    }

    formData.set("file", archivo);
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
    return { nombre_archivo };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
