/* eslint-disable react-hooks/rules-of-hooks */
import { Fragment, useRef, useState } from "react";

import Accordion from "./CierreCaja.component";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Error404 from "../../../../Error404";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Select from "../../../../../components/Base/Select";

import { buscarListaComerciosCierreCaja, buscarReporteCierreCaja } from "../../../utils/fetchCaja";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import { notifyError } from "../../../../../utils/notify";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useReactToPrint } from "react-to-print";

import "./CierreCaja.style.css";
import * as CierreCajaCons from "./CierreCaja.cons";

const formatMoney = makeMoneyFormatter(2);


// transacciones de consignación   = tbl_comprobantes
// el traslado de comisiones al cupo   = 
// notas débito/crédito  = tbl_notas_dc


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
)

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
        valoresCalculadosGrupos(info.autorizadores,CierreCajaCons.TAG_TRX_SUCCESS),
        valoresCalculadosGrupos(info.autorizadores,CierreCajaCons.TAG_TRX_FAILURE), 
        formatMoney.format(valoresCalculadosGrupos(info.autorizadores,CierreCajaCons.TAG_AMOUNT)), 
        formatMoney.format(valoresCalculadosGrupos(info.autorizadores,CierreCajaCons.TAG_COMMISSION))
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
})

const valoresCalculadosTotales = (gruposTransaccion, valor) => {
  var valorCalculado = 0
  if (gruposTransaccion !== null && gruposTransaccion !== undefined) {
    if (gruposTransaccion.length > 0) {
      gruposTransaccion.map((autorizadores) => {
        if (autorizadores.autorizadores.length > 0) {
          if (valor === CierreCajaCons.TAG_TRX_SUCCESS) {
            autorizadores.autorizadores.map((autorizador) => {
              valorCalculado += Number(autorizador.transaccionesExitosas);
            })
          }
          if (valor === CierreCajaCons.TAG_TRX_FAILURE) {
            autorizadores.autorizadores.map((autorizador) => {
              valorCalculado += Number(autorizador.transaccionesFallidas);
            })
          }
          if (valor === CierreCajaCons.TAG_AMOUNT) {
            autorizadores.autorizadores.map((autorizador) => {
              valorCalculado += Number(autorizador.monto);
            })
          }
          if (valor === CierreCajaCons.TAG_COMMISSION) {
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
      if (valor === CierreCajaCons.TAG_TRX_SUCCESS) {
        autorizadores.map((autorizador) => {
          valorCalculado += Number(autorizador.transaccionesExitosas);
        })
      }
      if (valor === CierreCajaCons.TAG_TRX_FAILURE) {
        autorizadores.map((autorizador) => {
          valorCalculado += Number(autorizador.transaccionesFallidas);
        })
      }
      if (valor === CierreCajaCons.TAG_AMOUNT) {
        autorizadores.map((autorizador) => {
          valorCalculado += Number(autorizador.monto);
        })
      }
      if (valor === CierreCajaCons.TAG_COMMISSION) {
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
  CierreCajaCons.HEADER_TRX_SUCCESS,
  CierreCajaCons.HEADER_TRX_FAILURE,
  CierreCajaCons.HEADER_AMOUNT,
  CierreCajaCons.HEADER_COMMISSION
]

const CierreCaja = () => {

  try {

    const printDiv = useRef();
  
    const { roleInfo } = useAuth();
    const [dataCapitalizar, setDataCapitalizar] = useState({});
    const [dataComercios, setDataComercios] = useState([]);
    const [dataInicioDia, setDataInicioDia] = useState({});
    const [dataTransacciones, setDataTransacciones] = useState([]);
    const [dataPdp, setDataPdp] = useState();

    const [fechas, setFechas] = useState({ fechaInicial: "", fechaFinal: "" });
    const [comercio, setComercio] = useState("");
    const [comercioSeleccionado, setComercioSeleccionado] = useState("");
    const [loadScreen, setLoadScreen] = useState(false);

    const handlePrint = useReactToPrint({ content: () => printDiv.current, });
    
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
                notifyError(CierreCajaCons.MESSAGE_EMPTY_COMMERCE);
              }
            } else {
              notifyError(CierreCajaCons.MESSAGE_EMPTY_COMMERCE);
            }
          } else {
            notifyError(CierreCajaCons.MESSAGE_ERROR);
          }
        } else {
          notifyError(CierreCajaCons.MESSAGE_NEED_COMMERCE);
        }
      } catch (error) {
        notifyError(CierreCajaCons.MESSAGE_ERROR);
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
            notifyError(CierreCajaCons.MESSAGE_INCONSISTENT_DATE);
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
                  setDataPdp(dataBack.obj.pdP)
                } else {
                  setDataCapitalizar({});
                  setDataInicioDia({});
                  setDataTransacciones([]);
                  setDataPdp([])
                  notifyError(CierreCajaCons.MESSAGE_EMPY_DATA_PER_DATE);
                }
              } else {
                notifyError(CierreCajaCons.MESSAGE_EMPTY_TRX);
              }
            } else {
              notifyError(CierreCajaCons.MESSAGE_ERROR);
            }
          }
        } else {
          notifyError(CierreCajaCons.MESSAGE_EMPY_FIELDS);
        }
      } catch (error) {
        notifyError(CierreCajaCons.MESSAGE_ERROR);
      }
      setLoadScreen(false);
    }

    return (
      <Fragment>
        { loadScreen &&
          <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4" />
            <h2 className="text-center text-white text-xl font-semibold">{CierreCajaCons.LABEL_LOADING}</h2>
          </div>
        }
        <h1 className="text-3xl mt-6">{CierreCajaCons.LABEL_TITLE_MODULE}</h1>
        <div className="containerCommerce">
          { !roleInfo.id_comercio &&
            <>
              <div className="containerCommerceSearch">
                <div className="commerceSelected">
                  <Input
                    autoComplete="off"
                    id={CierreCajaCons.TAG_FIND_COMMERCE}
                    label={CierreCajaCons.LABEL_FIND_COMMERCE}
                    maxLength="25"
                    minLength="1"
                    name={CierreCajaCons.TAG_FIND_COMMERCE}
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
                      xmlns={CierreCajaCons.UTIL_XMLNS}
                      x="0px" 
                      y="0px" 
                      width="25" 
                      height="25" 
                      viewBox="0 0 50 50"
                    >
                      <path 
                        d={CierreCajaCons.UTIL_D_PATH} />
                    </svg>
                  </button>
                </div>
              </div>
              { dataComercios.length > 0 ? (
                <div>
                  <Select
                    id="typeNumbers"
                    label={CierreCajaCons.LABEL_COMMERCE}
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
            id={CierreCajaCons.TAG_INITIAL_DATE}
            label={CierreCajaCons.LABEL_INITIAL_DATE}
            name={CierreCajaCons.TAG_INITIAL_DATE}
            onChange={(e) => {
              setFechas((last) => {
                return { ...last, fechaInicial: e.target.value };
              });
            }}
            required
            type="date"
            value={fechas?.[CierreCajaCons.TAG_INITIAL_DATE]}
          />
          <Input
            autoComplete="off"
            id={CierreCajaCons.TAG_FINAL_DATE}
            label={CierreCajaCons.LABEL_FINAL_DATE}
            name={CierreCajaCons.TAG_FINAL_DATE}
            onChange={(e) => {
              setFechas((last) => {
                return { ...last, fechaFinal: e.target.value };
              });
            }}
            required
            type="date"
            value={fechas?.[CierreCajaCons.TAG_FINAL_DATE]}
          />
        </Form>
        { dataTransacciones.length === 0 ? (
          <ButtonBar>
            <Button
              onClick={() => getData()}
              type="submit"
            >
              {CierreCajaCons.LABEL_BUTTON_GENERATE_REPORT}
            </Button>
          </ButtonBar>
        ) : (
          <>
            <div className="containerCommerceSearch">
              <ButtonBar>
                <Button
                  onClick={() => getData()}
                  type="submit"
                >
                  {CierreCajaCons.LABEL_BUTTON_GENERATE_REPORT}
                </Button>
              </ButtonBar>
              <ButtonBar>
                <Button
                  onClick={() => handlePrint()}
                  type="submit"
                >
                  {CierreCajaCons.LABEL_BUTTON_PRINT_REPORT}
                </Button>
              </ButtonBar>
            </div>
            <div ref={printDiv}>
              <Accordion
                estiloTitulo = {true}
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
                      dataInicioDia.monto !== CierreCajaCons.LABEL_NA ? (formatMoney.format(dataInicioDia.monto)) : (formatMoney.format(dataInicioDia.monto).toString().replace("$","")), 
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
                    dataPdp.nombre, 
                    valoresCalculadosTotales(dataPdp.valores_report,CierreCajaCons.TAG_TRX_SUCCESS),
                    valoresCalculadosTotales(dataPdp.valores_report,CierreCajaCons.TAG_TRX_FAILURE),
                    formatMoney.format(Number(valoresCalculadosTotales(dataPdp.valores_report,CierreCajaCons.TAG_AMOUNT))),
                    dataPdp.comisiones,
                  ]}
                />
              }>
                <TreeView
                  tree={dataPdp.valores_report}
                  child={false}
                />
              </Accordion>
              <Accordion
                titulo={
                  <GridRow
                    cols={[
                      "", 
                      CierreCajaCons.LABEL_COLUMN_BALANCE,
                      valoresCalculadosTotales(dataTransacciones,CierreCajaCons.TAG_TRX_SUCCESS)+dataCapitalizar.transaccionesExitosas,
                      valoresCalculadosTotales(dataTransacciones,CierreCajaCons.TAG_TRX_FAILURE)+dataCapitalizar.transaccionesFallidas,
                      dataInicioDia.monto !== CierreCajaCons.LABEL_NA ? 
                        (
                          formatMoney.format(Number(valoresCalculadosTotales(dataTransacciones,CierreCajaCons.TAG_AMOUNT))+Number(dataInicioDia.monto)+Number(dataCapitalizar.monto))
                        ) : (
                          formatMoney.format(Number(valoresCalculadosTotales(dataTransacciones,CierreCajaCons.TAG_AMOUNT))+Number(dataCapitalizar.monto))
                        ),
                      formatMoney.format(Number(valoresCalculadosTotales(dataTransacciones,CierreCajaCons.TAG_COMMISSION))+Number(dataInicioDia.comisiones)+Number(dataCapitalizar.comisiones))
                    ]}
                  />
                }
              />
            </div>
          </>
        )}
      </Fragment>
    )
  } catch (error) {
    return(<Error404 />)
  }
}

export default CierreCaja;
