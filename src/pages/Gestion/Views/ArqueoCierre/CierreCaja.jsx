import { Fragment, useState } from "react";

import Accordion from "../../../../components/Base/Accordion";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Error404 from "../../../Error404";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";

import { buscarListaComerciosCierreCaja, buscarReporteCierreCaja } from "../../utils/fetchCaja";
import { makeMoneyFormatter } from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";

import "./CierreCaja.css";

const formatMoney = makeMoneyFormatter(2);

const GridRow = ({ cols = [], self = false }) => (
  <div
    className={`grid gap-4 ${
      self ? "py-4 px-2 bg-secondary-light" : ""
    } cursor-pointer`}
    style={{
      gridTemplateColumns: `repeat(${cols?.length || 1}, minmax(0, 1fr))`,
    }}
  >
    {cols.map((val, ind) => (
      <div key={ind}>{val}</div>
    ))}
  </div>
);

const TreeView = ({ tree = {}, child }) =>
  Object.entries(tree).map(([key, info]) => {
    var cols = []
    if (child) {
      cols = [
        info.id,
        info.nombre, 
        info.transaccionesExitosas,
        info.transaccionesFallidas, 
        formatMoney.format(info.monto), 
        formatMoney.format(info.comisiones)
      ];
      if (info?.transacciones) {
        return (
          <Accordion titulo={<GridRow cols={cols} />} key={key}>
            {info?.transacciones && (
              <TreeView tree={info?.transacciones} child={true} />
            )}
          </Accordion>
        );
      }
    } else {
      cols = [
        "",
        info.nombre,
        valoresCalculadosGrupos(info.autorizadores,"transaccionesExitosas"),
        valoresCalculadosGrupos(info.autorizadores,"transaccionesFallidas"), 
        formatMoney.format(valoresCalculadosGrupos(info.autorizadores,"monto")), 
        formatMoney.format(valoresCalculadosGrupos(info.autorizadores,"comisiones"))
      ];
      if (info?.autorizadores) {
        return (
          <Accordion titulo={<GridRow cols={cols} />} key={key}>
            {info?.autorizadores && (
              <TreeView tree={info?.autorizadores} child={true} />
            )}
          </Accordion>
        );
      }
    }
    return (
      <GridRow
        key={key}
        cols={cols}
        self
      />
    );
  });

  const valoresCalculadosTotales = (gruposTransaccion, valor) => {
    var valorCalculado = 0
    if (gruposTransaccion !== null && gruposTransaccion !== undefined) {
      if (gruposTransaccion.length > 0) {
        gruposTransaccion.map((autorizadores) => {
          if (autorizadores.autorizadores.length > 0) {
            if (valor === "transaccionesExitosas") {
              autorizadores.autorizadores.map((autorizador) => {
                valorCalculado += Number(autorizador.transaccionesExitosas);
              })
            }
            if (valor === "transaccionesFallidas") {
              autorizadores.autorizadores.map((autorizador) => {
                valorCalculado += Number(autorizador.transaccionesFallidas);
              })
            }
            if (valor === "monto") {
              autorizadores.autorizadores.map((autorizador) => {
                valorCalculado += Number(autorizador.monto);
              })
            }
            if (valor === "comisiones") {
              autorizadores.autorizadores.map((autorizador) => {
                valorCalculado += Number(autorizador.comisiones);
              })
            }
          }
        })
      }
    }
    return valorCalculado
  }
  
  const valoresCalculadosGrupos = (autorizadores, valor) => {
    var valorCalculado = 0
    if (autorizadores !== null && autorizadores !== undefined) {
      if (autorizadores.length > 0) {
        if (valor === "transaccionesExitosas") {
          autorizadores.map((autorizador) => {
            valorCalculado += Number(autorizador.transaccionesExitosas);
          })
        }
        if (valor === "transaccionesFallidas") {
          autorizadores.map((autorizador) => {
            valorCalculado += Number(autorizador.transaccionesFallidas);
          })
        }
        if (valor === "monto") {
          autorizadores.map((autorizador) => {
            valorCalculado += Number(autorizador.monto);
          })
        }
        if (valor === "comisiones") {
          autorizadores.map((autorizador) => {
            valorCalculado += Number(autorizador.comisiones);
          })
        }
      }
    }
    return valorCalculado
  }

const headers = [
  "",
  "",
  "Transacciones Exitosas",
  "Transacciones Fallidas",
  "Monto",
  "Comisiones"
]

const CierreCaja = () => {

  const { roleInfo } = useAuth();
  const [dataCapitalizar, setDataCapitalizar] = useState({});
  const [dataComercios, setDataComercios] = useState([]);
  const [dataInicioDia, setDataInicioDia] = useState({});
  const [dataTransacciones, setDataTransacciones] = useState([]);

  const [fechas, setFechas] = useState({ fechaInicial: "", fechaFinal: "" });
  const [comercio, setComercio] = useState("");
  const [comercioSeleccionado, setComercioSeleccionado] = useState("");
  const [loadScreen, setLoadScreen] = useState(false);

  try {
    
    const getCommerces = async () => {
      setLoadScreen(true);
      try {
        setComercio("")
        if (comercioSeleccionado !== "" && comercioSeleccionado !== null && comercioSeleccionado !== undefined) {
          const dataBack = await buscarListaComerciosCierreCaja({ comercio: comercioSeleccionado });
          if (dataBack != null) { 
            if (dataBack.codigo === 200 && dataBack.status === true) {
              if (dataBack.obj.length > 0) {
                let dataComerciosList = []
                dataBack.obj.map((dataComercio) => {
                  dataComerciosList.push({value: dataComercio.idComercio, label: dataComercio.nombreComercio})
                });
                setDataComercios(dataComerciosList);
              } else {
                setDataComercios([]);
                notifyError("No existen comercios");
              }
            } else {
              notifyError("No se encontraton comercios");
            }
          } else {
            notifyError("Hubo un error, vuelva a intentar");
          }
        } else {
          notifyError("Debe ingresar un comercio");
        }
      } catch (error) {
        notifyError("Hubo un error, vuelva a intentar");
      }
      setLoadScreen(false);
    }

    const getData = async () => {
      setLoadScreen(true);
      let fechaActual = new Date().toISOString().split("T")[0];
      let comercioId = roleInfo?.id_comercio;
      if (!roleInfo.id_comercio) comercioId = comercio;
      try {
        if (fechas.fechaInicial !== "" && fechas.fechaFinal !== "" && comercioId !== "") {
          if (new Date(fechas.fechaFinal) < new Date(fechas.fechaInicial) && new Date(fechas.fechaFinal) <= new Date(fechaActual) && new Date(fechas.fechaInicial) <= new Date(fechaActual)) {
            notifyError("La fecha final debe ser mayor a la inicial");
          } else {
            const body = {
              idComercio: Number(comercioId),
              fechaInicio: fechas.fechaInicial,
              fechaFin: fechas.fechaFinal
            }
            const dataBack = await buscarReporteCierreCaja(body);
            if (dataBack != null) { 
              if (dataBack.codigo === 200 && dataBack.status === true) {
                if (dataBack.obj.grupoTransacciones.length > 0) {
                  setDataCapitalizar(dataBack.obj.capitalizar);
                  setDataInicioDia(dataBack.obj.inicioDia);
                  setDataTransacciones(dataBack.obj.grupoTransacciones);
                } else {
                  setDataCapitalizar({});
                  setDataInicioDia({});
                  setDataTransacciones([]);
                  notifyError("No se encontraron registros en el rango de fecha");
                }
              } else {
                notifyError("No se encontraton transacciones");
              }
            } else {
              notifyError("Hubo un error, vuelva a intentar");
            }
          }
        } else {
          notifyError("Debe llenar los campos");
        }
      } catch (error) {
        notifyError("Hubo un error, vuelva a intentar");
      }
      setLoadScreen(false);
    }

    return (
      <Fragment>
        { loadScreen &&
          <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4" />
            <h2 className="text-center text-white text-xl font-semibold">{"Cargando"}</h2>
          </div>
        }
        <h1 className="text-3xl mt-6">Cierre de caja</h1>
        <div className="containerCommerce">
          { !roleInfo.id_comercio &&
            <>
              <div className="containerCommerceSearch">
                <div className="commerceSelected">
                  <Input
                    autoComplete="off"
                    id="id_comercio"
                    label={"Buscar Comercio"}
                    maxLength="25"
                    minLength="1"
                    name="id_comercio"
                    onInput={(e) => {
                      setComercioSeleccionado(e.target.value);
                    }}
                    required={true}
                    type="search"
                    value={comercioSeleccionado}
                  />
                </div>
                <div>
                  <button
                    className="searchButton"
                    onClick={() => getCommerces()}
                    type="submit"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      x="0px" 
                      y="0px" 
                      width="25" 
                      height="25" 
                      viewBox="0 0 50 50"
                    >
                      <path 
                        d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z" />
                    </svg>
                  </button>
                </div>
              </div>
              { dataComercios.length > 0 ? (
                <div>
                  <Select
                    id="typeNumbers"
                    label={"Comercio"}
                    onChange={(e) => {
                      setComercio(e.target.value);
                    }}
                    options={[{ label: "", value: "" }, ...dataComercios]}
                    value={comercio}
                  />
                </div>
              ) : (
                <div/>
              )}
            </>
          }
        </div>
        <Form grid className="my-5">
          <Input
            autoComplete="off"
            id="fechaInicial"
            label={"Fecha inicio"}
            name="fechaInicial"
            onChange={(e) => {
              setFechas((last) => {
                return { ...last, fechaInicial: e.target.value };
              });
            }}
            required
            type="date"
            value={fechas?.["fechaInicial"]}
          />
          <Input
            autoComplete="off"
            id="fechaFinal"
            label={"Fecha fin"}
            name="fechaFinal"
            onChange={(e) => {
              setFechas((last) => {
                return { ...last, fechaFinal: e.target.value };
              });
            }}
            required
            type="date"
            value={fechas?.["fechaFinal"]}
          />
        </Form>
        <ButtonBar>
          <Button
            onClick={() => getData()}
            type="submit"
          >
            Generar reporte
          </Button>
        </ButtonBar>
        { dataTransacciones.length > 0 &&
          <div className="w-full px-10 my-10">          
            <Accordion
              titulo={
                <GridRow
                  cols={headers}
                />
              }
            />
            <Accordion
              titulo={
                <GridRow
                  cols={[
                    "", 
                    dataInicioDia.nombre, 
                    "",
                    "",
                    formatMoney.format(dataInicioDia.monto), 
                    formatMoney.format(dataInicioDia.comisiones)
                  ]}
                />
              }
            />
            <TreeView
              tree={dataTransacciones}
              child={false}
            />
            <Accordion
              titulo={
                <GridRow
                  cols={[
                    "", 
                    dataCapitalizar.nombre, 
                    dataCapitalizar.transaccionesExitosas,
                    dataCapitalizar.transaccionesFallidas,
                    formatMoney.format(dataCapitalizar.monto), 
                    formatMoney.format(dataCapitalizar.comisiones)
                  ]}
                />
              }
            />
            <Accordion
              titulo={
                <GridRow
                  cols={[
                    "", 
                    "Calculado", 
                    valoresCalculadosTotales(dataTransacciones,"transaccionesExitosas")+dataCapitalizar.transaccionesExitosas,
                    valoresCalculadosTotales(dataTransacciones,"transaccionesFallidas")+dataCapitalizar.transaccionesFallidas,
                    formatMoney.format(valoresCalculadosTotales(dataTransacciones,"monto")+dataInicioDia.monto+dataCapitalizar.monto), 
                    formatMoney.format(valoresCalculadosTotales(dataTransacciones,"comisiones")+dataInicioDia.comisiones+dataCapitalizar.comisiones)
                  ]}
                />
              }
            />
          </div>
        }
      </Fragment>
    );
  } catch (error) {
    return(<Error404 />)
  }
};

export default CierreCaja;
