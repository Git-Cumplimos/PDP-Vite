import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import fetchData from "../../../../src/utils/fetchData";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { notifyError } from "../../../utils/notify";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../components/Base/Tickets/Tickets";
import Table from "../../../components/Base/Table/Table";
import useForm from "../../../hooks/useForm";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";
import { useAuth, infoTicket } from "../../../hooks/AuthHooks";

const Reversos = () => {
  const {
    infoLoto: {},
    ingresoreversorecibo,
  } = useMujer();

  const { roleInfo } = useAuth();
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [selected, setSelected] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [value, setValue] = useState("");
  const [ticket, setTicket] = useState(false);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [comercio, setComercio] = useState("");
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [trxs, setTrxs] = useState([]);

  const [data, handleChange] = useForm({
    credit: "",
    reference: "",
  });

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

  const reversosFDLM = useCallback(
    (page, Comercio, Tipo_operacion, date_ini, date_end, state) => {
      const url = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones-view`;
      const queries = {};
      if (!(Comercio === -1 || Comercio === "")) {
        queries.Comercio = Comercio;
      }
      if (Tipo_operacion) {
        queries.Tipo_operacion = Tipo_operacion;
      }
      if (page) {
        queries.page = page;
      }
      if (date_ini && date_end) {
        queries.date_ini = date_ini;
        queries.date_end = date_end;
      }
      if (state !== undefined || state !== null) {
        queries.response_status = state;
      }

      fetchData(url, "GET", queries)
        .then((res) => {
          console.log(res);
          if (res?.status) {
            setMaxPages(res?.obj?.maxpages);
            setTrxs(res?.obj?.trxs);
          } else {
            throw new Error(res?.msg);
          }
        })
        .catch(() => {});
    },
    []
  );

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago(Reverso recaudo)",
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

  const closeModal = useCallback(async () => {
    setShowModal(false);
    handleChange();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const reverse = (e) => {
    e.preventDefault();
    const values = {
      tipo: roleInfo?.tipo_comercio,
      usuario: roleInfo?.id_usuario,
      comercio: roleInfo?.id_comercio,
      idtrx: selected?.id_transaccion,
      val: value,
      ...data,
    };
    console.log(values);
    ingresoreversorecibo(values)
      .then((res) => {
        console.log(res);
        notify("Reverso aplicado dentro de Punto De Pago y FDLM");
        setTicket(true);
        if (res?.status === false) {
          setTicket(false);
          console.log(res);
          if (res?.codigo === 420) {
            notifyError(
              "Reverso ya aplicado a el respectivo ID de transacción"
            );
          } else {
            notifyError(
              "Consulte soporte, servicio de Fundación de la mujer presenta fallas"
            );
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <h1 className="text-3xl mt-6">Reversos</h1>
      <Form grid>
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            setFechaInicial(e.target.value);
            if (fechaFinal !== "") {
              reversosFDLM(page, comercio, 5, e.target.value, fechaFinal, true);
            }
          }}
        />
        <Input
          id="dateInit"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            setFechaFinal(e.target.value);
            if (fechaFinal !== "") {
              reversosFDLM(
                page,
                comercio,
                5,
                fechaInicial,
                e.target.value,
                true
              );
            }
          }}
        />
        <Input
          id="nroComercio"
          label="ID Comercio"
          type="text"
          value={comercio}
          onInput={(e) => {
            if (e.target.value !== NaN) {
              setComercio(e.target.value);
              reversosFDLM(
                page,
                e.target.value,
                5,
                fechaInicial,
                fechaFinal,
                true
              );
            }
          }}
        />
      </Form>
      <Modal show={showModal} handleClose={() => closeModal()}>
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
          <>
            <>
              <h1 className="sm:text-center font-semibold">
                ¿Esta seguro del reverso de la obligación?
              </h1>
              <Form onSubmit={reverse} grid>
                <Input
                  id="idTrx"
                  name="idTrx"
                  label="ID de transacción"
                  type="text"
                  autoComplete="off"
                  value={selected?.id_transaccion}
                  disabled
                ></Input>
                <Input
                  id="nroCredito"
                  name="credit"
                  label="Número crédito"
                  type="text"
                  autoComplete="off"
                  minLength={"7"}
                  maxLength={"12"}
                  value={data?.credit ?? ""}
                  onInput={handleChange}
                  required
                ></Input>
                <MoneyInput
                  id="valCredito"
                  name="val"
                  label="Valor crédito"
                  type="text"
                  autoComplete="off"
                  maxLength={"15"}
                  value={value ?? ""}
                  onInput={(e, valor) => {
                    const num = valor || "";
                    setValue(num);
                  }}
                  required
                ></MoneyInput>
                <Input
                  id="refCredito"
                  name="reference"
                  label="Referencia"
                  type="text"
                  autoComplete="off"
                  value={data?.reference ?? ""}
                  onInput={handleChange}
                ></Input>
                <ButtonBar>
                  <Button type="submit">Aceptar</Button>
                </ButtonBar>
              </Form>
            </>
          </>
        )}
      </Modal>
      {Array.isArray(trxs) && trxs.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <ButtonBar className="col-span-1 md:col-span-2">
            <Button
              type="button"
              disabled={page < 2}
              onClick={() => {
                setPage(page - 1);
                reversosFDLM(
                  page - 1,
                  comercio,
                  5,
                  fechaInicial,
                  fechaFinal,
                  false
                );
              }}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={page >= maxPages}
              onClick={() => {
                setPage(page + 1);
                reversosFDLM(
                  page + 1,
                  comercio,
                  5,
                  fechaInicial,
                  fechaFinal,
                  false
                );
              }}
            >
              Siguiente
            </Button>
          </ButtonBar>
          <Table
            headers={["ID transacción", "Fecha", "Operación", "Monto"]}
            data={trxs.map(
              ({ id_transaccion, Created_at, Tipo_operacion, Monto }) => {
                const tempDate = new Date(Created_at);
                tempDate.setHours(tempDate.getHours() + 5);
                Created_at = Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(tempDate);
                Monto = formatMoney.format(Monto);
                return {
                  id_transaccion,
                  Created_at,
                  Tipo_operacion,
                  Monto,
                };
              }
            )}
            onSelectRow={(_e, index) => {
              setSelected(trxs[index]);
              setShowModal(true);
              setValue(trxs[index]?.Monto);
            }}
          />
        </>
      ) : (
        ""
      )}
    </>
  );
};
export default Reversos;
