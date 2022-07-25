import { useState, useRef, useMemo, useEffect, useCallback} from "react";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Modal from "../../../components/Base/Modal";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";


const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const QX = () => {
  const { consultaPinesVus, con_estado_tipoPin, ingresarIdQX } = usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [table, setTable] = useState([]);
  const [selected, setSelected] = useState(true);
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("");
  const [showModal, setShowModal] = useState(false)
  const [documentoCliente, setDocumentoCliente] = useState("")
  const [idQX, setIdQX] = useState("")
  const [disabledBtns, setDisabledBtns] = useState(false)
  

 
  const consultaPines = useCallback(async (fecha_ini,fecha_fin,tipo,documento, pageData) => {
    if (
      (fecha_ini !== "") & (fecha_fin !== "") ||
      tipo != ""
    ) {
      consultaPinesVus(
        "",
        fecha_ini,
        fecha_fin,
        5, // Los pines que ya no pueden ser cancelados
        tipo,
        documento,
        pageData
      )
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
          } else {
            setTable(res?.obj?.results);
            setMaxPages(res?.obj?.maxPages);
          }
        })
        .catch((err) => console.log("error", err));
    }
  }, []);

  useEffect(() => {
    con_estado_tipoPin("tipo_pines_vus")
      .then((res) => {
        console.log(res);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setOptionsTipoPines(res?.obj?.results);
        }
      })
      .catch((err) => console.log("error", err));
  }, []);
  
  useEffect(() => {
    consultaPines(fechaInicial, fechaFinal, tipoPin, documentoCliente, pageData)
  }, [pageData])
  
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    ingresarIdQX(selected?.id_pin, idQX)
      .then((res) => {
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {  
          notify(res?.msg)       
          closeModal();
          setDisabledBtns(false);         
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setTable([])
    setIdQX("")
    consultaPines(fechaInicial,fechaFinal,tipoPin,documentoCliente,pageData)
  }, [fechaInicial,fechaFinal,tipoPin,documentoCliente,pageData]);

  return (
    <>
      <>
        <TableEnterprise
          title="Reporte Pines"
          maxPage={maxPages}
          headers={[
            "Cedula",
            "Id QX",
            "Creación",
            "Vencimiento",
            "Tramite",
            "Valor",
          ]}
          data={table?.map((row) => {
            const fecha_vencimiento = new Date(row?.fecha_vencimiento);
            fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
            const fecha_creacion = new Date(row?.fecha_creacion);
            fecha_creacion.setHours(fecha_creacion.getHours() + 5);
            // setFormatMon(row?.ValorPagar);
            return {
              // Id: row?.id_pin,
              Cedula: row?.doc_cliente,
              "Id QX": row.id_qx,
              //Estado: row?.name_estado_pin,
              // "Codigo Estado": row?.estado_pin,
              Creacion: dateFormatter.format(fecha_creacion),
              Vencimiento: dateFormatter.format(fecha_vencimiento),
              Tramite: row?.name_tramite === "" ? "" : row?.name_tramite,
              Valor: formatMoney.format(row?.valor*1.19 + row?.valor_tramite), // Valor + (IVA solo PIN)
            };
          }) || []}
          onSelectRow={(e, index) => {
            setSelected(table[index]);
            setIdQX(table[index]?.id_qx)
            setShowModal(true)
          }}
          onSetPageData={setPageData}
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            value={fechaInicial}
            onInput={(e) => {
              setFechaInicial(e.target.value)
              consultaPines(e.target.value,fechaFinal,tipoPin,documentoCliente, pageData)}}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value)
              consultaPines(fechaInicial,e.target.value,tipoPin,documentoCliente, pageData)}}
          />
          <Input
            id="documentoCliente"
            label="Documento"
            type="text"
            minLength="5"
            maxLength="12"
            autoComplete="off"
            value={documentoCliente}
            required
            onInput={(e) => {{
              setDocumentoCliente(e.target.value);
              consultaPines(fechaInicial,fechaFinal,tipoPin,e.target.value, pageData)
            }}}
          />
          <Select
            className="place-self-stretch"
            id="TipoPin"
            label="Tipo pin"
            options={
              Object.fromEntries([
                ["", ""],
                ...optionsTipoPines?.map(({ descripcion, id }) => {
                  return [descripcion, id];
                }),
              ]) || { "": "" }
            }
            value={tipoPin}
            required={true}
            onChange={(e) => {
              setTipoPin(parseInt(e.target.value) ?? "")
              consultaPines(fechaInicial,fechaInicial,parseInt(e.target.value) ?? "",documentoCliente, pageData)}}
          />
        </TableEnterprise>
        <Modal show={showModal} handleClose={() => closeModal()}>
        {
          <>
            <div className="flex flex-col w-1/2 mx-auto ">
              <h1 className="text-3xl mt-3 mx-auto">Datos del Pin</h1>
              <br></br>
              <h1 className="flex flex-row justify-center text-lg font-medium">{selected?.name_tramite}</h1>
              <br></br>
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Id Pin</h1>
                <h1>{selected?.id_pin}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Documento Cliente</h1>
                <h1>{selected?.doc_cliente}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Tramite</h1>
                <h1>{formatMoney.format(selected?.valor_tramite)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Iva Tramite</h1>
                <h1>{formatMoney.format(0)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Pin</h1>
                <h1>{formatMoney.format(selected?.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Iva Pin</h1>
                <h1>{formatMoney.format(selected?.valor*0.19)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Total</h1>
                <h1>{formatMoney.format(selected?.valor*1.19 + selected?.valor_tramite)}</h1>
              </div>
            </>
            </div>
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmit} grid>
                <Input
                  id="idQX"
                  label="Id QX"
                  type="text"
                  minLength="1"
                  maxLength="15"
                  autoComplete="off"
                  value={idQX}
                  required
                  onInput={(e) => {{
                    setIdQX(e.target.value);
                  }}}
                />
                <ButtonBar>
                  <Button type="submit">Cargar ID</Button>
                  <Button
                  onClick={() => {
                    closeModal()
                  }}                >
                  Cancelar
                </Button>                  
                </ButtonBar>
              </Form>
            </div>
          </>
        }
      </Modal>
      </>
    </>
  );
};
export default QX;
