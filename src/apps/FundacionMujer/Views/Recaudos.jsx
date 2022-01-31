import { useCallback, useState, useRef } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Select from "../../../components/Base/Select/Select";
import Table from "../../../components/Base/Table/Table";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets/Tickets";

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
  const [number, setNumber] = useState("");
  const [info, setInfo] = useState("");
  const [table, setTable] = useState("");
  const [cuota, setCuota] = useState("");
  const [estadoPrueba] = useState(false);
  const [money, setMoney] = useState("");
  const [referencia, setReferencia] = useState("");
  const [ticket, setTicket] = useState(false);
  const [comercio] = useState("");
  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState("");
  const [recauditoss, setRecauditoss] = useState("");

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

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtn(false);
  }, []);

  const bankCollection = (e) => {
    e.preventDefault();
    const body = {
      Credito: table[0]?.Credito,
      Depto: 1,
      Municipio: 1,
      Valor: parseFloat(money),
      referenciaPago: referencia,
    };
    ingresorecibo(body)
      .then((res) => {
        if (res?.obj?.Confirmacion != -1) {
          setTicket(true);
        } else {
          notifyError(
            "El crédito no pudo ser recaudado, error al realizar el proceso"
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //////////////////////
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    valorcuota(String(number))
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
        });
      })
      .catch((err) => {
        console.log(err);
      });
    mostrarcredito(String(number), tipobusqueda)
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
              Cedula: row.Cedula,
              Mensaje: row.Mensaje,
              Cliente: row.NombreCliente,
              Producto: row.NombreProducto,
              Credito: row.Nrocredito,
              Valor: formatMoney.format(row.ValorPagar),
            },
          ]);
          setMoney(row.ValorPagar);
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
          <Table
            headers={["Valor mínimo", "Valor máximo", "Valor a pagar"]}
            data={cuota || []}
          />
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
      <Modal show={showModal} handleClose={() => closeModal()}>
        {ticket !== true && (
          <>
            <h1 className="xl:text-center font-semibold">
              Resumen de la transacción
            </h1>
            <h2 className="sm:text-center font-semibold">
              Crédito {table[0]?.Credito}
            </h2>
          </>
        )}
        <>
          {ticket !== false ? (
            <div className="flex flex-col justify-center items-center">
              <Tickets refPrint={printDiv} />
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
              <Input
                id="numPago"
                label="Valor a pagar"
                type="number"
                autoComplete="off"
                required
                value={money}
                onInput={(e) => {
                  const num = e.target.value || "";
                  setMoney(num);
                }}
                info={`${formatMoney.format(table[0]?.Valor ?? 0)}`}
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
                <Button type="submit" disabled={disabledBtn}>
                  Realizar pago
                </Button>
              </ButtonBar>
            </Form>
          )}
        </>
      </Modal>
    </>
  );
};
export default Recaudo;
