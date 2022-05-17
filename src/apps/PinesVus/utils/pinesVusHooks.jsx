import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  cancelPinVus: `${process.env.REACT_APP_URL_PinesVus}/cancelarPines`,
  PinVus: `${process.env.REACT_APP_URL_PinesVus}/pines`,
  cons_estado_tipoPin: `${process.env.REACT_APP_URL_PinesVus}/TipoEstadoPin`,
};

export const pinesVusContext = createContext({
  cancelPinVus: () => {},
  usarPinVus: () => {},
  con_estado_tipoPin: () => {},
});

export const usePinesVus = () => {
  return useContext(pinesVusContext);
};

export const useProvidePinesVus = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();

  const cancelPinVus = useCallback(async (info, valor, motivo, trx, user) => {
    const body = {
      Usuario: user?.id_usuario,
      Dispositivo: user?.id_dispositivo,
      Comercio: user?.id_comercio,
      Tipo: user?.tipo_comercio,
      valor: parseFloat(valor),
      motivo: motivo,
      id_trx: trx,
    };
    console.log(body);
    const query = {
      id_pin: info?.Id,
    };
    try {
      const res = await fetchData(urls.cancelPinVus, "PUT", query, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const crearPinVus = useCallback(
    async (documento, num_tramite, tipoPin, user) => {
      const body = {
        tipo_pin: tipoPin,
        num_tramite: String(num_tramite),
        doc_cliente: String(documento),
        Usuario: user?.Usuario,
        Dispositivo: user?.Dispositivo,
        Comercio: user?.Comercio,
        Tipo: user?.Tipo,
      };
      console.log(body);
      try {
        const res = await fetchData(urls.PinVus, "POST", {}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const usarPinVus = useCallback(async (info, valor, trx, user) => {
    const body = {
      Usuario: user?.id_usuario,
      Dispositivo: user?.id_dispositivo,
      Comercio: user?.id_comercio,
      Tipo: user?.tipo_comercio,
      valor: parseFloat(valor),
      id_trx: trx,
    };
    const query = {
      id_pin: info?.Id,
    };
    try {
      const res = await fetchData(urls.PinVus, "PUT", query, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const consultaPinesVus = useCallback(
    async (
      cod_hash_pin,
      fecha_ini,
      fecha_fin,
      estadoPin,
      tipoPin,
      pageData
    ) => {
      const query = { ...pageData };
      if (cod_hash_pin !== "") {
        query.cod_hash_pin = cod_hash_pin;
      }
      if (fecha_ini !== "") {
        query.fecha_ini = fecha_ini;
        query.fecha_fin = fecha_fin;
      }
      if ((estadoPin !== "") & !isNaN(estadoPin)) {
        query.estado_pin = estadoPin;
      }
      if ((tipoPin !== "") & !isNaN(tipoPin)) {
        query.tipo_pin = tipoPin;
      }
      try {
        const res = await fetchData(urls.PinVus, "GET", query);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const con_estado_tipoPin = useCallback(async (table) => {
    const query = { table: table };
    try {
      const res = await fetchData(urls.cons_estado_tipoPin, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    cancelPinVus,
    crearPinVus,
    consultaPinesVus,
    usarPinVus,
    con_estado_tipoPin,
  };
};
