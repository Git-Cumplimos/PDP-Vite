import { useCallback, useState, useRef, useMemo } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Select from "../../../components/Base/Select/Select";
import Table from "../../../components/Base/Table/Table";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "../../../utils/notify";
import Tickets from "../components/Voucher/Tickets";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";

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
  const { roleInfo } = useAuth();
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
        "Fecha de pago": "Fecha de pago",
        Hora: "Hora",
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": "Id devuelto cuando se ingresa el recibo",
        "Id Confirmación": "Id FDLM",
      }),
      commerceName: "FUNDACIÓN DE LA MUJER",
      trxInfo: Object.entries({
        CRÉDITO: "",
        VALOR: "$123.456",
      }),
      disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
    };
  }, [
    roleInfo?.ciudad,
    roleInfo?.direccion,
    roleInfo?.id_comercio,
    roleInfo?.id_dispositivo,
  ]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtn(false);
    setFormatMon("");
  }, []);

  const bankCollection = (e) => {
    e.preventDefault();
    setStop(true);

    const body = {
      Tipo: roleInfo?.tipo_comercio,
      Usuario: roleInfo?.id_usuario,
      Comercio: roleInfo?.id_comercio,
      Credito: table[0]?.Credito,
      Depto: roleInfo?.codigo_dane.slice(0, 2),
      Municipio: roleInfo?.codigo_dane.slice(2),
      Valor: parseFloat(formatMon),
      referenciaPago: referencia,
    };
    ingresorecibo(body)
      .then((res) => {
        if (res?.obj?.Confirmacion != -1) {
          console.log(res);
          setTicket(true);
          setStop(false);
        } else {
          notifyError(
            "El crédito no pudo ser recaudado, error al realizar el proceso"
          );
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
    setShowModal(false);
    const user = {
      Comercio: roleInfo?.id_comercio,
      Depto: roleInfo?.codigo_dane.slice(0, 2),
      Municipio: roleInfo?.codigo_dane.slice(2),
    };
    valorcuota(String(number), user)
      .then((res) => {
        console.log(res);
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

  return (
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
              setShowModal(true);
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
                  required
                  value={formatMon}
                  onInput={(e, valor) => {
                    console.log(valor);
                    const num = valor || "";
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
