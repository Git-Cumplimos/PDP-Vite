import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLoteria } from "../utils/LoteriaHooks";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { toast } from "react-toastify";
import Modal from "../../../components/Base/Modal";
import Tickets from "../../../components/Base/Tickets";
import PagarForm from "../components/SendForm/PagarForm";
import PagarFormFisico from "../components/SendForm/PagarFormFisico";
import PagoResp from "../components/SellResp/PagoResp";
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
  const { label } = route;
  const {
    infoLoto: { pagoresponse, setPagoresponse },
  } = useLoteria();
  const [respuesta, setRespuesta] = useState(false);
  const [estadoTransaccion, setEstadoTransaccion] = useState(false);
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [totalPagar, setTotalPagar] = useState("");
  const [valorbruto, setValorbruto] = useState("");
  const [serie, setSerie] = useState("");
  const [idLoteria, seIdLoteria] = useState("");
  const [phone, setPhone] = useState("");
  const [seleccionarFraccion, setSeleccionarFraccion] = useState(0);
  const [hash, setHash] = useState("");
  const [maxPago, setMaxPago] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const { quotaInfo, roleInfo, infoTicket, userInfo } = useAuth();
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
    navigate(`/loteria/loteria-de-bogota`);
  }, []);
  const [respagar, setRespagar] = useState([]);
  // const [respagar, setRespagar] = useState([
  //   {
  //     "Premio Mayor1": ["Hola", "Premio Mayor2"],
  //     "sorteo ": ["Estas", "todo"],
  //     "numero ": ["Que hay", "Sacan"],
  //     "serie ": ["De tu vida", "maleta"],
  //     "neto ": ["que tal todo", "espacio"],
  //   },
  // ]);
  const [tipopago, setTipopago] = useState("");
  const [fracciones_fisi, setFracciones_fisi] = useState("");

  const [winner, setWinner] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  ///////////////////////////////////////////////////////
  const [showModal, setShowModal] = useState(false);
  const printDiv = useRef();
  const [showTable, setShowTable] = useState(false);
  const [checkBilleteVirtual, setCheckBilleteVirtual] = useState(false);
  const [checkBilleteFisico, setCheckBilleteFisico] = useState(false);
  const [checkDisableVirtual, setCheckDisableVirtual] = useState(false);
  const [checkDisableFisico, setCheckDisableFisico] = useState(false);
  const [showAllmodals, setShowAllmodals] = useState({
    showModalVoucher: false,
    voucherAprobado: false,
    showModalDatosPropietario: false,
    showModalError: false,
    showModalconfirmacionVentaSoat: false,
    showLoading: false,
  });
  const [customer, setCustomer] = useState({
    doc_id: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    direccion: "",
    telefono: "",
    fracciones: "",
  });

  const closeModal = useCallback(() => {
    // setShowModal(false);
    setWinner("");
    setPhone("");
    setHash("");
    setFracciones_fisi("");
    setCustomer({
      doc_id: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      direccion: "",
      telefono: "",
      fracciones: "",
    });
  });
  ///////////////////////////////////////////////////////
  const [disabledBtns, setDisabledBtns] = useState(false);

  const { isWinner, makePayment, makePayment2, pagopremio, pagopremiofisico } =
    useLoteria();

  const [fracbill, setFracbill] = useState([]);
  const [selecFrac, setSelecFrac] = useState([]);

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
    // this.setState({ setCheckDisableVirtual: false });
    // this.setState({ setCheckBilleteFisico: false });
    var state = {
      // checkDisableVirtual: false,
      // checkBilleteFisico: false,
    };
    // const handleCheckboxChange = (event) => {
    //   this.setState({ isChecked: event.target.checkDisableVirtual });
    //   this.setState({ isChecked: event.target.checkBilleteFisico });
    // };
    // setCheckDisableVirtual(false);
    // setCheckBilleteFisico(false);
    setShowTable(false);
    setDisabledBtns(true);
    setRespuesta(true);
    e.preventDefault();
    isWinner(sorteo, billete, serie, checkBilleteFisico, checkBilleteVirtual)
      .then((res) => {
        var salvarRes = res;
        setMaxPago(res?.obj?.max_pago);
        seIdLoteria(res?.obj?.idloteria);
        setTotalPagar(res?.obj?.total);
        setTipopago(salvarRes?.obj?.tipo_ganancia);
        setDatosComercio((old) => {
          return {
            ...old,
            comercio: roleInfo?.id_comercio,
            usuario: roleInfo?.id_usuario,
            terminal: roleInfo?.id_dispositivo,
          };
        });

        setRespuesta(false);
        setValorbruto(res?.obj?.valorbruto);
        fracbill.length = 0;
        setDisabledBtns(false);
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
            // setIsSelf(true);
            setRespagar(res);
            setShowTable(true);
            setWinner(true);
          } else if (res?.obj?.ganador == false && "msg" in res) {
            notifyError(res?.obj?.gana);
            setWinner(false);
            setIsSelf(false);
          }
        }
        if (salvarRes?.obj?.tipo_ganancia == 2) {
          setWinner(true);
          setTipopago(salvarRes?.obj?.tipo_ganancia);
        }
        if (res[0]["Estado"] === false) {
          notifyError("No ganador");
          setWinner(false);
          setIsSelf(false);
        }
        if (res[0]["Estado"] === true) {
          if (res[0]["Tipo"] === 2) {
            notify("Ganador con billete virtual");
            setTipopago(res[0]["Tipo"]);
            setWinner(true);
            setIsSelf(true);
          } else {
            notify("Ganador con billete físico");
            for (var i = 0; i < res[0].cantidad_frac_billete; i++) {
              fracbill.push(i + 1);
            }
            setTipopago(res[0]["Tipo"]);
            setCheckedState(
              new Array(res[0].cantidad_frac_billete).fill(false)
            );
            setWinner(true);
            setIsSelf(false);
          }
        }
      })
      .catch(() => setDisabledBtns(false));
  };
  const optionsDocumento = [
    { value: 0, label: "Seleccione la fracción" },
    { value: 1, label: "Fracción # 1" },
    { value: 2, label: "Fracción # 2" },
    { value: 3, label: "Fracción # 3" },
  ];
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
            idLoteria,
            tipopago,
            hash,
            phone
          )
            .then((res) => {
              setRespuesta(false);
              setDatosCliente((old) => {
                return {
                  ...old,
                  statusPagoPremio: res?.status,
                  idTransaccion: res?.obj?.id_trx,
                };
              });
              setEstadoTransaccion(res?.status);
              if (res?.status === false) {
                var recargarPag = res?.status;
                // this.setState({ recargarPag: false });
                notifyError(res?.obj?.msg);
                navigate(`/loteria/loteria-de-bogota`);
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
          idLoteria,
          tipopago,
          hash,
          phone
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
              var recargarPag = res?.status;
              // this.setState({ recargarPag: false });
              notifyError(res?.obj?.msg);
              navigate(`/loteria/loteria-de-bogota`);
            }
          })
          .catch(() => setDisabledBtns(false));
      }
    }
  };

  const tickets2 = useMemo(() => {
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
      commerceName: "LOTERIA DE BOGOTÁ D.C",
      trxInfo: [
        ["", ""],
        ["Valor", formatMoney.format(totalPagar)],
      ],

      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [estadoTransaccion]);

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
      commerceName: "LOTERIA DE BOGOTÁ D.C",
      trxInfo: [
        ["", ""],
        ["", "DATOS DEL CLIENTE"],
        ["Nombre", datosCliente?.nombre],
        ["Celular", datosCliente?.celular],
        ["Valor", formatMoney.format(totalPagar)],
      ],

      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [estadoTransaccion]);

  const onPay2 = (e) => {
    setDisabledBtns(true);
    e.preventDefault();

    makePayment2(sorteo, billete, serie, selecFrac)
      .then((res) => {
        // setShowModal(true);
        setDisabledBtns(false);
        setRespagar(res);

        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          if (res?.Tipo === 0) {
            notifyError(
              "El valor a pagar supera la capacidad de la oficina: " +
                formatMoney.format(res["valor ganado"])
            );
          } else {
          }
        }
      })

      .catch(() => setDisabledBtns(false));
  };
  const handlePrint = useReactToPrint({
    content: () => printDiv?.current,
  });
  const [checkedState, setCheckedState] = useState();
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleOnChange = (position) => {
    setFracbill(5);
    selecFrac.length = 0;
    const updatedCheckedState = checkedState.map((item, frac) =>
      frac === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    for (var i = 0; i < fracbill.length; i++) {
      if (updatedCheckedState[i] === true) {
        selecFrac.push(fracbill[i]);
      }
    }
  };
  // useEffect(() => {
  //   if (pagoresponse != null && "msg" in pagoresponse) {
  //     notifyError(pagoresponse.msg);
  //   }
  // }, [pagoresponse]);
  // useEffect(() => {}, [totalPagar]);
  //------------------Funcion para validar el número del celular------------------------------
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
  //-------------------------------------------------------------------------------

  // const onCelChange = (e) => {
  //   const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
  //   setDatosCliente((old) => {
  //     return { ...old, celular: valueInput };
  //   });

  //   if (valueInput[0] != 3) {
  //     if (valueInput.length == 1 && datosCliente?.celular == "") {
  //       notifyError(
  //         "Número inválido, el No. de celular debe comenzar con el número 3"
  //       );
  //       return;
  //     }
  //   }
  // };

  useEffect(() => {
    const ticket = tipopago === 1 ? tickets : tickets2;
    infoTicket(datosCliente.idTransaccion, datosCliente.tipo_operacion, ticket)
      .then((resTicket) => {})
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  }, [
    infoTicket,
    datosCliente,
    estadoTransaccion,
    tickets2,
    tickets,
    tipopago,
  ]);
  const cancelar = () => {
    notifyError("Se cancelo el pago del premio");
    navigate(`/loteria/loteria-de-bogota`);
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
            <Form onSubmit={onPay1} grid>
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
                  minLength={"12"}
                  maxLength={"12"}
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
                {/* {fracbill.map((frac, index) => {
                  return (
                    <Input
                      id={frac}
                      label={`Fracción ${frac}:`}
                      type="checkbox"
                      value={frac}
                      checked={checkedState[index]}
                      onChange={() => handleOnChange(index)}
                    />
                  );
                })} */}
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
                      <Button type="submit" disabled={disabledBtns}>
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
                  <Form onSubmit={onPay1} grid>
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
                            <Button type="submit" disabled={disabledBtns}>
                              Pagar
                            </Button>
                          </ButtonBar>
                        </>
                      ) : (
                        ""
                      )}
                    </Fieldset>
                  </Form>
                  <Form onSubmit={onPay2} grid>
                    {fracbill.map((frac, index) => {
                      return (
                        <Input
                          id={frac}
                          label={`Fracción ${frac}:`}
                          type="checkbox"
                          value={frac}
                          checked={checkedState[index]}
                          onChange={() => handleOnChange(index)}
                        />
                      );
                    })}

                    {selecFrac.length >= 1 ? (
                      <ButtonBar className="col-auto md:col-span-2">
                        <Button type="submit" disabled={disabledBtns}>
                          Pagar
                        </Button>
                      </ButtonBar>
                    ) : (
                      ""
                    )}
                  </Form>
                </>
              ) : (
                ""
              )}
            </>
          )}
          {/* <Form onSubmit={onPay2} grid>
            <Fieldset
              className="lg:col-span-2"
              legend={"Seleccione un tipo de billete fielset 2"}>
              {fracbill.map((frac, index) => {
                return (
                  <Input
                    id={frac}
                    label={`Fracción ${frac}:`}
                    type="checkbox"
                    value={frac}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(index)}
                  />
                );
              })}
              {selecFrac.length >= 1 ? (
                <ButtonBar className="col-auto md:col-span-2">
                  <Button type="submit" disabled={disabledBtns}>
                    Pagar
                  </Button>
                </ButtonBar>
              ) : (
                ""
              )}
            </Fieldset>
          </Form> */}
        </>
      ) : (
        ""
      )}
      {winner ? (
        <>
          {tipopago === 3 ? (
            <Form onSubmit={onPay1} grid>
              <>
                <Input
                  id="numCel"
                  label="Numero de celular"
                  type="text"
                  autoComplete="off"
                  required
                  value={phone}
                  onInput={(e) => {
                    if (!isNaN(e.target.value)) {
                      const num = e.target.value;
                      setPhone(num);
                    }
                  }}
                />
                {isSelf ? (
                  <Input
                    id="codHash"
                    label="Codigo de seguridad"
                    type="text"
                    autoComplete="off"
                    required
                    value={hash}
                    onInput={(e) => {
                      setHash(e.target.value);
                    }}
                  />
                ) : (
                  ""
                )}
              </>
              <ButtonBar className="col-auto md:col-span-2">
                <Button type="submit" disabled={disabledBtns}>
                  Pagar
                </Button>
              </ButtonBar>
            </Form>
          ) : (
            <Form onSubmit={onPay2} grid>
              {/* <h2>Este numero no fue vendido por Punto de pago, solicite el billete</h2> */}

              {fracbill.map((frac, index) => {
                return (
                  <Input
                    id={frac}
                    label={`Fracción ${frac}:`}
                    type="checkbox"
                    value={frac}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(index)}
                  />
                );
              })}

              {selecFrac.length >= 1 ? (
                <ButtonBar className="col-auto md:col-span-2">
                  <Button type="submit" disabled={disabledBtns}>
                    Pagar
                  </Button>
                </ButtonBar>
              ) : (
                ""
              )}
            </Form>
          )}
        </>
      ) : (
        ""
      )}

      {respagar["msg"] === undefined && respagar?.Tipo != 0 ? (
        <>
          <Modal
            show={showModal}
            num_tele={phone}
            handleClose={() => closeModal()}>
            {pagoresponse === null || "msg" in pagoresponse ? (
              <>
                {tipopago === 2 ? (
                  <PagarForm
                    selected={respagar}
                    customer={customer}
                    setCustomer={setCustomer}
                    closeModal={closeModal}
                    handleSubmit={() => {
                      pagopremio(
                        sorteo,
                        billete,
                        serie,
                        hash,
                        customer,
                        respagar,
                        phone
                      );
                      setSorteo("");
                      setBillete("");
                      setSerie("");
                      setPhone("");
                      setHash("");
                      setWinner("");
                    }}
                  />
                ) : (
                  <PagarFormFisico
                    selected={respagar}
                    canFrac={fracciones_fisi}
                    numbillete={billete}
                    sorteo={sorteo}
                    serie={serie}
                    customer={customer}
                    setCustomer={setCustomer}
                    closeModal={closeModal}
                    handleSubmit={() => {
                      pagopremiofisico(
                        sorteo,
                        billete,
                        serie,
                        customer,
                        respagar,
                        selecFrac
                      );
                      setSorteo("");
                      setBillete("");
                      setSerie("");
                      setPhone("");
                      setHash("");
                      setWinner("");
                      setFracciones_fisi("");
                    }}
                  />
                )}
              </>
            ) : (
              <PagoResp
                pagoresponse={pagoresponse}
                setPagoresponse={setPagoresponse}
                closeModal={closeModal}
                setCustomer={setCustomer}
              />
            )}

            {/* {showTable ? (
              <TableEnterprise
                title="Premios a pagar"
                headers={[
                  "Acierto",
                  "Sorteo",
                  "Numero",
                  "Serie",
                  "Premio Neto x Billete",
                  "Premio Neto x Fraccion",
                ]}
                data={respagar}></TableEnterprise>
            ) : (
              ""
            )} */}
          </Modal>
        </>
      ) : (
        ""
      )}
      {estadoTransaccion && tipopago === 2 ? (
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
      ) : /*************** Compra Soat Exitosa Voucher **********************/
      tipopago === 1 ? (
        <Modal show={estadoTransaccion} handleClose={handleClose}>
          {/* <Modal show={showAllmodals.showModalVoucher} handleClose={handleClose}> */}
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} ticket={tickets2}></Tickets>
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
