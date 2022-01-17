import { useCallback } from "react";
import fetchData from "../../../../utils/fetchData";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState, useEffect } from "react";
import Input from "../../../../components/Base/Input/Input";
import { notify, notifyError } from "../../../../utils/notify";
import { ExportToCsv } from "export-to-csv";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function createCard(
  cod_distribuidor,
  cod_sucursal,
  sorteo,
  cod_loteria,
  num_billete,
  serie,
  fracciones,
  val_venta,
  fisico,
  fecha_venta) {
  return {
    cod_distribuidor,
  cod_sucursal,
  sorteo,
  cod_loteria,
  num_billete,
  serie,
  fracciones,
  val_venta,
  fisico,
  fecha_venta
  };
}
const url_reportVentas = `${process.env.REACT_APP_URL_LOTO_VENTA_REPORTES}/reportes_ventas`



const ReportVentasForm = ({closeModal, oficina}) => {

  const [fecha_ini, setFecha_ini] = useState('');
  const [fecha_fin, setFecha_fin] = useState('');
  const [disabledBtns, setDisabledBtns] = useState(true);
  const [resp_report,setResp_report] = useState(null)
  const [total,setTotal] = useState(null)
  

  const reportVentas = useCallback(async (fecha_ini,fecha_fin) => {
    try {
      const query= {fecha_ini:fecha_ini,
                    fecha_fin:fecha_fin,}
      if(oficina!==undefined){
        
          query.cod_distribuidor=oficina?.cod_oficina_lot;
          query.cod_sucursal=oficina?.cod_sucursal_lot; 

      }
      
      const res = await fetchData(url_reportVentas, "GET", 
        query 
      );
      
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);
 
  
  

  
  

  //const { reportVentas } = useLoteria();


  
 

  const exportdata = (e) => {
    e.preventDefault();
    setDisabledBtns(true)
    closeModal();
    
    const rows = [];

    resp_report.map((row) => {
      rows.push(
        createCard(
          row.cod_distribuidor,
          row.cod_sucursal,
          row.sorteo,
          row.cod_loteria,
          row.num_billete,
          row.serie,
          row.fracciones,
          row.val_venta,
          row.fisico,
          row.fecha_venta,
        )
      );
      return null;
    });
    const options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      title: "Reporte ventas",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: "Reporte ventas",
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
    const csvExporter = new ExportToCsv(options);
    if (rows.length > 0) {
      csvExporter.generateCsv(rows);
    }
    setFecha_ini('')
    setFecha_fin('')
    setResp_report(null)
    setTotal(null)
    return null;
  };

  console.log(resp_report,fecha_ini,fecha_fin)
  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={exportdata} grid>
            <div
              className="flex flex-row justify-between text-lg font-medium grid"
            >
             Seleccione el rango de fechas para generar el reporte

              
            </div>
            {/* <Input
            id="numsorteo"
            label="Sorteo"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="off"
            required='true'
            value={sorteo}
            onInput={(e) => {
              if(!isNaN(e.target.value)){
                const num = (e.target.value);
                setSorteo(num);
                }
            }}     
            /> */}
            <Input
              id="fecha_ini"
              label="Fecha inicial"
              type="date"
              required='true'
              value={fecha_ini}
              onInput={(e) => {
                setFecha_ini(e.target.value);
                if(fecha_fin!==''){
                  reportVentas(e.target.value,fecha_fin)
                    .then((res) => {                                      
                        if('msg' in res){
                          notifyError(res.msg)
                          setDisabledBtns(true)
                        }
                        else{
                          console.log(res)
                          setResp_report(res.data)
                          setTotal(res.total)                          
                          setDisabledBtns(false)
                        }                     
                                    
                    })}
              }}
            />
            <Input
              id="fecha_fin"
              label="Fecha final"
              type="date"
              required='true'
              value={fecha_fin}
              onInput={(e) => {
                setFecha_fin(e.target.value);
                if(fecha_ini!==''){
                reportVentas(fecha_ini,e.target.value)
                  .then((res) => {                                      
                      if('msg' in res){
                        notifyError(res.msg)
                        setDisabledBtns(true)
                      }
                      else{
                        console.log(res)
                        setResp_report(res.data)
                        setTotal(res.total)
                        setDisabledBtns(false)
                      }                     
                                  
                  })}
                
              }}
            /> 
            {total!==null?
            <>
            <Input
            id="frac_venta"
            label="Fracciones vendidas"
            type="text"
            required='true'
            value={total.total_frac}
            />
            <Input
            id="val_total"
            label="Total ventas"
            type="text"
            required='true'
            value={formatMoney.format(total.val_total)}
            />
            </>
            :""}
                       
            <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Descargar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setFecha_fin('');
                setFecha_ini('');
                setResp_report(null) 
                setTotal(null)
                setDisabledBtns(true)       
              
              }}
            >
              Cancelar
            </Button>
            </ButtonBar>            
        
        </Form>
      </div>
    </>
  );
};

export default ReportVentasForm;
