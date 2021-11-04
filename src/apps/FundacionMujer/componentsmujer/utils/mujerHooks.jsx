import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../../../../utils/AuthHooks";
import fetchData from "../../../../utils/fetchData";

const urls = {
  consultapin: "http://consultaPinFM-dev.us-east-2.elasticbeanstalk.com/pin",
  canselarpin:
    "http://cancelarpinfm-dev.us-east-2.elasticbeanstalk.com/cancel-pin",
  desembolso: "http://desembolsosFM-dev.us-east-2.elasticbeanstalk.com",
  recaudo: "http://pagocreditofm-dev.us-east-2.elasticbeanstalk.com/creditos",
  recaudo2: "http://pagocreditofm-dev.us-east-2.elasticbeanstalk.com/creditos",
  pagorecaudo: "http://pagocreditofm-dev.us-east-2.elasticbeanstalk.com",
  tiposoperaciones:
    "http://tipos-operaciones-pdp-dev.us-east-2.elasticbeanstalk.com/tipos-operaciones",
  transacciones:
    "http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view",
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

  transacciones: () => {},
  tiposdeoperaciones: () => {},
});

export const Usemujer = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();

  const [RespuestaPagoRecaudo, setRespuestaPagoRecaudo] = useState(null);
  const [serie, setSerie] = useState("");
  const [loterias, setLoterias] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  const [respuestamujer, setRespuestamujer] = useState(null);
  const [arreglo, setArreglo] = useState(null);




  const [ respuestatipooperaciontransaccion,setrespuestatipooperaciontransaccion, ] = useState(null);

  
  console.log(respuestatipooperaciontransaccion)
 


  const [sorteo, setSorteo] = useState("");

  const [fechaFinal, setFechaFinal] = useState("");

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

  // recaudos
  const recaudo = useCallback(async (cedula, comercio) => {
    try {
      const res = await fetchData(urls.recaudo, "GET", {
        cedula: 32131,
        comercio: roleInfo.id_comercio,
      });
      return res;
      setLoterias(res);
    } catch (err) {
      setLoterias([]);
      console.error(err);
    }
  }, []);

  //recaudos
  const recaudo2 = useCallback(async (cedula, comercio) => {
    try {
      const res = await fetchData(urls.recaudo2, "GET", {
        cedula: 4324,
        comercio: roleInfo.id_comercio,
      });
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //cancelar pin
  const cancelarpin = useCallback(async (transaccion) => {
    try {
      const res = await fetchData(urls.canselarpin, "GET", {
        transaccion: "TFM102",
        id_comercio: roleInfo.id_comercio,
      });
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //pago recaudo2
  const pagorecaudo = async () => {
    const dato = {
      numero: 1234,
      valor: 120500.5,
      comercio: roleInfo.id_comercio,
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

  // desembolso
  const desembolsospin = async (documento, pin) => {
    const dato = {
      documento: documento,
      pin: pin,
      valor: 780000.45,
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

  //transacciones uno

  const transacciones = useCallback( async (id_trx, Tipo_operacion, response_status) => {
      try {
        const res = await fetchData(urls.transacciones, "GET", {
          
          id_trx: 2,
          Tipo_operacion: 2,
          response_status: 2,
        }
        );
        setrespuestatipooperaciontransaccion(res)
        return res;

      } catch (err) {
        console.log("back fallando")
      }
    },
    []
  );



  const tiposdeoperaciones = useCallback(async () => {
    try {
      const res = await fetchData(urls.tiposoperaciones, "GET", {});
      return res;
    } catch (err) {
      console.error(err);
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
    },
    reportes: {},
    consultapin,
    cancelarpin,
    desembolsospin,
    //recaudo
    recaudo,
    recaudo2,
    pagorecaudo,
    transacciones,
    tiposdeoperaciones,
  };
};
