import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const base_agenda = {
  date: "",
  hours: [
    { day: "Lunes", startTime: "06:00", endTime: "20:00" },
    { day: "Martes", startTime: "06:00", endTime: "20:00" },
    { day: "Miércoles", startTime: "06:00", endTime: "20:00" },
    { day: "Jueves", startTime: "06:00", endTime: "20:00" },
    { day: "Viernes", startTime: "06:00", endTime: "20:00" },
    { day: "Sábado", startTime: "06:00", endTime: "20:00" },
    { day: "Domingo", startTime: "06:00", endTime: "20:00" },
    { day: "Festivo", startTime: "06:00", endTime: "20:00" },
  ],
  attendance: 0,
  inoperancia: [],
};

export const fetchGetDisponibilidadByIdComercio = async (
  fecha = "",
  comercio = ""
) => {
  try {
    let params = {
      fecha_vigencia: fecha,
      fk_id_comercio: comercio,
    };

    // Limpiar los parámetros vacíos
    params = Object.keys(params).reduce((acc, key) => {
      if (params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    const url = `${urlCerolio}/citas/get_parametrizacion_horarios`;

    const res = await fetchData(url, "GET", params);
    if (res.status) {
      return res.obj[0];
    } else {
      console.error(res?.msg);
      return { maxPages: 0, results: [] };
    }
  } catch (err) {
    throw err;
  }
};

export const fetchGetHorariosByIdComercio = async (fecha, comercio) => {
  try {
    const res = await fetchData(
      `${urlCerolio}/citas/get-horarios?fecha_consulta_disponibilidad=${fecha} 01:00:00&comercio=${comercio}`,
      "GET",
      {}
    );
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

export const fetchPostCrearHorario = async (body) => {
  try {
    const res = await fetchData(
      `${urlCerolio}/citas/parametrizar_horarios`,
      "POST",
      {},
      body
    );
    console.log(res);
    if (res.status) {
      return res;
    } else {
      console.error(res?.msg);
      return res;
    }
  } catch (err) {
    throw err;
  }
};
