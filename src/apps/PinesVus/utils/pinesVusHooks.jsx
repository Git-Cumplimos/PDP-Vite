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
  consultaEpsArl: `${process.env.REACT_APP_URL_PinesVus}/consultaEpsArl`,
  reenvioHash: `${process.env.REACT_APP_URL_PinesVus}/reenviarCodigoHash`,
  cierreManual: `${process.env.REACT_APP_URL_PinesVus}/cierreManual`,
  consultaEstadoCierre: `${process.env.REACT_APP_URL_PinesVus}/consultaCierreManual`,
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
  consultaEpsArl: () => {},
  reenvioHash: () => {},
  cierreManual: () => {},
  consultaEstadoCierre: () => {},
  activarNavigate: null,
  setActivarNavigate: null,
});
export const usePinesVus = () => {
  return useContext(pinesVusContext);
};

export const useProvidePinesVus = () => {
  // Datos consulta y compra
  const { roleInfo, pdpUser} = useAuth();
  const [activarNavigate, setActivarNavigate] = useState(true);
  const cancelPinVus = useCallback(async (valor, motivo, trx, user, id_pin, valor_tramite, tipCancelacion, infoComercioCreacion,ticket,pagoTarjeta) => {
    let tipo_comercio = user?.tipo_comercio
    if (user?.tipo_comercio === "KIOSCO"){
      tipo_comercio = "OFICINAS PROPIAS"
    }
    
    const body = {
      valor_tramite : valor_tramite,
      Usuario: user?.id_usuario,
      Dispositivo: user?.id_dispositivo,
      Comercio: user?.id_comercio,
      nombre_usuario: pdpUser?.uname ?? "",
      Tipo: tipo_comercio,
      NombreComercio: roleInfo?.["nombre comercio"],
      valor: parseFloat(valor),
      motivo: motivo,
      tipCancelacion: tipCancelacion,
      id_trx: trx,
      comercio_creacion: infoComercioCreacion,
      ticket: ticket,
      pago_tarjeta:pagoTarjeta
    };
    const query = {
      id_pin: id_pin,
    };
    try {
    
      const res = await fetchData(urls.cancelPinVus, "PUT", query, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, [roleInfo, pdpUser]);
  
  const crearPinVus = useCallback(async (documento, tipoPin, tramite, tramite2, user, infoTramite, infoTramite2, infoCliente, olimpia, categoria, categoria2, idPin, firma, motivoCompra, descripcionTipDocumento, ticket1, ticket2, codigoPago, codigoPago2) => {
    let tipo_comercio = user?.Tipo
    if (user?.Tipo === "KIOSCO"){
      tipo_comercio = "OFICINAS PROPIAS"
    }
    let tramiteTemp
    let infoTramiteTemp
    let categoriaTemp
    infoTramite["categoria"]=categoria
    if (tramite2==""){
      tramiteTemp= [tramite]
      infoTramiteTemp=[infoTramite]
      categoriaTemp=[categoria]
    }else{
      tramiteTemp= [tramite, tramite2]
      infoTramite2["categoria"]=categoria2
      infoTramiteTemp=[infoTramite, infoTramite2]
      categoriaTemp=[categoria, categoria2]
    }

    const body = {
      tipo_tramite: tramiteTemp,
      infoTramite: infoTramiteTemp,
      tipo_pin: tipoPin,
      doc_cliente: String(documento),
      Usuario: user?.Usuario,
      Dispositivo: user?.Dispositivo,
      Comercio: user?.Comercio,
      nombre_usuario: pdpUser?.uname ?? "",
      Tipo: tipo_comercio,
      NombreComercio: roleInfo?.["nombre comercio"],
      DireccionComercio: roleInfo?.direccion,
      infoCliente: infoCliente,
      olimpia: olimpia,
      categoria: categoriaTemp,
      firma: firma,
      motivoCompra: motivoCompra,
      descripcionTipDocumento:descripcionTipDocumento,
      ticket_pin:ticket1,
      ticket_tramite:ticket2,
      codigo_datafono:codigoPago,
      codigo_datafono_2:codigoPago2
    };
  
    if (idPin !== ""){
      body.Pin = idPin
    }
    try {
      //console.log(body)
      const res = await fetchData(urls.PinVus, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, [roleInfo, pdpUser]);

  const usarPinVus = useCallback(
    async (valor, trx, num_tramite, user, id_pin, ticket, datosOlimpia) => {
      let tipo_comercio = user?.tipo_comercio
      if (user?.tipo_comercio === "KIOSCO"){
        tipo_comercio = "OFICINAS PROPIAS"
      }
      const body = {
        Usuario: user?.id_usuario,
        Dispositivo: user?.id_dispositivo,
        Comercio: user?.id_comercio,
        Tipo: tipo_comercio,
        nombre_usuario: pdpUser?.uname ?? "",
        NombreComercio: roleInfo?.["nombre comercio"],
        valor: parseFloat(valor),
        id_trx: trx,
        ticket: ticket,
        datosOlimpia: datosOlimpia
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
    [roleInfo, pdpUser]
  );

  const consultaPinesVus = useCallback(
    async (
      cod_hash_pin,
      fecha_ini,
      fecha_fin,
      estadoPin,
      tipoPin,
      doc_cliente,
      pageData,
      pinesCliente
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
      if (pinesCliente == 1) {
        query.pinesCliente = pinesCliente;
      }
      try {
        const res = await fetchData(urls.PinVus, "GET", query);
        //console.log(res)
        return res;
      } catch (err) {
        throw err;
      }
    },
    [roleInfo]
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

  const consultaClientes = useCallback(async (cedula, olimpia, tipoDocumento, idPin, tipoPin) => {
    const query = { pk_documento_cliente: cedula};
    query.olimpia = olimpia
    query.id_comercio = roleInfo?.id_comercio
    query.tipo_documento = tipoDocumento
    if (idPin != ""){
      query.Pin = idPin}
    if (tipoPin !=""){
      query.tipoPin = tipoPin
    }
    try {
      const res = await fetchData(urls.consultaClientes, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, [roleInfo]);

  const consultaParticipacion = useCallback(async (fecha_ini) => {
    const query = { 
      id_comercio: roleInfo.id_comercio,
      id_usuario: roleInfo.id_usuario
    };
    query.fecha_participacion = fecha_ini
    try {
      const res = await fetchData(urls.consultaParticipacion, "GET", query);
      return res;
    } catch (err) {
      throw err;
    }
  }, [roleInfo]);

  const registroPagoParticipacion = useCallback(async (
    participante, 
    id_pago,
    // banco, 
    // num_cuenta, 
    // num_aprobacion,
    // num_transaccion, 
    valor,
    fecha_participacion,
    ticket
    // voucher
    ) => {
    let tipo_comercio = roleInfo.tipo_comercio
    if (roleInfo?.tipo_comercio === "KIOSCO"){
      tipo_comercio = "OFICINAS PROPIAS"
    }
    const body = {
      participante: participante, 
      id_pago: id_pago,
      // banco: banco, 
      // num_cuenta: num_cuenta, 
      // num_aprobacion: num_aprobacion,
      // num_transaccion: num_transaccion, 
      valor: valor,
      fecha_participacion: fecha_participacion,
      // voucher: voucher,
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      nombre_usuario: pdpUser?.uname ?? "",
      Tipo: tipo_comercio,
      ticket: ticket
    };
    try {
      const res = await fetchData(urls.registroPagoParticipacion, "POST", {}, body);
      return res;
    } catch (err) {
      throw err;
    }
  }, [roleInfo, pdpUser]);

  const consultaPagoParticipacion = useCallback(
    async (
      id_comercio,
      id_usuario,
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
      if ((id_usuario !== "") & !isNaN(id_usuario)) {
        query.id_usuario = id_usuario;
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

  const consultaEpsArl = useCallback(
    async () => {
      try {
        const res = await fetchData(urls.consultaEpsArl, "GET", {});
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const reenvioHash = useCallback(
    async (
      doc_cliente,
      reenviarFormulario
    ) => {
      const query = { doc_cliente : doc_cliente, reenviarFormulario : reenviarFormulario };
      try {
        const res = await fetchData(urls.reenvioHash, "GET", query);
        //console.log(res)
        return res;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const cierreManual = useCallback(
    async () => {
      const body = { 
        pk_id_comercio : roleInfo?.id_comercio,
        id_usuario : roleInfo?.id_usuario
      };
      try {
        const res = await fetchData(urls.cierreManual, "POST", {}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    [roleInfo]
  );

  const consultaCierreManual = useCallback(
    async () => {
      const body = { 
        pk_id_comercio : roleInfo?.id_comercio,
        id_usuario : roleInfo?.id_usuario 
      };
      try {
        const res = await fetchData(urls.consultaEstadoCierre, "POST",{}, body);
        return res;
      } catch (err) {
        throw err;
      }
    },
    [roleInfo]
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
    consultaEpsArl,
    reenvioHash,
    cierreManual,
    consultaCierreManual
  };
};
