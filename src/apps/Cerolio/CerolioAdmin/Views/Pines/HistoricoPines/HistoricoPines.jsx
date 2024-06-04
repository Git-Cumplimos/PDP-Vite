import { useCallback, useEffect, useState } from "react";
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
import {
  fetchGetPinData,
  fetchPutCancelacion,
  fetchPutReagendar,
} from "../../../../utils/pin";
import { notify, notifyError } from "../../../../../../utils/notify";
import FileInput from "../../../../../../components/Base/FileInput";
import TextArea from "../../../../../../components/Base/TextArea";
import {
  fetchGetUploadToS3,
  uploadFilePresignedUrl,
} from "../../../../utils/general";
import { useAuth } from "../../../../../../hooks/AuthHooks";

const HistoricoPines = () => {
  const { roleInfo } = useAuth();
  const [showModalReagendar, setShowModalReagendar] = useState(false);
  const [showModalDevolucion, setShowModalDevolucion] = useState(false);

  const [selectedItem, setSelectedItem] = useState({});
  const [date, setDate] = useState("");

  const changeDate = (date) => {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    const [year, month, day] = date.target.value.split("-");
    const fechaSeleccionada = new Date(year, month - 1, day);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaActual) {
      notifyError("No puedes seleccionar una fecha anterior a hoy");
      setDate("");
      return;
    } else {
      setDate(date.target.value);
    }
  };

  const hours = [
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
  ];

  const [selectedHour, setSelectedHour] = useState("");

  const selectHour = useCallback((hour) => {
    setSelectedHour(hour);
  }, []);

  const handleOpenReagendar = useCallback((e, item) => {
    setShowModalReagendar(true);
    // console.log("Reagendar", item);
    setSelectedItem(item);
  }, []);

  const handleOpenDevolverPin = useCallback((e, item) => {
    setShowModalDevolucion(true);
    // console.log("Devolver PIN", item);
    setSelectedItem(item);
  }, []);

  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({ page: 1, limit: 10 });

  const [filters, setFilters] = useState({
    // Fecha inicial es una semana antes de hoy en formato YYYY-MM-DD
    fechaInicial: "",
    // Fecha final es hoy en formato YYYY-MM-DD
    fechaFinal: "",
    estado: "",
    limit: 10,
    page: 1,
  });

  const [data, setData] = useState([
    {
      "ID PIN": "",
      PIN: "",
      "Estado PIN": "",
      "Fecha Registro": "",
      "Hora Registro": "",
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

  const getFiltersData = useCallback(async () => {
    const res = await fetchGetPinData(
      "",
      filters.estado,
      filters.fechaInicial,
      filters.fechaFinal,
      page,
      limit
    );
    if (res) {
      setData(
        res.results.map((item) => ({
          "ID PIN": item.pk_id_pin,
          PIN: item.numero_pin,
          "Estado PIN": item.estado,
          Fecha: item.fecha_creacion
            ? new Date(item.fecha_creacion).toISOString().split("T")[0]
            : "Sin uso",
          Hora: item.fecha_creacion
            ? new Date(item.fecha_creacion)
                .toISOString()
                .split("T")[1]
                .slice(0, 5)
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
                design="primary"
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
                disabled={item.estado !== "Disponible"}
                design="primary"
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
  }, [filters, handleOpenDevolverPin, handleOpenReagendar, page, limit]);

  useEffect(() => {
    getFiltersData();
  }, [filters, getFiltersData]);

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
      // console.log("Devolver item", selectedItem);
      // console.log("Devolver data", devolucionData);
      // Creo la prefirmada
      const certPresigned = await fetchGetUploadToS3(
        `certificados_bancarios/${selectedItem.fk_id_cliente}.pdf`
      );
      // console.log("certPresigned", certPresigned);
      // Subo el archivo
      if (certPresigned.status) {
        const upload = await uploadFilePresignedUrl(
          certPresigned.obj,
          devolucionData.certificado
        );
        // console.log("upload", upload);
        if (upload.ok) {
          // Espero 5 segundos para que se suba el archivo
          setTimeout(async () => {
            const body = {
              carpeta_certificado: `certificados_bancarios/${selectedItem.fk_id_cliente}`,
              observacion: devolucionData.observacion,
              nombre_usuario: roleInfo.nombre_comercio,
            };
            // console.log("body", body);
            // Hago la devolución
            const res = await fetchPutCancelacion(selectedItem.pk_id_pin, body);
            // console.log(res);
            if (res.status) {
              // Si todo sale bien, notifico y limpio los datos
              notify(res.msg);
              setDevolucionData({});
              setSelectedItem({});
              getFiltersData();
              setShowModalDevolucion(false);
            } else {
              console.error(res.msg);
              notifyError(res.msg);
            }
          }, 5000);
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
  }, [devolucionData, selectedItem, roleInfo, getFiltersData]);

  const formatTimeTo12Hour = (timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convertir 0 horas a 12 para el formato de 12 horas
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  };

  return (
    <>
      <TableEnterprise
        title="Tabla Histórico Pines"
        headers={[
          "ID PIN",
          // "Lugar Originación",
          "PIN",
          "Estado PIN",
          "Fecha Registro",
          "Hora Registro",
          "Estado Agenda",
          "Tipo Trámite",
          "Trámite",
          "Nombre Cliente",
          "Celular",
          "Correo electrónico",
          "Acciones",
        ]}
        data={data}
        onSetPageData={setPageData}
        maxPage={maxPages}
        // onSetPageData={(pageData) => setFilters({ ...filters, ...pageData })}
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
            { label: "", value: "" },
            { label: "Disponible", value: "Disponible" },
            { label: "Usado", value: "Usado" },
            { label: "Cancelado", value: "Cancelado" },
            { label: "Creado", value: "Creado" },
            { label: "Sin recaudo", value: "Sin recaudo" },
          ]}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
        />
      </TableEnterprise>
      <Modal show={showModalReagendar} bigger>
        <h2 className="mb-5 text-center">
          ¿Qué re-agenda le queda bien al cliente?
        </h2>
        <p className="mb-5 font-semibold text-center">
          {selectedItem?.nombre_oficina}
        </p>
        <div className="grid grid-cols-2 gap-5">
          <CalendarDate value={date} onChange={changeDate}>
            <CalendarMonth />
          </CalendarDate>
          <div className="grid items-center grid-cols-2 gap-5">
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
                {hour.hour.split("-").map(formatTimeTo12Hour).join(" - ")}
              </button>
            ))}
          </div>
        </div>
        {/* {JSON.stringify(selectedItem)} */}
        {selectedItem?.hora_inicio && selectedItem?.hora_fin && (
          <div className="flex flex-col items-center justify-center my-5 text-center gap-y-5">
            <p>
              <span className="font-semibold">Fecha anterior:</span>{" "}
              {new Date(selectedItem?.hora_inicio).toISOString().split("T")[0]}{" "}
              {formatTimeTo12Hour(
                new Date(selectedItem.hora_inicio)
                  .toISOString()
                  .split("T")[1]
                  .slice(0, 5)
              )}
              {" - "}
              {formatTimeTo12Hour(
                new Date(selectedItem?.hora_fin)
                  .toISOString()
                  .split("T")[1]
                  .slice(0, 5)
              )}
            </p>
            {date && selectedHour && (
              <p>
                <span className="font-semibold">Fecha nueva:</span> {date}{" "}
                {formatTimeTo12Hour(selectedHour.split("-")[0])}
                {" - "}
                {formatTimeTo12Hour(selectedHour.split("-")[1])}
              </p>
            )}
          </div>
        )}
        {/* {JSON.stringify(date)}
        {JSON.stringify(selectedHour)} */}
        <ButtonBar>
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
        </ButtonBar>
      </Modal>
      <Modal show={showModalDevolucion} bigger>
        <h2 className="text-center">Devolución del PIN</h2>
        <div className="flex flex-col gap-5 overflow-x-auto">
          <Table
            headers={[
              "Número de PIN",
              // "Lugar de Originación",
              "Fecha de solicitud de la devolución",
              "Estado actual",
              "Nombre de quien solicita",
            ]}
            data={[
              {
                "Número de PIN": selectedItem.numero_pin,
                // "Lugar de Originación": "Lugar de Originación",
                "Fecha de solicitud de la devolución":
                  new Date().toLocaleDateString(),
                "Estado actual": selectedItem.estado ?? "",
                "Nombre de quien solicita": roleInfo.nombre_comercio,
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
          <FileInput
            label="Certificado de cuenta"
            accept=".pdf"
            onGetFile={(file) => {
              // Validar que sea un archivo PDF
              if (file[0].type !== "application/pdf") {
                notifyError("El archivo debe ser un PDF");
                return;
              }
              setDevolucionData({
                ...devolucionData,
                certificado: file[0],
              });
            }}
          />
          {devolucionData.certificado && (
            <p className="text-center">
              Archivo cargado: {devolucionData.certificado?.name}
            </p>
          )}
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
              !devolucionData.certificado || !devolucionData.observacion
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
