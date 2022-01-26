import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import Form from "../../../components/Base/Form/Form"
import Input from "../../../components/Base/Input/Input"
import Select from "../../../components/Base/Select/Select"
import Table from "../../../components/Base/Table/Table";
import { notify, notifyError } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import { ExportToCsv } from "export-to-csv";

function createCard(
  fecha,
  id_trx,
  tipo_operacion,
  sms,
  numeros,
  creditos,
) {
  return {
  fecha,
  id_trx,
  tipo_operacion,
  sms,
  numeros,
  creditos,
  };
}

const url_Report = `${process.env.REACT_APP_URL_Report_SMS}/report`;
const url_actualizar = `${process.env.REACT_APP_URL_Report_SMS}/actualizar_pendientes`;
const url_Download = `${process.env.REACT_APP_URL_Report_SMS}/reportDownload`;


const ReporteSMS = () => {

  const [trxs, setTrxs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [tipoOp, setTipoOp] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [fechaInicialDownload, setFechaInicialDownload] = useState('')
  const [fechaFinalDownload, setFechaFinalDownload] = useState('')  
  const [Download, setDownload] = useState(null);
  const [showModal2, setShowModal2] = useState(false)
  const [disabledBtn, setDisabledBtn] = useState(true)

  const exportdata = (e) => { 
    console.log('Hola') 
    e.preventDefault();
    setShowModal2(false)  
    const rows = [];  
    Download.map((row) => {
      rows.push(
        createCard(
          row.fecha,
          row.id_trx,
          row.tipo_operacion,
          row.sms,
          row.numeros,
          row.creditos,
        )
      );
      return null;
    });
    const options = {
      fieldSeparator: ";",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      title: "Reporte SMS",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: "Reporte SMS",
    };
    const csvExporter = new ExportToCsv(options);
    if (rows.length > 0) {
      csvExporter.generateCsv(rows);
    }
    setDownload(null);
    return null;
  };
  

  const options = [
    { value: "", label: "" },
    { value: "16", label: "Mensajes enviados" },
    { value: "17", label: "Mensajes en espera" },
  
  ];

  /*Buscar report*/
  const report = useCallback(async (tipoOp,page,fechaInicial,fechaFinal) => {
    console.log(tipoOp)
    const query={'tipo_operacion':tipoOp}
    query.page=page
    if (fechaInicial && fechaFinal){
    query.fecha_ini=fechaInicial
    query.fecha_fin=fechaFinal
    }


    try {     
      const res = await fetchData(url_Report, "GET", query);
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  /*Actualizar datos*/
  const actualizar = useCallback(async (id_trx) => {
    const query={'id_trx':id_trx}
    try {     
      const res = await fetchData(url_actualizar, "GET", query);
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  /*Download*/
  const download = useCallback(async (fecha_ini,fecha_fin) => {
    const query={}
    query.fecha_ini=fecha_ini
    query.fecha_fin=fecha_fin
    try {     
      const res = await fetchData(url_Download, "GET", query);
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal2(true)
    
  };

  const closeModal2 = useCallback(() => {
    setShowModal2(false);
    setDisabledBtn(true);
    setDownload(null);
    setFechaInicialDownload('')
    setFechaFinalDownload('')  
  });

  const closeModal = useCallback(async (tipoOp) => {
    setShowModal(false);
    console.log(tipoOp)
    report(
      tipoOp,
      page,
      fechaInicial,
      fechaFinal
      ).then((res) => {
      if (res.status===false) {
        notifyError(res.msg);   
      } else {
        setMaxPages(res?.obj?.maxPages)
        setTrxs(res?.obj?.results)
        console.log(res?.obj?.results);
            
      }
    });

  }, []);

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Reporte</h1>
      <Form onSubmit={onSubmit} grid>
        <ButtonBar className="col-span-1 md:col-span-2">
        <Button
        type="submit"
        onClick={() => {         

        }}
        >
          Descargar reporte
        </Button>
        </ButtonBar> 
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicial}
          onInput={(e) => {
            setPage(1);
            setMaxPages(1);
            setFechaInicial(e.target.value);
            if(fechaFinal!==''){
              if ( tipoOp!==""){
                report(
                  tipoOp,
                  1,
                  e.target.value,
                  fechaFinal
                  ).then((res) => {
                  if (res.status===false) {
                    notifyError(res.msg);   
                  } else {
                    setMaxPages(res?.obj?.maxPages)
                    setTrxs(res?.obj?.results)
                    console.log(res?.obj?.results);
                        
                  }
                });
              }
            }
          }}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          value={fechaFinal}
          onInput={(e) => {
            setPage(1);
            setFechaFinal(e.target.value);
            if(fechaInicial!==''){
              if ( tipoOp!==""){
                report(
                  tipoOp,
                  1,
                  fechaInicial,
                  e.target.value,                  
                  ).then((res) => {
                  if (res.status===false) {
                    notifyError(res.msg);   
                  } else {
                    setMaxPages(res?.obj?.maxPages)
                    setTrxs(res?.obj?.results)
                    console.log(res?.obj?.results);
                        
                  }
                });
              }
            }
          }}
        />
        <Select
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={options}
          value={tipoOp}
          onChange={(e) => {
            setPage(1);
            setTipoOp(parseInt(e.target.value));
            if(!(e.target.value===null || e.target.value==='')){
              report(
                e.target.value,
                1,
                fechaInicial,
                fechaFinal
                ).then((res) => {
                if (res.status===false) {
                  notifyError(res.msg);   
                } else {
                  setMaxPages(res?.obj?.maxPages)
                  setTrxs(res?.obj?.results)
                  console.log(res?.obj?.results);
                      
                }
              });
            }
           
          }}
        />      
              
        <ButtonBar className="col-span-1 md:col-span-2">
          <Button
            type="button"
            disabled={page < 2}
            onClick={() => {
              setPage(page - 1);
              report(
                tipoOp,
                page - 1,
                fechaInicial,
                fechaFinal
                ).then((res) => {
                if (res.status===false) {
                  notifyError(res.msg);   
                } else {
                  setTrxs(res?.obj?.results)
                  console.log(res?.obj?.results);
                      
                }
              });
              
              
            }}
          >
            Anterior
          </Button>
          <Button
            type="button"
            disabled={page >= maxPages}
            onClick={() => {
              setPage(page + 1);
              report(
                tipoOp,
                page + 1,
                fechaInicial,
                fechaFinal
                ).then((res) => {
                if (res.status===false) {
                  notifyError(res.msg);   
                } else {
                  setTrxs(res?.obj?.results)
                  console.log(res?.obj?.results);
                      
                }
              });
              
            }}
          >
            Siguiente
          </Button>
        </ButtonBar>
      </Form>
      {Array.isArray(trxs) && trxs.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={["Fecha", "Mensaje","Números","Creditos"]}
            data={trxs.map(({ fecha, sms, numeros,creditos }) => {
              const tempDate = new Date(fecha);
              tempDate.setHours(tempDate.getHours() + 5);
              fecha = Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric"
              }).format(tempDate);
              return {
                fecha,
                sms: sms.length > 30 ? `${sms.substring(0, 30)}...` : sms,
                numeros,
                creditos,
              };
            })}
            onSelectRow={(_e, index) => {
              if (tipoOp===17){
              setSelected(trxs[index]);
              setShowModal(true);
              }
            }}
          />
        </>
      ) : (
        ""
      )}

      <Modal show={showModal} handleClose={()=>{closeModal(tipoOp)}}>
      <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            Desea actualizar el estado del envio con fecha de {' '}
            {selected?.fecha ? Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric"
              }).format((new Date(selected?.fecha)).setHours((new Date(selected?.fecha)).getHours()+5))
            :
            ''}
            
          </h1>         
          <ButtonBar>
            <Button 
            type="submit" 
            onClick={() => {
              closeModal(tipoOp)
              actualizar(
                selected.id_trx
                ).then((res) => {
                if (res.status===false) {
                  notifyError(res?.obj?.msg);   
                } else {
                  notify(res?.obj?.msg)
                  console.log(res?.obj?.results);
                      
                }
              });
              
              }}>
              Aceptar
            </Button>            
          </ButtonBar>
        </div>
        {/* )} */}  
        
      </Modal>

      <Modal show={showModal2} handleClose={closeModal2}>
      <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            Seleccione el rango de fechas para realizar la descarga            
          </h1>
          <Form onSubmit={exportdata}>
          <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          value={fechaInicialDownload}
          onInput={(e) => {
            setPage(1);
            setMaxPages(1);
            setFechaInicialDownload(e.target.value);
            if(fechaFinalDownload!==''){
              download(
                e.target.value,
                fechaFinalDownload
                ).then((res) => {
                if (res.status===false) {
                  setDownload(null)
                  notifyError(res.msg);   
                } else {
                  console.log(res?.obj?.results);
                  setDisabledBtn(false)
                  setDownload(res?.obj)                      
                }
              });
            }
          }}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinalDownload}
            onInput={(e) => {
              setPage(1);
              setFechaFinalDownload(e.target.value);
              if(fechaInicialDownload!==''){
                download(
                  fechaInicialDownload,
                  e.target.value                
                  ).then((res) => {
                  if (res.status===false) {
                    setDownload(null)
                    notifyError(res.msg);   
                  } else {
                    setDownload(res?.obj?.results)
                    setDisabledBtn(false) 
                    console.log(res?.obj?.results);                      
                  }
                });
              }
            }}
          />

          <ButtonBar>
            <Button 
            type="submit" 
            disabled={disabledBtn}
            >
              Descargar
            </Button>
            <Button
              type="button"
              onClick={() => {
                closeModal2();               
              }}
            >
              Cancelar
            </Button>            
          </ButtonBar>
          </Form>
        </div>
        {/* )} */}  
        
      </Modal>
    </div>
  );
};

export default ReporteSMS;
