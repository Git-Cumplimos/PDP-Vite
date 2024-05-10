import { useCallback, useEffect, useMemo, useState } from "react";
import Input from "../../../../../../components/Base/Input";
import TableEnterprise from "../../../../../../components/Base/TableEnterprise";
import { fetchGetReportesHistorico } from "../../../../utils/reportes";
import { useAuth } from "../../../../../../hooks/AuthHooks";

const ReportesHistorico = () => {
  const { roleInfo } = useAuth();

  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [filters, setFilters] = useState({
    // Fecha inicial es una semana antes de hoy en formato YYYY-MM-DD
    fechaInicial: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    // Fecha final es hoy en formato YYYY-MM-DD
    fechaFinal: new Date().toISOString().split("T")[0],
  });

  const [data, setData] = useState([]);

  useEffect(() => {
    const getFiltersData = async () => {
      const res = await fetchGetReportesHistorico(
        filters.fechaInicial,
        filters.fechaFinal,
        1
      );
      console.log(res);
      if (res.status) {
        const arr = Object.keys(res.obj.carpetas).map(
          (key) => res.obj.carpetas[key]
        );
        const carpetas = arr.filter((item) => item.length > 0);
        const carpetasArray = carpetas.reduce(
          (acc, val) => acc.concat(val),
          []
        );
        console.log(carpetasArray);
        setData(carpetasArray);
        setMaxPages(res.obj.maxPages);
      }
    };
    getFiltersData();
  }, [pageData, filters, roleInfo]);

  const tableData = useMemo(() => {
    return data.map((item) => ({
      Nombre: item.archivo,
      Tipo: "PDF",
      "Última modificación": "Hoy",
    }));
  }, [data]);

  const descargarReporte = useCallback(
    async (i) => {
      console.log("Descargar reporte", i);
      // Buscar en data el archivo con el nombre de la fila i
      // Descargar el archivo
      const archivo = data[i].url;
      // Crear un link con el archivo
      const link = document.createElement("a");
      link.href = archivo;
      link.download = data[i].archivo;
      // Agregar el link al body
      document.body.appendChild(link);
      // Simular click
      link.click();
      // Eliminar el link
      document.body.removeChild(link);
    },
    [data]
  );

  return (
    <>
      <TableEnterprise
        title="Vista de reportes"
        headers={["Nombre", "Tipo", "Última modificación"]}
        data={tableData}
        onSelectRow={
          // Enviar el nombre del archivo para descargar
          (e, i) => descargarReporte(i)
        }
        setMaxPages={setMaxPages}
        pageData={pageData}
        setPageData={setPageData}
      >
        {/* Input para fecha */}
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
      </TableEnterprise>
    </>
  );
};

export default ReportesHistorico;
