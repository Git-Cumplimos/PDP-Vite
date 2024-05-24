import { useCallback, useMemo, useState } from "react";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { formatMoney } from "../../../components/Base/MoneyInput";
import Input from "../../../components/Base/Input";
import { onChangeNumber } from "../../../utils/functions";

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
  const [filterData, setFilterData] = useState({
    noDesembolso: "",
    noPrestamo: "",
  });
  const dataTable = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, dataCreditos.length);
    const tableObjCreditos = dataCreditos
      .map(
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
            numeroPrestamo: Numeroprestamo,
            desembolso: Id,
            saldoCredito: formatMoney.format(Saldo),
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
      )
      .filter((data) =>
        data.desembolso.toString().match(filterData.noDesembolso)
      )
      .filter((data) =>
        data.numeroPrestamo.toString().match(filterData.noPrestamo)
      );
    const currentPageCuotas = tableObjCreditos.slice(startIndex, endIndex);
    const totalPages = Math.ceil(tableObjCreditos.length / limit);

    setMaxPages(totalPages);
    setPageData({ page, limit });

    return currentPageCuotas;
  }, [dataCreditos, page, limit, filterData]);

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
      headers={[
        "No. Crédito",
        "No. Desembolso",
        "Saldo del crédito",
        "No. cuotas",
        "Estado",
        "Fecha Desembolso",
      ]}
      onChange={(ev) =>
        setFilterData((old) => ({
          ...old,
          [ev.target.name]: ev.target.value,
        }))
      }
      data={dataTable}
      onSelectRow={onSelect}
      onSetPageData={setPageData}
    >
      <Input
        id={"noDesembolso"}
        label={"No. Desembolso"}
        name={"noDesembolso"}
        type="tel"
        autoComplete="off"
        maxLength={"8"}
        onChange={(ev) => {
          ev.target.value = onChangeNumber(ev);
        }}
        defaultValue={filterData?.noDesembolso ?? ""}
        required
      />
      <Input
        id={"noPrestamo"}
        label={"No. Crédito"}
        name={"noPrestamo"}
        type="tel"
        autoComplete="off"
        maxLength={"12"}
        onChange={(ev) => {
          ev.target.value = onChangeNumber(ev);
        }}
        defaultValue={filterData?.noPrestamo ?? ""}
        required
      />
    </TableEnterprise>
  );
};

export default TablaExtractoCreditos;
