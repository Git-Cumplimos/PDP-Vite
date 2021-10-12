import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import fetchData from "../../../utils/fetchData";

const urls = {
  ordinario:
    "http://loteriacons.us-east-2.elasticbeanstalk.com/consultas_loteria",
  ventaOrdinario: "http://loteriaventa.us-east-2.elasticbeanstalk.com/venta",
  moda: "http://buscadosmas.us-east-2.elasticbeanstalk.com/consurepmasbusca",
};

export const LoteriaContext = createContext({
  infoLoto: {
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
  searchLoteria: () => {},
  sellLoteria: () => {},
  reportes: {
    moda: null,
  },
  searchModa: () => {},
});

export const useLoteria = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
  const [numero, setNumero] = useState("");
  const [serie, setSerie] = useState("");
  const [loterias, setLoterias] = useState(null);
  const [selected, setSelected] = useState(null);
  const [customer, setCustomer] = useState({
    fracciones: "",
    phone: "",
    doc_id: "",
  });
  const [sellResponse, setSellResponse] = useState(null);

  const [moda, setModa] = useState(null);

  useEffect(() => {
    if (numero === "" && serie === "") {
      setLoterias([]);
    }
  }, [numero, serie, setLoterias]);

  const searchLoteria = useCallback(async (sorteo, num, ser, page) => {
    if (num === "" && ser === "") return;
    try {
      const { Resultado:res, Num_Datos } = await fetchData(
        urls.ordinario,
        "GET",
        {
          num_loteria: num,
          serie: ser,
          sorteo,
          numero: page,
        },
        {}
      );
      setLoterias(res);
      return Num_Datos;
    } catch (err) {
      setLoterias([]);
      console.error(err);
    }
  }, []);

  const sellLoteria = useCallback(async (sorteo) => {
    const req = {
      num_sorteo: sorteo,
      num_billete: `${selected.Num_billete}`,
      serie: `${selected.serie}`,
      val_pago:
        parseInt(customer.fracciones) * parseFloat(selected.Valor_fraccion),
      vendedor: 1,
      celular: parseInt(customer.phone),
      cod_loteria: selected.Cod_loteria,
      cod_distribuidor: "DIS",
      can_frac_venta: parseInt(customer.fracciones),
      can_fracciones: 3,
      cantidad_frac_billete: 3,
    };
    try {
      const res = await fetchData(urls.ventaOrdinario, "POST", {}, req);
      setSellResponse(res);
    } catch (err) {
      setSellResponse(null);
      console.error(err);
    }
  }, [selected, customer]);

  const searchModa = useCallback(async () => {
    try {
      const res = await fetchData(urls.moda, "GET", {}, {});
      console.log(res);
      setModa(res);
    } catch (err) {
      setModa(null);
      console.error(err);
      throw err;
    }
  }, []);

  return {
    infoLoto: {
      numero,
      setNumero,
      serie,
      setSerie,
      loterias,
      setLoterias,
      selected,
      setSelected,
      customer,
      setCustomer,
      sellResponse,
      setSellResponse,
    },
    searchLoteria,
    sellLoteria,
    reportes: {
      moda,
    },
    searchModa,
  };
};
