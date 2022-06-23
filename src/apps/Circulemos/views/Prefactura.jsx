import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Base/Modal";
import Input from "../../../components/Base/Input";
import Button from "../../../components/Base/Button";
import MoneyInput from "../../../components/Base/MoneyInput";
import { pagarPrefactura } from "../utils/fetchCirculemos";
import { useAuth } from "../../../hooks/AuthHooks";
import { useReactToPrint } from "react-to-print";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Tickets from "../../../components/Base/Tickets";
import ButtonBar from "../../../components/Base/ButtonBar";

const Prefactura = ({
  prefacturaInfo,
  numero,
  totalPrefactura,
  setPrefactura,
}) => {
  const { roleInfo, infoTicket } = useAuth();
  const navigate = useNavigate();
  const [payment, setPayment] = useState("");
  const [type, setType] = useState("");
  const [total, setTotal] = useState("");
  const [ticket, setTicket] = useState(false);
  const [summary, setSummary] = useState("");

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const paymentType = (e) => {
    setType(e);
  };

  const closeModal = () => {
    setPayment(false);
    setTotal("");
    setTicket(false);
    setType("");
    navigate(-1);
  };

  const paymentGuide = () => {
    setTotal(prefacturaInfo?.prefacturas[0]?.valorTotal);
    setPayment(true);
  };

  const tickets = useMemo(() => {
    return {
      title: "Recibo de compra",
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
        "Id Transacción": summary?.obj?.id_trx,
      }),
      commerceName: "Consorcio Circulemos",
      trxInfo: [
        ,
        ["", ""],
        ["Total prefactura", formatMoney.format(totalPrefactura)],
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
    summary,
  ]);

  const headers = [
    "Código",
    "Naturaleza",
    "Nombre",
    "Tipo saldo",
    "Unidades a liquidar",
    "Valor unitario",
    "Valor total",
  ];

  const pagarPrefac = () => {
    const body = {
      persona: {
        tipoIdentificacion: {
          codigo:
            prefacturaInfo?.prefacturas?.[0]?.solicitante
              ?.codigoTipoIdentificacion,
        },
        numeroDocumento:
          prefacturaInfo?.prefacturas?.[0]?.solicitante?.numeroIdentificacion,
        nombre1: "Esteban",
        apellido1: "Heredia",
      },
      tipoPago: {
        codigo: "01",
      },
      medioRecaudo: "2",
      numeroSoporte: "1010",
      numeroPrefactura: numero,
      valorPago: prefacturaInfo?.prefacturas?.[0]?.valorTotal,
      organismoTransito: {
        codigoOrganismo: "13001000",
      },
      origenTransaccion: 1,
      username: "usuario4",
      password: "ithfnc45",
      codigoOrganismo: "13001000",
      origen: "c1",
      id_usuario: roleInfo.id_usuario,
      id_terminal: roleInfo.id_dispositivo,
      id_comercio: roleInfo.id_comercio,
    };
    pagarPrefactura(body)
      .then((res) => {
        console.log(res);
        if (res?.status) {
          setTicket(true);
          setSummary(res);
          infoTicket(res?.obj?.id_trx, res?.obj?.tipo_trx, tickets);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {}, [totalPrefactura]);
  return (
    <>
      <div>
        {prefacturaInfo?.prefacturas?.map(
          ({
            carteraWSDTO,
            codigoOrganismo,
            detalle,
            estadoPrefactura,
            fechaLiquidacion,
            fechaVencimiento,
            numeroLiquidacion,
            numeroPrefactura,
            solicitante,
            tramites,
            valorTotal,
          }) => {
            return (
              <div className="w-full flex flex-col justify-center items-center my-8">
                <h1 className="text-3xl">Circulemos</h1>
                <Form className="my-4" grid={false}>
                  <Fieldset legend="Usuario" className="lg:col-span-2">
                    <Input
                      value={solicitante?.numeroIdentificacion}
                      label="Identificación"
                      disabled
                    ></Input>
                    <Input
                      value={solicitante?.codigoTipoIdentificacion}
                      label="Tipo identificación"
                      disabled
                    ></Input>
                    <Input
                      value={estadoPrefactura}
                      label="Estado prefactura"
                      disabled
                    ></Input>
                    <Input
                      value={codigoOrganismo}
                      label="Código organismo"
                      disabled
                    ></Input>
                  </Fieldset>
                  <Fieldset legend="Datos generales" className="lg:col-span-2">
                    <Input
                      value={carteraWSDTO}
                      label="Cartera"
                      disabled
                    ></Input>
                    <Input value={detalle} label="Detalle" disabled></Input>
                    <Input
                      value={fechaLiquidacion}
                      label="Fecha liquidación"
                      disabled
                    ></Input>
                    <Input
                      value={fechaVencimiento}
                      label="Fecha vencimiento"
                      disabled
                    ></Input>
                    <Input
                      value={numeroLiquidacion}
                      label="Número de liquidación"
                      disabled
                    ></Input>
                    <Input
                      value={numeroPrefactura}
                      label="Número prefactura"
                      disabled
                    ></Input>
                  </Fieldset>
                  <Fieldset legend="Tramites" className="lg:col-span-2">
                    {tramites?.map(
                      ({
                        cantidad,
                        codigoTramite,
                        radicadoSolicitud,
                        idTramite,
                        referencias,
                      }) => {
                        return (
                          <>
                            <PaymentSummary
                              title="Resumen de tramites para prefactura"
                              subtitle="Consorcio circulemos"
                              summaryTrx={{
                                "id Tramite": idTramite,
                                Cantidad: cantidad,
                                "Codigo tramite": codigoTramite,
                                "Radicado solicitud": radicadoSolicitud,
                                Referencias: referencias?.map((row) => {
                                  return row;
                                }),
                              }}
                            ></PaymentSummary>
                          </>
                        );
                      }
                    )}
                  </Fieldset>
                  {tramites?.map(({ conceptos }) => {
                    return (
                      <TableEnterprise
                        title="Conceptos"
                        headers={headers}
                        data={conceptos?.map(
                          ({
                            codigo,
                            naturaleza,
                            nombre,
                            tipoSaldo,
                            unidadesALiquidar,
                            valorUnitario,
                            valorTotal,
                          }) => {
                            const vU = formatMoney.format(valorUnitario);
                            const vT = formatMoney.format(valorTotal);
                            return {
                              codigo,
                              naturaleza,
                              nombre,
                              tipoSaldo,
                              unidadesALiquidar,
                              vU,
                              vT,
                            };
                          }
                        )}
                      ></TableEnterprise>
                    );
                  })}

                  <Fieldset className="lg:col-span-2">
                    <div className="justify-center">
                      <h1 className="text-3xl w-full flex flex-col justify-center items-center">
                        Valor total:{formatMoney.format(valorTotal)}
                      </h1>
                    </div>
                  </Fieldset>
                  <Button type="button" onClick={paymentGuide}>
                    Pagar
                  </Button>
                </Form>
              </div>
            );
          }
        )}
      </div>
      <Modal show={payment} handleClose={closeModal}>
        {!ticket && (
          <>
            <h1>Metodos de pago</h1>
            <br />
            <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
              Efectivo
              <input
                id="Efectivo"
                value="efectivo"
                name="pago"
                type="radio"
                onChange={(e) => paymentType(e.target.value)}
              />
              Tarjeta débito/crédito
              <input
                id="tarjeta"
                value="tarjeta"
                name="pago"
                type="radio"
                onChange={(e) => paymentType(e.target.value)}
              />
            </div>
            {type === "efectivo" ? (
              <div className="w-full flex flex-col justify-center items-center my-8">
                <MoneyInput
                  id="codigoTipoIdentificacion"
                  label="Valor efectivo"
                  type="text"
                  autoComplete="off"
                  value={total}
                />
                <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
                  <Button type="button" onClick={pagarPrefac}>
                    Finalizar transacción
                  </Button>
                </div>
              </div>
            ) : type === "tarjeta" ? (
              <div className="w-full flex flex-col justify-center items-center my-8">
                <h1>Datos voucher</h1>
                <Input
                  id="numeroRRN"
                  label="Número RRN"
                  type="text"
                  minLength="7"
                  maxLength="12"
                  autoComplete="off"
                />
                <br />
                <Input
                  id="numeroAprobacion"
                  label="Número aprobación"
                  type="text"
                  minLength="7"
                  maxLength="12"
                  autoComplete="off"
                />
                <br />
                <Input
                  id="numeroCuenta"
                  label="Número cuenta"
                  type="text"
                  minLength="7"
                  maxLength="12"
                  autoComplete="off"
                />
                <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
                  <Button type="button" onClick={pagarPrefac}>
                    Finalizar transacción
                  </Button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </>
        )}{" "}
        <>
          {ticket && (
            <div className="flex flex-col justify-center items-center">
              <Tickets refPrint={printDiv} ticket={tickets} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={closeModal}>Cerrar</Button>
              </ButtonBar>
            </div>
          )}
        </>
      </Modal>
    </>
  );
};

export default Prefactura;
