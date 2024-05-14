import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../../../components/Base/Button";
import Input from "../../../../../../components/Base/Input";
import TableEnterprise from "../../../../../../components/Base/TableEnterprise";
import Modal from "../../../../../../components/Base/Modal";
import {
  CalendarMonth,
  CalendarDate,
} from "../../../../../../components/Base/Calendar/Calendar";
import Select from "../../../../../../components/Base/Select";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Table from "../../../../../../components/Base/Table";
import { makeMoneyFormatter } from "../../../../../../utils/functions";
import { fetchGetPinData, fetchPutReagendar } from "../../../../utils/pin";
import { notify, notifyError } from "../../../../../../utils/notify";
import FileInput from "../../../../../../components/Base/FileInput";
import TextArea from "../../../../../../components/Base/TextArea";
import {
  fetchGetUploadToS3,
  uploadFilePresignedUrl,
} from "../../../../utils/general";

const HistoricoPines = () => {
  const [showModalReagendar, setShowModalReagendar] = useState(false);
  const [showModalDevolucion, setShowModalDevolucion] = useState(false);

  const [selectedItem, setSelectedItem] = useState({});
  const [date, setDate] = useState("");

  const changeDate = (date) => {
    setDate(date.target.value);
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

  const handleOpenReagendar = useCallback((e, item) => {
    setShowModalReagendar(true);
    console.log("Reagendar", item);
    setSelectedItem(item);
  }, []);

  const handleOpenDevolverPin = useCallback((e, item) => {
    setShowModalDevolucion(true);
    console.log("Devolver PIN", item);
    setSelectedItem(item);
  }, []);

  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [filters, setFilters] = useState({
    // Fecha inicial es una semana antes de hoy en formato YYYY-MM-DD
    fechaInicial: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    // Fecha final es hoy en formato YYYY-MM-DD
    fechaFinal: new Date().toISOString().split("T")[0],
    estado: "",
  });

  const [data, setData] = useState([
    {
      ID: "",
      PIN: "",
      "Estado PIN": "",
      Fecha: "",
      Hora: "",
      "Estado Agenda": "",
      "Tipo Trámite": "",
      Trámite: "",
      "Nombre Cliente": "",
      Celular: "",
      "Correo electrónico": "",
      Acciones: "",
    },
  ]);

  const [devolucionData, setDevolucionData] = useState({});

  const formatMoney = makeMoneyFormatter(2);

  const getFiltersData = useCallback(async () => {
    const res = await fetchGetPinData(
      "",
      filters.estado
      // TODO HECTOR validando errores de fechas
      // filters.fechaInicial,
      // filters.fechaFinal
    );
    console.log("HISTORICO", res);
    if (res) {
      setData(
        res.results.map((item) => ({
          ID: item.fk_id_cliente,
          PIN: item.numero_pin,
          "Estado PIN": item.estado,
          Fecha: item.fecha_uso
            ? new Date(item.fecha_uso).toLocaleDateString()
            : "Sin uso",
          Hora: item.fecha_uso
            ? new Date(item.fecha_uso).toLocaleTimeString()
            : "Sin uso",
          "Estado Agenda": item.estado_cita,
          "Tipo Trámite": item.tipo_tramite,
          Trámite: item.categoria,
          "Nombre Cliente": item.nombres + " " + item.apellidos,
          Celular: item.telefono,
          "Correo electrónico": item.email,
          Acciones: (
            <div className="flex flex-row">
              <Button
                title="Reagendar"
                onClick={(e) => {
                  handleOpenReagendar(e, item);
                }}
                disabled={item.estado !== "Disponible"}
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
                onClick={(e) => {
                  handleOpenDevolverPin(e, item);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-reply"
                  viewBox="0 0
              16 16"
                >
                  <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM7.8 10.386q.103 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z" />
                </svg>
              </Button>
            </div>
          ),
        }))
      );
      setMaxPages(res.maxPages);
    }
  }, [filters, handleOpenDevolverPin, handleOpenReagendar]);

  useEffect(() => {
    getFiltersData();
  }, [pageData, filters, getFiltersData]);

  const reagendarPin = useCallback(
    async (date, selectedHour) => {
      try {
        // console.log("Reagendar item", selectedItem);
        const [startHour, endHour] = selectedHour.split("-");
        const startDate = date + " " + startHour + ":00";
        const endDate = date + " " + endHour + ":00";

        const body = {
          fk_id_cliente: selectedItem.fk_id_cliente,
          fk_id_comercio: selectedItem.fk_id_comercio_creacion,
          hora_inicio: startDate,
          hora_final: endDate,
        };
        // console.log("body", body);
        const res = await fetchPutReagendar(selectedItem.pk_id_pin, body);
        // console.log(res);
        if (res.status) {
          notify(res.msg);
          setDate("");
          setSelectedHour("");
          setSelectedItem({});
          getFiltersData();
          setShowModalReagendar(false);
        } else {
          console.error(res.msg);
          notifyError(res.msg);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [selectedItem, getFiltersData]
  );

  const devolverPin = useCallback(async () => {
    try {
      console.log("Devolver item", selectedItem);
      console.log("Devolver data", devolucionData);
      const certPresigned = await fetchGetUploadToS3(
        `certificados_bancarios/${selectedItem.fk_id_cliente}`
      );
      console.log("certPresigned", certPresigned);
      if (certPresigned.status) {
        const upload = await uploadFilePresignedUrl(
          certPresigned.obj,
          devolucionData.certificado
        );
        console.log("upload", upload);
        if (upload.ok) {
          // TODO terminar devolucion de pin
          // Paso a paso: Se crea un input de archivo para el certificado de cuenta
          // Se crea un input de texto para la observación
          // Cuando haya un archivo cargado, permitir la devolución del PIN
          // Se carga el archivo con la carpeta certificados_bancarios/y el id del usuario por prefirmada
          // Se hace el put de cancelar pin con la misma carpeta y ahí se valida la cancelación
        } else {
          console.error(upload);
          notifyError(upload.statusText);
        }
      } else {
        console.error(certPresigned.msg);
        notifyError(certPresigned.msg);
      }
    } catch (err) {
      console.error(err);
    }
  }, [devolucionData, selectedItem]);

  return (
    <>
      <TableEnterprise
        title="Vista de reportes"
        headers={[
          "ID",
          // "Lugar Originación",
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
        data={data}
      >
        {/* Input para fecha inicial y fecha final - rango */}
        <Input
          label="Fecha Inicial"
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, fechaInicial: e.target.value })
          }
          value={filters.fechaInicial}
        />
        <Input
          label="Fecha Final"
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, fechaFinal: e.target.value })
          }
          value={filters.fechaFinal}
        />
        {/* Select para Lugar originación */}
        {/* <Select
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
        /> */}
        {/* Select para Estado PIN */}
        <Select
          label="Estado PIN"
          options={[
            { label: "Sin estado", value: "" },
            { label: "Disponible", value: "Disponible" },
            { label: "Usado", value: "Usado" },
            { label: "Cancelado", value: "Cancelado" },
          ]}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
        />
      </TableEnterprise>
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
              setDate("");
              setShowModalReagendar(false);
            }}
          >
            Volver
          </Button>
          <Button
            design="primary"
            type="button"
            onClick={() => {
              reagendarPin(date, selectedHour);
            }}
            disabled={!selectedHour || !date}
          >
            Re-agendar
          </Button>
        </div>
      </Modal>
      <Modal show={showModalDevolucion} bigger>
        <h2 className="text-center">Devolución del PIN</h2>
        <div className="flex flex-col gap-5 overflow-x-auto">
          <Table
            headers={[
              "Número de PIN",
              // "Lugar de Originación",
              "Fecha de solicitud de la devolución",
            ]}
            data={[
              {
                "Número de PIN": selectedItem.numero_pin,
                // "Lugar de Originación": "Lugar de Originación",
                "Fecha de solicitud de la devolución":
                  new Date().toLocaleDateString(),
              },
            ]}
          ></Table>
          <TextArea
            label="Observación"
            placeholder="Observación"
            onChange={(e) =>
              setDevolucionData({
                ...devolucionData,
                observacion: e.target.value,
              })
            }
          />
          <Input
            label="Nombre de quien solicita"
            placeholder="Nombre de quien solicita"
            onChange={(e) =>
              setDevolucionData({
                ...devolucionData,
                nombreSolicita: e.target.value,
              })
            }
          />
          <FileInput
            label="Certificado de cuenta"
            accept=".pdf"
            onGetFile={(file) =>
              setDevolucionData({
                ...devolucionData,
                certificado: file[0],
              })
            }
          />
        </div>
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
            disabled={
              !devolucionData.certificado ||
              !devolucionData.observacion ||
              !devolucionData.nombreSolicita
            }
            onClick={() => {
              devolverPin();
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
