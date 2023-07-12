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
  }, [sorteosLOT]);

  const onSubmit = (e) => {
    if (sorteo === " "){
      notifyError("Debe escoger el sorteo para generar el archivo de pago de premios")
    }
    else{
      reportePagoPremios_S3(sorteo);
      descargarReporte();
      setSorteo(" ");
    }
  }

  const descargarReporte = (()=>{
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const partesFecha = fecha.split("/");
    const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
    const sort=sorteosLOT.split(",")[0];
    const filename= `${sort}/${fechaFormateada}/sorteo_${sorteo}.zip`
    fetchData(`${url}/readPagoPremiosS3`, "GET", {filename: filename})
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          setSorteo(" ")
          return;
        }
        window.open(res?.obj, "_blank");
      })
      .catch((err) => console.error(err));
  })

  console.log("codigos_lot-->",codigos_lot)
  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Archivos pago de premios</h1>
      <Select
        className="place-self-stretch"
        id="selectSorteo"
        label="Seleccione un sorteo"
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