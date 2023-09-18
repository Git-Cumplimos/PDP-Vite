import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import Input from "../../../../components/Base/Input";
import { searchHistorico } from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  makeDateFormatter,
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import Modal from "../../../../components/Base/Modal";
// import Tickets from "../../../../components/Base/Tickets";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useReactToPrint } from "react-to-print";
import TicketCierre from "./TicketCierre";

const formatMoney = makeMoneyFormatter(0);

const dateFormatter = makeDateFormatter(true);

const PanelHistorico = () => {
  const [receipt, setReceipt] = useState([]);
  const [pageData, setPageData] = useState({});
  const [maxPages, setMaxPages] = useState(1);
  // const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumenCierre, setResumenCierre] = useState(null);
  const [searchInfo, setSearchInfo] = useState({
    id_usuario: "",
    id_comercio: "",
    date_ini: "",
    date_end: "",
  });

  const CloseModal = useCallback(() => {
    // setSelected(null);
    setResumenCierre(null)
  }, []);

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

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const cierreCaja = useCallback((data) => {
    setLoading(false)
    const tempTicket = {
      title: "Cierre de caja",
      timeInfo: {
        "Fecha de pago":new Date(data.created).toLocaleDateString(),
        Hora: new Date(data.created).toLocaleTimeString('en-CO'),
      },
      commerceInfo: [
        ["Id Comercio", data.id_comercio],
        ["No. Terminal", data.id_terminal],
        ["Id Cierre", data.pk_id_cierre],
        ["Comercio", data.nombre_comercio],
        ["Cajero",data.nombre_usuario],
        ["", ""],
      ],
      cajaInfo: [
        ["movimientos del día",formatMoney.format(data.total_movimientos)],
        ["", ""],
        ["Efectivo cierre día anterior",formatMoney.format(data.total_efectivo_cierre_día_anterior)],
        ["", ""],
        ["Efectivo en caja",formatMoney.format(data.total_efectivo_en_caja)],
        ["", ""],
        // ["Efectivo en caja PDP",formatMoney.format('')],
        // ["", ""],
        // ["Efectivo en caja PDP + Externos",formatMoney.format('')],
        // ["", ""],
      ],
      trxInfo: [
        ["Sobrante", formatMoney.format(data.total_sobrante)],
        ["", ""],
        ["Faltante", formatMoney.format(data.total_faltante)],
        ["", ""],
        ["Estimación faltantes",formatMoney.format(data.total_estimacion_faltante)],
        ["", ""],
        ["Consignaciones bancarias",formatMoney.format(data.total_consignaciones)],
        ["", ""],
        ["Entregado a transportadora", formatMoney.format(data.total_entregado_transportadora)],
        ["", ""],
        ["Recibido de transportadora", formatMoney.format(data.total_recibido_transportadora)],
        ["", ""],
        ["Notas débito o crédito",formatMoney.format(data.total_notas)],
        ["", ""],
        // ["Nombre plataforma 1",formatMoney.format(''),],
        // ["", ""],
        // ["Nombre plataforma 2",formatMoney.format(''),],
        // ["", ""],
        // ["Nombre plataforma 3",formatMoney.format(''),],
        // ["", ""],
      ],
    };
    setResumenCierre(tempTicket);
  }, []);

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
          "Total notas débito o crédito",
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
        onSelectRow={(_e, index) => {
          // setSelected(receipt[index]);
          cierreCaja(receipt[index])
        }}
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
          name={"id_comercio"}
          label="Id comercio"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev),
            }))
          }
        />
        <Input
          id="id_usuario"
          name={"id_usuario"}
          label="Id usuario"
          type="tel"
          onInput={(ev) =>
            setSearchInfo((old) => ({
              ...old,
              [ev.target.name]: onChangeNumber(ev),
            }))
          }
        />
      </TableEnterprise>
      <Modal show={resumenCierre} handleClose={loading ? () => {} : CloseModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
          <TicketCierre refPrint={printDiv} ticket={resumenCierre} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={CloseModal}>Cerrar</Button>
          </ButtonBar>
        </div>
      </Modal>
    </Fragment>
  );
};

export default PanelHistorico;
