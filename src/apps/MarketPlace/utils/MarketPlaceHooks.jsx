import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  consultaOrden: `${process.env.REACT_APP_URL_MARKETPLACE}/consultorder`,
  pagoOrden: `${process.env.REACT_APP_URL_MARKETPLACE}/consultorder`,
};

export const MarketContext = createContext({
  infoMarket: {
    consulta: "",
    setConsulta: "",
  },
  searchsOrder: () => {},
  payOrder: () => {},
});

export const useMarketPlace = () => {
  return useContext(MarketContext);
};

export const useProvideMarketPlace = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();
  const [consulta, setConsulta] = useState([]);

  const payOrder = useCallback(async (idCompra) => {
    const req = {
      idCompra: idCompra,
      idComercio: 4,
    };
    try {
      const res = await fetchData(urls.pagoOrden, "POST", {}, req);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  });

  const searchsOrder = useCallback(async (idCompra) => {
    try {
      const res = await fetchData(urls.consultaOrden, "GET", {
        idCompra: idCompra,
        idComercio: 4,
      });
      setConsulta(res);
      console.log(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  });

  return {
    payOrder,
    searchsOrder,
    infoMarket: {
      consulta,
    },
  };
};
