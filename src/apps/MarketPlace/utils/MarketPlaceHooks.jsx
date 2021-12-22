import { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";
// import Loteria from "../Views/Loteria";

const urls = {
  consultaOrden: "http://127.0.0.1:9000/consultorder",
  pagoOrden: "http://127.0.0.1:9000/payorder",
};

export const MarketContext = createContext({
  infoMarket: {
    consulta: "",
    setConsulta: "",
  },
  searchsOrder: () => {},
  payOrder: () => {},
});

export const useMarketPlace = () => {
  return useContext(MarketContext);
};

export const useProvideMarketPlace = () => {
  // Datos consulta y compra
  const { roleInfo } = useAuth();
  const [consulta, setConsulta] = useState([]);

  // const searchLoteria = useCallback(async (sorteo, num, ser, page) => {
  //   if (num === "" && ser === "") return;
  //   try {
  //     const { Resultado: res, Num_Datos } = await fetchData(
  //       urls.ordinario,
  //       "GET",
  //       {
  //         num_loteria: num,
  //         serie: ser,
  //         sorteo,
  //         numero: page,
  //       },
  //       {}
  //     );
  //     setLoterias(res);
  //     return Num_Datos;
  //   } catch (err) {
  //     setLoterias([]);
  //     console.error(err);
  //   }
  // }, []);

  // const sellLoteria = useCallback(
  //   async (sorteo) => {
  //     const req = {
  //       num_sorteo: sorteo,
  //       num_billete: `${selected.Num_billete}`,
  //       serie: `${selected.serie}`,
  //       val_pago:
  //         parseInt(customer.fracciones) * parseFloat(selected.Valor_fraccion),
  //       vendedor: 1,
  //       celular: parseInt(customer.phone),
  //       cod_loteria: selected.Cod_loteria,
  //       cod_distribuidor: "DIS",
  //       can_frac_venta: parseInt(customer.fracciones),
  //       can_fracciones: parseInt(selected.Fracciones_disponibles),
  //       cantidad_frac_billete: 3,
  //       id_comercio: roleInfo.id_comercio,
  //       id_usuario: roleInfo.id_usuario,
  //     };
  //     try {
  //       const res = await fetchData(urls.ventaOrdinario, "POST", {}, req);
  //       setSellResponse(res);
  //       console.log(Loteria);
  //     } catch (err) {
  //       setSellResponse(null);
  //       console.error(err);
  //     }
  //   },
  //   [selected, customer, roleInfo]
  // );

  // const searchModa = useCallback(
  //   async (dateInit, dateEnd, sorteoSearch = null) => {
  //     const query = {};
  //     if (sorteoSearch !== null) {
  //       query.num_sorteo = sorteoSearch;
  //     } else {
  //       query.fecha_ini = dateInit;
  //       query.fecha_fin = dateEnd;
  //     }
  //     try {
  //       const res = await fetchData(urls.moda, "GET", query, {});
  //       // console.log(res);
  //       setModa(res);
  //     } catch (err) {
  //       setModa(null);
  //       console.error(err);
  //     }
  //   },
  //   []
  // );

  // const getReportesVentas = useCallback(async (sorteo) => {
  //   try {
  //     const info = await fetchData(urls.ventasReportes, "GET", {
  //       sorteo,
  //     });
  //     const res = info[0];
  //     let str = `${res.Campo1}\n${res.Campo2}\n${res.Campo3}\n${res.Campo4}\n`;
  //     for (const venta of res.Campo5) {
  //       const line = venta.split("-").join("").concat("\n");
  //       str = str.concat(line);
  //     }
  //     const data = new Blob([str], { type: "text/plain" });
  //     const csv = window.URL.createObjectURL(data);
  //     return csv;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  // const isWinner = useCallback(async (sorteo, billete, serie) => {
  //   try {
  //     const res = await fetchData(urls.consultaPago, "GET", {
  //       num_sorteo: sorteo,
  //       bill_ganador: billete,
  //       serie_ganadora: serie,
  //     });
  //     console.log(res);
  //     return res;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  // const makePayment = useCallback(
  //   async (sorteo, billete, serie, phone, hash) => {
  //     try {
  //       const res = await fetchData(urls.premiohash, "GET", {
  //         num_sorteo: sorteo,
  //         bill_ganador: billete,
  //         serie_ganadora: serie,
  //         celular: phone,
  //         hash,
  //       });
  //       return res;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   },
  //   []
  // );

  // const makePayment2 = useCallback(
  //   async (sorteo, billete, serie, fracciones_fisi) => {
  //     try {
  //       const res = await fetchData(urls.premiofisico, "GET", {
  //         num_sorteo: sorteo,
  //         bill_ganador: billete,
  //         serie_ganadora: serie,
  //         cant_fracciones: fracciones_fisi,
  //       });
  //       return res;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   },
  //   []
  // );

  // const pagopremio = useCallback(
  //   async (sorteo, billete, serie, hash, customer, respagar, phone) => {
  //     console.log(customer);
  //     const req = {
  //       nombre:
  //         customer.primer_nombre +
  //         " " +
  //         customer.segundo_nombre +
  //         " " +
  //         customer.primer_apellido +
  //         " " +
  //         customer.segundo_apellido,
  //       num_sorteo: sorteo,
  //       bill_ganador: billete,
  //       serie_ganadora: serie,
  //       cod_seguridad: hash,
  //       direccion: customer.direccion,
  //       cod_dane_ciudad: "12", ///////////
  //       celular: parseInt(phone),
  //       valorganado: respagar["valor ganado"], ////////////////
  //       tipo: parseInt(respagar.Tipo),
  //       identificacion: customer.doc_id,
  //       id_usuario: 8,
  //       id_comercio: 2,
  //     };
  //     try {
  //       const res = await fetchData(urls.pagopremio, "POST", {}, req);
  //       setPagoresponse(res);

  //       //console.log(Loteria)
  //     } catch (err) {
  //       setPagoresponse(null);
  //       console.error(err);
  //     }
  //   },
  //   []
  // );

  const payOrder = useCallback(async (idCompra) => {
    const req = {
      idCompra: idCompra,
      idComercio: 4,
    };
    try {
      const res = await fetchData(urls.pagoOrden, "POST", {}, req);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  });

  const searchsOrder = useCallback(async (idCompra) => {
    try {
      const res = await fetchData(urls.consultaOrden, "GET", {
        idCompra: idCompra,
        idComercio: 4,
      });
      setConsulta(res);
      console.log(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  });

  return {
    payOrder,
    searchsOrder,
    infoMarket: {
      consulta,
    },
  };
};
