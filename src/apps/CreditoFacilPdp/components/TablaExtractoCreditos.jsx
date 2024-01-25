import { useCallback, useMemo, useState } from "react";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { formatMoney } from "../../../components/Base/MoneyInput";

const TablaExtractoCreditos = ({
  dataCreditos,
  setDataCreditoUnique,
  setShowModal,
}) => {
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
        cuotas,
      }) => {
        return {
          desembolso: Id,
          valorCredito: formatMoney.format(Saldo),
          cuotas: cuotas,
          estado: Estado,
          fechaDesembolso: new Date(Fechadesembolso).toLocaleDateString(
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
      const idData = dataTable[i]?.desembolso;
      const dataCredito = dataCreditos.filter((data) => data.Id === idData);
      setDataCreditoUnique(dataCredito[0] ?? {});
      setShowModal(true);
    },
    [dataTable, dataCreditos]
  );
  return (
    <TableEnterprise
      title={"Créditos comercio"}
      maxPage={maxPages}
      onChange={onChange}
      headers={[
        "No. Desembolso",
        "Valor del crédito",
        "No. cuotas",
        "Estado",
        "Fecha Desembolso",
      ]}
      data={dataTable}
      onSelectRow={onSelect}
      onSetPageData={setPageData}
    ></TableEnterprise>
  );
};

export default TablaExtractoCreditos;
