import { createContext, useContext, useState } from "react";
import fetchData from "../../../utils/fetchData";

const urls = {
  semanal:
    "http://loteriacons.us-east-2.elasticbeanstalk.com/consultas_loteria",
};

export const LoteriaContext = createContext({
  semanal: {
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
  searchSemanal: () => {},
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

  const searchSemanal = async (num) => {
    try {
      const res = await fetchData(
        urls.semanal,
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
    semanal: {
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
    searchSemanal,
  };
};
