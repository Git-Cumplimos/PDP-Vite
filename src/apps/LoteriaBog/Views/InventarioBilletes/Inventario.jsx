import React from "react";
import fetchData from "../../../../utils/fetchData";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "../../../../components/Base/Select";
import classes from "./Inventario.module.css";

import { useLoteria } from "../../utils/LoteriaHooks";
import { notify, notifyError } from "../../../../utils/notify";
import Input from "../../../../components/Base/Input";
import InputX from "../../../../components/Base/InputX/InputX";
import Button from "../../../../components/Base/Button";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import BarcodeReader from "../../../../components/Base/BarcodeReader";
import TextArea from "../../../../components/Base/TextArea";
import Modal from "../../../../components/Base/Modal";
import LogoPDP from "../../../../components/Base/LogoPDP";
import Fieldset from "../../../../components/Base/Fieldset";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;
const {
  contenedorPrincipal,
  contenedorBotones,
  contenedorImagen,
  titulosSecundarios,
  textTarea,
  autorizacionMensajes,
} = classes;
const Inventario = () => {
  const navigate = useNavigate();
  const {
    infoLoto: { numero, setNumero, serie, setSerie, loterias, setLoterias },
    consultaInventario,
    registrarInventario,
    codigos_lot,
  } = useLoteria();
  const [texto, setTexto] = useState("");
  const [sorteoOrdifisico, setSorteofisico] = useState(null);
  const [sorteoExtrafisico, setSorteofisicoextraordinario] = useState(null);
  const [sorteo, setSorteo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [datosAzar, setDatosAzar] = useState("");
  const [datosCantidadBilletes, setDatosCantidadBilletes] = useState("");
  const [cantidadBilletes, setCantidadBilletes] = useState("");
  const [mensajeCausal, setMensajeCausal] = useState("");
  const [mensajeInventarioInvalido, setMensajeInventarioInvalido] =
    useState("");
  const [mensajeInventarioInvalido2, setMensajeInventarioInvalido2] =
    useState("");
  const [showCrearInventario, setShowCrearInventario] = useState(false);
  const [datosEscaneados, setDatosEscaneados] = useState({
    escaneado1: "",
    escaneado2: "",
    escaneado3: "",
  });
  const [datosEscaneadosValidados, setDatosEscaneadosValidados] = useState({
    escaneado1Validados: false,
    escaneado2Validados: false,
    escaneado3Validados: false,
  });
  const [
    habilitarBtnAgregarInconsistencia,
    setHabilitarBtnAgregarInconsistencia,
  ] = useState(false);
  const [procesandoTrx, setProcesandoTrx] = useState(false);
  const sorteosLOT = useMemo(() => {
    var cod = "";
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    return cod;
  }, [codigos_lot]);

  useEffect(() => {
    const query = {
      num_loteria: sorteosLOT,
    };
    fetchData(urlLoto, "GET", query, {})
      .then((res) => {
        setSorteofisico(null);
        setSorteofisicoextraordinario(null);
        const sortOrdfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && fisico;
        });
        const sortExtfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && fisico;
        });

        if (sortOrdfisico.length > 0) {
          setSorteofisico(sortOrdfisico[0]);
        } else {
          /*    notifyError("No se encontraron extraordinarios fisicos"); */
        }

        if (sortExtfisico.length > 0) {
          setSorteofisicoextraordinario(sortExtfisico[0]);
        } else {
          /*   notifyError("No se encontraron extraordinarios fisicos"); */
        }
      })
      .catch((err) => console.error(err));
  }, [codigos_lot, sorteosLOT]);

  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    const copy = [{ value: "", label: "" }];
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.num_loteria}`,
        label: `Sorteo ordinario  fisico- ${sorteoOrdifisico.num_sorteo}`,
      });
    }

    if (sorteoExtrafisico !== null) {
      copy.push({
        value: `${sorteoExtrafisico.num_sorteo}-${sorteoExtrafisico.num_loteria}`,
        label: `Sorteo extraordinario fisico - ${sorteoExtrafisico.num_sorteo}`,
      });
    }
    SetOpcionesDisponibles([...copy]);
  }, [sorteoExtrafisico, sorteoOrdifisico, sorteosLOT, codigos_lot]);

  const onSubmitInventario = useCallback(
    (e) => {
      e.preventDefault();
      registrarInventario(
        sorteo.split("-")[0],
        sorteo.split("-")[1],
        "Inventario registrado con éxito", // comentario
        cantidadBilletes, //numero_total
        [
          datosEscaneados?.["escaneado1"],
          datosEscaneados?.["escaneado2"],
          datosEscaneados?.["escaneado3"],
        ], //numero_completo
        "true" //inconcistencia-bool
      ).then((resp) => {
        if (resp?.response === "Registro exitoso") {
          notify("Inventario agregado exitosamente.");
          navigate(`/loteria`);
          setProcesandoTrx(false);
        } else {
          notifyError("Error inventario no agregado.");
          setHabilitarBtnAgregarInconsistencia(false);
          setProcesandoTrx(false);
        }
      });
    },
    [sorteo, datosEscaneados, cantidadBilletes]
  );
  const onSubmitMensajeInconsistencia = useCallback(
    (e) => {
      e.preventDefault();
      setHabilitarBtnAgregarInconsistencia(true);
      setProcesandoTrx(true);
      registrarInventario(
        sorteo.split("-")[0],
        sorteo.split("-")[1],
        `${mensajeInventarioInvalido},${mensajeInventarioInvalido2}, ${mensajeCausal}`, // comentario
        cantidadBilletes, //numero_total
        [
          datosEscaneados?.["escaneado1"] /* ?? "" */,
          datosEscaneados?.["escaneado2"] /* ?? "" */,
          datosEscaneados?.["escaneado3"] /* ?? "" */,
        ], //numero_completo
        "false" //inconcistencia-bool
      ).then((res) => {
        if (res?.response === "Registro exitoso") {
          notify("Inconsistencia agregada exitosamente.");
          setHabilitarBtnAgregarInconsistencia(true);
          navigate(`/loteria`);
          setProcesandoTrx(false);
        } else {
          notifyError("Error inconsistencia no agregada.");
          setHabilitarBtnAgregarInconsistencia(false);
          setProcesandoTrx(false);
        }
      });
    },
    [sorteo, cantidadBilletes, mensajeCausal, datosEscaneados]
  );
  /* 
  const inventarioErrado = (e)=>{
    e.preventDefault();

  } */

  /* const validarEntradaScanner = (validarNum) => {
    if (validarNum[0] === "]") {
      setDatosEscaneados((old) => {
        return { ...old, escaneado1: validarNum.replace("]", " ") };
      });
    }
  }; */
  const validarEntradaScanner = useCallback(
    (validarNum) => {
      if (validarNum[0] === "]") {
        return validarNum.replace("]C1", "");
      } else {
        return validarNum;
      }
    },
    [datosEscaneados]
  );

  return (
    <>
      {showModal ? (
        <>
          <SimpleLoading show={procesandoTrx}></SimpleLoading>
          <Modal show={showModal} /* handleClose={handleClose} */>
            <div className={contenedorImagen}>
              <LogoPDP xsmall></LogoPDP>
            </div>
            {/* <Form grid onSubmit={(e) => enviar(e)}> */}
            <Form grid onSubmit={(e) => onSubmitMensajeInconsistencia(e)}>
              <Fieldset className="lg:col-span-3">
                <div className={autorizacionMensajes}>
                  <span className={titulosSecundarios}>
                    Si existe alguna inconsistencia al realizar el inventario,
                    por favor agregue su comentario.
                  </span>
                </div>
                <textarea
                  className={textTarea}
                  type="input"
                  minLength="1"
                  maxLength="160"
                  autoComplete="off"
                  value={mensajeCausal}
                  onInput={(e) => {
                    setMensajeCausal(e.target.value);
                  }}
                  required
                ></textarea>
              </Fieldset>
              <ButtonBar className={"lg:col-span-2"} type="">
                {
                  <Button
                    type="submit"
                    /*      disabled={disabledBtn}
                  onSubmit={(e) => enviar(e)} */
                    /*   onSubmit={(e) => {
                    if (mensajeCausal) {
                      setHabilitarBtnAgregarInconsistencia(false);
                      onSubmitMensajeInconsistencia(e);
                    }
                  }} */
                    disabled={habilitarBtnAgregarInconsistencia}
                  >
                    Agregar inconsistencia
                  </Button>
                  /*  ) : null */
                }
                <Button onClick={() => setShowModal(false)}>Cancelar</Button>
              </ButtonBar>
            </Form>
          </Modal>
        </>
      ) : (
        ""
      )}
      <Select
        id="selectSorteo"
        label="Tipo de sorteo"
        options={opcionesdisponibles}
        value={sorteo}
        onChange={(e) => {
          setShowCrearInventario(false);
          setSorteo(e.target.value);
          if (e.target.value !== "") {
            consultaInventario(
              e.target.value.split("-")[0],
              e.target.value.split("-")[1]
            ).then((res) => {
              if (!res?.status) {
                notifyError(res?.response);
              } else {
                setDatosAzar(res?.response?.numerosAzar);
                setDatosCantidadBilletes(
                  res?.response?.numero_total_asignaciones
                );
                setShowCrearInventario(true);
              }
            });
          }
        }}
      />
      {datosAzar && showCrearInventario ? (
        <>
          <Form onSubmit={onSubmitInventario}>
            <InputX
              label="Cantidad de billetes"
              type="tel"
              minLength="1"
              maxLength="5"
              value={cantidadBilletes}
              onInput={(e) => {
                const cantidad = parseInt(e.target.value) || "";

                setCantidadBilletes(cantidad);
              }}
            ></InputX>
            <div className={contenedorPrincipal}>
              <div>
                <InputX
                  value={datosAzar?.[0] ?? ""}
                  label="Billete"
                  type="search"
                  disabled
                ></InputX>
                <InputX
                  value={datosAzar[1] ?? ""}
                  label="Billete"
                  type="search"
                  disabled
                ></InputX>
                <InputX
                  value={datosAzar[2] ?? ""}
                  label="Billete"
                  type="search"
                  disabled
                ></InputX>
              </div>
              {/*               <div>
                <Button type="submit">Scan</Button>
                <Button type="submit">Scan</Button>
                <Button type="submit">Scan</Button>
              </div> */}
              <div>
                <InputX
                  label="Escanee el código de barras"
                  type="search"
                  maxLength="23"
                  value={datosEscaneados["escaneado1"]}
                  onInput={(e) => {
                    const num = e.target.value || "";

                    setDatosEscaneados((old) => {
                      return { ...old, escaneado1: validarEntradaScanner(num) };
                    });
                    setDatosEscaneadosValidados((old) => {
                      return { ...old, escaneado1Validados: false };
                    });
                    if (num?.length === 20) {
                      if (
                        (String(num.substr(-9, 4)) !==
                          String(datosAzar[0].split("-")[0])) &
                        (String(num.substr(-5, 3)) !==
                          String(datosAzar[0].split("-")[1]))
                      ) {
                        notifyError("Número de billete y serie no coinciden");
                      } else if (
                        String(num.substr(-9, 4)) !==
                        String(datosAzar[0].split("-")[0])
                      ) {
                        notifyError("Número de billete no coincide");
                      } else if (
                        String(num.substr(-5, 3)) !==
                        String(datosAzar[0].split("-")[1])
                      ) {
                        notifyError("Número de serie no coincide");
                      } else {
                        setDatosEscaneadosValidados((old) => {
                          return { ...old, escaneado1Validados: true };
                        });
                      }
                    }
                  }}
                ></InputX>
                <InputX
                  label="Escanee el código de barras"
                  type="search"
                  maxLength="23"
                  value={datosEscaneados["escaneado2"]}
                  onInput={(e) => {
                    const num2 = e.target.value || "";

                    setDatosEscaneados((old) => {
                      return {
                        ...old,
                        escaneado2: validarEntradaScanner(num2),
                      };
                    });
                    setDatosEscaneadosValidados((old) => {
                      return { ...old, escaneado2Validados: false };
                    });
                    if (num2?.length === 20) {
                      if (
                        (String(num2.substr(-9, 4)) !==
                          String(datosAzar[1].split("-")[0])) &
                        (String(num2.substr(-5, 3)) !==
                          String(datosAzar[1].split("-")[1]))
                      ) {
                        notifyError("Número de billete y serie no coinciden");
                      } else if (
                        String(num2.substr(-9, 4)) !==
                        String(datosAzar[1].split("-")[0])
                      ) {
                        notifyError("Número de billete no coincide");
                      } else if (
                        String(num2.substr(-5, 3)) !==
                        String(datosAzar[1].split("-")[1])
                      ) {
                        notifyError("Número de serie no coincide");
                      } else {
                        setDatosEscaneadosValidados((old) => {
                          return { ...old, escaneado2Validados: true };
                        });
                      }
                    }
                  }}
                ></InputX>
                <InputX
                  label="Escanee el código de barras"
                  type="search"
                  maxLength="23"
                  value={datosEscaneados["escaneado3"]}
                  onInput={(e) => {
                    const num3 = e.target.value || "";

                    setDatosEscaneados((old) => {
                      return {
                        ...old,
                        escaneado3: validarEntradaScanner(num3),
                      };
                    });
                    setDatosEscaneadosValidados((old) => {
                      return { ...old, escaneado3Validados: false };
                    });
                    if (num3?.length === 20) {
                      if (
                        (String(num3.substr(-9, 4)) !==
                          String(datosAzar[2].split("-")[0])) &
                        (String(num3.substr(-5, 3)) !==
                          String(datosAzar[2].split("-")[1]))
                      ) {
                        notifyError("Número de billete y serie no coinciden");
                      } else if (
                        String(num3.substr(-9, 4)) !==
                        String(datosAzar[2].split("-")[0])
                      ) {
                        notifyError("Número de billete no coincide");
                      } else if (
                        String(num3.substr(-5, 3)) !==
                        String(datosAzar[2].split("-")[1])
                      ) {
                        notifyError("Número de serie no coincide");
                      } else {
                        setDatosEscaneadosValidados((old) => {
                          return { ...old, escaneado3Validados: true };
                        });
                      }
                    }
                  }}
                ></InputX>
              </div>
            </div>
            <div className={contenedorBotones}>
              <Button
                type="submit"
                disabled={
                  !datosEscaneadosValidados["escaneado1Validados"] ||
                  !datosEscaneadosValidados["escaneado2Validados"] ||
                  !datosEscaneadosValidados["escaneado3Validados"] ||
                  datosCantidadBilletes !== cantidadBilletes
                }
              >
                Guardar inventario
              </Button>
              <Button
                type="button"
                disabled={
                  datosEscaneadosValidados["escaneado1Validados"] &&
                  datosEscaneadosValidados["escaneado2Validados"] &&
                  datosEscaneadosValidados["escaneado3Validados"] &&
                  datosCantidadBilletes === cantidadBilletes
                }
                onClick={() => {
                  if (cantidadBilletes < 1) {
                    notifyError("Ingrese la cantidad de billetes");
                  } else {
                    const Strcaso1 = !datosEscaneadosValidados[
                      "escaneado1Validados"
                    ]
                      ? `${datosAzar?.[0]}, `
                      : "";
                    const Strcaso2 = !datosEscaneadosValidados[
                      "escaneado2Validados"
                    ]
                      ? `${datosAzar?.[1]}, `
                      : "";
                    const Strcaso3 = !datosEscaneadosValidados[
                      "escaneado3Validados"
                    ]
                      ? `${datosAzar?.[2]}`
                      : "";
                    if (datosCantidadBilletes !== cantidadBilletes) {
                      notifyError(
                        "La cantidad de billetes no corresponde al del inventario lógico"
                      );
                      setMensajeInventarioInvalido(
                        `La cantidad de billetes no coinciden, inventario logico: ${datosCantidadBilletes}, inventario fisico: ${cantidadBilletes}`
                      );
                      setShowModal(true);
                    }
                    if (
                      !datosEscaneadosValidados["escaneado1Validados"] ||
                      !datosEscaneadosValidados["escaneado2Validados"] ||
                      !datosEscaneadosValidados["escaneado3Validados"]
                    ) {
                      setMensajeInventarioInvalido2(
                        ` No se encontraron los siguientes billetes: ${Strcaso1}${Strcaso2}${Strcaso3}`
                      );
                    }

                    setShowModal(true);
                  }
                }}
              >
                Inventario errado
              </Button>
            </div>
          </Form>
          <ButtonBar></ButtonBar>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default Inventario;
