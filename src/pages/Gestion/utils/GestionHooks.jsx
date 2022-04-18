import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  consultaCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
};

export const GestionContext = createContext({
  statesGestion: {},
  searchCash: () => {},
});

export const useGestion = () => {
  return useContext(GestionContext);
};

export const useProvideGestion = () => {
  // Datos consulta y compra

  const { roleInfo } = useAuth();
  const payOrder = useCallback(async () => {
    const req = {
      idCompra: "",
      idComercio: "",
      tipoComercio: "",
      idTienda: "",
      idDispositivo: "",
      idUsuario: "",
    };
    try {
      const res = await fetchData(urls.pagoOrden, "POST", {}, req);
      return res;
    } catch (err) {
      throw err;
    }
  });

  const searchCash = useCallback(async () => {
    try {
      const res = await fetchData(
        urls.consultaCaja,
        "GET",
        {
          id_usuario: 206,
          id_comercio: 8,
          id_terminal: 121,
        },
        {},
        {},
        false
      );
      console.log(res);
      return res;
    } catch (err) {
      throw err;
    }
  });

  return {
    statesGestion: {},
    searchCash,
  };
};
