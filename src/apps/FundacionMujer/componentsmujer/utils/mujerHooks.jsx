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
  transacciones:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view",
 transaccionesuno:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?id_trx=2",
transaccionesdos:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?Tipo_operacion=2",
transaccionestres:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?Comercio=2",
transaccionescuatro:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?response_status=true",
transaccionescinco:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?Tipo_operacion=2&Comercio=2",
transaccionesseis:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?Tipo_operacion=2&response_status=true",
transaccionessiete:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?Comercio=2&response_status=true",
transaccionesoocho:"http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view?Tipo_operacion=2&Comercio=2&response_status=true"

};

export const LoteriaContext = createContext({
  infoLoto: {
    respuestamujer: null,
    setRespuestamujer: null,
    arreglo: null,
    setArreglo: null,
    RespuestaPagoRecaudo: null,
     setRespuestaPagoRecaudo: null
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
  transacciones:() => {},
  transaccionesuno:()=>{},
  transaccionesdos:()=>{},
  transaccionestres:()=>{},
  transaccionescuatro:()=>{},
  transaccionescinco:()=>{},
  transaccionesseis:()=>{},
  transaccionessieste:()=>{},
  transaccionesocho:()=>{},
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
  const[arreglo,setArreglo]=useState(null);
  // Datos estadisticas

  const [sorteo, setSorteo] = useState("");

  const [fechaFinal, setFechaFinal] = useState("");

  //consulta del pin
  const consultapin = useCallback(async (documento, pin) => {
    try {
      const res = await fetchData(urls.consultapin, "GET", {
        documento: documento,
        pin: pin,
        
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
        comercio: 321312,
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
        comercio: 43243,
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
      comercio: 2,
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
  const desembolsospin = async () => {
    const dato = {
      documento: 1080100200,
      pin: 123,
      valor: 780000.45,
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
  
  const transacciones = useCallback(async () => {
    try {
      const res = await fetchData(urls.transacciones, "GET", {
      
      });
      return res;
      setLoterias(res);
    } catch (err) {
      setLoterias([]);
      console.error(err);
    }
  }, []);


    const transaccionesuno = useCallback(async (id_trx) => {
      try {
        const res = await fetchData(urls.transaccionesuno, "GET", {
          id_trx: id_trx,
        
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);

    const transaccionesdos = useCallback(async (Tipo_operacion) => {
      try {
        const res = await fetchData(urls.transaccionesdos, "GET", {
          Tipo_operacion: Tipo_operacion,
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);
   
    const transaccionestres = useCallback(async (Comercio) => {
      try {
        const res = await fetchData(urls.transaccionesdos, "GET", {
          Comercio: Comercio,
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);

    const transaccionescuatro = useCallback(async (response_status) => {
      try {
        const res = await fetchData(urls.transaccionescuatro, "GET", {
          response_status: response_status,
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);



    const transaccionescinco = useCallback(async (Tipo_operacion,Comercio) => {
      try {
        const res = await fetchData(urls.transaccionescinco, "GET", {
          Tipo_operacion: Tipo_operacion,
          Comercio:Comercio
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);


    const transaccionesseis = useCallback(async (Tipo_operacion,response_status) => {
      try {
        const res = await fetchData(urls.transaccionesseis, "GET", {
          Tipo_operacion: Tipo_operacion,
          response_status:response_status
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);


    
    const transaccionessieste = useCallback(async (Comercio,response_status) => {
      try {
        const res = await fetchData(urls.transaccionessiete, "GET", {
          Comercio: Comercio,
          response_status:response_status
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
        console.error(err);
      }
    }, []);


     
    const transaccionesocho = useCallback(async (Tipo_operacion,Comercio,response_status) => {
      try {
        const res = await fetchData(urls.transaccionesoocho, "GET", {
          Tipo_operacion: Tipo_operacion,
          Comercio:Comercio,
          response_status:response_status
        });
        return res;
        setLoterias(res);
      } catch (err) {
        setLoterias([]);
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
      setRespuestaPagoRecaudo
    },
    reportes: {
     
     
    },
    consultapin,
    cancelarpin,
    desembolsospin,
    //recaudo
    recaudo,
    recaudo2,
    pagorecaudo,
    //transacciones
    transacciones,
    transaccionesuno,
    transaccionesdos,
    transaccionestres,
    transaccionescuatro,
    transaccionescinco,
    transaccionesseis,
    transaccionessieste,
    transaccionesocho
  };
};
