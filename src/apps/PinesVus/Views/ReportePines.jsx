import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import Table from "../../../components/Base/Table";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "../../../utils/notify";
import Tickets from "../components/Voucher/Tickets";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import UsarPinForm from "../components/UsarPinForm/UsarPinForm";
import CancelPin from "../components/CancelPinForm/CancelPinForm";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const url_params = `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`;

const ReportePines = () => {
  const { consultaPinesVus, con_estado_tipoPin } = usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [parametroBusqueda, setParametroBusqueda] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [info, setInfo] = useState("");
  const [table, setTable] = useState("");
  const [formatMon, setFormatMon] = useState("");
  const [referencia, setReferencia] = useState("");
  const [ticket, setTicket] = useState(false);
  const [selected, setSelected] = useState(true);
  const [response, setResponse] = useState("");
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [optionsEstadoPin, setOptionsEstadoPin] = useState([]);
  const [estadoPin, setEstadoPin] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("");

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago(ReportePines)",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": response.id_trx,
        "Id Confirmación": response.Confirmacion,
      }),
      commerceName: "FUNDACIÓN DE LA MUJER",
      trxInfo: [
        ["CRÉDITO", selected?.Credito],
        ["VALOR", formatMoney.format(formatMon)],
        ["Cliente", selected?.Cliente],
        ["", ""],
        ["Cédula", selected?.Cedula],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [
    roleInfo?.ciudad,
    roleInfo?.direccion,
    roleInfo?.id_comercio,
    roleInfo?.id_dispositivo,
    response,
    formatMon,
    table,
  ]);

  const { infoTicket } = useAuth();

  useEffect(() => {
    infoTicket(response?.id_trx, 5, tickets);
  }, [infoTicket, response]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  useEffect(() => {
    if (
      (fechaInicial !== "") & (fechaFinal !== "") ||
      estadoPin !== "" ||
      tipoPin != ""
    ) {
      console.log(estadoPin);
      consultaPinesVus(
        "",
        fechaInicial,
        fechaFinal,
        estadoPin,
        tipoPin,
        pageData
      )
        .then((res) => {
          setTable("");
          setInfo(res);
          setDisabledBtn(false);
          if (res?.status == false) {
            notifyError(res?.msg);
          } else {
            setTable(
              res?.obj?.results?.map((row) => {
                const fecha_vencimiento = new Date(row?.fecha_vencimiento);
                fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
                setFormatMon(row?.ValorPagar);
                return {
                  Id: row?.id_pin,
                  Cedula: row?.doc_cliente,
                  Estado: row?.name_estado_pin,
                  "Codigo Estado": row?.estado_pin,
                  Vencimiento: dateFormatter.format(fecha_vencimiento),
                  Valor: formatMoney.format(row?.valor),
                };
              })
            );
            setMaxPages(res?.obj?.maxPages);
          }
        })
        .catch((err) => console.log("error", err));
    }
  }, [pageData, fechaFinal, fechaInicial, estadoPin, tipoPin]);

  useEffect(() => {
    con_estado_tipoPin("estado_pines_vus")
      .then((res) => {
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          setOptionsEstadoPin(res?.obj?.results);
        }
      })
      .catch((err) => console.log("error", err));

    con_estado_tipoPin("tipo_pines_vus")
      .then((res) => {
        console.log(res);
        if (res?.status === false) {
          notifyError(res?.msg);
        } else {
          setOptionsTipoPines(res?.obj?.results);
        }
      })
      .catch((err) => console.log("error", err));
  }, []);
  return (
    <>
      <>
        <TableEnterprise
          title="Información de credito"
          maxPage={maxPages}
          headers={[
            "Id",
            "Cedula",
            "Estado",
            "Codigo Estado",
            "Vencimiento",
            "Valor",
          ]}
          data={table || []}
          onSelectRow={(e, index) => {
            if (table[index]["Codigo Estado"] !== 1) {
              notifyError(table[index].Estado);
            } else {
              setSelected(table[index]);
            }
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
          <Select
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
            onChange={(e) => setTipoPin(parseInt(e.target.value) ?? "")}
          />
          <Select
            id="estadoPin"
            label="Estado del pin"
            options={
              Object.fromEntries([
                ["", ""],
                ...optionsEstadoPin?.map(({ descripcion, id }) => {
                  return [descripcion, id];
                }),
              ]) || { "": "" }
            }
            value={estadoPin}
            required={true}
            onChange={(e) => setEstadoPin(parseInt(e.target.value) ?? "")}
          />
          {/* {userPermissions
            .map(({ id_permission }) => id_permission)
            .includes(5) ? (
            <>
              <Input
                id="id_comercio"
                label="Id comercio"
                type="numeric"
                value={idComercio}
                onChange={(e) => {
                  setIdComercio(e.target.value);
                }}
                onLazyInput={{
                  callback: (e) => {},
                  timeOut: 500,
                }}
              />
              <Input
                id="id_usuario"
                label="Id usuario"
                type="numeric"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                }}
                onLazyInput={{
                  callback: (e) => {},
                  timeOut: 500,
                }}
              />
            </>
          ) : (
          "" )} */}
        </TableEnterprise>
      </>
    </>
  );
};
export default ReportePines;
