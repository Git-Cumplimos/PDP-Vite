import { useCallback, useState } from "react";
import Button from "../../../../../components/Base/Button";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import Modal from "../../../../../components/Base/Modal";
import {
  CalendarMonth,
  CalendarDate,
} from "../../../../../components/Base/Calendar/Calendar";
import Select from "../../../../../components/Base/Select";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Table from "../../../../../components/Base/Table";

const HistoricoPines = () => {
  const [showModalReagendar, setShowModalReagendar] = useState(false);
  const [showModalDevolucion, setShowModalDevolucion] = useState(false);

  const [date, setDate] = useState(new Date());

  const changeDate = (date) => {
    console.log(date);
    setDate(date);
  };

  const [hours, setHours] = useState([
    { hour: "06:00-07:00" },
    { hour: "07:00-08:00" },
    { hour: "08:00-09:00" },
    { hour: "09:00-10:00" },
    { hour: "10:00-11:00" },
    { hour: "11:00-12:00" },
    { hour: "12:00-13:00" },
    { hour: "13:00-14:00" },
    { hour: "14:00-15:00" },
    { hour: "15:00-16:00" },
    { hour: "16:00-17:00" },
    { hour: "17:00-18:00" },
    { hour: "18:00-19:00" },
    { hour: "19:00-20:00" },
  ]);

  const [selectedHour, setSelectedHour] = useState("");

  const selectHour = useCallback((hour) => {
    setSelectedHour(hour);
  }, []);

  const handleOpenReagendar = useCallback((e, i) => {
    setShowModalReagendar(true);
    console.log("Reagendar", i);
  }, []);

  const handleOpenDevolverPin = useCallback((e, i) => {
    setShowModalDevolucion(true);
    console.log("Devolver PIN", i);
  }, []);

  return (
    <>
      <TableEnterprise
        title="Vista de reportes"
        headers={[
          "ID",
          "Lugar Originación",
          "PIN",
          "Estado PIN",
          "Fecha",
          "Hora",
          "Estado Agenda",
          "Tipo Trámite",
          "Trámite",
          "Nombre Cliente",
          "Celular",
          "Correo electrónico",
          "Acciones",
        ]}
        data={[
          {
            ID: "1",
            "Lugar Originación": "Lugar Originación",
            PIN: "PIN",
            "Estado PIN": "Estado PIN",
            Fecha: "Fecha",
            Hora: "Hora",
            "Estado Agenda": "Estado Agenda",
            "Tipo Trámite": "Tipo Trámite",
            Trámite: "Trámite",
            "Nombre Cliente": "Nombre Cliente",
            Celular: "Celular",
            "Correo electrónico": "Correo electrónico",
            Acciones: (
              <div className="flex flex-row">
                <Button
                  title="Reagendar"
                  onClick={() => {
                    handleOpenReagendar();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-pencil"
                    viewBox="0 0 16 16"
                  >
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                  </svg>
                </Button>
                <Button
                  title="Devolver PIN"
                  onClick={() => {
                    handleOpenDevolverPin();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-reply"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM7.8 10.386q.103 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z" />
                  </svg>
                </Button>
              </div>
            ),
          },
        ]}
      >
        {/* Select para Lugar originación */}
        <Select
          label="Lugar Originación"
          options={[
            {
              label: "Option 1",
              value: "1",
            },
            {
              label: "Option 2",
              value: "2",
            },
            {
              label: "Option 3",
              value: "3",
            },
          ]}
        />
        {/* Select para Estado PIN */}
        <Select
          label="Estado PIN"
          options={[
            { label: "Option 1", value: "1" },
            { label: "Option 2", value: "2" },
            { label: "Option 3", value: "3" },
          ]}
        />
        {/* Input para fecha */}
        <Input label="Fecha" type="date" />
      </TableEnterprise>
      {/* REAGENDAR */}
      <Modal show={showModalReagendar}>
        <h2 className="text-center">
          ¿Qué re-agenda le queda bien al cliente?
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
                  selectedHour === hour.hour
                    ? "bg-primary text-white"
                    : "bg-secondary-light"
                }`}
                onClick={() => {
                  selectHour(hour.hour);
                }}
              >
                {hour.hour}
              </button>
            ))}
          </div>
          <Button
            design="secondary"
            type="button"
            onClick={() => {
              setSelectedHour("");
              setShowModalReagendar(false);
            }}
          >
            Volver
          </Button>
          <Button
            design="primary"
            type="button"
            onClick={() => {
              setSelectedHour("");
              setShowModalReagendar(false);
            }}
          >
            Re-agendar
          </Button>
        </div>
      </Modal>
      {/* DEVOLUCIÓN PIN */}
      <Modal show={showModalDevolucion} bigger>
        <h2 className="text-center">Devolución del PIN</h2>
        <Table
          headers={[
            "Número de PIN",
            "Lugar de Originación",
            "Fecha de solicitud de la devolución",
            "Observación",
            "Nombre de quien solicita",
            "Certificado de cuenta",
            "Acción",
          ]}
          data={[
            {
              "Número de PIN": "Número de PIN",
              "Lugar de Originación": "Lugar de Originación",
              "Fecha de solicitud de la devolución":
                "Fecha de solicitud de la devolución",
              Observación: "Observación",
              "Nombre de quien solicita": "Nombre de quien solicita",
              "Certificado de cuenta": "Certificado de cuenta",
              Acción: (
                <Button
                  design="primary"
                  onClick={() => {
                    setShowModalDevolucion(false);
                  }}
                  title="Devolver PIN"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-reply"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM7.8 10.386q.103 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z" />
                  </svg>
                </Button>
              ),
            },
          ]}
        ></Table>
        <ButtonBar>
          <Button
            design="secondary"
            type="button"
            onClick={() => {
              setSelectedHour("");
              setShowModalDevolucion(false);
            }}
          >
            Volver
          </Button>
          <Button
            design="primary"
            type="button"
            onClick={() => {
              setSelectedHour("");
              setShowModalDevolucion(false);
            }}
          >
            Devolver PIN
          </Button>
        </ButtonBar>
      </Modal>
    </>
  );
};

export default HistoricoPines;
