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

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

const url_params = `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`;

const TramitePines = () => {
  const {
    infoLoto: {},
    consultaPinesVus,
    ingresorecibo,
    valorcuota,
  } = usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [parametroBusqueda, setParametroBusqueda] = useState("");
  const [tipobusqueda, setTiposBusqueda] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [stop, setStop] = useState("");
  const [number, setNumber] = useState("");
  const [info, setInfo] = useState("");
  const [table, setTable] = useState("");
  const [cuota, setCuota] = useState("");
  const [creditStatus, setCreditStatus] = useState(false);
  const [formatMon, setFormatMon] = useState("");
  const [referencia, setReferencia] = useState("");
  const [ticket, setTicket] = useState(false);
  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState("");
  const [response, setResponse] = useState("");
  const { roleInfo } = useAuth();
  const [permiteCambio, setPermiteCambio] = useState("");
  const [paraMax, setParaMax] = useState(null);
  const [paraMin, setParaMin] = useState(null);
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

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
      title: "Recibo de pago(TramitePines)",
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

  const params = useCallback(async () => {
    const queries = { tipo_op: 5 };
    console.log(queries);
    try {
      const res = await fetchData(url_params, "GET", queries);
      if ("Parametros" in res?.obj?.[0]) {
        setParaMax(res?.obj?.[0].Parametros.monto_maximo);
        setParaMin(res?.obj?.[0].Parametros.monto_minimo);
      } else {
        setParaMax(10000000);
        setParaMin(0);
      }

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);
  useEffect(() => {
    params();
  }, [info]);

  useEffect(() => {
    infoTicket(response?.id_trx, 5, tickets);
  }, [infoTicket, response]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtn(false);
    setFormatMon("");
    setCreditStatus(false);
    setInfo("");
    setTicket(false);
    setReferencia("");
  }, []);

  const bankCollection = (e) => {
    e.preventDefault();
    setStop(true);

    const body = {
      Tipo: roleInfo?.tipo_comercio,
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      Credito: selected?.Credito,
      Depto: roleInfo?.codigo_dane.slice(0, 2),
      Municipio: roleInfo?.codigo_dane.slice(2),
      Valor: parseFloat(formatMon),
      referenciaPago: referencia,
      cliente: selected?.Cliente,
      cedula: selected?.Cedula,
      nombre_comercio: roleInfo?.["nombre comercio"],
    };
    console.log(body);
    ingresorecibo(body)
      .then((res) => {
        if (res?.status == true) {
          console.log(res);
          setResponse(res?.obj);
          setTicket(true);
          setStop(false);
        } else {
          console.log(res);
          notifyError(res?.msg);
          setStop(false);
        }
      })
      .catch((err) => {
        notifyError("Se ha presentado un error, intente mas tarde", err);
      });
  };

  //////////////////////
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    // setCreditStatus(false);
    setInfo("");
    // const user = {
    //   Usuario: roleInfo?.id_usuario,
    //   Dispositivo: roleInfo?.id_dispositivo,
    //   Comercio: roleInfo?.id_comercio,
    //   Depto: roleInfo?.codigo_dane?.slice(0, 2),
    //   Municipio: roleInfo?.codigo_dane?.slice(2),
    // };
    consultaPinesVus(parametroBusqueda, pageData)
      .then((res) => {
        console.log(res);
        setInfo(res);
        setDisabledBtn(false);
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          setTable(
            res?.obj?.results?.map((row) => {
              console.log(row);
              const fecha_vencimiento = new Date(row?.fecha_vencimiento);
              fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
              setFormatMon(row?.ValorPagar);
              return {
                Id: row?.id_pin,
                Cedula: row?.doc_cliente,
                Estado: row?.name_estado_pin,
                Vencimiento: dateFormatter.format(fecha_vencimiento),
                Valor: formatMoney.format(row?.valor),
              };
            })
          );
          setMaxPages(res?.obj?.maxPages);
        }
      })
      .catch((err) => console.log("error", err));
  };

  const onChangeTable = (e) => {
    e.preventDefault();
    setInfo("");
    consultaPinesVus(parametroBusqueda, pageData)
      .then((res) => {
        console.log(res);
        setInfo(res);
        if (res?.status == false) {
          notifyError(res?.msg);
        } else {
          setTable(
            res?.obj?.results?.map((row) => {
              console.log(row);
              const fecha_vencimiento = new Date(row?.fecha_vencimiento);
              fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
              setFormatMon(row?.ValorPagar);
              return {
                Id: row?.id_pin,
                Cedula: row?.doc_cliente,
                Estado: row?.name_estado_pin,
                Vencimiento: dateFormatter.format(fecha_vencimiento),
                Valor: formatMoney.format(row?.valor),
              };
            })
          );
          setMaxPages(res?.obj?.maxPages);
        }
      })
      .catch((err) => console.log("error", err));
  };

  console.log(maxPages);
  return (
    <>
      {"id_comercio" in roleInfo ? (
        <>
          <h1 className="text-3xl mt-6">Tramitar Pines Vus</h1>
          <Form onSubmit={onSubmit} grid>
            {/* <Select
              id="searchBySorteo"
              label="Tipo de busqueda"
              options={[
                { value: "", label: "" },
                {
                  value: 1,
                  label: `Documento`,
                },
                {
                  value: 2,
                  label: `Nº credito`,
                },
              ]}
              value={tipobusqueda}
              onChange={(e) => {
                setTiposBusqueda(e.target.value);
                if (e.target.value == 1) {
                  setLabel("Documento");
                }
                if (e.target.value == 2) {
                  setLabel("Número crédito");
                }
              }}
            /> */}
            <Input
              id="paramBusqueda"
              label="Documento"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
              value={parametroBusqueda}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setParametroBusqueda(num);
              }}
            />
            <ButtonBar className="col-auto md:col-span-2">
              <Button type="submit" disabled={disabledBtn}>
                Consultar Pin
              </Button>
            </ButtonBar>
          </Form>
        </>
      ) : (
        <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
      )}

      {info?.status && (
        <>
          <TableEnterprise
            title="Información de credito"
            maxPage={maxPages}
            onChange={onChangeTable}
            headers={["Id", "Cedula", "Estado", "Vencimiento", "Valor"]}
            data={table || []}
            onSelectRow={(e, index) => {
              setSelected(table[index]);
              if (info?.obj?.NroMensaje === 1) {
                setShowModal(true);
              }
            }}
            onSetPageData={setPageData}
          ></TableEnterprise>
        </>
      )}
      {info?.obj?.NroMensaje === 1 && (
        <Modal show={showModal} handleClose={() => closeModal()}></Modal>
      )}
    </>
  );
};
export default TramitePines;
