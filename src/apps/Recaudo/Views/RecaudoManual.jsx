import { useEffect, useState } from "react";
import useQuery from "../../../hooks/useQuery";
import FlujoRecaudo from "../components/FlujoRecaudo/FlujoRecaudo";

const initFounds = [
  ["Numero de contrato", ""],
  ["Documento", ""],
  ["Telefono", ""],
];

const initOpts = {
  pago_parcial: true,
  pago_vencido: false,
};

const RecaudoManual = () => {
  const { id_convenio } = useQuery();

  const [opts, setOpts] = useState(null);
  const [foundRefs, setFoundRefs] = useState(null);

  useEffect(() => {
    setFoundRefs(initFounds);
    setOpts(initOpts);
  }, []);
  
  return <FlujoRecaudo opts={opts} foundRefs={foundRefs} />;
};

export default RecaudoManual;
