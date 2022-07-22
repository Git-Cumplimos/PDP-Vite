import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";

const urls = {
  cancelPinVus: `${process.env.REACT_APP_URL_PinesVus}/cancelarPines`,
  PinVus: `${process.env.REACT_APP_URL_PinesVus}/pines`,
  cons_estado_tipoPin: `${process.env.REACT_APP_URL_PinesVus}/TipoEstadoPin`,
  consultaTramites: `${process.env.REACT_APP_URL_PinesVus}/consultaTramites`,
  consultaClientes: `${process.env.REACT_APP_URL_PinesVus}/consultaClientes`,
  consultaParticipacion: `${process.env.REACT_APP_URL_PinesVus}/consultaParticipacion`,
  registroPagoParticipacion: `${process.env.REACT_APP_URL_PinesVus}/registroPagoParticipacion`,
  consultaPagoParticipacion: `${process.env.REACT_APP_URL_PinesVus}/consultaPagoParticipacion`,
  descargaArchivosS3: `${process.env.REACT_APP_URL_PinesVus}/descargaArchivosS3`,
  cupoQX: `${process.env.REACT_APP_URL_PinesVus}/cupoQX`,
  ingresarIdQX: `${process.env.REACT_APP_URL_PinesVus}/ingresarIdQX`,
};

export const pinesVusContext = createContext({
  cancelPinVus: () => {},
  usarPinVus: () => {},
  con_estado_tipoPin: () => {},
  consultaTramite: () => {},
  consultaClientes: () => {},
  consultaParticipacion: () => {},
  registroPagoParticipacion: () => {},
  consultaPagoParticipacion: () => {},
  descargaArchivosS3: () => {},
  consultaCupoQX: () => {},
  modificarCupoQX: () => {},
  ingresarIdQX: () => {},
  activarNavigate: null,
  setActivarNavigate: null,
});
export const usePinesVus = () => {
  return useContext(pinesVusContext);
};

export const useProvidePinesVus = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();
  const [activarNavigate, setActivarNavigate] = useState(true);

  const cancelPinVus = useCallback(async (valor, motivo, trx, user, id_pin, valor_tramite) => {
    const body = {
      valor_tramite : valor_tramite,
      Usuario: user?.id_usuario,
      Dispositivo: user?.id_dispositivo,
      Comercio: user?.id_comercio,
      Tipo: user?.tipo_comercio,
      NombreComercio: roleInfo?.["nombre comercio"],
      valor: parseFloat(valor),
      motivo: motivo,
      id_trx: trx,
    };
    console.log(body);
    const query = {
      id_pin: id_pin,
    };
    try {
      const res = await fetchData(urls.cancelPinVus, "PUT", query, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);
  console.log(roleInfo)
  
  const crearPinVus = useCallback(async (documento, tipoPin, tramite, user, infoTramite, infoCliente, olimpia, categoria, idPin) => {
    console.log(infoTramite)
    const body = {
      tipo_tramite: tramite,
      infoTramite: infoTramite,
      tipo_pin: tipoPin,
      doc_cliente: String(documento),
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      Comercio: user?.Comercio,
      Tipo: user?.Tipo,
      NombreComercio: roleInfo?.["nombre comercio"],
      infoCliente: infoCliente,
      olimpia: olimpia,
      categoria: categoria
    };
    if (idPin != ""){
      body.Pin = idPin
    }
    try {
      const res = await fetchData(urls.PinVus, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const usarPinVus = useCallback(
    async (valor, trx, num_tramite, user, id_pin) => {
      const body = {
        Usuario: user?.id_usuario,
        Dispositivo: user?.id_dispositivo,
        Comercio: user?.id_comercio,
        Tipo: user?.tipo_comercio,
        NombreComercio: roleInfo?.["nombre comercio"],
        valor: parseFloat(valor),
        id_trx: trx,
      };
      if (num_tramite !== "") {
        body.num_tramite = String(num_tramite);
      }

      const query = {
        id_pin: id_pin,
      };
      try {
        const res = await fetchData(urls.PinVus, "PUT", query, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const consultaPinesVus = useCallback(
    async (
      cod_hash_pin,
      fecha_ini,
      fecha_fin,
      estadoPin,
      tipoPin,
      doc_cliente,
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
      if ( roleInfo?.id_comercio !== undefined) {
        query.id_comercio = roleInfo?.id_comercio;
      }
      if (doc_cliente !== "") {
        query.doc_cliente = doc_cliente;
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

  const consultaTramite = useCallback(async () => {
    try {
      const res = await fetchData(urls.consultaTramites, "GET", {});
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const consultaClientes = useCallback(async (cedula, olimpia, idPin) => {
    const query = { pk_documento_cliente: cedula};
    query.olimpia = olimpia
    query.id_comercio = roleInfo?.id_comercio
    if (idPin != ""){
      query.Pin = idPin}
    try {
      const res = await fetchData(urls.consultaClientes, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const consultaParticipacion = useCallback(async () => {
    const query = { id_comercio: roleInfo.id_comercio};
    try {
      const res = await fetchData(urls.consultaParticipacion, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const registroPagoParticipacion = useCallback(async (
    participante, 
    // banco, 
    // num_cuenta, 
    // num_aprobacion,
    // num_transaccion, 
    valor,
    // voucher
    ) => {
    const body = {
      participante: participante, 
      // banco: banco, 
      // num_cuenta: num_cuenta, 
      // num_aprobacion: num_aprobacion,
      // num_transaccion: num_transaccion, 
      valor: valor,
      // voucher: voucher,
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      Tipo: roleInfo?.tipo_comercio,
    };
    try {
      const res = await fetchData(urls.registroPagoParticipacion, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  const consultaPagoParticipacion = useCallback(
    async (
      id_comercio,
      fecha_ini,
      fecha_fin,
      pageData
    ) => {
      const query = { ...pageData };
      if (fecha_ini !== "") {
        query.fecha_ini = fecha_ini;
        query.fecha_fin = fecha_fin;
      }
      if ((id_comercio !== "") & !isNaN(id_comercio)) {
        query.id_comercio = id_comercio;
      }
      try {
        const res = await fetchData(urls.consultaPagoParticipacion, "GET", query);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const descargaArchivosS3 = useCallback(
    async (ruta) => {
      const query = { ruta : ruta };
      try {
        const res = await fetchData(urls.descargaArchivosS3, "GET", query);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const consultaCupoQX = useCallback(
    async () => {
      try {
        const res = await fetchData(urls.cupoQX, "GET", {});
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const modificarCupoQX = useCallback(
    async (parametros) => {
      const postData = {parametros : parametros}
      try {
        const res = await fetchData(urls.cupoQX, "POST", {}, postData);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const ingresarIdQX = useCallback(
    async (id_pin,id_qx) => {
      const body = {
        id_qx: id_qx,
      };

      const query = {
        id_pin: id_pin,
      };
      try {
        const res = await fetchData(urls.ingresarIdQX, "PUT", query, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  return {
    cancelPinVus,
    crearPinVus,
    consultaPinesVus,
    usarPinVus,
    con_estado_tipoPin,
    consultaTramite,
    consultaClientes,
    consultaParticipacion,
    registroPagoParticipacion,
    consultaPagoParticipacion,
    descargaArchivosS3,
    consultaCupoQX,
    modificarCupoQX,
    ingresarIdQX,
    activarNavigate,
    setActivarNavigate,
  };
};
