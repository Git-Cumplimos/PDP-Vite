import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLoteria } from "../utils/LoteriaHooks";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { toast } from "react-toastify";
import Modal from "../../../components/Base/Modal";
import Tickets from "../../../components/Base/Tickets";
import { useAuth } from "../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Fieldset from "../../../components/Base/Fieldset";
import Select from "../../../components/Base/Select";
import { useReactToPrint } from "react-to-print";
const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const Premios = ({ route }) => {
  const [respuesta, setRespuesta] = useState(false);
  const [estadoTransaccion, setEstadoTransaccion] = useState(false);
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [totalPagar, setTotalPagar] = useState("");
  const [valorbruto, setValorbruto] = useState("");
  const [serie, setSerie] = useState("");
  const [idLoteria, seIdLoteria] = useState("");
  const [cod_distribuidor, setCod_distribuidor] = useState("");
  const [seleccionarFraccion, setSeleccionarFraccion] = useState(0);
  const [hash, setHash] = useState("");
  const [maxPago, setMaxPago] = useState("");
  const { roleInfo, infoTicket } = useAuth();
  const [respagar, setRespagar] = useState([]);
  const [tipopago, setTipopago] = useState("");
  const [isSelf, setIsSelf] = useState(false);
  const printDiv = useRef();
  const [showTable, setShowTable] = useState(false);
  const [checkBilleteVirtual, setCheckBilleteVirtual] = useState(false);
  const [checkBilleteFisico, setCheckBilleteFisico] = useState(false);
  const [checkDisableVirtual, setCheckDisableVirtual] = useState(false);
  const [checkDisableFisico, setCheckDisableFisico] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const { isWinner, makePayment } = useLoteria();
  const optionsDocumento = [
    { value: 0, label: "Seleccione la fracción" },
    { value: 1, label: "Fracción # 1" },
    { value: 2, label: "Fracción # 2" },
    { value: 3, label: "Fracción # 3" },
  ];
  const [showAllmodals, setShowAllmodals] = useState({
    showModalVoucher: false,
    voucherAprobado: false,
    showModalDatosPropietario: false,
    showModalError: false,
    showModalconfirmacionVentaSoat: false,
    showLoading: false,
  });
  const [datosCliente, setDatosCliente] = useState({
    selectFraccion: 0,
    nombre: "",
    documento: "",
    direccion: "",
    celular: "",
    idTransaccion: "",
    statusPagoPremio: false,
    tipo_operacion: "",
  });
  const [datosComercio, setDatosComercio] = useState({
    comercio: "",
    terminal: "",
    usuario: "",
    codigo_dane: "",
    nom_loteria: "",
  });
  const handleClose = useCallback(() => {
    setShowAllmodals((old) => {
      return {
        ...old,
        showModalDatosPropietario: false,
        showModalVoucher: false,
        showModalconfirmacionVentaSoat: false,
      };
    });
    navigate(-1);
  }, []);


  const notifyError = (msg) => {
    toast.warn(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const onSubmit = (e) => {
    setSeleccionarFraccion(0);
    setShowTable(false);
    setDisabledBtns(true);
    setRespuesta(true);
    e.preventDefault();
    setDatosCliente((old) => {
      return {
        ...old,
        selectFraccion: "0",
        nombre: "",
        documento: "",
        direccion: "",
        celular: "",
        idTransaccion: "",
        statusPagoPremio: false,
      };
    });
    isWinner(sorteo, billete, serie, checkBilleteFisico, checkBilleteVirtual)
      .then((res) => {
        var salvarRes = res;
        setCod_distribuidor(roleInfo.cod_oficina_lot);
        setMaxPago(res?.obj?.max_pago);
        seIdLoteria(res?.obj?.idloteria);
        setTotalPagar(res?.obj?.total);
        setTipopago(salvarRes?.obj?.tipo_ganancia);
        setDatosComercio((old) => {
          setRespuesta(false);
          setValorbruto(res?.obj?.valorbruto);
          setDisabledBtns(false);
          return {
            ...old,
            comercio: roleInfo?.id_comercio,
            usuario: roleInfo?.id_usuario,
            terminal: roleInfo?.id_dispositivo,
            codigo_dane: roleInfo?.codigo_dane,
            nom_loteria: res?.obj?.nom_loteria,
          };
        });

        if ("msg" in res) {
          if (res?.obj?.max_pago == true) {
            notifyError(
              "El valor del premio, supera el valor asignado para el comercio"
            );
            var gana = res?.obj?.gana;
            var ValNetoFraccion = res?.obj?.ValNetoFraccion;
            var totalPagarLoteria = res?.obj?.total;
            res = [];
            for (let i = 0; i < gana.length; i++) {
              res.push([
                gana[i],
                sorteo,
                billete,
                serie,
                formatMoney.format(ValNetoFraccion[i]),
              ]);
            }
            res.push([
              "TOTAL A PAGAR:",
              "",
              "",
              "",
              formatMoney.format(totalPagarLoteria),
            ]);
            setRespagar(res);
            setShowTable(true);
          } else if (res?.obj?.ganador) {
            gana = res?.obj?.gana;
            ValNetoFraccion = res?.obj?.ValNetoFraccion;
            totalPagarLoteria = res?.obj?.total;

            res = [];
            for (let i = 0; i < gana.length; i++) {
              res.push([
                gana[i],
                sorteo,
                billete,
                serie,
                formatMoney.format(ValNetoFraccion[i]),
              ]);
            }
            res.push([
              "TOTAL A PAGAR:",
              "",
              "",
              "",
              formatMoney.format(totalPagarLoteria),
            ]);
            setRespagar(res);
            setShowTable(true);
          } else if (res?.obj?.ganador == false && "msg" in res) {
            notifyError(res?.obj?.gana);
            setIsSelf(false);
          }
        }
        if (salvarRes?.obj?.tipo_ganancia == 2) {
          setTipopago(salvarRes?.obj?.tipo_ganancia);
        }
        if (res[0]["Estado"] === false) {
          notifyError("No ganador");
          setIsSelf(false);
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const onPay1 = (e) => {
    e.preventDefault();
    if (tipopago === 2) {
      if (String(datosCliente?.celular).charAt(0) === "3") {
        setRespuesta(true);
        if (
          seleccionarFraccion === 0 ||
          seleccionarFraccion === "0" ||
          seleccionarFraccion === undefined
        ) {
          setRespuesta(false);
          notifyError("Seleccione una fracción");
        } else {
          makePayment(
            sorteo,
            billete,
            serie,
            checkBilleteFisico,
            checkBilleteVirtual,
            seleccionarFraccion,
            datosCliente?.nombre,
            datosCliente?.documento,
            datosCliente?.direccion,
            datosCliente?.celular,
            totalPagar,
            valorbruto,
            datosComercio.comercio,
            datosComercio.terminal,
            datosComercio.usuario,
            datosComercio.codigo_dane,
            cod_distribuidor,
            idLoteria,
            tipopago,
            hash,
          )
            .then((res) => {
              setRespuesta(false);
              setDatosCliente((old) => {
                return {
                  ...old,
                  statusPagoPremio: res?.status,
                  idTransaccion: res?.obj?.id_trx,
                  tipo_operacion: res?.obj?.tipo_operacion,
                };
              });
              setEstadoTransaccion(res?.status);
              if (res?.status === false) {
                notifyError(res?.obj?.msg);
                navigate(-1);
              }
            })
            .catch(() => setDisabledBtns(false));
        }
      } else {
        notifyError(
          "Numero invalido, el N° de celular debe comenzar con el número 3."
        );
      }
    } else {
      setRespuesta(true);
      if (
        seleccionarFraccion === 0 ||
        seleccionarFraccion === "0" ||
        seleccionarFraccion === undefined
      ) {
        setRespuesta(false);
        notifyError("Seleccione una fracción");
      } else {
        makePayment(
          sorteo,
          billete,
          serie,
          checkBilleteFisico,
          checkBilleteVirtual,
          seleccionarFraccion,
          datosCliente?.nombre,
          datosCliente?.documento,
          datosCliente?.direccion,
          datosCliente?.celular,
          totalPagar,
          valorbruto,
          datosComercio.comercio,
          datosComercio.terminal,
          datosComercio.usuario,
          datosComercio.codigo_dane,
          cod_distribuidor,
          idLoteria,
          tipopago,
          hash,
        )
          .then((res) => {
            setRespuesta(false);
            setDatosCliente((old) => {
              return {
                ...old,
                statusPagoPremio: res?.status,
                idTransaccion: res?.obj?.id_trx,
                tipo_operacion: res?.obj?.tipo_operacion,
              };
            });
            setEstadoTransaccion(res?.status);
            if (res?.status === false) {
              notifyError(res?.obj?.msg);
              navigate(-1);
            }
          })
          .catch(() => setDisabledBtns(false));
      }
    }
  };

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago",
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
      commerceInfo: [
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Id Trx ", datosCliente.idTransaccion],
        ["Municipio", roleInfo?.ciudad],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],
      commerceName: datosComercio.nom_loteria,
      trxInfo: [
        ["", ""],
        [tipopago === 2 ? "Nombre" : "", tipopago === 2 ? datosCliente?.nombre : ""],
        [tipopago === 2 ? "Celular" : "", tipopago === 2 ? datosCliente?.celular : ""],
        ["Valor", formatMoney.format(totalPagar)],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [estadoTransaccion]);

  const handlePrint = useReactToPrint({
    content: () => printDiv?.current,
  });
  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && datosCliente?.celular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setDatosCliente((old) => {
      return { ...old, celular: valueInput };
    });
  };

  useEffect(() => {
    const ticket = tickets;
    infoTicket(datosCliente.idTransaccion, datosCliente.tipo_operacion, ticket)
      .then((resTicket) => { })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  }, [
    infoTicket,
    datosCliente,
    estadoTransaccion,
    tickets,
    tipopago,
  ]);
  const cancelar = () => {
    notifyError("Se cancelo el pago del premio");
    navigate(-1);
  };
  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numSorteo"
          label="Número de sorteo"
          type="text"
          minLength="1"
          maxLength="4"
          required
          autoComplete="off"
          value={sorteo}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setSorteo(num);
            }
          }}
        />
        <Input
          id="numBillete"
          label="Número de billete"
          type="text"
          minLength="4" /*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="4"
          required
          autoComplete="off"
          value={billete}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setBillete(num);
            }
          }}
        />
        <Input
          id="numSerie"
          label="Número de serie"
          type="text"
          minLength="3" /*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="3"
          required
          autoComplete="off"
          value={serie}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setSerie(num);
            }
          }}
        />
        <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
          <Input
            type="checkbox"
            label="Billete Físico"
            required
            value={checkBilleteFisico}
            disabled={checkDisableFisico}
            onChange={() => {
              setCheckBilleteFisico(!checkBilleteFisico);
              if (checkBilleteFisico == true) {
                setCheckDisableVirtual(false);
                setIsSelf(!isSelf);
              } else {
                setCheckDisableVirtual(true);
              }
            }}></Input>

          <Input
            label="Billete Virtual"
            type="checkbox"
            required
            disabled={checkDisableVirtual}
            value={checkBilleteVirtual}
            onChange={() => {
              setCheckBilleteVirtual(!checkBilleteVirtual);
              if (checkBilleteVirtual == true) {
                setCheckDisableFisico(false);
                setIsSelf(true);
              } else {
                setCheckDisableFisico(true);
              }
            }}></Input>
        </div>

        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar
          </Button>
        </ButtonBar>
        <SimpleLoading show={respuesta} />
      </Form>
      {showTable && totalPagar && respagar ? (
        <>
          <TableEnterprise
            title="Premios a pagar"
            headers={[
              "Descripción Premio",
              "Sorteo",
              "Numero",
              "Serie",
              "Premio Neto x Fraccion",
            ]}
            data={respagar}></TableEnterprise>
          {tipopago === 2 && !maxPago ? (
            <Form grid>
              <Fieldset
                className="lg:col-span-2"
                legend={
                  "El valor del premio, supera la ganancia ocasional, por favor diligencie los campos del usuario."
                }>
                <Input
                  id="nombre"
                  label="Nombre"
                  type="text"
                  autoComplete="off"
                  value={datosCliente?.nombre}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        nombre: e.target.value,
                      };
                    });
                  }}
                  required
                />
                <Input
                  id="cedula"
                  label="Cédula"
                  type="text"
                  minLength={"10"}
                  maxLength={"10"}
                  autoComplete="off"
                  required
                  value={datosCliente?.documento}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        documento: e.target.value,
                      };
                    });
                  }}
                />
                <Input
                  id="numCel"
                  name="celular"
                  label="Número de celular"
                  type="tel"
                  minLength={"10"}
                  maxLength={"10"}
                  autoComplete="off"
                  required
                  value={datosCliente?.celular}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        celular: e.target.value,
                      };
                    });
                  }}
                  onChange={onCelChange}
                />
                <Input
                  id="direccion"
                  label="Dirección"
                  type="text"
                  autoComplete="off"
                  required
                  value={datosCliente?.direccion}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        direccion: e.target.value,
                      };
                    });
                  }}
                />
                <Select
                  id="selectFraccion"
                  label="Fracción"
                  options={optionsDocumento}
                  value={seleccionarFraccion}
                  required
                  onChange={(e) => {
                    setSeleccionarFraccion(e.target.value);
                  }}
                />
                {checkBilleteVirtual == true ? (
                  <Input
                    id="codHash"
                    label="Codigo de seguridad"
                    type="text"
                    autoComplete="off"
                    required
                    value={hash}
                    onChange={(e) => {
                      setHash(e.target.value);
                    }}
                  />
                ) : (
                  ""
                )}
                {checkBilleteVirtual == true || checkBilleteFisico == true ? (
                  <>
                    <ButtonBar
                      className="flex flex-row justify-center items-center
                          mx-auto container gap-10 text-lg lg:col-span-2">
                      <Button onClick={() => cancelar()}>Cancelar</Button>
                      <Button type={"submit"} onClick={onPay1}>
                        Pagar
                      </Button>
                    </ButtonBar>
                  </>
                ) : (
                  ""
                )}
              </Fieldset>
            </Form>
          ) : (
            <>
              {!maxPago ? (
                <>
                  <Form grid>
                    <Fieldset
                      className="lg:col-span-2 flex justify-center items-center"
                      legend={
                        "Por favor, seleccione la fracción del billete a pagar"
                      }>
                      <Select
                        id="selectFraccion"
                        label="Fracción"
                        options={optionsDocumento}
                        value={seleccionarFraccion}
                        required
                        onChange={(e) => {
                          setSeleccionarFraccion(e.target.value);
                        }}
                      />
                      {checkBilleteVirtual === true ? (
                        <Input
                          id="codHash"
                          label="Codigo de seguridad"
                          type="text"
                          autoComplete="off"
                          required
                          value={hash}
                          onChange={(e) => {
                            setHash(e.target.value);
                          }}
                        />
                      ) : (
                        ""
                      )}
                      {checkBilleteFisico === true ||
                        checkBilleteVirtual === true ? (
                        <>
                          <ButtonBar
                            className="flex flex-row justify-center items-center
                          mx-auto container gap-10 text-lg lg:col-span-2">
                            <Button onClick={() => cancelar()}>Cancelar</Button>
                            <Button type={"submit"} onClick={onPay1}>
                              Pagar
                            </Button>
                          </ButtonBar>
                        </>
                      ) : (
                        ""
                      )}
                    </Fieldset>
                  </Form>
                </>
              ) : (
                ""
              )}
            </>
          )}
        </>
      ) : (
        ""
      )}
      {estadoTransaccion && tipopago === 2 || tipopago === 1 ? (
        /**************** Compra Soat Exitosa Voucher **********************/
        <Modal show={estadoTransaccion} handleClose={handleClose}>
          {/* <Modal show={showAllmodals.showModalVoucher} handleClose={handleClose}> */}
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} ticket={tickets}></Tickets>
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        </Modal>
      ) : (
        <Modal show={showAllmodals.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <div>
              <label className="font-medium">{`${estadoTransaccion}`}</label>
            </div>
          </Fieldset>
        </Modal>
      )}
    </>
  );
};

export default Premios;
