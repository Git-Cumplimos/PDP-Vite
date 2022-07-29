import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input";
import { usePinesVus } from "../../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { notify, notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";


const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const Participacion = () => {
  const { consultaPagoParticipacion, descargaArchivosS3 } = usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [table, setTable] = useState([]);
  const [formatMon, setFormatMon] = useState("");
  const [selected, setSelected] = useState("");
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [showModal, setShowModal] = useState(false)
  const [urlVoucher, setUrlVoucher] = useState("")

  const closeModal = useCallback(() => {
    setShowModal(false);
    setUrlVoucher("")
    setSelected("")
  }, []);


  const transacciones = useCallback(() => {
    if (
      (fechaInicial !== "") & (fechaFinal !== "")){
      consultaPagoParticipacion(
        roleInfo.id_comercio,
        fechaInicial,
        fechaFinal,
        pageData
      ).then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
          } else {
            console.log(res?.obj?.results)
            setTable(res?.obj?.results?.map((row) => {
              const fecha_registro = new Date(row?.fecha_registro);
              fecha_registro.setHours(fecha_registro.getHours() + 5);
              setFormatMon(row?.ValorPagar);
              return {
                Participante: row?.participante,
                // Banco: row?.banco,
                // "No cuenta": row?.num_cuenta,
                // "No transaccion": row?.num_transaccion,
                // "No aprobacion": row?.num_aprobacion,
                "Fecha pago": dateFormatter.format(fecha_registro),
                "Comercio": row?.id_comercio,
                Valor: formatMoney.format(row?.valor),
                // "voucher": row?.voucher
              };
            }));            
            setMaxPages(res?.obj?.maxPages);
          }
        })
        .catch((err) => console.log("error", err));
    }
  }, [pageData, fechaInicial,fechaFinal]);

  useEffect(() => {
    transacciones();
  }, [transacciones]);
  console.log(selected)
  const descargarVoucher = useCallback((datos) => {
    
    descargaArchivosS3(
      datos?.voucher
    ).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setUrlVoucher(res?.obj?.[0]?.url)
        }
      })
      .catch((err) => console.log("error", err));
    
  }, [pageData, fechaInicial,fechaFinal]);

  console.log(urlVoucher)
  return (
    <>
      <>
        <TableEnterprise
          title="Pagos participacion"
          maxPage={maxPages}
          headers={[
            "Participante",
            "Fecha pago",
            "Comercio",
            "Valor",
          ]}
          data={table || []}
          onSelectRow={(e, index) => {
              setSelected(table[index]);
              // descargarVoucher(table[index]);
              // setShowModal(true)
          }}
          onSetPageData={setPageData}
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            value={fechaInicial}
            onInput={(e) => setFechaInicial(e.target.value)}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => setFechaFinal(e.target.value)}
          />
        </TableEnterprise>
        <Modal show={showModal} handleClose={() => closeModal()}>
          <img src={urlVoucher} alt="Imagen no encontrada"/>
        </Modal>
      </>
    </>
  );
};
export default Participacion;