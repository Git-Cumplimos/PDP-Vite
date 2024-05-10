import fetchData from "../../../utils/fetchData";

const urlCerolio = process.env.REACT_APP_URL_CEROLIO;

export const base_agenda = {
  date: "",
  hours: [
    { day: "Lunes", startTime: "08:00", endTime: "19:00" },
    { day: "Martes", startTime: "08:00", endTime: "19:00" },
    { day: "Miércoles", startTime: "08:00", endTime: "19:00" },
    { day: "Jueves", startTime: "08:00", endTime: "19:00" },
    { day: "Viernes", startTime: "08:00", endTime: "19:00" },
    { day: "Sábado", startTime: "08:00", endTime: "19:00" },
    { day: "Domingo", startTime: "08:00", endTime: "19:00" },
    { day: "Festivo", startTime: "08:00", endTime: "19:00" },
  ],
  attendance: 0,
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
