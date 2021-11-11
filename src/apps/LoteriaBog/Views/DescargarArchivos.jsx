import { useEffect, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useLoteria } from "../utils/LoteriaHooks";
import Select from "../../../components/Base/Select/Select";
import Form from "../../../components/Base/Form/Form";

const DescargarArchivos = () => {
  const [downloadRef, setDownloadRef] = useState("");
  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);
  const [sorteo, setSorteo] = useState("");

  const { getReportesVentas, con_sort_ventas } = useLoteria();
  const [disabled_Btn, setDisabled_Btn] = useState(true)

  useEffect(() => {
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
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setDisabled_Btn(false)
    getReportesVentas(e.target.value).then((res) => {
      setDownloadRef(res);
   });
  };
  
  const disabled = (e) =>{
    setDisabled_Btn(true)
  }


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
            onSubmit(e)
          }}
        />
        {!disabled_Btn?
        <ButtonBar>
        <Button type="button" onClick={() => {
              disabled();
            
            }}>
          <a
          href={downloadRef}
          download={`Reporte_ventas-${sorteo}-${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.txt`}
          target="_blank"
          rel="noreferrer" 
        >
          Descargar archivo
        </a>          
        </Button>
        </ButtonBar> : ''}

      </Form>
    </div>
  );
};

export default DescargarArchivos;
