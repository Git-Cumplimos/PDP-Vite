import { CalendarDate, CalendarMonth } from "../../../../components/Base/Calendar/Calendar";

const Agenda = () => {
  return (
    <div>
      <h1>Agenda</h1>
      <CalendarDate
            // value={formTipoTramite.appointmentDate}
            // onChange={changeDate}
          >
            <CalendarMonth />
          </CalendarDate>
    </div>
  );
}

export default Agenda;