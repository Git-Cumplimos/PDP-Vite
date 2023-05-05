import { Fragment, useState } from "react";

import Accordion from "../../../../components/Base/Accordion";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";

import { buscarReporteTrxArqueo } from "../../utils/fetchCaja";
import { makeMoneyFormatter } from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import Error404 from "../../../Error404";

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

const ReporteTrx = () => {

  const { roleInfo } = useAuth();
  const [dataCapitalizar, setDataCapitalizar] = useState({});
  const [dataInicioDia, setDataInicioDia] = useState({});
  const [dataTransacciones, setDataTransacciones] = useState([]);

  const [loadScreen, setLoadScreen] = useState(false);
  const [fechas, setFechas] = useState({ fechaInicial: "", fechaFinal: "" });

  try{
      
    const getData = async () => {
      setLoadScreen(true);
      try {
        if (fechas.fechaInicial !== "" && fechas.fechaFinal !== "") {
          if (new Date(fechas.fechaFinal) <= new Date(fechas.fechaInicial)) {
            notifyError("La fecha final debe ser mayor a la inicial");
          } else {
            const body = {
              idComercio: roleInfo.id_comercio,
              fechaInicio: fechas.fechaInicial,
              fechaFin: fechas.fechaFinal
            }
            const dataBack = await buscarReporteTrxArqueo(body);
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
                notifyError("Consulta fallida");
              }
            }
          }
        } else {
          notifyError("Debe seleccionar ambas fechas");
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
        <h1 className="text-3xl mt-6">Reporte de transacciones</h1>        
        <div className="w-full px-10 my-10">
          <Input
            id="fechaInicial"
            name="fechaInicial"
            label={"Fecha inicio"}
            type="date"
            autoComplete="off"
            value={fechas?.["fechaInicial"]}
            onChange={(e) => {
              setFechas((last) => {
                return { ...last, fechaInicial: e.target.value };
              });
            }}
            required
          />
          <br/>
          <Input
            id="fechaFinal"
            name='fechaFinal'
            label={"Fecha fin"}
            type="date"
            autoComplete="off"
            value={fechas?.["fechaFinal"]}
            onChange={(e) => {
              setFechas((last) => {
                return { ...last, fechaFinal: e.target.value };
              });
            }}
            required
          />
          <ButtonBar className='lg:col-span-2'>
            <Button
              onClick={() => getData()}
              type='submit'
            >
              Generar reporte
            </Button>
          </ButtonBar>
        </div>
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

export default ReporteTrx;
