import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  mostrarcreditos: `${process.env.REACT_APP_URL_pinesVusWSDL}/mostrarcreditos`,
  ingresoreverso: `${process.env.REACT_APP_URL_pinesVusWSDL}/ingresoreversorecibo`,
  ingresorecibo: `${process.env.REACT_APP_URL_pinesVusWSDL}/ingresorecibo`,
  valorcuota: `${process.env.REACT_APP_URL_pinesVusWSDL}/valorcuota`,
  ///____
  PinVus: `${process.env.REACT_APP_URL_PinesVus}/pines`,
  cancelarDesembolso: `${process.env.REACT_APP_URL_pinesVusWSDL}/cancelarDesembolso`,

  //_____
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
  mostrarcredito: () => {},
  ingresoreversorecibo: () => {},
  ingresorecibo: () => {},
  valorcuota: () => {},
  crearPinVus: () => {},
  consultaPinesVus: () => {},
  cancelarDesembolso: () => {},
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

  const mostrarcredito = useCallback(async (numero, param, user) => {
    const body = {
      Comercio: user?.Comercio,
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      nroBusqueda: numero,
      ParametroBusqueda: param,
      Depto: parseInt(user?.Depto),
      Municipio: parseInt(user?.Municipio),
    };
    try {
      const res = await fetchData(urls.mostrarcreditos, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const ingresoreversorecibo = useCallback(async (values) => {
    const body = {
      Tipo: values?.tipo,
      Usuario: values?.usuario,
      Dispositivo: values?.dispositivo,
      Comercio: values?.comercio,
      Credito: parseInt(values?.credit),
      Valor: parseFloat(values?.val),
      referenciaPago: values?.reference,
      id_trx: values?.idtrx,
      motivo: values?.motivo,
    };
    try {
      const res = await fetchData(urls.ingresoreverso, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const ingresorecibo = useCallback(async (values) => {
    const body = {
      Tipo: values?.Tipo,
      Usuario: parseInt(values?.Usuario),
      Dispositivo: values?.Dispositivo,
      Comercio: values?.Comercio,
      Credito: parseInt(values?.Credito),
      Depto: parseInt(values?.Depto),
      Municipio: parseInt(values?.Municipio),
      Valor: parseFloat(values?.Valor),
      referenciaPago: values?.referenciaPago,
      cedula: values?.cedula,
      cliente: values?.cliente,
      nombre_comercio: values?.nombre_comercio,
    };
    try {
      const res = await fetchData(urls.ingresorecibo, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const valorcuota = useCallback(async (numero, user) => {
    const body = {
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      Comercio: user?.Comercio,
      Credito: numero,
      Depto: parseInt(user?.Depto),
      Municipio: parseInt(user?.Municipio),
    };
    console.log(body);
    try {
      const res = await fetchData(urls.valorcuota, "POST", {}, body);
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

  const cancelarDesembolso = useCallback(async (info, user) => {
    const body = {
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      Comercio: user?.Comercio,
      nroPIN: info?.CodigoPIN,
      documento: info?.Cedula,
    };
    console.log(body);
    try {
      const res = await fetchData(urls.cancelarDesembolso, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const consultaPinesVus = useCallback(async (paramConsulta, pageData) => {
    const query = { ...pageData };
    query.doc_cliente = paramConsulta;
    try {
      const res = await fetchData(urls.PinVus, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  console.log(roleInfo);
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
    mostrarcredito,
    ingresoreversorecibo,
    ingresorecibo,
    valorcuota,
    crearPinVus,
    consultaPinesVus,
    cancelarDesembolso,
  };
};
