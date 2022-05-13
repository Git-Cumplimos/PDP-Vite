import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  cancelPinVus: `${process.env.REACT_APP_URL_PinesVus}/cancelarPines`,
  PinVus: `${process.env.REACT_APP_URL_PinesVus}/pines`,
};

export const pinesVusContext = createContext({
  infoLoto: {},
  searchLoteria: () => {},
  sellLoteria: () => {},
  reportes: {
    moda: null,
    sorteo: null,
    setSorteo: null,
    fechaInicial: null,
    setFechaInicial: null,
    fechaFinal: null,
    setFechaFinal: null,
  },
  cancelPinVus: () => {},
  usarPinVus: () => {},
});

export const usePinesVus = () => {
  return useContext(pinesVusContext);
};

export const useProvidePinesVus = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();
  const [RespuestaPagoRecaudo, setRespuestaPagoRecaudo] = useState(null);
  const [respuestamujer, setRespuestamujer] = useState();
  const [arreglo, setArreglo] = useState(null);
  const [
    respuestatipooperaciontransaccion,
    setrespuestatipooperaciontransaccion,
  ] = useState(null);

  const [respuestaconsultarecaudo, setRespuestaconsultarecaudo] = useState();
  const [
    respuestaconsultarecaudocreditos,
    setRespuestaconsultarecaudocreditos,
  ] = useState();

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

  const crearPinVus = useCallback(async (documento, num_tramite, user) => {
    const body = {
      tipo_pin: 1, //Por ahora es quemado, mas adelante sera una consulta
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
  }, []);

  const usarPinVus = useCallback(async (info, valor, user) => {
    const body = {
      Usuario: user?.id_usuario,
      Dispositivo: user?.id_dispositivo,
      Comercio: user?.id_comercio,
      Tipo: user?.tipo_comercio,
      valor: parseFloat(valor),
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

  const consultaPinesVus = useCallback(async (paramConsulta, pageData) => {
    const query = { ...pageData };
    query.cod_hash_pin = paramConsulta;
    try {
      const res = await fetchData(urls.PinVus, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    infoLoto: {
      respuestamujer,
      setRespuestamujer,
      arreglo,
      setArreglo,
      RespuestaPagoRecaudo,
      setRespuestaPagoRecaudo,
      respuestatipooperaciontransaccion,
      setrespuestatipooperaciontransaccion,
      respuestaconsultarecaudo,
      setRespuestaconsultarecaudo,
      respuestaconsultarecaudocreditos,
      setRespuestaconsultarecaudocreditos,
    },
    reportes: {},
    cancelPinVus,
    crearPinVus,
    consultaPinesVus,
    usarPinVus,
  };
};
