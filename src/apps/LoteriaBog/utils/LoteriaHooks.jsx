import { createContext, useContext, useEffect, useState } from "react";
import fetchData from "../../../utils/fetchData";

const urls = {
  loteria: "",
  ordinario:
    "http://loteriacons.us-east-2.elasticbeanstalk.com/consultas_loteria",
  ventaOrdinario: "http://loteriaventa.us-east-2.elasticbeanstalk.com/venta",
};

export const LoteriaContext = createContext({
  ordinario: {
    numero: null,
    setNumero: null,
    serie: null,
    setSerie: null,
    loterias: null,
    selected: null,
    setSelected: null,
    customer: null,
    setCustomer: null,
    sellResponse: null,
    setSellResponse: null,
  },
  searchOrdinario: () => {},
  sellOrdinario: () => {},
  extra: {
    numero: null,
    setNumero: null,
    serie: null,
    setSerie: null,
    loterias: null,
    selected: null,
    setSelected: null,
    customer: null,
    setCustomer: null,
    sellResponse: null,
    setSellResponse: null,
  },
});

export const useLoteria = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
  const [numero, setNumero] = useState("");
  const [serie, setSerie] = useState("");
  const [loterias, setLoterias] = useState(null);
  const [selected, setSelected] = useState(null);
  const [customer, setCustomer] = useState({ fracciones: "", phone: "" });
  const [sellResponse, setSellResponse] = useState(null);

  const [numeroExtra, setNumeroExtra] = useState("");
  const [serieExtra, setSerieExtra] = useState("");
  const [loteriasExtra, setLoteriasExtra] = useState(null);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [customerExtra, setCustomerExtra] = useState({
    fracciones: "",
    phone: "",
  });
  const [sellResponseExtra, setSellResponseExtra] = useState(null);

  useEffect(() => {
    if (numero === "" && serie === "") {
      setLoterias([]);
    }
    if (numeroExtra === "" && serieExtra === "") {
      setLoteriasExtra([]);
    }
  }, [numero, serie, setLoterias, numeroExtra, serieExtra, setLoteriasExtra]);

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
      setLoteriasExtra(res);
    } catch (err) {
      setLoterias([]);
      setLoteriasExtra([]);
      console.error(err);
      // throw err;
    }
  };

  const sellOrdinario = async (sorteo) => {
    const req = {
      num_sorteo: sorteo,
      num_billete: `${selected.Num_loteria}`,
      serie: `${selected.Serie}`,
      val_pago: 15000,
      vendedor: 1,
      celular: parseInt(customer.phone),
      cod_loteria: "002",
      cod_distribuidor: "DIS",
      can_frac_venta: parseInt(customer.fracciones),
      can_fracciones: 3,
      cantidad_frac_billete: 3,
    };
    try {
      const res = await fetchData(urls.ventaOrdinario, "POST", {}, req);
      setSellResponse(res);
      console.log(req);
      console.log(res);
    } catch (err) {
      setSellResponse(null);
      console.error(err);
      // throw err;
    }
  };

  return {
    ordinario: {
      numero,
      setNumero,
      serie,
      setSerie,
      loterias,
      selected,
      setSelected,
      customer,
      setCustomer,
      sellResponse,
      setSellResponse,
    },
    searchOrdinario,
    sellOrdinario,
    extra: {
      numero: numeroExtra,
      setNumero: setNumeroExtra,
      serie: serieExtra,
      setSerie: setSerieExtra,
      loterias: loteriasExtra,
      selected: selectedExtra,
      setSelected: setSelectedExtra,
      customer: customerExtra,
      setCustomer: setCustomerExtra,
      sellResponse: sellResponseExtra,
      setSellResponse: setSellResponseExtra,
    },
  };
};
