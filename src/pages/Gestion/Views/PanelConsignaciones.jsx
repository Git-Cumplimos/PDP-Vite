import { useState, useEffect, useCallback } from "react";
import Select from "../../../components/Base/Select";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import ValidarComprobante from "./ValidarComprobante";
import { searchReceipt } from "../utils/fetchCaja";
import TableEnterprise from "../../../components/Base/TableEnterprise";

const headers = [
  "Id",
  "Id comercio",
  "Número comprobante",
  "Observación cajero",
  "Observación analista",
  "Cuenta",
  "Compañia",
  "Valor registrado",
  "Fecha registro",
  "Estado",
];

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

const PanelConsignaciones = () => {
  const [showModal, setShowModal] = useState(false);
  const [dataRes, setDataRes] = useState({});
  const [receipt, setReceipt] = useState([]);
  const [consultaEstado, setConsultaEstado] = useState("");
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [fecha, setFecha] = useState("");
  const [maxPages, setMaxPages] = useState(1);
  const CloseModal = () => {
    setShowModal(false);
  };

  const buscarConsignaciones = useCallback(() => {
    const queries = { ...pageData };
    if (consultaEstado !== 0 || consultaEstado !== "") {
      queries.status = consultaEstado;
    }
    if (fecha) {
      const fecha_ini = new Date(fecha);
      fecha_ini.setHours(fecha_ini.getHours() + 5);
      queries.created = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(fecha_ini);
    }
    searchReceipt(queries)
      .then((res) => {
        setReceipt(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [consultaEstado, fecha]);

  useEffect(() => {
    buscarConsignaciones();
  }, [buscarConsignaciones]);

  return (
    <>
      <div className="w-full flex flex-col justify-center items-center my-8">
        <h1 className="text-xl">Validación de comprobante</h1>
      </div>
      <TableEnterprise
        title="Comprobantes relacionados"
        headers={headers}
        maxPage={maxPages}
        data={receipt?.map(
          ({
            id_comprobante,
            id_comercio,
            nro_comprobante,
            obs_cajero,
            obs_analista,
            cuenta,
            compañia,
            valor,
            created,
            status,
          }) => {
            const t_consignado = formatMoney.format(valor);
            const tempDate = new Date(created);
            tempDate.setHours(tempDate.getHours() + 5);
            const fechaHora = dateFormatter.format(tempDate);
            return {
              id_comprobante,
              id_comercio,
              nro_comprobante,
              obs_cajero,
              obs_analista,
              cuenta,
              compañia,
              t_consignado,
              fechaHora,
              status,
            };
          }
        )}
        onSelectRow={(_e, index) => {
          setDataRes(receipt[index]);
          setShowModal(true);
        }}
        onSetPageData={setPageData}
      >
        <Input
          id="dateInit"
          label="Fecha"
          type="date"
          onInput={(e) => setFecha(e.target.value)}
        />
        <Select
          id="searchByStatus"
          label="Estado"
          options={[
            { value: 0, label: "" },
            { value: "PENDIENTE", label: "PENDIENTE" },
            { value: "RECHAZADO", label: "RECHAZADO" },
            { value: "APROBADO", label: "APROBADO" },
          ]}
          onChange={(e) => {
            console.log(e.target.value);
            setConsultaEstado(e.target.value);
          }}
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={CloseModal}>
        <ValidarComprobante data={dataRes} setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default PanelConsignaciones;
