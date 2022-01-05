import { useEffect, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useLoteria } from "../utils/LoteriaHooks";
import Select from "../../../components/Base/Select/Select";
import Form from "../../../components/Base/Form/Form";
import { toast } from "react-toastify";
import Auth from '@aws-amplify/auth';
import Lambda from 'aws-sdk/clients/lambda'; // npm install aws-sdk

const DescargarArchivos = () => {

  

  const [downloadRef, setDownloadRef] = useState("");
  const [downloadRefPagos, setDownloadRefPagos] = useState("");
  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);
  
  const [opcionesdistri, SetOpcionesDistri] = useState([
    { value: "", label: "" },
  ]);
  
  const [distribuidor, setDistribuidor] = useState("PPVIR");
  const [sorteo, setSorteo] = useState("");

  const { getReportesVentas, con_sort_ventas, getReportesPagos, con_distribuidor_venta, cargueVentasFisicas_S3} = useLoteria();
  const [disabled_Btn, setDisabled_Btn] = useState(true)

  const S3 = (e) => {
    e.preventDefault();
    cargueVentasFisicas_S3().then((res) => {
      if(res.estado===true){
        notify(res.msg);
      }
      else{
        notifyError(res.msg)
      }
    });
    };

  useEffect(() => {
    getReportesPagos().then((res) => {
      setDownloadRefPagos(res);
    });
    con_sort_ventas().then((res) => {
      
      const copy = [...opcionesdisponibles];
      if (copy.length === 1) {
        for (var i = 0; i < res?.length; i++) {
          if (res[i]["fisico"]) {
            copy.push({
              value: `${res[i]["num_sorteo"]}-${res[i]["fisico"]}-${res[i]["num_loteria"]}`,
              label: `Sorteo - ${res[i]["num_sorteo"]} - fisico`,
            });
          } else {
            copy.push({
              value: `${res[i]["num_sorteo"]}-${res[i]["fisico"]}-${res[i]["num_loteria"]}`,
              label: `Sorteo - ${res[i]["num_sorteo"]} - virtual`,
            });
          }
        }
      }
      SetOpcionesDisponibles([...copy]);
    });

    con_distribuidor_venta().then((res) => {
      
      const copy2 = [...opcionesdisponibles];
      if (copy2.length === 1) {
        console.log(res?.info)
        for (var i = 0; i < res?.info?.length; i++) {
          
            copy2.push({
              value: `${res.info[i]}`,
              label: `${res.info[i]}`,
            });
        }
      }
      SetOpcionesDistri([...copy2]);
    });    
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    getReportesVentas(sorteo,e.target.value).then((res) => {
      console.log(res)
      if('msg' in res){
        notifyError(res.msg);
        setDownloadRef(res.msg);
      }else{
      setDownloadRef(res.archivo);
      setDisabled_Btn(false)
      console.log(res)
      }
   });
  };

  const onSubmitVir = (e) => {
    if(e.target.value.split('-')[1]==='false'){
    
    getReportesVentas(e.target.value,distribuidor).then((res) => {
      console.log(res)
      if('msg' in res){
        notifyError(res.msg);
        setDownloadRef(res.msg);
      }else{
      setDownloadRef(res.archivo);
      setDisabled_Btn(false)
      console.log(res)
      }
  });} 
  }
  
  const disabled = (e) =>{
    setDisabled_Btn(true)
  }

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


  return (
    <div>
      <Form onSubmit={S3} >
      <ButtonBar>
      <Button type="submit">
      S3   
      </Button>
      </ButtonBar>
      </Form>
      
      <Form grid>
        
        <Select
          id="selectSorteo"
          label="Tipo de sorteo"
          options={opcionesdisponibles}
          required={true}
          value={sorteo}
          onChange={(e) => {
            setSorteo(e.target.value);
            setDisabled_Btn(true)
            onSubmitVir(e)
            
            
          }}
        />
        {sorteo!=='' && sorteo.split('-')[1]!=='false'?
        <Select
        id="selectDistribuidor"
        label="Distribuidor"
        options={opcionesdistri}
        required={true}
        value={distribuidor}
        onChange={(e) => {
          setDistribuidor(e.target.value);
          onSubmit(e);
        }}
        />:""}
        
        {!disabled_Btn?
        <ButtonBar>
        <Button type="button" onClick={() => {
              disabled();
            
            }}>
          <a
          href={downloadRef}
          download={`Reporte_ventas-${sorteo}-${distribuidor}-${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.txt`}
          target="_blank"
          rel="noreferrer" 
        >
          Descargar archivo
        </a>          
        </Button>
        </ButtonBar> : ''}
        {/* <ButtonBar>
        <Button type="button" onClick={() => {
              disabled();
              onsubmit();
            
            }}>
          <a
          href={downloadRefPagos}
          download={`Reporte_pagos-Sorteo_semana???-${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.txt`}
          target="_blank"
          rel="noreferrer" 
        >
          Descargar archivo pagos
        </a>          
        </Button>
        </ButtonBar> */}

      </Form>
    </div>
  );
};

export default DescargarArchivos;
