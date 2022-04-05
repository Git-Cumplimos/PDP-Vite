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
  console.log(fecha);
  const fecha_ini = fecha.toISOString();
  console.log(fecha_ini);

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
  const [showArqueo, setShowArqueo] = useState(false);
  const [id_arqueo, setId_arqueo] = useState("");
  const { roleInfo } = useAuth();

  console.log(roleInfo);
  const { con_SortVentas_S3 } = useLoteria();
  const [showModal2, setShowModal2] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    crearArqueoBilletes(fecha_ini, fracDisp, total, id_arqueo).then((res) => {
      if (res.status === false) {
        notifyError(res.msg);
        setShowArqueo(false);
        consultaArqueoBilletes(fecha_ini, fecha_fin).then((res) => {
          if (res.status === false) {
            notifyError(res.msg);
            // setDisabledBtns(true);
          } else {
            console.log(res);
            // setResp_report(res.data);
            setId_arqueo(res?.obj?.data?.[0].id_arqueo);
            // setDisabledBtns(false);
          }
        });
        // setDisabledBtns(true);
      } else {
        // setResp_report(res.data);
        setShowArqueo(true);
        notify(res.msg);
        consultaArqueoBilletes(fecha_ini, fecha_fin).then((res) => {
          if (res.status === false) {
            notifyError(res.msg);
            // setDisabledBtns(true);
          } else {
            console.log(res);
            // setResp_report(res.data);
            setId_arqueo(res?.obj?.data?.[0].id_arqueo);
            // setDisabledBtns(false);
          }
        });
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
    async (fecha_ini, fracDisp, total, id_arqueo) => {
      try {
        const body = {
          cod_distribuidor: roleInfo?.cod_oficina_lot,
          cod_sucursal: roleInfo?.cod_sucursal_lot,
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          fecha: fecha_ini.substr(0, 10),
          frac_vendidas: total === null ? 0 : total?.total_frac,
          val_total: total === null ? 0 : total?.val_total,
          fracciones_restantes: fracDisp,
        };

        if (id_arqueo) {
          body.id_arqueo = id_arqueo;
        } else {
          body.id_arqueo = "";
        }

        const res = await fetchData(url_Arqueobilletes, "POST", {}, body);

        return res;
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const consultaArqueoBilletes = useCallback(async (fecha_ini, fecha_fin) => {
    try {
      const query = {
        id_comercio: roleInfo?.id_comercio,
        // id_usuario: roleInfo?.id_usuario,
        // id_terminal: roleInfo?.id_dispositivo,
        fecha_ini: fecha_ini.substr(0, 10),
        fecha_fin: fecha_fin.substr(0, 10),
      };
      const res = await fetchData(url_Arqueobilletes, "GET", query);

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

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

  useEffect(() => {
    consultaArqueoBilletes(fecha_ini, fecha_fin).then((res) => {
      if (res.status === false) {
        notifyError(res.msg);
        // setDisabledBtns(true);
      } else {
        console.log(res);
        // setResp_report(res.data);
        setId_arqueo(res?.obj?.data?.[0].id_arqueo);
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

  return (
    <>
      <Form formDir="col" onSubmit={onSubmit}>
        {showArqueo ? (
          <>
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
          </>
        ) : (
          ""
        )}

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
