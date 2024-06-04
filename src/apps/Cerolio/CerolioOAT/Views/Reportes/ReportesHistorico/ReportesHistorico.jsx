import { useCallback, useEffect, useMemo, useState } from "react";
import Input from "../../../../../../components/Base/Input";
import TableEnterprise from "../../../../../../components/Base/TableEnterprise";
import { fetchGetReportesHistorico } from "../../../../utils/reportes";
import { useAuth } from "../../../../../../hooks/AuthHooks";

const ReportesHistorico = () => {
  const { roleInfo } = useAuth();

  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({ page: 1, limit: 10 });

  const [filters, setFilters] = useState({
    // Fecha inicial es una semana antes de hoy en formato YYYY-MM-DD
    fechaInicial: "",
    // Fecha final es hoy en formato YYYY-MM-DD
    fechaFinal: "",
  });

  const [data, setData] = useState([]);

  useEffect(() => {
    const getFiltersData = async () => {
      const res = await fetchGetReportesHistorico(
        filters.fechaInicial.split("-").slice(0, 2).join("-"),
        filters.fechaFinal.split("-").slice(0, 2).join("-"),
        roleInfo.id_comercio,
        "movimientos",
        page,
        limit
      );
      // console.log(res);
      if (res.status) {
        const arr = Object.keys(res.obj.carpetas).map(
          (key) => res.obj.carpetas[key]
        );
        const carpetas = arr.filter((item) => item.length > 0);
        const carpetasArray = carpetas.reduce(
          (acc, val) => acc.concat(val),
          []
        );
        // console.log(carpetasArray);
        setData(carpetasArray);
        setMaxPages(res.obj.maxPages);
      }
    };
    getFiltersData();
  }, [filters, roleInfo, page, limit]);

  const tableData = useMemo(() => {
    return data.map((item) => ({
      Nombre: item.archivo,
      /*       Tipo: "Archivo",
      "Última modificación": "Hoy", */
    }));
  }, [data]);

  const descargarReporte = useCallback(
    async (i) => {
      // console.log("Descargar reporte", i);
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
        headers={["Nombre" /* , "Tipo", "Última modificación" */]}
        data={tableData}
        onSelectRow={
          // Enviar el nombre del archivo para descargar
          (e, i) => descargarReporte(i)
        }
        maxPage={maxPages}
        onSetPageData={setPageData}
      >
        {/* Input para fecha */}
        {/* <Input
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
        /> */}
        <Input
          type="month"
          label="Fecha"
          onChange={(e) =>
            setFilters({
              ...filters,
              fechaInicial: e.target.value + "-01",
              fechaFinal: e.target.value + "-31",
            })
          }
          value={filters.fechaInicial.split("-").slice(0, 2).join("-")}
        />
      </TableEnterprise>
    </>
  );
};

export default ReportesHistorico;

