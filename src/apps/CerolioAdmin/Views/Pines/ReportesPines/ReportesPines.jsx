import { useCallback } from "react";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";

const ReportesPines = () => {
  const descargarReporte = useCallback(async (e, i) => {
    console.log("Descargar reporte", i);
  }, []);
  return (
    <>
      <TableEnterprise
        title="Vista de reportes"
        headers={["Nombre", "Tipo", "Última modificación"]}
        data={[
          {
            Nombre: "Reporte 1",
            Tipo: "Tipo 1",
            "Última modificación": "12/12/2021",
          },
          {
            Nombre: "Reporte 2",
            Tipo: "Tipo 2",
            "Última modificación": "12/12/2021",
          },
          {
            Nombre: "Reporte 3",
            Tipo: "Tipo 3",
            "Última modificación": "12/12/2021",
          },
        ]}
        onSelectRow={descargarReporte}
      >
        {/* Input para fecha */}
        <Input label="Fecha" type="date" />
      </TableEnterprise>
    </>
  );
};

export default ReportesPines;
