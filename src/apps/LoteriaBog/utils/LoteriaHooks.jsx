import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../../../utils/AuthHooks";
import fetchData from "../../../utils/fetchData";
//import Loteria from "../Views/Loteria";

const urls = {
  ordinario: `${process.env.REACT_APP_URL_LOTO1}/consultas_loteria`,
  ventaOrdinario: `${process.env.REACT_APP_URL_LOTO_VENTA}/venta`,
  moda: `${process.env.REACT_APP_URL_LOTO_MODA}/consurepmasbusca`,
  ventasReportes: `${process.env.REACT_APP_URL_LOTO_VENTA_REPORTES}/reportes_ventas`,
  consultaPago: `${process.env.REACT_APP_URL_LOTO_PREMIOS}/pagodepremios`,
  premiohash: `${process.env.REACT_APP_URL_LOTO_PREMIOS}/hash`,
  premiofisico: `${process.env.REACT_APP_URL_LOTO_PREMIOS}/fisico`,
  pagopremio: `${process.env.REACT_APP_URL_LOTO_PREMIOS}/premios_pagados`,
  pagopremiofisico: `${process.env.REACT_APP_URL_LOTO_PREMIOS}/premios_pagados1`,
  ConsultaCrearSort: `${process.env.REACT_APP_LOTO_SORTEOS}/sorteo`,
  CambiarSort: `${process.env.REACT_APP_LOTO_SORTEOS}/cambio_sorteo`,
  EstadoArchivos: `${process.env.REACT_APP_URL_LOTO1}/logs`,
};

export const LoteriaContext = createContext({
  infoLoto: {
    numero: null,
    setNumero: null,
    serie: null,
    setSerie: null,
    loterias: null,
    selected: null,
    setSelected: null,
    customer: null,
    setCustomer: null,
    sellResponse: null,
    setSellResponse: null,
    fracciones_fisi: null,
    setFracciones_fisi: null,
    pagoresponse: null,
    setPagoresponse: null,
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
  makePayment: () => {},
  makePayment2: () => {},
  pagopremio: () => {},
  pagopremiofisico: () => {},
  ConsultaCrearSort: () => {},
  CambiarSort: () => {},
  EstadoArchivos: () => {},
});

export const useLoteria = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();

  const [numero, setNumero] = useState("");
  const [serie, setSerie] = useState("");
  const [loterias, setLoterias] = useState(null);
  const [loteriasfisico, setLoteriasfisco] = useState();
  const [selected, setSelected] = useState(null);
  const [customer, setCustomer] = useState({
    fracciones: "",
    phone: "",
    doc_id: "",
  });
  const [sellResponse, setSellResponse] = useState(null);
  const [pagoresponse, setPagoresponse] = useState(null);
  const [crearRolresp, setCrearRolresp] = useState(null);
  const [roles_disponibles, setRoles_disponibles] = useState(null);

  // Datos estadisticas
  const [moda, setModa] = useState(null);
  const [sorteo, setSorteo] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  useEffect(() => {
    if (numero === "" && serie === "") {
      setLoterias([]);
    }
  }, [numero, serie, setLoterias]);

  const searchLoteria = useCallback(async (sorteo, num, ser, page) => {
    let fisico = false;
    const sort = sorteo.split("-");
    if (sort[1] === "true") {
      fisico = true;
    }

    if (num === "" && ser === "") return;
    try {
      const { Resultado: res, Num_Datos } = await fetchData(
        urls.ordinario,
        "GET",
        {
          loteria: "02",
          num_loteria: num,
          serie: ser,
          sorteo: parseInt(sort[0]),
          numero: page,
          fisico: fisico,
        },
        {}
      );
      setLoterias(res);
      return Num_Datos;
    } catch (err) {
      setLoterias([]);
      console.error(err);
    }
  }, []);

  const sellLoteria = useCallback(
    async (sorteo) => {
      let fisico = false;
      const sort = sorteo.split("-");
      if (sort[1] === "true") {
        fisico = true;
      }

      const req = {
        num_sorteo: parseInt(sort[0]),
        num_billete: `${selected.Num_billete}`,
        serie: `${selected.serie}`,
        val_pago:
          parseInt(customer.fracciones) * parseFloat(selected.Valor_fraccion),
        vendedor: 1,
        celular: parseInt(customer.phone),
        cod_loteria: selected.Cod_loteria,
        cod_distribuidor: "PPAGO", ////////////////////////////////////#########################
        can_frac_venta: parseInt(customer.fracciones),
        can_fracciones: parseInt(selected.Fracciones_disponibles),
        cantidad_frac_billete: selected.Can_fraccion_billete,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        fisico: fisico,
      };
      try {
        const res = await fetchData(urls.ventaOrdinario, "POST", {}, req);
        setSellResponse(res);
      } catch (err) {
        setSellResponse(null);
        console.error(err);
      }
    },
    [selected, customer, roleInfo]
  );

  const searchModa = useCallback(
    async (dateInit, dateEnd, sorteoSearch = null) => {
      const query = {};
      if (sorteoSearch !== null) {
        query.num_sorteo = sorteoSearch;
      } else {
        query.fecha_ini = dateInit;
        query.fecha_fin = dateEnd;
      }
      try {
        const res = await fetchData(urls.moda, "GET", query, {});
        // console.log(res);
        setModa(res);
      } catch (err) {
        setModa(null);
        console.error(err);
      }
    },
    []
  );

  const getReportesVentas = useCallback(async (sorteo) => {
    try {
      const info = await fetchData(urls.ventasReportes, "GET", {
        sorteo,
      });
      const res = info[0];
      let str = `${res.Campo1}\n${res.Campo2}\n${res.Campo3}\n${res.Campo4}\n`;
      for (const venta of res.Campo5) {
        const line = venta.split("-").join("").concat("\n");
        str = str.concat(line);
      }
      const data = new Blob([str], { type: "text/plain;charset=utf-8" });
      const csv = window.URL.createObjectURL(data);
      return csv;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const isWinner = useCallback(async (sorteo, billete, serie) => {
    try {
      const res = await fetchData(urls.consultaPago, "GET", {
        num_sorteo: sorteo,
        bill_ganador: billete,
        serie_ganadora: serie,
      });
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const makePayment = useCallback(
    async (sorteo, billete, serie, phone, hash) => {
      try {
        const res = await fetchData(urls.premiohash, "GET", {
          num_sorteo: sorteo,
          bill_ganador: billete,
          serie_ganadora: serie,
          celular: phone,
          hash,
        });
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const makePayment2 = useCallback(
    async (sorteo, billete, serie, fracciones_fisi) => {
      try {
        const res = await fetchData(urls.premiofisico, "GET", {
          num_sorteo: sorteo,
          bill_ganador: billete,
          serie_ganadora: serie,
          cant_fracciones: fracciones_fisi,
        });
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const pagopremio = useCallback(
    async (sorteo, billete, serie, hash, customer, respagar, phone) => {
      const req = {
        nombre:
          customer.primer_nombre +
          " " +
          customer.segundo_nombre +
          " " +
          customer.primer_apellido +
          " " +
          customer.segundo_apellido,
        num_sorteo: sorteo,
        bill_ganador: billete,
        serie_ganadora: serie,
        cod_seguridad: hash,
        direccion: customer.direccion,
        cod_dane_ciudad: "12", ////////////////////////////////////#########################
        celular: parseInt(phone),
        valorganado: respagar["valor ganado"],
        valor17percent: respagar["valor 17percent"],
        valor20percent: respagar["valor 20percent"],
        valorbruto: respagar["valor bruto"],
        tipo: parseInt(respagar.Tipo),
        identificacion: customer.doc_id,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
      };
      try {
        const res = await fetchData(urls.pagopremio, "POST", {}, req);
        setPagoresponse(res);
        return res;
      } catch (err) {
        setPagoresponse(null);
        console.error(err);
      }
    },
    [roleInfo]
  );

  const pagopremiofisico = useCallback(
    async (sorteo, billete, serie, customer2, respagar) => {
      const req = {
        nombre:
          customer2.primer_nombre +
          " " +
          customer2.segundo_nombre +
          " " +
          customer2.primer_apellido +
          " " +
          customer2.segundo_apellido,
        num_sorteo: sorteo,
        bill_ganador: billete,
        serie_ganadora: serie,
        direccion: customer2.direccion,
        cod_dane_ciudad: "12", ////////////////////////////////////#########################
        celular: customer2.telefono,
        valorganado: respagar["valor ganado"],
        valor17percent: respagar["valor 17percent"],
        valor20percent: respagar["valor 20percent"],
        valorbruto: respagar["valor bruto"],
        tipo: parseInt(respagar.Tipo),
        identificacion: customer2.doc_id,
        fraciones: customer2.fracciones,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
      };
      try {
        const res = await fetchData(urls.pagopremiofisico, "POST", {}, req);
        setPagoresponse(res);
      } catch (err) {
        setPagoresponse(null);
        console.error(err);
      }
    },
    [roleInfo]
  );

  const ConsultaCrearSort = useCallback(async () => {
    try {
      const res = await fetchData(urls.ConsultaCrearSort, "GET", {
        num_loteria: "02", ////////////////////////////////////#########################
      });

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const CambiarSort = useCallback(async (resp) => {
    const req = {
      num_sorteo: resp.sorteo,
      num_sorteo_ante: resp["sorteo anterior"],
      fecha: resp.fecha,
      tipo_sorteo: resp.tipo,
      num_loteria: resp.loteria,
      nom_loteria: resp["nombre loteria"],
    };
    try {
      const res = await fetchData(urls.CambiarSort, "POST", {}, req);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const EstadoArchivos = useCallback(async () => {
    try {
      const res = await fetchData(urls.EstadoArchivos, "GET", {});

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    infoLoto: {
      numero,
      setNumero,
      serie,
      setSerie,
      loterias,
      setLoterias,
      loteriasfisico,
      setLoteriasfisco,
      selected,
      setSelected,
      customer,
      setCustomer,
      sellResponse,
      setSellResponse,
      pagoresponse,
      setPagoresponse,
    },
    searchLoteria,
    sellLoteria,
    reportes: {
      moda,
      sorteo,
      setSorteo,
      fechaInicial,
      setFechaInicial,
      fechaFinal,
      setFechaFinal,
    },
    searchModa,
    getReportesVentas,
    isWinner,
    makePayment,
    makePayment2,
    pagopremio,
    pagopremiofisico,
    ConsultaCrearSort,
    CambiarSort,
    EstadoArchivos,
  };
};
