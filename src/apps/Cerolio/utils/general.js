import fetchData from "../../../utils/fetchData";
const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const addHoursAndFormat = (time1, time2) => {
  // Crear objetos Date a partir de las cadenas de tiempo
  const date1 = new Date(time1);
  const date2 = new Date(time2);

  // Sumar 5 horas a cada hora
  date1.setHours(date1.getHours() + 5);
  date2.setHours(date2.getHours() + 5);

  // Formatear las horas en el formato "hh:mm"
  const formattedTime1 = `${date1
    .getHours()
    .toString()
    .padStart(2, "0")}:${date1.getMinutes().toString().padStart(2, "0")}`;
  const formattedTime2 = `${date2
    .getHours()
    .toString()
    .padStart(2, "0")}:${date2.getMinutes().toString().padStart(2, "0")}`;

  // Combinar las horas formateadas en un solo string con el formato "hh:mm-hh:mm"
  const combinedTime = `${formattedTime1}-${formattedTime2}`;

  return combinedTime;
};

export const formatDate = (dateString) => {
  // Crear un objeto Date a partir del string
  const date = new Date(dateString);

  // Extraer los componentes de la fecha
  const day = date.getDate();
  const month = date.getMonth() + 1; // Los meses en JavaScript van de 0 a 11, por lo que se suma 1
  const year = date.getFullYear();

  // Formatear la fecha en el formato dd/mm/aaaa
  const formattedDate = `${day.toString().padStart(2, "0")}/${month
    .toString()
    .padStart(2, "0")}/${year}`;

  return formattedDate;
};

export const fetchGetUploadToS3 = async (filename, contentType) => {
  try {
    if (!filename) {
      throw new Error("No se ha especificado un nombre de archivo");
    }

    let params = {
      filename: filename,
      contentType: contentType,
    };

    const url = `${urlCerolio}/S3/cargar`;

    const res = await fetchData(url, "GET", params);
    if (res) {
      return res;
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
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
