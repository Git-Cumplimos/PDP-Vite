import { useState, useCallback, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import { useLoteria } from "../utils/LoteriaHooks";
import Form from "../../../components/Base/Form";
import Table from "../../../components/Base/Table";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import DescargaForm from "../components/DescargaForm/DescargaForm";
import SubPage from "../../../components/Base/SubPage/SubPage";
import ReportVentasForm from "../components/ReportVentasForm/ReportVentasForm";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import fetchData from "../../../../src/utils/fetchData";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const url_reportVentas = `http://127.0.0.1:5000/reportes_ventas`;
const url_Arqueobilletes = `http://127.0.0.1:5000/arqueobilletes`;

const ArqueoBilletes = ({ route }) => {
  /*__________ Fechas para consulta de transacciones del día________________ */
  const fecha = new Date();
  //fecha.setDate(fecha.getHours() - 5);
  const fecha_ini = fecha.toISOString();

  fecha.setDate(fecha.getDate() + 1);
  const fecha_fin = fecha.toISOString();
  /*_________________________________________________________ */

  const { label } = route;

  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  const [resp_con_sort, setResp_con_sort] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fracDisp, setFracDisp] = useState("");
  const [total, setTotal] = useState(null);
  const { roleInfo } = useAuth();

  console.log(roleInfo);
  const { con_SortVentas_S3 } = useLoteria();
  const [showModal2, setShowModal2] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    crearArqueoBilletes(fecha_ini, fracDisp, total).then((res) => {
      if (res.status === false) {
        notifyError(res.msg);
        // setDisabledBtns(true);
      } else {
        console.log(res);
        // setResp_report(res.data);
        notify(res.msg);
        // setDisabledBtns(false);
      }
    });
  };

  const reportVentas = useCallback(async (fecha_ini, fecha_fin) => {
    try {
      const query = {
        fecha_ini: fecha_ini.substr(0, 10),
        fecha_fin: fecha_fin.substr(0, 10),
      };
      if ("cod_oficina_lot" in roleInfo) {
        query.cod_distribuidor = roleInfo?.cod_oficina_lot;
        query.cod_sucursal = roleInfo?.cod_sucursal_lot;
      }

      query.arqueo = "Si";
      const res = await fetchData(url_reportVentas, "GET", query);

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const crearArqueoBilletes = useCallback(
    async (fecha_ini, fracDisp, total) => {
      try {
        const body = {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          fecha: fecha_ini,
          frac_vendidas: total === null ? 0 : total?.total_frac,
          val_total: total === null ? 0 : total?.val_total,
          fracciones_restantes: fracDisp,
        };

        const res = await fetchData(url_Arqueobilletes, "POST", {}, body);

        return res;
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    reportVentas(fecha_ini, fecha_fin).then((res) => {
      if ("msg" in res) {
        notifyError(res.msg);
        // setDisabledBtns(true);
      } else {
        console.log(res);
        // setResp_report(res.data);
        setTotal(res.total);
        // setDisabledBtns(false);
      }
    });
  }, []);

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);

  const closeModal2 = useCallback(async () => {
    setShowModal2(false);
  }, []);

  console.log(fracDisp);
  return (
    <>
      <Form formDir="col" onSubmit={onSubmit}>
        <Input
          id="frac_venta"
          label="Fracciones vendidas"
          type="text"
          required="true"
          value={total === null ? 0 : total?.total_frac}
        />
        <Input
          id="val_total"
          label="Total ventas"
          type="text"
          required="true"
          value={formatMoney.format(total === null ? 0 : total?.val_total)}
        />
        <Input
          id="frac_disponibles"
          label="Fracciones disponibles"
          type="text"
          required="true"
          value={fracDisp}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setFracDisp(num);
            }
          }}
        />

        <Button type="submit">Arqueo</Button>
      </Form>
      <div>
        <Modal show={showModal} handleClose={closeModal}>
          <DescargaForm closeModal={closeModal} selected={selected} />
        </Modal>
        <Modal show={showModal2} handleClose={closeModal2}>
          <ReportVentasForm closeModal={closeModal2} Oficina="" />
        </Modal>
      </div>
    </>
  );
};

export default ArqueoBilletes;
