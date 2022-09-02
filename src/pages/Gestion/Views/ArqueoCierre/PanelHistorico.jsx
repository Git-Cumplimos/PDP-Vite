import { useState, useEffect, useCallback, Fragment } from "react";
import Input from "../../../../components/Base/Input";
import { searchHistorico } from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  makeDateFormatter,
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";

const formatMoney = makeMoneyFormatter(0);

const dateFormatter = makeDateFormatter(true);

const PanelConsignaciones = () => {
  const [receipt, setReceipt] = useState([]);
  const [pageData, setPageData] = useState({});
  const [maxPages, setMaxPages] = useState(1);
  const [searchInfo, setSearchInfo] = useState({
    id_usuario: "",
    id_comercio: "",
    date_ini: "",
    date_end: "",
  });

  const buscarConsignaciones = useCallback(() => {
    searchHistorico({
      ...Object.fromEntries(
        Object.entries(searchInfo).filter(([, val]) => val)
      ),
      ...pageData,
    })
      .then((res) => {
        setReceipt(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
        notifyError("Peticion fallida");
      });
  }, [searchInfo, pageData]);

  useEffect(() => {
    buscarConsignaciones();
  }, [buscarConsignaciones]);

  return (
    <Fragment>
      <TableEnterprise
        title="Históricos - Cierre de Caja"
        headers={[
          "Id cierre",
          "Id comercio",
          "Id usuario",
          "Total movimientos día",
          "Total efectivo cierre día anterior",
          "Total efectivo en caja",
          "Total sobrante",
          "Total faltante",
          "Total estimación faltante",
          "Total entregado transportadora",
          "Total recibido transportadora",
          "Total consignaciones bancarias",
          "Total transferencias cajeros",
          "Total notas debito o credito",
          "Fecha y hora cierre",
        ]}
        maxPage={maxPages}
        data={receipt?.map(
          ({
            created,
            fecha_cierre,
            id_comercio,
            id_terminal,
            id_usuario,
            pk_id_cierre,
            total_arqueo,
            total_consignaciones,
            total_efectivo_cierre_día_anterior,
            total_efectivo_en_caja,
            total_entregado_transportadora,
            total_estimacion_faltante,
            total_faltante,
            total_movimientos,
            total_notas,
            total_recibido_transportadora,
            total_sobrante,
            total_transferencias,
          }) => ({
            pk_id_cierre,
            id_comercio,
            id_usuario,
            total_movimientos: formatMoney.format(total_movimientos),
            total_efectivo_cierre_día_anterior: formatMoney.format(
              total_efectivo_cierre_día_anterior
            ),
            total_efectivo_en_caja: formatMoney.format(total_efectivo_en_caja),
            total_sobrante: formatMoney.format(total_sobrante),
            total_faltante: formatMoney.format(total_faltante),
            total_estimacion_faltante: formatMoney.format(
              total_estimacion_faltante
            ),
            total_entregado_transportadora: formatMoney.format(
              total_entregado_transportadora
            ),
            total_recibido_transportadora: formatMoney.format(
              total_recibido_transportadora
            ),
            total_consignaciones: formatMoney.format(total_consignaciones),
            total_transferencias: formatMoney.format(total_transferencias),
            total_notas: formatMoney.format(total_notas),
            created: dateFormatter.format(new Date(created)),
          })
        )}
        onSetPageData={setPageData}
      >
        <Input
          id="dateInit"
          name={"date_ini"}
          label="Fecha inicial"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="dateEnd"
          name={"date_end"}
          label="Fecha final"
          type="date"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }
        />
        <Input
          id="id_comercio"
          name={"id_usuario"}
          label="Id comercio"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev.target.value),
            }))
          }
        />
        <Input
          id="id_usuario"
          name={"id_comercio"}
          label="Id usuario"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev.target.value),
            }))
          }
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default PanelConsignaciones;
