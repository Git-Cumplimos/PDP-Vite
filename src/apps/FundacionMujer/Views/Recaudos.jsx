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
import Tickets from "../components/Voucher/Tickets";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

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
      title: "Recibo de pago(Recaudo)",
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
          notifyError(res?.obj?.Mensaje);
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
    };
    valorcuota(String(number), user)
      .then((res) => {
        console.log(res);
        setPermiteCambio(res?.obj?.PermiteCambio);
        [res?.obj].map((row) => {
          setCuota([
            {
              min: formatMoney.format(row.ValorMin),
              max: formatMoney.format(row.ValorMaximo),
              cuota: formatMoney.format(row.ValorPagar),
            },
          ]);
          if (row.ValorPagar !== 0) {
            setCreditStatus(true);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    mostrarcredito(String(number), tipobusqueda, user)
      .then((res) => {
        console.log(res);
        setInfo(res);
        setDisabledBtn(false);
        if (res?.status == false) {
          notifyError(
            "Consulte soporte, servicio de Fundación de la mujer presenta fallas"
          );
        }
        [res?.obj].map((row) => {
          setTable([
            {
              Cedula: row?.Cedula,
              Mensaje: row?.Mensaje,
              Cliente: row?.NombreCliente,
              Producto: row?.NombreProducto,
              Credito: row?.Nrocredito,
              Valor: formatMoney.format(row?.ValorPagar),
            },
          ]);
          setFormatMon(row?.ValorPagar);
        });
      })
      .catch((err) => console.log("error", err));
  };
  console.log(roleInfo);
  return (
    <>
      {"id_comercio" in roleInfo ? (
        <>
          <h1 className="text-3xl mt-6">Recaudo Fundación de la mujer</h1>
          <Form onSubmit={onSubmit} grid>
            <Select
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
            />
            {tipobusqueda?.length > 0 && (
              <Input
                id="numpin"
                label={label}
                type="text"
                minLength="7"
                maxLength="12"
                autoComplete="off"
                value={number}
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  setNumber(num);
                }}
              />
            )}
            <ButtonBar className="col-auto md:col-span-2">
              <Button type="submit" disabled={disabledBtn}>
                Consultar recaudos
              </Button>
            </ButtonBar>
          </Form>
        </>
      ) : (
        <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
      )}

      {info?.status && (
        <>
          {creditStatus && (
            <Table
              headers={["Valor mínimo", "Valor máximo", "Valor a pagar"]}
              data={cuota || []}
            />
          )}
          <br />
          <Table
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
              if (info?.obj?.NroMensaje === 1) {
                setShowModal(true);
              }
            }}
          />
        </>
      )}
      {info?.obj?.NroMensaje === 1 && (
        <Modal show={showModal} handleClose={() => closeModal()}>
          {ticket !== true && (
            <>
              <h1 className="xl:text-center font-semibold">
                Resumen de la transacción
              </h1>
              <h2 className="sm:text-center font-semibold">
                Crédito # {table[0]?.Credito}
              </h2>
            </>
          )}
          <>
            {ticket !== false ? (
              <div className="flex flex-col justify-center items-center">
                <Tickets refPrint={printDiv} ticket={tickets} />
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handlePrint();
                    }}
                  >
                    Imprimir
                  </Button>
                  <Button
                    onClick={() => {
                      closeModal();
                      setTicket(false);
                    }}
                  >
                    Cerrar
                  </Button>
                </ButtonBar>
              </div>
            ) : (
              <Form onSubmit={bankCollection}>
                <MoneyInput
                  id="numPago"
                  label="Valor a pagar"
                  type="number"
                  autoComplete="off"
                  max={paraMax}
                  min={paraMin}
                  required
                  value={formatMon}
                  disabled={permiteCambio == "N"}
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
                <Input
                  id="refPago"
                  label="Referencia pago"
                  type="text"
                  maxLength="15"
                  autoComplete="off"
                  value={referencia}
                  onInput={(e) => {
                    const ref = String(e.target.value) || "";
                    setReferencia(ref);
                  }}
                />
                <ButtonBar>
                  <Button type="submit" disabled={stop}>
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
