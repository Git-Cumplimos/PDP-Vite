import { useState } from "react";
import Input from "../../../../../components/Base/Input";
import Button from "../../../../../components/Base/Button";
import { base_agenda, fetchPostCrearHorario } from "../../../utils/agenda";
import { notify, notifyError } from "../../../../../utils/notify";
import { useAuth } from "../../../../../hooks/AuthHooks";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Modal from "../../../../../components/Base/Modal";

const Agenda = () => {
  const { roleInfo } = useAuth();

  const [scheduleData, setScheduleData] = useState(base_agenda);
  const [showModalResults, setShowModalResults] = useState(false);
  const [results, setResults] = useState({});

  const updateHours = async () => {
    console.log(scheduleData);
    const body = {
      fecha_vigencia:
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0] + " 00:00:00",
      duracion_tiempo_cita: 120,
      fecha_inoperancia: [],
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
    console.log(body);
    const res = await fetchPostCrearHorario(body);
    console.log(res);
    if (!res.status) {
      notifyError(res.msg);
    } else {
      notify(res.msg);
      setResults(res.obj.resp_cancelaciones.obj);
      setShowModalResults(true);
      setScheduleData(base_agenda);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full my-2">
        {/* <CalendarDate value={scheduleData.date} onChange={changeDate}>
        <CalendarMonth />
      </CalendarDate> */}
        <div className="grid grid-cols-2 gap-x-5">
          {scheduleData.hours.map((hour, index) => (
            <div key={index} className="mb-5">
              <h3 className="text-center">{hour.day}</h3>
              <div className="grid grid-cols-2 gap-2">
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
            type="number"
            placeholder="Número de personas"
            value={scheduleData.attendance}
            onChange={(e) =>
              setScheduleData({
                ...scheduleData,
                attendance: e.target.value,
              })
            }
          />
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
          value={results.cantidad_citas_canceladas}
          disabled
        />
        {results.lista_citas_canceladas.length > 0 &&
          results.lista_citas_canceladas?.map((cita) => (
            <p key={cita}>{cita}</p>
          ))}
      </Modal>
    </>
  );
};

export default Agenda;
