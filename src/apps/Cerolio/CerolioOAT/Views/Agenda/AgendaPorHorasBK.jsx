import { useState } from "react";
import {
  CalendarDate,
  CalendarMonth,
} from "../../../../../components/Base/Calendar/Calendar";
import Input from "../../../../../components/Base/Input";
import Button from "../../../../../components/Base/Button";
import { fetchGetHorariosByIdComercio } from "../../../utils/agenda";
import { notifyError } from "../../../../../utils/notify";

const Agenda = () => {
  const [date, setDate] = useState(null);

  const changeDate = async (e) => {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    const [year, month, day] = e.target.value.split("-");
    const fechaSeleccionada = new Date(year, month - 1, day);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaActual) {
      notifyError("No puedes seleccionar una fecha anterior a la actual");
      setDate(null);
      return;
    }

    const fechaSeleccionadaFormatted = fechaSeleccionada
      .toISOString()
      .split("T")[0];
    console.log(fechaSeleccionadaFormatted);

    setDate(fechaSeleccionadaFormatted);
    const horarios = await fetchGetHorariosByIdComercio(
      fechaSeleccionadaFormatted,
      3
    );
    if (horarios.status) {
      console.log("horarios original", horarios.obj?.["horarios disponibles"]);
      // Crear una lista de todas las horas posibles desde las 6 hasta las 20
      const allHours = Array.from({ length: 14 }, (v, i) => ({
        hour: `${(i + 6).toString().padStart(2, "0")}:00-${(i + 7)
          .toString()
          .padStart(2, "0")}:00`,
        available: false,
      }));

      const horariosFormatted = horarios.obj?.["horarios disponibles"].map(
        (hora) => {
          const horaInicio = new Date(hora[0]);
          const horaFin = new Date(hora[1]);

          // Agregar 5 horas a horaInicio y horaFin
          horaInicio.setHours(horaInicio.getHours() + 5);
          horaFin.setHours(horaFin.getHours() + 5);

          return {
            hour: `${horaInicio
              .getHours()
              .toString()
              .padStart(2, "0")}:${horaInicio
              .getMinutes()
              .toString()
              .padStart(2, "0")}-${horaFin
              .getHours()
              .toString()
              .padStart(2, "0")}:${horaFin
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
            available: true,
          };
        }
      );

      const finalHours = allHours.map((allHour) => {
        const foundHour = horariosFormatted.find(
          (formattedHour) => formattedHour.hour === allHour.hour
        );
        return foundHour || allHour;
      });
      console.log("horarios formatted", finalHours);
      setHours(finalHours);
    }
  };

  const [hours, setHours] = useState([
    { hour: "06:00-07:00", available: true },
    { hour: "07:00-08:00", available: true },
    { hour: "08:00-09:00", available: true },
    { hour: "09:00-10:00", available: true },
    { hour: "10:00-11:00", available: true },
    { hour: "11:00-12:00", available: true },
    { hour: "12:00-13:00", available: true },
    { hour: "13:00-14:00", available: true },
    { hour: "14:00-15:00", available: true },
    { hour: "15:00-16:00", available: true },
    { hour: "16:00-17:00", available: true },
    { hour: "17:00-18:00", available: true },
    { hour: "18:00-19:00", available: true },
    { hour: "19:00-20:00", available: true },
  ]);

  const updateHours = async () => {
    const availableHours = hours.filter((hour) => hour.available);
    console.log("available hours", availableHours);
    // Ahora se debe convertir availableHours a un formato que pueda ser enviado al backend
    const formattedHours = availableHours.map((hour) => {
      const [start, end] = hour.hour.split("-");
      return [start, end];
    });
    console.log("formatted hours", formattedHours);
  };

  return (
    <>
      <h2 className="text-center">
        Por favor modifique las horas de acuerdo a su necesidad
      </h2>
      <div className="grid grid-cols-2 gap-5">
        <CalendarDate value={date} onChange={changeDate}>
          <CalendarMonth />
        </CalendarDate>
        <div className="grid items-center grid-cols-3 gap-5">
          {hours.map((hour, index) => (
            <button
              key={hour.hour}
              className={`mr-2 p-2 rounded-xl ${
                hour.available ? "bg-green-500" : "bg-red-500"
              }`}
              onClick={() => {
                const newHours = [...hours];
                newHours[index].available = !newHours[index].available;
                setHours(newHours);
              }}
            >
              {hour.hour}
            </button>
          ))}
        </div>
        <div className="col-span-2">
          <Input
            label="¿Cuántas personas puedes atender por hora?"
            type="number"
            placeholder="Número de personas"
          />
        </div>
        <Button design="secondary" type="button">
          Limpiar todo
        </Button>
        <Button design="primary" type="button" onClick={updateHours}>
          Guardar
        </Button>
      </div>
    </>
  );
};

export default Agenda;
