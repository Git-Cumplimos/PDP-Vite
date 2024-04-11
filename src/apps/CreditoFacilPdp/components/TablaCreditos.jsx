import { useCallback, useMemo, useState } from "react";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { formatMoney } from "../../../components/Base/MoneyInput";

const TablaCreditos = ({ dataCreditos, setDataCreditoUnique }) => {
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const dataTable = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, dataCreditos.length);
    const currentPageCuotas = dataCreditos.slice(startIndex, endIndex);
    const totalPages = Math.ceil(dataCreditos.length / limit);

    setMaxPages(totalPages);
    setPageData({ page, limit });

    return currentPageCuotas.map(
      ({
        Agrupacion,
        Calificacion,
        Calificacionactual,
        Codigoasesor,
        Codigore,
        Cuotasmora,
        Cuotaspagadas,
        Diasmoraacumulado,
        Diasmorapromedio,
        Estado,
        Fechadesembolso,
        Fechadeultimopago,
        Fechavencimientoproximo,
        Formapago,
        Frecuenciapagocapital,
        Frecuenciapagointeres,
        Id,
        Idsucursal,
        Idtercero,
        Nombreasesor,
        Nombrere,
        Numeroprestamo,
        Saldo,
        Sucursal,
        Tasaprestamo,
        Terceroprestamo,
        Tipocredito,
        Valorcuotaactual,
        Valordecuota,
        Valordesembolso,
        Valorinteresanticipado,
        Valorpagototal,
        Valorpagototalcausado,
        Valorparaestaraldia,
      }) => {
        return {
          id: Numeroprestamo,
          estado: Estado,
          valorCuota: formatMoney.format(Valorcuotaactual),
          saldo: formatMoney.format(Saldo),
          desembolso: new Date(Fechadesembolso).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          ultimoPago: new Date(Fechadeultimopago).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          proximoPago: new Date(Fechavencimientoproximo).toLocaleDateString(
            "es-ES",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          ),
        };
      }
    );
  }, [dataCreditos, page, limit]);
  const onChange = useCallback((ev) => {}, []);
  const onSelect = useCallback(
    (ev, i) => {
      const idData = dataTable[i]?.id;
      const dataCredito = dataCreditos.filter(
        (data) => data.Numeroprestamo === idData
      );
      setDataCreditoUnique(dataCredito[0] ?? {});
    },
    [dataTable, dataCreditos]
  );
  return (
    <TableEnterprise
      title={"Créditos activos comercio"}
      maxPage={maxPages}
      onChange={onChange}
      headers={[
        "Crédito",
        "Estado",
        "Cuota",
        "Saldo",
        "Desembolso",
        "Último pago",
        "Proximo pago",
      ]}
      data={dataTable}
      onSelectRow={onSelect}
      onSetPageData={setPageData}
    ></TableEnterprise>
  );
};

export default TablaCreditos;
