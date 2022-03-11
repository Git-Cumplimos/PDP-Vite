import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  consultaOrden: `${process.env.REACT_APP_URL_MARKETPLACE}consultorder`,
  pagoOrden: `${process.env.REACT_APP_URL_MARKETPLACE}payorder`,
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
  const [consulta, setConsulta] = useState([]);
  const { roleInfo } = useAuth();
  const payOrder = useCallback(async (idCompra) => {
    const req = {
      idCompra: idCompra,
      idComercio: -1,
      tipoComercio: roleInfo?.tipo_comercio,
      idTienda: roleInfo?.id_comercio,
      idDispositivo: roleInfo?.id_dispositivo,
      idUsuario: roleInfo?.id_usuario,
    };
    try {
      const res = await fetchData(urls.pagoOrden, "POST", {}, req);
      return res;
    } catch (err) {
      throw err;
    }
  });

  const searchsOrder = useCallback(async (idCompra) => {
    console.log(idCompra);
    try {
      const res = await fetchData(urls.consultaOrden, "GET", {
        idCompra: idCompra,
      });
      setConsulta(res);
      console.log(res);
      return res;
    } catch (err) {
      console.log(err);
      throw err;
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
