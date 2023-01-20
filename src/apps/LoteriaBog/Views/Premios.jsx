import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLoteria } from "../utils/LoteriaHooks";
// import SimpleLoading from "../../../../components/Base/SimpleLoading";
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
import SubPage from "../../../components/Base/SubPage/SubPage";
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
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [serie, setSerie] = useState("");
  const [total, setTotal] = useState("");
  const [valNetoFraccion, setValNetoFraccion] = useState("");
  const [phone, setPhone] = useState("");
  const [hash, setHash] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const { quotaInfo, roleInfo, infoTicket, userInfo } = useAuth();
  const [datosCliente, setDatosCliente] = useState({
    selectFraccion: "0",
    nombre: "",
    documento: "",
    direccion: "",
    celular: "",
    idTransaccion: "",
    statusPagoPremio: false,
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
    setShowTable(false);
    setDisabledBtns(true);
    setRespuesta(true);
    e.preventDefault();
    isWinner(sorteo, billete, serie)
      .then((res) => {
        var salvarRes = res;
        setRespuesta(false);
        fracbill.length = 0;
        setDisabledBtns(false);
        var totalPagar = res?.obj?.total;
        console.log("ESTO ES RES***", res);

        if ("msg" in res) {
          if (res?.obj?.ganador) {
            var gana = res?.obj?.gana;
            var ValNetoFraccion = res?.obj?.ValNetoFraccion;
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
              formatMoney.format(totalPagar),
            ]);
            setWinner(true);
            // setIsSelf(true);
            console.log("RES??? CRISTINA", res);
            setRespagar(res);
            setShowTable(true);
          } else if (res?.obj?.ganador == false && "msg" in res) {
            notifyError(res?.obj?.gana);
            setWinner(false);
            setIsSelf(false);
          }
        }
        console.log("Esto es tipo de ganancia", salvarRes?.obj?.tipo_ganancia);
        if (salvarRes?.obj?.tipo_ganancia == 2) {
          setWinner(true);
          setTipopago(salvarRes?.obj?.tipo_ganancia);
          console.log("Entro al if y este es Tipopago", tipopago);
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

  const onPay1 = (e) => {
    e.preventDefault();
    setRespuesta(true);
    // setDisabledBtns(true);
    makePayment(
      sorteo,
      billete,
      serie,
      phone,
      hash,
      checkBilleteFisico,
      checkBilleteVirtual,
      datosCliente?.selectFraccion,
      datosCliente?.nombre,
      datosCliente?.documento,
      datosCliente?.direccion,
      datosCliente?.celular
    )
      .then((res) => {
        setRespuesta(false);
        console.log("ESTO ES EL RES DEL PAGO***", res);
        setDatosCliente((old) => {
          return { ...old, statusPagoPremio: res?.status };
        });
        console.log("ESTO ES EL RES DEL STATUS***", res?.status);
        console.log(
          "ESTO ES datosCliente?.statusPagoPremio ????????***",
          datosCliente?.statusPagoPremio
        );
        // setShowModal(true);
        // setDisabledBtns(false);
        // setRespagar(res);
        // if ("msg" in res) {
        //   notifyError(res.msg);
        // } else {
        //   if (res?.Tipo === 0) {
        //     notifyError(
        //       "El valor a pagar supera la capacidad de la oficina " +
        //         formatMoney.format(res["valor ganado"])
        //     );
        //   } else {
        //   }
        // }
      })
      .catch(() => setDisabledBtns(false));
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
        ["Id Trx ", 222],
        ["Id Aut ", 333],
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
        ["Valor", formatMoney.format("Hola")],
      ],

      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [datosCliente?.statusPagoPremio]);
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
  useEffect(() => {
    if (pagoresponse != null && "msg" in pagoresponse) {
      notifyError(pagoresponse.msg);
    }
  }, [pagoresponse]);
  useEffect(() => {
    // if (isSelf) {
    //   setIsSelf(true);
    // } else {
    //   setIsSelf(true);
    // }
  }, [setIsSelf]);
  const optionsDocumento = [
    { value: "0", label: "Seleccione la fracción" },
    { value: "1", label: "Fracción # 1" },
    { value: "2", label: "Fracción # 2" },
    { value: "3", label: "Fracción # 3" },
  ];
  const consultarSoat = (e) => {};
  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    setDatosCliente((old) => {
      return { ...old, numCelular: valueInput };
    });

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && datosCliente?.numCelular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
  };
  useEffect(() => {
    infoTicket(datosCliente?.statusPagoPremio, 114, tickets)
      .then((resTicket) => {})
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  }, [infoTicket, datosCliente?.statusPagoPremio, tickets]);
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
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar
          </Button>
        </ButtonBar>
        <SimpleLoading show={respuesta} />
      </Form>
      {showTable ? (
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
          <Fieldset legend={"Seleccione un tipo de billete"}>
            {tipopago == 2 ? (
              <Form onSubmit={onPay1} grid>
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
                  // onChange={onCelChange}
                  value={datosCliente?.celular}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        celular: e.target.value,
                      };
                    });
                  }}
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
                  value={datosCliente?.selectFraccion}
                  onChange={(e) => {
                    setDatosCliente((old) => {
                      return { ...old, selectFraccion: e.target.value };
                    });
                  }}
                  required
                />
                <div>
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
                  {checkBilleteVirtual == true ? (
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
                  {checkBilleteVirtual == true || checkBilleteFisico == true ? (
                    <>
                      <ButtonBar className="col-auto md:col-span-2">
                        <Button type="submit" disabled={disabledBtns}>
                          Pagar
                        </Button>
                      </ButtonBar>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </Form>
            ) : (
              <>
                <Form onSubmit={onPay2} grid>
                  {/************Selección tipo de documento******************* */}

                  <Select
                    id="selectFraccion"
                    label="Fracción"
                    options={optionsDocumento}
                    value={datosCliente?.selectFraccion}
                    onChange={(e) => {
                      setDatosCliente((old) => {
                        return { ...old, selectFraccion: e.target.value };
                      });
                    }}
                    required
                  />
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
                  {checkBilleteVirtual == true ? (
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
                  {checkBilleteVirtual == true || checkBilleteFisico == true ? (
                    <>
                      <ButtonBar className="col-auto md:col-span-2">
                        <Button type="submit" disabled={disabledBtns}>
                          Pagar
                        </Button>
                      </ButtonBar>
                    </>
                  ) : (
                    ""
                  )}
                </Form>
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
              </>
            )}
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
          </Fieldset>
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
      {datosCliente?.statusPagoPremio ? (
        /**************** Compra Soat Exitosa Voucher **********************/
        <Modal show={datosCliente?.statusPagoPremio} handleClose={handleClose}>
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
        /*************** Compra Soat Exitosa Voucher **********************/
        <Modal show={showAllmodals.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <div>
              <label className="font-medium">{`${datosCliente?.statusPagoPremio}`}</label>
            </div>
          </Fieldset>
        </Modal>
      )}
    </>
  );
};

export default Premios;
