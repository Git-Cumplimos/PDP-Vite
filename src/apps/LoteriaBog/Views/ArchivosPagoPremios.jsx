import { Fragment, useEffect, useMemo, useState } from "react";

import Button from "../../../components/Base/Button";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
import { useLoteria } from "../utils/LoteriaHooks";
import Select from "../../../components/Base/Select"

const url = process.env.REACT_APP_URL_LOTERIAS;

const ArchivosPagoPremios = () => {

  const { codigos_lot,reportePagoPremios_S3} = useLoteria();
  const [opciones, setOpciones] = useState([]);
  const [sorteo, setSorteo] = useState(" ");
  
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
    const copy = [{ value: "", label: "" }];
    const query = {
      num_loteria: sorteosLOT
    }
    fetchData(`${url}/listarSorteosPagosPremios`,"GET",query,{})
    .then((res)=>{
      const sorteos = res?.obj;
      for (const sort of sorteos){
        const clave = Object.keys(sort)[0];
        const valor = sort[clave];
        copy.push({ label:[valor], value:valor });
      }
      setOpciones([...copy])
    })
    .catch((err) => console.error(err));
  }, []);

  const onSubmit = (e) => {
    if (sorteo === " "){
      notifyError("Debe escoger el sorteo para generar los archivos de pago de premios")
    }
    else{
      console.log("solicitar archivos")
      reportePagoPremios_S3(sorteo)
    }
  }

  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Archivos pago de premios</h1>
      <Select
        className="place-self-stretch"
        id="selectSorteo"
        label="Sorteos disponibles"
        options={opciones}
        value={sorteo}
        onChange={(e) => {
          setSorteo(e.target.value);
        }}
      />
      <Button
      type="submit"
      onClick={()=>{
        onSubmit();
      }}
      >Generar archivo</Button>
    </Fragment>
  );
};

export default ArchivosPagoPremios;