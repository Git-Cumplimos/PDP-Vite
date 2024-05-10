import { useEffect, useState } from "react";
import Button from "../../../../../components/Base/Button";
import Input from "../../../../../components/Base/Input";
import Select from "../../../../../components/Base/Select";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import { fetchGetReportesConsulta } from "../../../utils/reportes";
import { makeMoneyFormatter } from "../../../../../utils/functions";

const ReportesConsulta = () => {
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [filters, setFilters] = useState({
    // Fecha inicial es una semana antes de hoy en formato YYYY-MM-DD
    fechaInicial: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    // Fecha final es hoy en formato YYYY-MM-DD
    fechaFinal: new Date().toISOString().split("T")[0],
    pin: "",
    nombreTramite: "",
    documento: "",
  });

  const [data, setData] = useState([
    {
      Fecha: "",
      Naturaleza: "",
      "Tipo de Trámite": "",
      PIN: "",
      "Nombre Trámite": "",
      Cliente: "",
      "N° de Documento": "",
      Valor: "",
    },
  ]);

  const formatMoney = makeMoneyFormatter(2);

  useEffect(() => {
    const getFiltersData = async () => {
      const res = await fetchGetReportesConsulta(
        filters.fechaInicial,
        filters.fechaFinal,
        1,
        filters.nombreTramite,
        filters.pin,
        filters.documento
      );
      if (res) {
        setData(
          res.results.map((item) => ({
            Fecha: new Date(item.fecha_uso).toLocaleDateString(),
            Naturaleza: item.naturaleza,
            "Tipo de Trámite": item.tipo_tramite,
            PIN: item.numero_pin,
            "Nombre Trámite": item.nombre_tramite,
            Cliente: item.nombres + " " + item.apellidos,
            "N° de Documento": item.numero_documento,
            Valor: formatMoney.format(item.valor),
          }))
        );
        setMaxPages(res.maxPages);
      }
    };
    getFiltersData();
  }, [pageData, filters]);

  return (
    <>
      <TableEnterprise
        title="Reportes Consulta"
        headers={[
          "Fecha",
          "Naturaleza",
          "Tipo de Trámite",
          "PIN",
          "Nombre Trámite",
          "Cliente",
          "N° de Documento",
          "Valor",
        ]}
        data={data}
        maxPage={maxPages}
        onSetPageData={setPageData}
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
        {/* Filtro PIN */}
        <Input
          label="PIN"
          type="text"
          onChange={(e) => setFilters({ ...filters, pin: e.target.value })}
          value={filters.pin}
        />
        {/* Filtro Nombre Trámite */}
        <Select
          label="Nombre Trámite"
          options={[
            {
              label: "Licencia por primera vez",
              value: "Licencia por primera vez",
            },
            {
              label: "Renovación de licencia",
              value: "Renovación de licencia",
            },
            {
              label: "Recategorización de licencia",
              value: "Recategorización de licencia",
            },
          ]}
          onChange={(e) =>
            setFilters({ ...filters, nombreTramite: e.target.value })
          }
          value={filters.nombreTramite}
        />
        {/* Filtro Documento */}
        <Input
          label="N° de Documento"
          type="text"
          onChange={(e) =>
            setFilters({ ...filters, documento: e.target.value })
          }
          value={filters.documento}
        />
      </TableEnterprise>
    </>
  );
};

export default ReportesConsulta;
