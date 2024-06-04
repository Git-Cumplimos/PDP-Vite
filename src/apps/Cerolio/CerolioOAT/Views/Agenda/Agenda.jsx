import { useCallback, useEffect, useState } from "react";
import Input from "../../../../../components/Base/Input";
import Button from "../../../../../components/Base/Button";
import {
  base_agenda,
  fetchGetDisponibilidadByIdComercio,
  fetchPostCrearHorario,
} from "../../../utils/agenda";
import { notify, notifyError } from "../../../../../utils/notify";
import { useAuth } from "../../../../../hooks/AuthHooks";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Modal from "../../../../../components/Base/Modal";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const Agenda = () => {
  const { roleInfo } = useAuth();

  const [scheduleData, setScheduleData] = useState(base_agenda);
  const [showModalResults, setShowModalResults] = useState(false);
  const [results, setResults] = useState({});
  const [inoperanceDates, setInoperanceDates] = useState([]);

  const getSchedule = useCallback(async () => {
    const res = await fetchGetDisponibilidadByIdComercio(
      // Fecha en formato YYYY-MM-DD dentro de 5 días
      new Date(Date.now()).toISOString().split("T")[0],
      roleInfo.id_comercio
    );
    // console.log(res);
    setScheduleData({
      date: "",
      hours: [
        {
          day: "Lunes",
          startTime: res.horario_atencion.lunes.Apertura,
          endTime: res.horario_atencion.lunes.Cierre,
        },
        {
          day: "Martes",
          startTime: res.horario_atencion.martes.Apertura,
          endTime: res.horario_atencion.martes.Cierre,
        },
        {
          day: "Miércoles",
          startTime: res.horario_atencion.miercoles.Apertura,
          endTime: res.horario_atencion.miercoles.Cierre,
        },
        {
          day: "Jueves",
          startTime: res.horario_atencion.jueves.Apertura,
          endTime: res.horario_atencion.jueves.Cierre,
        },
        {
          day: "Viernes",
          startTime: res.horario_atencion.viernes.Apertura,
          endTime: res.horario_atencion.viernes.Cierre,
        },
        {
          day: "Sábado",
          startTime: res.horario_atencion.sabado.Apertura,
          endTime: res.horario_atencion.sabado.Cierre,
        },
        {
          day: "Domingo",
          startTime: res.horario_atencion.domingo.Apertura,
          endTime: res.horario_atencion.domingo.Cierre,
        },
        {
          day: "Festivos",
          startTime: res.horario_atencion_festivos.Apertura,
          endTime: res.horario_atencion_festivos.Cierre,
        },
      ],
      attendance: res.numero_ventanillas,
    });
    setInoperanceDates(res.fecha_inoperancia.map((date) => new Date(date)));
  }, [roleInfo]);

  useEffect(() => {
    getSchedule();
  }, [roleInfo, getSchedule]);
  // const handleDateChange = useCallback(
  //   (date) => {
  //     console.log("inoperanceDates", inoperanceDates);
  //     const isDuplicate = inoperanceDates?.some(
  //       (inoperanceDate) => inoperanceDate.getTime() === date.getTime()
  //     );
  //     if (!isDuplicate) {
  //       setInoperanceDates([...inoperanceDates, date]);
  //     } else {
  //       notifyError("La fecha ya ha sido seleccionada.");
  //     }
  //   },
  //   [inoperanceDates]
  // );
  const handleDateChange = useCallback(
    (date) => {
      const isDuplicate = inoperanceDates?.some(
        (inoperanceDate) =>
          inoperanceDate.getFullYear() === date.getFullYear() &&
          inoperanceDate.getMonth() === date.getMonth() &&
          inoperanceDate.getDate() === date.getDate()
      );
      if (!isDuplicate) {
        setInoperanceDates([...inoperanceDates, date]);
      } else {
        notifyError("La fecha ya ha sido seleccionada.");
      }
    },
    [inoperanceDates]
  );
  const updateHours = async () => {
    // console.log(scheduleData);
    const body = {
      fecha_vigencia:
        new Date(Date.now()).toISOString().split("T")[0] + " 00:00:00",
      duracion_tiempo_cita: 60,
      fecha_inoperancia: inoperanceDates.map(
        (date) => date.toISOString().split("T")[0]
      ),
      horario_atencion: {
        lunes: {
          Apertura: scheduleData.hours[0].startTime,
          Cierre: scheduleData.hours[0].endTime,
        },
        martes: {
          Apertura: scheduleData.hours[1].startTime,
          Cierre: scheduleData.hours[1].endTime,
        },
        miercoles: {
          Apertura: scheduleData.hours[2].startTime,
          Cierre: scheduleData.hours[2].endTime,
        },
        jueves: {
          Apertura: scheduleData.hours[3].startTime,
          Cierre: scheduleData.hours[3].endTime,
        },
        viernes: {
          Apertura: scheduleData.hours[4].startTime,
          Cierre: scheduleData.hours[4].endTime,
        },
        sabado: {
          Apertura: scheduleData.hours[5].startTime,
          Cierre: scheduleData.hours[5].endTime,
        },
        domingo: {
          Apertura: scheduleData.hours[6].startTime,
          Cierre: scheduleData.hours[6].endTime,
        },
      },
      horario_atencion_festivos: {
        Apertura: scheduleData.hours[7].startTime,
        Cierre: scheduleData.hours[7].endTime,
      },
      fk_id_comercio: roleInfo.id_comercio,
      numero_ventanillas: scheduleData.attendance,
    };
    // console.log(body);
    const res = await fetchPostCrearHorario(body);
    // console.log(res);
    if (!res.status) {
      notifyError(res.msg);
    } else {
      notify(res.msg);
      setResults(res.obj.resp_cancelaciones.obj);
      setShowModalResults(true);
      // setScheduleData(base_agenda);
      getSchedule();
    }
  };

  const addInoperanceDate = () => {
    setInoperanceDates([...inoperanceDates, ""]);
  };

  // const handleDateChange = (date) => {
  //   const isDuplicate = inoperanceDates?.some(
  //     (inoperanceDate) => inoperanceDate.getTime() === date.getTime()
  //   );
  //   if (!isDuplicate) {
  //     setInoperanceDates([...inoperanceDates, date]);
  //   } else {
  //     notifyError("La fecha ya ha sido seleccionada.");
  //   }
  // };

  return (
    <>
      <div className="flex flex-col w-full my-2">
        {/* <CalendarDate value={scheduleData.date} onChange={changeDate}>
        <CalendarMonth />
      </CalendarDate> */}
        <div className="grid grid-cols-2 gap-x-5">
          {scheduleData.hours.map((hour, index) => (
            <div
              key={index}
              className="p-2 mb-5 border rounded-xl border-primary-extra-light"
            >
              <h3 className="font-semibold text-center">{hour.day}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">Hora de Apertura</div>
                <div className="text-center">Hora de Cierre</div>
                <Input
                  type="time"
                  value={hour.startTime}
                  onChange={(e) => {
                    const newHours = [...scheduleData.hours];
                    newHours[index].startTime = e.target.value;
                    setScheduleData({
                      ...scheduleData,
                      hours: newHours,
                    });
                  }}
                />
                <Input
                  type="time"
                  value={hour.endTime}
                  onChange={(e) => {
                    const newHours = [...scheduleData.hours];
                    newHours[index].endTime = e.target.value;
                    setScheduleData({
                      ...scheduleData,
                      hours: newHours,
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="">
          <Input
            label="¿Cuántas personas puedes atender por hora?"
            type="tel"
            placeholder="Número de personas"
            value={scheduleData.attendance}
            maxLength={2}
            onChange={(e) =>
              setScheduleData({
                ...scheduleData,
                attendance: e.target.value,
              })
            }
          />
        </div>
        <br></br>
        <div className="p-2 mb-5 border rounded-xl border-primary-extra-light">
          <h3 className="font-semibold text-center">
            Agregar Fechas Inoperancia
          </h3>
          <br />
          {/* <Button design="secondary" type="button" onClick={addInoperanceDate}>
            Agregar Inoperancia
          </Button> */}
          <div className="grid grid-cols-2 gap-x-4">
            {/* <div className="flex flex-row gap-x-5"> */}
            <div className="flex justify-center w-auto">
              <DatePicker
                // showTimeSelect

                selected={scheduleData?.inoperancia & null}
                // onChange={(date) => setInoperanceDates([...inoperanceDates, date])}
                onChange={handleDateChange}
                startDate={inoperanceDates[0]}
                // endDate={inoperanceDates[inoperanceDates.length - 1]}
                inline
                locale="es-CO"
                // multiple
              />
            </div>
            <div className="grid grid-cols-4 gap-x-5">
              {inoperanceDates.map((date, index) => (
                <div
                  className="flex flex-col items-center justify-center p-2 border rounded-xl border-primary-extra-light max-h-16"
                  key={index}
                >
                  {date && date.toLocaleDateString()}

                  <button
                    onClick={() =>
                      setInoperanceDates(
                        inoperanceDates.filter((_, i) => i !== index)
                      )
                    }
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ButtonBar>
          <Button
            design="secondary"
            type="button"
            onClick={() => {
              setScheduleData(base_agenda);
            }}
          >
            Limpiar todo
          </Button>
          <Button design="primary" type="button" onClick={updateHours}>
            Guardar
          </Button>
        </ButtonBar>
      </div>
      <Modal
        show={showModalResults}
        handleClose={() => {
          setShowModalResults(false);
        }}
      >
        <h2 className="">Resultados</h2>
        <Input
          label="Citas canceladas"
          type="number"
          value={results?.cantidad_citas_canceladas}
          disabled
        />
        {results?.lista_citas_canceladas &&
          results?.lista_citas_canceladas.length > 0 &&
          results?.lista_citas_canceladas?.map((cita) => (
            <p key={cita}>{cita}</p>
          ))}
      </Modal>
    </>
  );
};

export default Agenda;
