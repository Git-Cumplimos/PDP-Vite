import { useState, useEffect, useCallback, Fragment } from "react";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import { searchHistorico } from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ButtonBar from "../../../../components/Base/ButtonBar";

const headers = [
  "Id",
  "Id comercio",
  "Id Terminal",
  "Total Caja",
  "Sobrante",
  "Faltante",
  "Transportadora",
  "Fecha Cierre",
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
  const [pageData, setPageData] = useState({});
  const [fecha, setFecha] = useState("");
  const [maxPages, setMaxPages] = useState(1);

  const buscarConsignaciones = useCallback(() => {
    const queries = { ...pageData };
    if (fecha) {
      const fecha_ini = new Date(fecha);
      fecha_ini.setHours(fecha_ini.getHours() + 5);
      queries.fecha_cierre = Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(fecha_ini);
    }
    searchHistorico(queries)
      .then((res) => {
        setReceipt(res?.obj);
        //setMaxPages(res?.obj?.maxPages);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [fecha, pageData]);

  useEffect(() => {
    buscarConsignaciones();
  }, [buscarConsignaciones]);

  return (
    <Fragment>
      <TableEnterprise
        title="Históricos - Cierre de Caja"
        headers={headers}
        maxPage={maxPages}
        data={receipt?.map(
          ({
            id_cierre,
            id_comercio,
            id_terminal,
            total_caja,
            sobrante,
            faltante,
            transportadora,
            fecha_cierre,
          }) => {
            const t_total_caja = formatMoney.format(total_caja);
            const t_sobrante = formatMoney.format(sobrante);
            const t_faltante = formatMoney.format(faltante);
            const tempDate = new Date(fecha_cierre);
            tempDate.setHours(tempDate.getHours() + 5);
            const fechaHora = dateFormatter.format(tempDate);
            return {
              id_cierre,
              id_comercio,
              id_terminal,
              t_total_caja,
              t_sobrante,
              t_faltante,
              transportadora,
              fechaHora,
            };
          }
        )}
      >
        <Input
          id="dateInit"
          label="Fecha"
          type="date"
          onInput={(e) => setFecha(e.target.value)}
        />
        <ButtonBar />
      </TableEnterprise>
    </Fragment>
  );
};

export default PanelConsignaciones;
