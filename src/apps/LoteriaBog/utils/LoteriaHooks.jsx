import { createContext, useContext, useState } from "react";
import fetchData from "../../../utils/fetchData";

const urls = {
  ordinario:
    "http://loteriacons.us-east-2.elasticbeanstalk.com/consultas_loteria",
};

export const LoteriaContext = createContext({
  ordinario: {
    numero: undefined,
    setNumero: undefined,
    serie: undefined,
    setSerie: undefined,
    loterias: undefined,
    setLoterias: undefined,
    selected: undefined,
    setSelected: undefined,
    customer: undefined,
    setCustomer: undefined,
  },
  searchOrdinario: () => {},
  extra: {},
  premios: {},
  reportes: {},
});

export const useLoteria = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
  const [numero, setNumero] = useState(123);
  const [serie, setSerie] = useState(undefined);
  const [loterias, setLoterias] = useState(undefined);
  const [selected, setSelected] = useState(undefined);
  const [customer, setCustomer] = useState({ fracciones: "", phone: "" });

  const searchOrdinario = async (num) => {
    try {
      const res = await fetchData(
        urls.ordinario,
        "GET",
        {
          tipo: 1,
          num_loteria: num,
        },
        {}
      );
      setLoterias(res);
    } catch (err) {
      setLoterias([]);
      console.error(err);
    }
  };

  return {
    ordinario: {
      numero,
      setNumero: (val) => setNumero(val),
      serie,
      setSerie: (val) => setSerie(val),
      loterias,
      setLoterias: (val) => setLoterias(val),
      selected,
      setSelected: (val) => setSelected(val),
      customer,
      setCustomer: (val) => setCustomer(val),
    },
    searchOrdinario,
  };
};
