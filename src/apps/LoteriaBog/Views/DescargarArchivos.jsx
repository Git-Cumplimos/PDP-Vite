import { useEffect, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useLoteria } from "../utils/LoteriaHooks";
import Select from "../../../components/Base/Select/Select";
import Form from "../../../components/Base/Form/Form";
import { toast } from "react-toastify";

const DescargarArchivos = () => {
  const [downloadRef, setDownloadRef] = useState("");
  const [downloadRefPagos, setDownloadRefPagos] = useState("");
  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);
  
  const [opcionesdistri, SetOpcionesDistri] = useState([
    { value: "", label: "" },
  ]);
  
  const [distribuidor, setDistribuidor] = useState("");
  const [sorteo, setSorteo] = useState("");

  const { getReportesVentas, con_sort_ventas, getReportesPagos, con_distribuidor_venta} = useLoteria();
  const [disabled_Btn, setDisabled_Btn] = useState(true)

  useEffect(() => {
    getReportesPagos().then((res) => {
      setDownloadRefPagos(res);
    });
    con_sort_ventas().then((res) => {
      
      const copy = [...opcionesdisponibles];
      if (copy.length === 1) {
        for (var i = 0; i < res.length; i++) {
          if (res[i]["fisico"]) {
            copy.push({
              value: `${res[i]["num_sorteo"]}-${res[i]["fisico"]}`,
              label: `Sorteo - ${res[i]["num_sorteo"]} - fisico`,
            });
          } else {
            copy.push({
              value: `${res[i]["num_sorteo"]}-${res[i]["fisico"]}`,
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
        console.log(res.info)
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
    
    setDisabled_Btn(false)
    getReportesVentas(sorteo,e.target.value).then((res) => {
      console.log(res)
      if('msg' in res){
        notifyError(res.msg);
        setDownloadRef(res.msg);
      }else{
      setDownloadRef(res.archivo);
      console.log(res)
      }
   });
  };
  
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


  return (
    <div>
      <Form grid>
        <Select
          id="selectSorteo"
          label="Tipo de sorteo"
          options={opcionesdisponibles}
          required={true}
          value={sorteo}
          onChange={(e) => {
            setSorteo(e.target.value);
            
          }}
        />
        {sorteo!==''?
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
