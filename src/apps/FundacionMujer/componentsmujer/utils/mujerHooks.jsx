import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import fetchData from "../../../../utils/fetchData";

const urls = {
  consultapin: `${process.env.REACT_APP_URL_FDLM_CONSULTAPIN}/pin`,
  cancelarpin: `${process.env.REACT_APP_URL_FDLM_CANCELARPIN}/cancel-pin`,
  desembolso: `${process.env.REACT_APP_URL_FDLM_DESEMBOLSOS}`,
  recaudo: `${process.env.REACT_APP_URL_FDLM_PAGOCREDITO}/creditos`,
  recaudo2: `${process.env.REACT_APP_URL_FDLM_PAGOCREDITO}/creditos`,
  pagorecaudo: `${process.env.REACT_APP_URL_FDLM_PAGOCREDITO}`,
};

export const LoteriaContext = createContext({
  infoLoto: {
    respuestamujer: null,
    setRespuestamujer: null,
    arreglo: null,
    setArreglo: null,
    RespuestaPagoRecaudo: null,
    setRespuestaPagoRecaudo: null,
    respuestatipooperaciontransaccion: null,
    setrespuestatipooperaciontransaccion: null,
    respuestaconsultarecaudo: null,
    setRespuestaconsultarecaudo: null,
    respuestaconsultarecaudocreditos: null,
    setRespuestaconsultarecaudocreditos: null,
  },
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
  searchModa: () => {},
  getReportesVentas: () => {},
  isWinner: () => {},
  consultapin: () => {},
  cancelarpin: () => {},
  desembolsospin: () => {},
  recaudo: () => {},
  recaudo2: () => {},
  pagorecaudo: () => {},
  pagorecaudocedula: () => {},
});

export const Usemujer = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
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


  console.log(respuestaconsultarecaudo)
  console.log(respuestaconsultarecaudocreditos);
  //consulta del pin
  const consultapin = useCallback(async (documento, pin) => {
    try {
      const res = await fetchData(urls.consultapin, "GET", {
        documento: documento,
        pin: pin,
        id_comercio: roleInfo.id_comercio,
      });
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //cancelar pin
  const cancelarpin = useCallback(async (transaccion) => {
    try {
      const res = await fetchData(urls.cancelarpin, "GET", {
        transaccion: "TFM102",
        id_comercio: roleInfo.id_comercio,
      });
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  // desembolso
  const desembolsospin = async (documento, pin) => {
    const dato = {
      id_trx: respuestamujer?.obj["id_trx"],
      id_usuario: roleInfo.id_usuario,
      id_comercio: roleInfo.id_comercio,
    };
    let control = await fetch(`${urls.desembolso}/desembolsos`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(dato),
    });
    let respuesta = await control.json();
    console.log(respuesta);
  };

  // recaudos
  const recaudo = useCallback(async (cedula, comercio) => {
    try {
      const res = await fetchData(urls.recaudo, "GET", {
        cedula: cedula,
        comercio: 2,
      });

      setRespuestaconsultarecaudo(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //recaudos
  const recaudo2 = useCallback(async (credito, comercio) => {
    try {
      const res = await fetchData(urls.recaudo2, "GET", {
        credito: credito,
        comercio: 2,
      });

      setRespuestaconsultarecaudocreditos(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //pago recaudo2
  const pagorecaudo = async () => {
    const dato = {
      numero: respuestaconsultarecaudo.obj[0]["Credito"],
      cedula: respuestaconsultarecaudo.obj[0]["Cedula"],
      valor: respuestaconsultarecaudo.obj[0]["Valor a pagar"],
      id_comercio: 1,
      id_usuario: 2,
    };
    let control = await fetch(`${urls.pagorecaudo}/pago`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(dato),
    });
    let respuesta = await control.json();
    console.log(respuesta);
    ///
    setRespuestaPagoRecaudo(respuesta);
  };

  const pagorecaudocedula = async () => {
    const dato = {
      numero: respuestaconsultarecaudocreditos.obj[0]["Cedula"],
      valor: respuestaconsultarecaudocreditos.obj[0]["Valor a pagar"],
      id_comercio: 1,
      id_usuario: 2,
    };
    let control = await fetch(`${urls.pagorecaudo}/pago`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(dato),
    });
    let respuesta = await control.json();
    console.log(respuesta);
    ///
    setRespuestaPagoRecaudo(respuesta);
  };

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
    consultapin,
    cancelarpin,
    desembolsospin,
    //recaudo
    recaudo,
    recaudo2,
    pagorecaudo,
    pagorecaudocedula,
  };
};
