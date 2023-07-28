import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import Table from "../../../components/Base/Table";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { enumParametrosFundacion } from "../utils/enumParametrosFundacion";
import { useNavigate } from "react-router-dom";

const url_params = `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`;

const Recaudo = () => {
  const {
    infoLoto: {},
    mostrarcredito,
    ingresorecibo,
    valorcuota,
  } = useMujer();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const navigate = useNavigate();

  const [label, setLabel] = useState("");
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
  const [tickets, setTickets] = useState("");
  const [valueValor, setValueValor] = useState(false);
  

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

  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de pago(Recaudo)",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],
      ["Id Trx", ""],
      ["Id Aut", ""],
      /*ciudad*/
      ["Comercio", roleInfo?.["nombre comercio"]],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["", ""],
    ],
    commerceName: "FUNDACIÓN DE LA MUJER",
    trxInfo: [],
    disclamer:
      "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  });
  // const tickets = useMemo(() => {
  //   return {
  //     title: "Recibo de pago(Recaudo)",
  //     timeInfo: {
  //       "Fecha de pago": Intl.DateTimeFormat("es-CO", {
  //         year: "numeric",
  //         month: "numeric",
  //         day: "numeric",
  //       }).format(new Date()),
  //       Hora: Intl.DateTimeFormat("es-CO", {
  //         hour: "numeric",
  //         minute: "numeric",
  //         second: "numeric",
  //         hour12: false,
  //       }).format(new Date()),
  //     },
  //     commerceInfo: Object.entries({
  //       "Id Comercio": roleInfo?.id_comercio,
  //       "No. terminal": roleInfo?.id_dispositivo,
  //       Municipio: roleInfo?.ciudad,
  //       Dirección: roleInfo?.direccion,
  //       "Id Trx": response.id_trx,
  //       "Id Confirmación": response.Confirmacion,
  //     }),
  //     commerceName: "FUNDACIÓN DE LA MUJER",
  //     trxInfo: [
  //       ["CRÉDITO", selected?.Credito],
  //       ["VALOR", formatMoney.format(formatMon)],
  //       ["Cliente", selected?.Cliente],
  //       ["", ""],
  //       ["Cédula", selected?.Cedula],
  //       ["", ""],
  //     ],
  //     disclamer:
  //       "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  //   };
  // }, [
  //   roleInfo?.ciudad,
  //   roleInfo?.direccion,
  //   roleInfo?.id_comercio,
  //   roleInfo?.id_dispositivo,
  //   response,
  //   formatMon,
  //   table,
  // ]);

  // const { infoTicket } = useAuth();
  
  const params = useCallback(async () => {
    const queries = { tipo_op: 5 };
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

  // useEffect(() => {
  //   infoTicket(response?.id_trx, 5, tickets);
  // }, [infoTicket, response]);

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
    setValueValor(false);
    setPermiteCambio("");
    setCuota("");
    setValueValor(false);
  }, []);

  const bankCollection = (e) => {
    e.preventDefault();
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    let objTicket = {};
    objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["trxInfo"] = [];
    objTicket["trxInfo"].push(["CRÉDITO", selected?.Credito]);
    objTicket["trxInfo"].push(["VALOR", formatMoney.format(formatMon)]);
    objTicket["trxInfo"].push(["Cliente", selected?.Cliente]);
    objTicket["trxInfo"].push(["", ""]);
    objTicket["trxInfo"].push(["Cédula", selected?.Cedula]);
    objTicket["trxInfo"].push(["", ""]);

    setStop(true);
    let tipo_comercio = roleInfo?.tipo_comercio;
    if (roleInfo?.tipo_comercio === "KIOSCO") {
      tipo_comercio = "OFICINAS PROPIAS";
    }

    const body = {
      Tipo: tipo_comercio,
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
      ticket: objTicket,
    };
    ingresorecibo(body)
      .then((res) => {
        if (res?.status === true) {
          setResponse(res?.obj);
          objTicket["commerceInfo"][2] = ["Id Trx", res?.obj?.id_trx];
          objTicket["commerceInfo"][3] = ["Id Aut", res?.obj?.Confirmacion];
          setTickets(objTicket);
          setTicket(true);
          setStop(false);
        } else {
          closeModal();
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
    setCreditStatus(false);
    setInfo("");
    const user = {
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      Depto: roleInfo?.codigo_dane?.slice(0, 2),
      Municipio: roleInfo?.codigo_dane?.slice(2),
      TipoBusqueda: tipobusqueda,
      Credito: parseFloat(number),
    };
    mostrarcredito(String(number), tipobusqueda, user)
      .then((res) => {
        setInfo(res);
        setDisabledBtn(false);
        if (res?.status === false) {
          notifyError(
            "Consulte soporte, servicio de Fundación de la mujer presenta fallas"
          );
        }
        if (tipobusqueda === "2") {
          valorcuota(String(number), user, res)
            .then((res) => {
              setPermiteCambio(res?.obj?.PermiteCambio);
              setCuota(res?.obj);
              setValueValor(true);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        [res?.obj].map((row) => {
          setTable([
            {
              Cedula: row?.Cedula,
              Mensaje: row?.Mensaje,
              Cliente: row?.NombreCLiente1,
              Producto: row?.NombreProducto,
              Credito: row?.Nrocredito,
              Valor: formatMoney.format(row?.ValorPagar1),
            },
          ]);
          setFormatMon(row?.ValorPagar1);
        });        
      })
      .catch((err) => console.log("error", err));
  };

  return (
    <>
      <>
        <h1 className='text-3xl mt-6'>Recaudo Fundación de la mujer</h1>
        <Form onSubmit={onSubmit} grid>
          <Select
            id='searchBySorteo'
            label='Tipo de busqueda'
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
              if (e.target.value === 1) {
                setLabel("Documento");
              }
              if (e.target.value === 2) {
                setLabel("Número crédito");
              }
            }}
          />
          {tipobusqueda?.length > 0 && (
            <Input
              id='numpin'
              label={label}
              type='text'
              minLength='5'
              maxLength='12'
              autoComplete='off'
              value={number}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setNumber(num);
              }}
            />
          )}
          <ButtonBar className='col-auto md:col-span-2'>
            <Button type='submit' disabled={disabledBtn}>
              Consultar recaudos
            </Button>
          </ButtonBar>
        </Form>
      </>
      {info?.status && (
        <>
          <br />
          <TableEnterprise
            title='Información de credito'
            headers={[
              "Cédula",
              "Mensaje",
              "Cliente",
              "Producto",
              "Crédito",
              "Valor a pagar",
            ]}
            data={table || []}
            onSelectRow={(e, index) => {
              setSelected(table[index]);
              if (info?.obj?.Nromensaje1 === 1) {
                setShowModal(true);
              }
            }}
          ></TableEnterprise>
        </>
      )}
      {info?.obj?.Nromensaje1 === 1 && (
        <Modal show={showModal} handleClose={() => closeModal()}>
          {ticket !== true && (
            <>
              <h1 className='xl:text-center font-semibold'>
                Resumen de la transacción
              </h1>
              <h2 className='sm:text-center font-semibold'>
                Crédito # {table[0]?.Credito}
              </h2>
            </>
          )}
          <>
            {ticket !== false ? (
              <div className='flex flex-col justify-center items-center'>
                <Tickets refPrint={printDiv} ticket={tickets} />
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handlePrint();
                    }}>
                    Imprimir
                  </Button>
                  <Button
                    onClick={() => {
                      closeModal();
                      setTicket(false);
                    }}>
                    Cerrar
                  </Button>
                </ButtonBar>
              </div>
            ) : (
              <Form grid onSubmit={bankCollection}>
                <>
                <h2>{`Nombre del Cliente: ${
                  info?.obj?.NombreCLiente1 ?? ""
                }`}
                </h2>
                <h2>{`Documento del Cliente: ${
                  info?.obj?.Cedula ?? ""
                }`}
                </h2>
                </>
                {valueValor !== false ? (
                  <>
                    <h2>{`Valor de pago mínimo: ${formatMoney.format(
                      cuota?.ValorPagarMin
                    )}`}</h2>
                    <h2>{`Valor de pago máximo: ${formatMoney.format(
                      cuota?.ValorPagarMaximo
                    )}`}</h2>
                    <h2>{`Valor de pago total: ${formatMoney.format(
                      cuota?.ValorPagar
                    )}`}</h2>
                  </>
                ): ""}
                <MoneyInput
                  id='numPago'
                  label='Valor a pagar'
                  type='number'
                  autoComplete='off'
                  max={paraMax}
                  min={paraMin}
                  required
                  value={formatMon}
                  disabled={permiteCambio === "N"}
                  onInput={(e, valor) => {
                    const num = valor || "";
                    if (num > paraMax || num < paraMin) {
                      setStop(true);
                    } else {
                      setStop(false);
                    }
                    setFormatMon(num);
                  }}
                />
                <ButtonBar>
                  <Button type='submit' disabled={stop}>
                    Realizar pago
                  </Button>
                </ButtonBar>
              </Form>
            )}
          </>
        </Modal>
      )}
    </>
  );
};
export default Recaudo;
