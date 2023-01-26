import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
//import Loteria from "../Views/Loteria";

////// NITS de loterias _______________________
const nitsLoterias = {
  "loteria-de-bogota": "899.999.270-1",
  "loteria-del-tolima": "809.008.775-0",
  "loteria-de-cundinamarca": "86.003.723-4",
};
//////////////////////////////////////////////

const urls = {
  ordinario: `${process.env.REACT_APP_URL_LOTERIAS}/billeteriaVirtual`,
  ordinariofisico: `${process.env.REACT_APP_URL_LOTERIAS}/billeteriaFisica`,
  EstadoArchivos: `${process.env.REACT_APP_URL_LOTERIAS}/logs`,

  ventaOrdinario: `${process.env.REACT_APP_URL_LOTERIAS}/venta`,
  ventaOrdinariofisica: `${process.env.REACT_APP_URL_LOTERIAS}/ventafisica`,

  reportVentas: `${process.env.REACT_APP_URL_LOTERIAS}/reportes_ventas`,
  con_sort_ventas: `${process.env.REACT_APP_URL_LOTERIAS}/con_sort_vendidos`,
  con_distribuidor_venta: `${process.env.REACT_APP_URL_LOTERIAS}/con_distribuidores`,
  cargueVentasExtra_S3: `${process.env.REACT_APP_URL_LOTERIAS}/reporteVentaExtra_S3`,
  descargaVentas_S3: `${process.env.REACT_APP_URL_LOTERIAS}/descarga_reportes_S3`,
  con_SortVentas_S3: `${process.env.REACT_APP_URL_LOTERIAS}/con_sort`,

  //ventasReportes: `${process.env.REACT_APP_URL_LOTERIAS}/reportes_ventas`,
  //pagosReportes:`${process.env.REACT_APP_URL_LOTERIAS}/reportes_pago_premios`,

  consultaPago: `${process.env.REACT_APP_URL_LOTERIAS}/consultaPremio`,
  pagoPremioLoterias: `${process.env.REACT_APP_URL_LOTERIAS}/pagoPremio`,
  // pagoPremioLoterias: `${process.env.REACT_APP_URL_LOTERIAS}/pagoPremio`,
  premiohash: `${process.env.REACT_APP_URL_LOTERIAS}/estadoPremioVirtual`,
  premiofisico: `${process.env.REACT_APP_URL_LOTERIAS}/estadoPremioFisico`,
  pagopremio: `${process.env.REACT_APP_URL_LOTERIAS}/pagoPremioVirtual`,
  pagopremiofisico: `${process.env.REACT_APP_URL_LOTERIAS}/pagoPremioFisico`,

  ConsultaCrearSort: `${process.env.REACT_APP_URL_LOTERIAS}/consulta_sorteos`,
  CambiarSort: `${process.env.REACT_APP_URL_LOTERIAS}/sorteo`,

  idloteria: `${process.env.REACT_APP_URL_LOTERIAS}/codigos_loteria`,
  consulta_operaciones: `${process.env.REACT_APP_URL_LOTERIAS}/consulta_operaciones`,
  consulta_codigos_oficina: `${process.env.REACT_APP_URL_LOTERIAS}/cod_loteria_oficina`,
  consultaInventario: `${process.env.REACT_APP_URL_LOTERIAS}/consulta_numeros_inventario`,
  consultaInventarioReporte: `${process.env.REACT_APP_URL_LOTERIAS}/consulta_inventario`,
  registrarInventario: `${process.env.REACT_APP_URL_LOTERIAS}/registrar_inventario`,
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
  searchLoteriafisica: () => {},
  sellLoteria: () => {},
  sellLoteriafisica: () => {},
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
  con_distribuidor_venta: () => {},
  // getReportesVentas: () => {},
  // getReportesPagos: () => {},
  isWinner: () => {},
  makePayment: () => {},
  makePayment2: () => {},
  pagopremio: () => {},
  pagopremiofisico: () => {},
  ConsultaCrearSort: () => {},
  CambiarSort: () => {},
  EstadoArchivos: () => {},
  con_sort_ventas: () => {},
  cargueVentasExtra_S3: () => {},
  reportVentas: () => {},
  consultaInventario: () => {},
  consultaInventarioReporte: () => {},
  registrarInventario: () => {},
  setCodigos_lot: null,
  codigos_lot: null,
  tiposOperaciones: null,
  setTiposOperaciones: null,
  codigosOficina: null,
  setCodigosOficina: null,
  loadConsulta: null,
  setLoadConsulta: null,
});

export const useLoteria = () => {
  return useContext(LoteriaContext);
};

export const useProvideLoteria = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();
  const { pathname } = useLocation();

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

  // Datos estadisticas
  const [moda, setModa] = useState(null);
  const [sorteo, setSorteo] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const [codigos_lot, setCodigos_lot] = useState(null);
  const [tiposOperaciones, setTiposOperaciones] = useState(null);
  const [codigosOficina, setCodigosOficina] = useState(null);
  const [nit_loteria, setNit_loteria] = useState(null);
  const [loadConsulta, setLoadConsulta] = useState(false);

  useEffect(() => {
    if (numero === "" && serie === "") {
      setLoterias([]);
    }
  }, [numero, serie, setLoterias]);

  /////// Consulta los sorteos asociados a la loteria
  const idloteria = useCallback(async (nit) => {
    const query = { nit_loteria: nit };
    try {
      const res = await fetchData(urls.idloteria, "GET", query);

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //// Conaulta operaciones asociadas a la lotería
  const consulta_operaciones = useCallback(async (nit) => {
    const query = { nit_loteria: nit };
    try {
      const res = await fetchData(urls.consulta_operaciones, "GET", query);

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  //// Conaulta id disribuidor y de sucursal asociadas a la lotería
  const consulta_codigos_oficina = useCallback(
    async (nit) => {
      const query = { nit_loteria: nit, id_comercio: roleInfo?.id_comercio };
      try {
        const res = await fetchData(
          urls.consulta_codigos_oficina,
          "GET",
          query
        );
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [roleInfo]
  );

  useEffect(() => {
    const nit = nitsLoterias?.[pathname.split("/")?.[2]];
    if (nit !== "" && nit !== undefined) {
      //Consulta codigos de lotería que tiene cada lotería
      setNit_loteria(nit);
      idloteria(nit).then((res) => {
        if (!res?.status) {
          // console.log(res?.msg);
          // setDisabledBtns(true);
        } else {
          setCodigos_lot(res?.obj);
          // console.log(res?.obj);
        }
      });
      //Consulta id de las operaciones por lotería
      consulta_operaciones(nit).then((res) => {
        if (!res?.status) {
          // console.log(res?.msg);
          // setDisabledBtns(true);
        } else {
          setTiposOperaciones(res?.obj);
          // console.log(res?.obj);
        }
      });

      //Consulta codigos de oficina y sucursal por lotería
      if (roleInfo?.id_comercio !== undefined) {
        try {
          consulta_codigos_oficina(nit).then((res) => {
            // console.log("repueta", res);
            if ("msg" in res) {
              setCodigosOficina({
                cod_oficina_lot: "PPVIR",
                cod_sucursal_lot: "00",
              });
            } else {
              setCodigosOficina(res);
            }
          });
        } catch (err) {
          notifyError("Error");
          console.error(err);
        }
      }
    }
  }, [pathname, roleInfo]);

  const sorteosLOT = useMemo(() => {
    var cod = "";
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    return cod;
  }, [codigos_lot]);

  const searchLoteria = useCallback(async (sorteo, num, ser, page) => {
    let fisico = false;
    const sort = sorteo.split("-");
    if (sort[1] === "true") {
      fisico = true;
    }
    if (num === "" && ser === "") return;

    try {
      setLoadConsulta(true);
      const { Resultado: res, Num_Datos } = await fetchData(
        urls.ordinario,
        "GET",
        {
          loteria: sort[2],
          num_loteria: num,
          serie: ser,
          sorteo: sort[0],
          numero: page,
          fisico: fisico,
        },
        {}
      );
      setLoterias(res);
      setLoadConsulta(false);
      return Num_Datos;
    } catch (err) {
      setLoterias([]);
      console.error(err);
      setLoadConsulta(false);
    }
  }, []);

  const searchLoteriafisica = useCallback(
    async (sorteo, num, ser, page) => {
      let fisico = false;
      const sort = sorteo.split("-");
      if (sort[1] === "true") {
        fisico = true;
      }

      if (num === "" && ser === "") return;

      try {
        setLoadConsulta(true);
        const { Resultado: res, Num_Datos } = await fetchData(
          urls.ordinariofisico,
          "GET",
          {
            loteria: sort[2],
            num_loteria: num,
            serie: ser,
            sorteo: sort[0],
            numero: page,
            fisico: fisico,
            cod_distribuidor: codigosOficina?.cod_oficina_lot,
            cod_sucursal: codigosOficina?.cod_sucursal_lot,
          },
          {}
        );

        setLoterias(res);
        setLoadConsulta(false);
        return Num_Datos;
      } catch (err) {
        setLoterias([]);
        setLoadConsulta(false);
        console.error(err);
      }
    },
    [roleInfo, codigosOficina]
  );

  const sellLoteria = useCallback(
    async (sorteo, selecFrac, tipoPago) => {
      let fisico = false;
      const sort = sorteo.split("-");
      if (sort[1] === "true") {
        fisico = true;
      }
      let tipo_comercio = roleInfo.tipo_comercio;
      if (roleInfo.tipo_comercio === "KIOSCO") {
        tipo_comercio = "OFICINAS PROPIAS";
      }
      const req = {
        num_sorteo: sort[0],
        num_billete: `${selected.Num_billete}`,
        serie: `${selected.serie}`,
        val_pago:
          parseInt(customer.fracciones) * parseFloat(selected.Valor_fraccion),
        celular: parseInt(customer.phone),
        cod_loteria: selected.Cod_loteria,
        cod_distribuidor: codigosOficina?.cod_oficina_lot,
        cod_sucursal: codigosOficina?.cod_sucursal_lot,
        can_frac_venta: parseInt(customer.fracciones),
        can_fracciones: parseInt(selected.Fracciones_disponibles),
        cantidad_frac_billete: selected.Can_fraccion_billete,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,

        fisico: fisico,
        cod_dane: roleInfo.codigo_dane,
        tipo_comercio: tipo_comercio,
        tipoPago: tiposOperaciones?.Venta_Virtual, /// Venta - Virtual
      };

      try {
        const res = await fetchData(urls.ventaOrdinario, "POST", {}, req);
        setSellResponse(res);
      } catch (err) {
        setSellResponse(null);
        console.error(err);
      }
    },
    [selected, customer, roleInfo, tiposOperaciones]
  );

  const sellLoteriafisica = useCallback(
    async (sorteo, selecFrac, tipoPago) => {
      let fisico = false;
      const sort = sorteo.split("-");
      if (sort[1] === "true") {
        fisico = true;
      }
      let tipo_comercio = roleInfo.tipo_comercio;
      if (roleInfo.tipo_comercio === "KIOSCO") {
        tipo_comercio = "OFICINAS PROPIAS";
      }
      const req = {
        num_sorteo: sort[0],
        num_billete: `${selected.Num_billete}`,
        serie: `${selected.serie}`,
        val_pago:
          parseInt(selecFrac.length) * parseFloat(selected.Valor_fraccion),
        celular: parseInt(customer.phone),
        cod_loteria: selected.Cod_loteria,
        cod_distribuidor: codigosOficina?.cod_oficina_lot,
        cod_sucursal: codigosOficina?.cod_sucursal_lot,
        cantidad_frac_billete: selected.Can_fraccion_billete,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
        fisico: fisico,
        frac_fisico_venta: selecFrac,
        frac_fisico_disponibles: selected?.Fracciones,
        frac_fisico_final: selected?.Fracciones?.filter(
          (el) => !selecFrac?.includes(el)
        ),
        cod_dane: roleInfo.codigo_dane,
        tipo_comercio: tipo_comercio,
        tipoPago: tipoPago !== null ? tipoPago : tiposOperaciones?.Venta_Fisica, /// Venta lotería de Bogotá - Intercambio/Fisica
      };

      try {
        const res = await fetchData(urls.ventaOrdinariofisica, "POST", {}, req);
        setSellResponse(res);
      } catch (err) {
        setSellResponse(null);
        console.error(err);
      }
    },
    [selected, customer, roleInfo, tiposOperaciones?.Venta_Fisica]
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

  const con_sort_ventas = useCallback(async () => {
    try {
      const info = await fetchData(urls.con_sort_ventas, "GET", {
        //num_loteria:'02'/////////////////////////////////////////////////
      });
      const res = info;
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const con_distribuidor_venta = useCallback(async () => {
    try {
      const info = await fetchData(urls.con_distribuidor_venta, "GET", {});
      return info;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const isWinner = useCallback(
    async (sorteo, billete, serie, checkBilleteFisico, checkBilleteVirtual) => {
      let loteria = sorteosLOT.split(",");
      try {
        const res = await fetchData(
          urls.consultaPago,
          "POST",
          {},
          {
            num_sorteo: sorteo,
            bill_consultado: billete,
            serie_consultada: serie,
            idloteria: loteria,
            fisico: checkBilleteFisico,
            virtual: checkBilleteVirtual,
          },
          {},
          true,
          60000
        );
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [sorteosLOT]
  );

  const makePayment = useCallback(
    async (
      sorteo,
      billete,
      serie,
      checkBilleteFisico,
      checkBilleteVirtual,
      selectFraccion,
      nombre,
      documento,
      direccion,
      celular,
      totalPagar,
      valorbruto,
      comercio,
      terminal,
      usuario,
      codigo_dane,
      idLoteria,
      tipopago,
      hash,
      phone
    ) => {
      if (tipopago == 2) {
        // let tipo_comercio = roleInfo.tipo_comercio;
        // if (roleInfo.tipo_comercio === "KIOSCO") {
        //   tipo_comercio = "OFICINAS PROPIAS";
        // }
        try {
          const res = await fetchData(
            urls.pagoPremioLoterias,
            "POST",
            {},
            {
              datosBill: {
                num_sorteo: sorteo,
                bill_consultado: billete,
                serie_consultada: serie,
                fisico: checkBilleteFisico,
                virtual: checkBilleteVirtual,
                valorbruto: valorbruto,
                valorneto: totalPagar,
                fraccion: selectFraccion,
                hash: hash,
                nombre: nombre,
                identificacion: documento,
                direccion: direccion,
                celular: celular,
              },
              comercio: {
                id_comercio: comercio,
                id_terminal: terminal,
                id_usuario: usuario,
              },
              idLoteria: idLoteria,
              tipo_ganancia: tipopago,
              oficina_propia:
                roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
              cod_distribuidor: codigosOficina?.cod_oficina_lot,
              cod_dane_ciudad: codigo_dane,
            },
            {},
            true,
            60000
          );
          return res;
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          const res = await fetchData(
            urls.pagoPremioLoterias,
            "POST",
            {},
            {
              datosBill: {
                num_sorteo: sorteo,
                bill_consultado: billete,
                serie_consultada: serie,
                fisico: checkBilleteFisico,
                virtual: checkBilleteVirtual,
                valorbruto: valorbruto,
                valorneto: totalPagar,
                fraccion: selectFraccion,
                hash: hash,
              },
              comercio: {
                id_comercio: comercio,
                id_terminal: terminal,
                id_usuario: usuario,
              },
              idLoteria: idLoteria,
              tipo_ganancia: tipopago,
              oficina_propia: false,
              cod_distribuidor: "PPAGO",
              cod_dane_ciudad: 555,
            },
            {},
            true,
            60000
          );
          return res;
        } catch (err) {
          console.error(err);
        }
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
          fracciones_fisi: fracciones_fisi,
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
      let tipo_comercio = roleInfo.tipo_comercio;
      if (roleInfo.tipo_comercio === "KIOSCO") {
        tipo_comercio = "OFICINAS PROPIAS";
      }
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
        cod_dane_ciudad: roleInfo.codigo_dane,
        celular: parseInt(phone),
        valorganado: respagar["valor ganado"],
        valor17percent: respagar["valor 17percent"],
        valor20percent: respagar["valor 20percent"],
        valorbruto: respagar["valor bruto"],
        tipo: parseInt(respagar.Tipo),
        identificacion: customer.doc_id,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
        tipo_comercio: tipo_comercio,
        cod_distribuidor: codigosOficina?.cod_oficina_lot,
        tipo_Operacion: tiposOperaciones?.Pago, /// Pago premios
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
    [roleInfo, tiposOperaciones]
  );

  const pagopremiofisico = useCallback(
    async (sorteo, billete, serie, customer2, respagar, fracciones) => {
      let tipo_comercio = roleInfo.tipo_comercio;
      if (roleInfo.tipo_comercio === "KIOSCO") {
        tipo_comercio = "OFICINAS PROPIAS";
      }
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
        cod_dane_ciudad: roleInfo.codigo_dane,
        celular: customer2.telefono,
        valorganado: respagar["valor ganado"],
        valor17percent: respagar["valor 17percent"],
        valor20percent: respagar["valor 20percent"],
        valorbruto: respagar["valor bruto"],
        tipo: parseInt(respagar.Tipo),
        identificacion: customer2.doc_id,
        fracciones: fracciones,
        id_comercio: roleInfo.id_comercio,
        id_usuario: roleInfo.id_usuario,
        id_terminal: roleInfo.id_dispositivo,
        tipo_comercio: tipo_comercio,
        cod_distribuidor: codigosOficina?.cod_oficina_lot,
        tipo_Operacion: tiposOperaciones?.Pago, /// Pago premios
      };

      try {
        const res = await fetchData(urls.pagopremiofisico, "POST", {}, req);
        setPagoresponse(res);
      } catch (err) {
        setPagoresponse(null);
        console.error(err);
      }
    },
    [roleInfo, tiposOperaciones]
  );

  const ConsultaCrearSort = useCallback(async (cod_loteria) => {
    try {
      const res = await fetchData(urls.ConsultaCrearSort, "GET", {
        cod_loteria: cod_loteria,
      });

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const CambiarSort = useCallback(
    async (sorteo, tipo_sorteo, fecha, num_loteria) => {
      const req = {
        num_sorteo: sorteo,
        tip_sorteo: tipo_sorteo,
        num_loteria: num_loteria, ///////////////////////////////////////////////////////////////77
        fecha: fecha,
      };
      try {
        const res = await fetchData(urls.CambiarSort, "POST", {}, req);

        return res;
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const EstadoArchivos = useCallback(async () => {
    try {
      const res = await fetchData(urls.EstadoArchivos, "GET", {});

      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const cargueVentasExtra_S3 = useCallback(
    async (tip_sorteo) => {
      try {
        const res = await fetchData(urls.cargueVentasExtra_S3, "GET", {
          tip_sorteo: tip_sorteo,
          nit_loteria: nit_loteria,
        });
        // console.log(res);
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [nit_loteria]
  );

  const con_SortVentas_S3 = useCallback(
    async (sorteo, fecha_ini, fecha_fin, page) => {
      const query = {};
      if (sorteo !== "") {
        query.sorteo = sorteo;
        query.numero = page;
      } else {
        query.fecha_ini = fecha_ini;
        query.fecha_fin = fecha_fin;
        query.numero = page;
      }
      query.codigos_loteria = sorteosLOT;
      try {
        const res = await fetchData(urls.con_SortVentas_S3, "GET", query, {});
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [sorteosLOT]
  );

  const descargaVentas_S3 = useCallback(
    async (info) => {
      try {
        const res = await fetchData(urls.descargaVentas_S3, "GET", {
          sorteo: info.num_sorteo,
          fecha_juego: info.fecha_juego,
          tip_sorteo: info.tipo_sorteo,
          nit_loteria: nit_loteria,
        });
        // console.log(res);
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [nit_loteria]
  );

  const reportVentas = useCallback(async (fecha_ini, fecha_fin) => {
    try {
      const res = await fetchData(urls.reportVentas, "GET", {
        fecha_ini: fecha_ini,
        fecha_fin: fecha_fin,
      });
      // console.log(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const consultaInventario = useCallback(
    async (numSorteo, numLoteria) => {
      try {
        const res = await fetchData(
          urls.consultaInventario,
          "POST",
          {},
          {
            num_sorteo: numSorteo,
            num_loteria: numLoteria,
            cod_distribuidor: codigosOficina?.cod_oficina_lot,
            cod_sucursal: codigosOficina?.cod_sucursal_lot,
          }
        );
        // console.log(res);
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [codigosOficina]
  );

  const consultaInventarioReporte = useCallback(
    async (num_sorteo, pageData) => {
      try {
        console.log(codigos_lot);
        const data = {
          ...pageData,
          num_sorteo: num_sorteo,
          num_loteria: codigos_lot,
        };
        // console.log("data inventario reporte", data);
        const res = await fetchData(
          urls.consultaInventarioReporte,
          "POST",
          {},
          data
        );
        // console.log("respuesta inventario reporte", res);
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [codigos_lot]
  );

  const registrarInventario = useCallback(
    async (
      numSorteo,
      numLoteria,
      comentario,
      numero_total,
      numero_completo,
      inconcistencia
    ) => {
      try {
        const res = await fetchData(
          urls.registrarInventario,
          "POST",
          {},
          {
            num_sorteo: numSorteo,
            num_loteria: numLoteria,
            cod_distribuidor: codigosOficina?.cod_oficina_lot,
            cod_sucursal: codigosOficina?.cod_sucursal_lot,
            comentario: comentario,
            numero_total: numero_total,
            numero_completo: numero_completo,
            inconcistencia: inconcistencia,
          }
        );
        // console.log(res);
        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [codigosOficina]
  );

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
    searchLoteriafisica,
    sellLoteria,
    sellLoteriafisica,
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
    con_distribuidor_venta,
    // getReportesVentas,
    // getReportesPagos,
    isWinner,
    makePayment,
    makePayment2,
    pagopremio,
    pagopremiofisico,
    ConsultaCrearSort,
    CambiarSort,
    EstadoArchivos,
    con_sort_ventas,
    cargueVentasExtra_S3,
    con_SortVentas_S3,
    descargaVentas_S3,
    reportVentas,
    consultaInventario,
    consultaInventarioReporte,
    registrarInventario,
    codigos_lot,
    setCodigos_lot,
    tiposOperaciones,
    setTiposOperaciones,
    codigosOficina,
    setCodigosOficina,
    loadConsulta,
    setLoadConsulta,
  };
};
