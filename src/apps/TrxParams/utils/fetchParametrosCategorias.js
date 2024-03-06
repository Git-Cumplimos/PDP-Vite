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

export const postCreateSubCategoria = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/createSubCat`,
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

export const putEditSubCategoria = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/updateSubCat`,
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

export const fetchCreatePresignedUrl = async (obj) => {
  try {
    const res = await fetchData(
      `${urlParametrizacion}/categorias/getPresignedUrlImages`,
      "POST",
      {},
      obj
    );
    if (res?.status) {
      return res
    } else {
      console.error(res);
      return [];
    }
  } catch (err) {
    throw err;
  }
};

export const uploadFilePresignedUrl = async (obj, file) => {
  const formData = new FormData();
  Object.entries(obj?.fields).map(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);
  try {
    const res = await fetch(obj?.url, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      return res;
    } else {
      console.error(res);
      return [];
    }
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


// const [selectedFile, setSelectedFile] = useState(null);

// const handleFileChange = (event) => {
//   setSelectedFile(event.target.files[0]);
// };

// const handleSubmit = async (event) => {
//   event.preventDefault();

//   if (!selectedFile) {
//     console.log("Selecciona un archivo primero.");
//     return;
//   }

//   const img_name = selectedFile.name;
//   const img_type = selectedFile.type;

//   const formDataS3 = new FormData();
//   formDataS3.append("img_name", img_name);
//   formDataS3.append("img_type", img_type);

//   try {
//     // Obtener la URL prefirmada y los campos del formulario de carga
//     const data = await fetchCreatePresignedUrl(formDataS3);

//     console.log("PREFIRMADA", data);

//     const response = await uploadFilePresignedUrl(data?.obj, selectedFile);

//     if (response.ok) {
//       console.log("Archivo cargado exitosamente.", response);
//     } else {
//       console.error("Error al cargar el archivo:", response.statusText);
//     }
//   } catch (error) {
//     console.error("Error al procesar la solicitud:", error);
//   }
// };