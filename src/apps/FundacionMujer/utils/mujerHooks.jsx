import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  mostrarcreditos: `${process.env.REACT_APP_URL_FDLMWSDL}/mostrarcreditos`,
  ingresoreverso: `${process.env.REACT_APP_URL_FDLMWSDL}/ingresoreversorecibo`,
  ingresorecibo: `${process.env.REACT_APP_URL_FDLMWSDL}/ingresorecibo`,
  valorcuota: `${process.env.REACT_APP_URL_FDLMWSDL}/valorcuota`,
  ///____
  consultarPines: `${process.env.REACT_APP_URL_FDLMWSDL}/consultarPines`,
  desembolsospin: `${process.env.REACT_APP_URL_FDLMWSDL}/confirmarDesembolso`,
  cancelarDesembolso: `${process.env.REACT_APP_URL_FDLMWSDL}/cancelarDesembolso`,

  //_____
};

export const FDLMContext = createContext({
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
  consultarPines: () => {},
  desembolsospin: () => {},
  cancelarDesembolso: () => {},
});

export const useMujer = () => {
  return useContext(FDLMContext);
};

export const useProvideFDLM = () => {
  // Datos consulta y compra
  const { roleInfo, pdpUser } = useAuth();
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

  const mostrarcredito = useCallback(
    async (numero, param, user) => {
      const body = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        Datos: {
          Depto: parseInt(user?.Depto),
          Municipio: parseInt(user?.Municipio),
          nroBusqueda: numero,
          ParametroBusqueda: param,
        },
      };
      try {
        const res = await fetchData(urls.mostrarcreditos, "POST", {}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    [pdpUser,roleInfo]
  );

  const ingresoreversorecibo = useCallback(
    async (values) => {
      const body = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        id_trx: values?.id_trx,
        valor_total_trx: parseFloat(values?.val),
        ticket_init: values?.ticket,
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        Datos: {
          Depto: parseInt(values?.Depto),
          Municipio: parseInt(values?.Municipio),
          nroBusqueda: values?.reference,
          Direccion: values?.Direccion,
        },
      };
      try {
        const res = await fetchData(urls.ingresoreverso, "POST", {}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    [pdpUser, roleInfo]
  );

  const ingresorecibo = useCallback(
    async (values) => {
      const body = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        id_uuid_trx: values?.uuid_key,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        id_trx: values?.id_trx,
        valor_total_trx: parseFloat(values?.Valor),
        ticket_init: values?.ticket,
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        Datos: {
          Depto: parseInt(values?.Depto),
          Municipio: parseInt(values?.Municipio),
          nroBusqueda: values?.Credito,
          referenciaPago: values?.ReferenciaPago,
          Direccion: values?.Direccion,
        },
      };
      try {
        const res = await fetchData(urls.ingresorecibo, "POST", {}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    [pdpUser, roleInfo]
  );

  const valorcuota = useCallback(
    async (numero, user, idTrx) => {
      const body = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        id_trx: idTrx?.obj?.id_trx,
        Datos: {
          Depto: parseInt(user?.Depto),
          Municipio: parseInt(user?.Municipio),
          nroBusqueda: numero,
        },
      };
      try {
        const res = await fetchData(urls.valorcuota, "POST", {}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    [pdpUser]
  );

  const consultarPines = useCallback(async (documento, pin, user) => {
    const body = {
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      Comercio: user?.Comercio,
      nroPIN: String(pin),
      documento: String(documento),
    };
    try {
      const res = await fetchData(urls.consultarPines, "POST", {}, body);
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
    try {
      const res = await fetchData(urls.cancelarDesembolso, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const desembolsospin = useCallback(async (info, user) => {
    let tipo_comercio = user?.Tipo;
    if (user?.Tipo === "KIOSCO") {
      tipo_comercio = "OFICINAS PROPIAS";
    }
    const body = {
      Tipo: tipo_comercio,
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      Comercio: user?.Comercio,
      Depto: parseInt(user?.Depto),
      Municipio: parseInt(user?.Municipio),
      nombre_comercio: user?.nombre_comercio,
      NombresCliente: info?.NombresCliente,
      Solicitud: info?.Solicitud,
      nroPIN: info?.CodigoPIN,
      documento: info?.Cedula,
      valorDesembolso: info?.ValorDesembolso,
    };
    try {
      const res = await fetchData(urls.desembolsospin, "POST", {}, body);
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
    mostrarcredito,
    ingresoreversorecibo,
    ingresorecibo,
    valorcuota,
    consultarPines,
    desembolsospin,
    cancelarDesembolso,
  };
};
