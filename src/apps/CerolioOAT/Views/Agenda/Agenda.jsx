import { Fragment, useState } from "react";
import {
  CalendarDate,
  CalendarMonth,
} from "../../../../components/Base/Calendar/Calendar";
import Input from "../../../../components/Base/Input";
import Button from "../../../../components/Base/Button";
import { fetchGetHorariosByIdComercio } from "../../utils/agenda";
import { notifyError } from "../../../../utils/notify";
import Table from "../../../../components/Base/Table";
import { useAuth } from "../../../../hooks/AuthHooks";

const Agenda = () => {
  const { roleInfo } = useAuth();
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
      roleInfo.id_comercio
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
    { day: "Lunes", startTime: "08:00", endTime: "19:00" },
    { day: "Martes", startTime: "08:00", endTime: "19:00" },
    { day: "Miércoles", startTime: "08:00", endTime: "19:00" },
    { day: "Jueves", startTime: "08:00", endTime: "19:00" },
    { day: "Viernes", startTime: "08:00", endTime: "19:00" },
    { day: "Sábado", startTime: "08:00", endTime: "19:00" },
    { day: "Domingo", startTime: "08:00", endTime: "19:00" },
    { day: "Festivo", startTime: "08:00", endTime: "19:00" },
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
    <div className="flex flex-col w-full">
      <CalendarDate value={date} onChange={changeDate}>
        <CalendarMonth />
      </CalendarDate>
      <div className="grid grid-cols-4">
        {hours.map((hour, index) => (
          <Fragment key={index}>
            <Input
              label={`¿Desde qué hora atiendes los ${hour.day}?`}
              type="time"
              value={hour.startTime}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[index].startTime = e.target.value;
                setHours(newHours);
              }}
            />
            <Input
              label={`¿Hasta qué hora atiendes los ${hour.day}?`}
              type="time"
              value={hour.endTime}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[index].endTime = e.target.value;
                setHours(newHours);
              }}
            />
          </Fragment>
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
  );
};

export default Agenda;
