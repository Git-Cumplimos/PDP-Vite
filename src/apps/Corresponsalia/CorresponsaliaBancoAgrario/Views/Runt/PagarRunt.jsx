import { useState, useRef, useCallback, useEffect } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Fieldset from "../../../../../components/Base/Fieldset";
import Form from "../../../../../components/Base/Form";
import InputX from "../../../../../components/Base/InputX/InputX";
import LogoPDP from "../../../../../components/Base/LogoPDP";
import Modal from "../../../../../components/Base/Modal";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { notify } from "../../../../../utils/notify";

import { validarEntradaScanner } from "../../utils/functionsRunt";

import classes from "./PagarRunt.module.css";

const PagarRunt = () => {
  const {
    contenedorImagen,
    contenedorMensaje,
    contenedorRefPago,
    contenedorPago,
    mensaje,
  } = classes;
  const [datosEscaneados, setDatosEscaneados] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [desHabilitarBtnConsultar, setDesHabilitarBtnConsulta] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [aprobarRef, setAprobarRef] = useState(false);
  const [procesandoTrx, setProcesandoTrx] = useState(false);
  const [dataTrx, setDataTrx] = useState({ ref1: "" });
  /* const validarReferenciaPago = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
 */
  const isAlt = useRef("");
  const isAltCR = useRef({ data: "", state: false });

  const consultarRunt = (e) => {
    e.preventDefault();
    setAprobarRef(true);
    setProcesandoTrx(true);
    setTimeout(() => {
      setShowModal(false);
      setProcesandoTrx(false);
      setShowModal2(true);
    }, 2500);
  };
  const pagar = (e) => {
    e.preventDefault();
    setProcesandoTrx(true);
    setTimeout(() => {
      setShowModal2(false);
      setProcesandoTrx(false);
      setDatosEscaneados("");
      notify("Pago Runt Exitoso");
    }, 2500);
  };

  const onChangeFormat = useCallback(
    (ev) => {
      const valor = ev.target.value;
      if (valor.length > codigoBarras.length) {
        setCodigoBarras((old) => {
          return { ...old, [ev.target.name]: valor };
        });
      }
    },
    [codigoBarras]
  );

  // useEffect(() => {
  //   console.log(codigoBarras);
  // }, [codigoBarras]);

  const callOnKeyDown = (ev) => {
    console.log("down", isAltCR.current);

    if (ev.keyCode === 13 && ev.shiftKey === false) {
      // ev.preventDefault();
      console.log("cc");
      // onSubmit(ev);
      return;
    }
    if (ev.altKey) {
      if (isAltCR.current.state) {
        isAltCR.current = {
          ...isAltCR.current,
          data: isAltCR.current.data + ev.key,
        };
      }
      if (ev.keyCode !== 18) {
        isAlt.current += ev.key;
      } else {
        isAltCR.current = { ...isAltCR.current, state: true };
      }
    }
  };

  const callOnKeyUp = (ev) => {
    if (ev.altKey === false && isAlt.current !== "") {
      let value = String.fromCharCode(parseInt(isAlt.current));
      isAlt.current = "";
      if (value === "\u001d") {
        setCodigoBarras((old) => old + "\u001d");
      }
    }
    if (ev.keyCode === 18) {
      if (isAltCR.current.data === "013") {
        // onSubmit(ev);
      }
      isAltCR.current = {
        ...isAltCR.current,
        state: false,
        data: "",
      };
    }
  };

  return (
    <div>
      <Fieldset legend="RUNT" className="lg:col-span-2">
        <SimpleLoading show={procesandoTrx}></SimpleLoading>
        {showModal && !desHabilitarBtnConsultar ? (
          <Modal show={showModal}>
            <div className={contenedorImagen}>
              <LogoPDP xsmall></LogoPDP>
            </div>
            <Form grid>
              <div className={contenedorMensaje}>
                <h1 className={mensaje}>
                  ¿Esta seguro del numero de referecia?
                </h1>
                <div className={contenedorRefPago}>
                  <h3>N° referencia de pago:</h3>
                  <h3>{datosEscaneados}</h3>
                </div>
              </div>
              <ButtonBar className={"lg:col-span-2"}>
                <>
                  <Button
                    type=""
                    onClick={(e) => {
                      consultarRunt(e);
                    }}
                    disabled={desHabilitarBtnConsultar}
                  >
                    Consultar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              </ButtonBar>
            </Form>
          </Modal>
        ) : (
          ""
        )}
        {showModal2 && !desHabilitarBtnConsultar ? (
          <Modal show={showModal2}>
            <div className={contenedorImagen}>
              <LogoPDP xsmall></LogoPDP>
            </div>
            <Form grid>
              <div className={contenedorMensaje}>
                <h1 className={mensaje}>El valor a pagar del Runt es de:</h1>
                <div className={contenedorPago}>
                  <h3>$</h3>
                  <h3>125.000</h3>
                </div>
              </div>
              <ButtonBar className={"lg:col-span-2"}>
                <>
                  <Button
                    type=""
                    onClick={(e) => {
                      e.preventDefault();
                      pagar(e);
                    }}
                  >
                    Pagar
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowModal2(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              </ButtonBar>
            </Form>
          </Modal>
        ) : (
          ""
        )}
        <Form grid onSubmit={(e) => e.preventDefault()}>
          <InputX
            id="codBarras"
            label="Escanee el código de barras"
            type="text"
            name="codBarras"
            required
            value={codigoBarras}
            autoFocus
            autoComplete="off"
            onInput={onChangeFormat}
            onKeyDown={callOnKeyDown}
            onKeyUp={callOnKeyUp}
          ></InputX>
          <ButtonBar className={"lg:col-span-2"}>
            {desHabilitarBtnConsultar ? (
              <Button type="button" disabled={desHabilitarBtnConsultar}>
                Consultar
              </Button>
            ) : (
              <Button
                type=""
                disabled={desHabilitarBtnConsultar}
                onClick={(e) => {
                  e.preventDefault();
                  setShowModal(true);
                }}
              >
                Consultar
              </Button>
            )}
          </ButtonBar>
        </Form>
      </Fieldset>
    </div>
  );
};

export default PagarRunt;
