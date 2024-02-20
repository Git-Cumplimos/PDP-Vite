import fetchData from "../../../utils/fetchData";

const urlParametrizacion =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

export const postCreateCategoria = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/create`,
      "POST",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const putEditCategoria = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/update`,
      "PUT",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const fetchCategorias = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/all`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res.obj;
    } else {
      console.error(res);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchCategoriaById = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/getById`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res?.obj;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const postDeleteCategoria = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/delete`,
      "POST",
      {},
      obj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const fetchCategoriasImgs = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/getAllImages`,
      "POST",
      {},
      obj,
      {},
      false
    );
    if (res?.status) {
      return res;
    } else {
      console.error(res);
      return [];
    }
  } catch (err) {
    throw err;
  }
};