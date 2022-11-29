import React from "react";
import fetchData from "../../../utils/fetchData";
import { useMemo, useEffect, useState, useCallback } from "react";
import Select from "../../../components/Base/Select";
import classes from "./Inventario.module.css";

import { useLoteria } from "../utils/LoteriaHooks";
import { notify, notifyError } from "../../../utils/notify";
import Input from "../../../components/Base/Input";
import InputX from "../../../components/Base/InputX/InputX";
import Button from "../../../components/Base/Button";
import Form from "../../../components/Base/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import BarcodeReader from "../../../components/Base/BarcodeReader";
import TextArea from "../../../components/Base/TextArea";

const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;
const { contenedorPrincipal, contenedorBotones } = classes;
const Inventario = () => {
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
  const [datosAzar, setDatosAzar] = useState("");
  const [cantidadBilletes, setCantidadBilletes] = useState("");
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

  const sorteosLOT = useMemo(() => {
    var cod = "";
    console.log(codigos_lot?.length);
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    console.log(cod);
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
        console.log(res);
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
    console.log(sorteoOrdifisico);
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
        "", // comentario
        "", //numero_total
        "", //numero_completo
        "" //inconcistencia
      );
    },
    [sorteo]
  );

  return (
    <>
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
                  value={datosAzar[1]}
                  label="Billete"
                  type="search"
                  disabled
                ></InputX>
                <InputX
                  value={datosAzar[2]}
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
                  type="text"
                  onInput={(e) => {
                    const num = e.target.value || "";

                    setDatosEscaneados((old) => {
                      return { ...old, escaneado1: num.toString() };
                    });

                    if (e.target.value?.length == 20) {
                      /* console.log(e.target.value.substr(-9, 4)); */
                      console.log(
                        String(e.target.value.substr(-5, 3)),
                        String(datosAzar[0].split("-")[1])
                      );
                      if (
                        (String(e.target.value.substr(-9, 4)) !==
                          String(datosAzar[0].split("-")[0])) &
                        (String(e.target.value.substr(-5, 3)) !==
                          String(datosAzar[0].split("-")[1]))
                      ) {
                        notifyError("Número de billete y serie no coinciden");
                      } else if (
                        String(e.target.value.substr(-9, 4)) !==
                        String(datosAzar[0].split("-")[0])
                      ) {
                        notifyError("Número de billete no coincide");
                      } else if (
                        String(e.target.value.substr(-5, 3)) !==
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
                  onInput={(e) => {
                    const num2 = e.target.value || "";

                    setDatosEscaneados((old) => {
                      return { ...old, escaneado2: num2.toString() };
                    });

                    if (e.target.value?.length == 20) {
                      /* console.log(e.target.value.substr(-9, 4)); */
                      console.log(
                        String(e.target.value.substr(-9, 4)),
                        String(datosAzar[1].split("-")[0])
                      );
                      if (
                        (String(e.target.value.substr(-9, 4)) !==
                          String(datosAzar[1].split("-")[0])) &
                        (String(e.target.value.substr(-5, 3)) !==
                          String(datosAzar[1].split("-")[1]))
                      ) {
                        notifyError("Número de billete y serie no coinciden");
                      } else if (
                        String(e.target.value.substr(-9, 4)) !==
                        String(datosAzar[1].split("-")[0])
                      ) {
                        notifyError("Número de billete no coincide");
                      } else if (
                        String(e.target.value.substr(-5, 3)) !==
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
                  onInput={(e) => {
                    const num3 = e.target.value || "";

                    setDatosEscaneados((old) => {
                      return { ...old, escaneado3: num3.toString() };
                    });
                    if (e.target.value?.length == 20) {
                      /* console.log(e.target.value.substr(-9, 4)); */
                      console.log(
                        String(e.target.value.substr(-9, 4)),
                        String(datosAzar[2].split("-")[0])
                      );
                      if (
                        (String(e.target.value.substr(-9, 4)) !==
                          String(datosAzar[2].split("-")[0])) &
                        (String(e.target.value.substr(-5, 3)) !==
                          String(datosAzar[2].split("-")[1]))
                      ) {
                        notifyError("Número de billete y serie no coinciden");
                      } else if (
                        String(e.target.value.substr(-9, 4)) !==
                        String(datosAzar[2].split("-")[0])
                      ) {
                        notifyError("Número de billete no coincide");
                      } else if (
                        String(e.target.value.substr(-5, 3)) !==
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
                  !datosEscaneadosValidados["escaneado1Validados"] &&
                  !datosEscaneadosValidados["escaneado2Validados"] &&
                  !datosEscaneadosValidados["escaneado3Validados"]
                }
              >
                Guardar inventario
              </Button>
              <Button type="onsubmit">Inventario errado</Button>
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
