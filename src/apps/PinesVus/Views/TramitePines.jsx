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

const TramitePines = () => {
  const { consultaPinesVus } = usePinesVus();

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
  const [modalUsar, setModalUsar] = useState("");
  const [modalCancel, setModalCancel] = useState("");
  const [response, setResponse] = useState("");
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [valor, setValor] = useState("");
  const [id_trx, setId_trx] = useState("");

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
    setModalUsar(false);
    setModalCancel(false);
    setParametroBusqueda("");
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
    consultaPinesVus(parametroBusqueda, "", "", "", pageData)
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
                "Codigo Estado": row?.estado_pin,
                Vencimiento: dateFormatter.format(fecha_vencimiento),
                Valor: formatMoney.format(row?.valor),
              };
            })
          );
          setMaxPages(res?.obj?.maxPages);
          setValor(res?.obj?.results?.[0]?.valor);
          setId_trx(res?.obj?.results?.[0]?.id_trx?.creacion);
        }
      })
      .catch((err) => console.log("error", err));
  };

  // useEffect(() => {
  //   if (info !== "") {
  //     consultaPinesVus(parametroBusqueda, pageData)
  //       .then((res) => {
  //         console.log(res);
  //         setInfo(res);
  //         setDisabledBtn(false);
  //         if (res?.status == false) {
  //           notifyError(res?.msg);
  //         } else {
  //           setTable(
  //             res?.obj?.results?.map((row) => {
  //               console.log(row);
  //               const fecha_vencimiento = new Date(row?.fecha_vencimiento);
  //               fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
  //               setFormatMon(row?.ValorPagar);
  //               return {
  //                 Id: row?.id_pin,
  //                 Cedula: row?.doc_cliente,
  //                 Estado: row?.name_estado_pin,
  //                 "Codigo Estado": row?.estado_pin,
  //                 Vencimiento: dateFormatter.format(fecha_vencimiento),
  //                 Valor: formatMoney.format(row?.valor),
  //               };
  //             })
  //           );
  //           setMaxPages(res?.obj?.maxPages);
  //         }
  //       })
  //       .catch((err) => console.log("error", err));
  //   }
  // }, [pageData]);

  const onSubmitUsar = (e) => {
    setModalUsar(true);
  };

  return (
    <>
      {"id_comercio" in roleInfo ? (
        <div className="flex flex-col w-1/2 mx-auto">
          <>
            <h1 className="text-3xl mt-6 mx-auto">Tramitar Pines Vus</h1>
            <br></br>
            <Form onSubmit={onSubmit} grid>
              <Input
                id="paramBusqueda"
                label="Codigo"
                type="text"
                minLength="10"
                maxLength="10"
                autoComplete="off"
                value={parametroBusqueda}
                onInput={(e) => {
                  setParametroBusqueda(e.target.value);
                }}
              />
              <ButtonBar className="col-auto md:col-span-2">
                <Button type="submit" disabled={disabledBtn}>
                  Consultar Pin
                </Button>
              </ButtonBar>
            </Form>
          </>
        </div>
      ) : (
        <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
      )}

      {info?.status && (
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
                setShowModal(true);
              }
            }}
            onSetPageData={setPageData}
          ></TableEnterprise>
        </>
      )}
      <Modal show={showModal} handleClose={() => closeModal()}>
        {(modalUsar !== true) & (modalCancel !== true) ? (
          <>
            <div className="flex flex-col w-1/2 mx-auto ">
              <h1 className="text-3xl mt-3 mx-auto">Datos del Pin</h1>
              <br></br>
              {Object.entries(selected).map(([key, val]) => {
                return (
                  <>
                    <div
                      className="flex flex-row justify-between text-lg font-medium"
                      key={key}
                    >
                      <h1>{key}</h1>
                      <h1>{val}</h1>
                    </div>
                  </>
                );
              })}
            </div>
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmitUsar}>
                <ButtonBar>
                  <Button type="submit">Usar pin</Button>
                  <Button
                    onClick={() => {
                      setModalCancel(true);
                    }}
                  >
                    Cancelar pin
                  </Button>
                </ButtonBar>
              </Form>
            </div>
          </>
        ) : (
          ""
        )}
        {modalUsar === true ? (
          <UsarPinForm
            respPin={selected}
            valor={valor}
            trx={id_trx}
            closeModal={closeModal}
          ></UsarPinForm>
        ) : (
          ""
        )}
        {modalCancel === true ? (
          <CancelPin
            respPin={selected}
            valor={valor}
            trx={id_trx}
            closeModal={closeModal}
          ></CancelPin>
        ) : (
          ""
        )}
      </Modal>
    </>
  );
};
export default TramitePines;
