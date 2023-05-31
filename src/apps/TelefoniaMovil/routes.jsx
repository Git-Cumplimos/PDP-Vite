import { lazy } from "react";
import GetRoutesTelefoniaMovil from "./DynamicTelefoniaMovil/GetRoutesTelefoniaMovil";
import { useBackendRecargas } from "./ServiciosOperadores/Claro/BackendRecargas";
import { useBackendRecargasMovistar } from "./ServiciosOperadores/Movistar/BackendRecargas";
import { useBackendRecargasPractisistemas } from "./ServiciosOperadores/Practisistemas/BackendRecargas";
import { useBackendPaquetesMovistar } from "./ServiciosOperadores/Movistar/BackendPaquetes";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

//Routes --- si desea agregar un operador  MODIFIQUE AQUI-------

export default GetRoutesTelefoniaMovil([
  {
    name: "claro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/99/Logo_de_Claro.svg",
    subModules: {
      recargas: {
        backend: useBackendRecargas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "movistar",
    logo: "https://e7.pngegg.com/pngimages/543/906/png-clipart-movistar-yamaha-motogp-mobile-phones-claro-telefonica-others-angle-logo.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasMovistar,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Tigo",
    logo: "https://play-lh.googleusercontent.com/BR3FX8EpkDP1FGH_FdE9NpfDZSQcsxEk_khWNn3mvFd7cR9CA0UZVn0L1PUZdYYVPuE=w600-h300-pc0xffffff-pd",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "WOM",
    logo: "https://emtecgroup.net/wp-content/uploads/2020/05/Wom-COLOR.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Uff",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Uffmovillogo.svg/1200px-Uffmovillogo.svg.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Exito",
    logo: "https://roams.com.co/images/post/es_CO_telco/companias-telefonicas-movil-exito.svg",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Virgin",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Virgin-logo.svg/2341px-Virgin-logo.svg.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Direct TV",
    logo: "https://w7.pngwing.com/pngs/612/912/png-transparent-directv-1-hd-logo.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Une",
    logo: "https://www.pngfind.com/pngs/m/682-6828862_une-colombia-png-transparent-png.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Avantel",
    logo: "https://www.estamosenlinea.com/wp-content/uploads/2018/09/Avantel.jpg",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Etb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/ETB_Bogot%C3%A1_logo.svg/2560px-ETB_Bogot%C3%A1_logo.svg.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Flash Mobile",
    logo: "https://moyobamba.com/wp-content/uploads/2020/06/flash-mobile.gif",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Comunicate",
    logo: "https://lh5.googleusercontent.com/p/AF1QipN5f7_KlsxXJQJzIxrEf1TkbsvlHGYx1gMyf52X",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
  {
    name: "Buenofon",
    logo: "https://supergirosnortedelvalle.com/wp-content/uploads/2021/05/buenofon.png",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesMovistar,
      },
      cargarPaquetes: {
        backend: async () => {},
      },
      cargarConciliacion: {
        backend: async () => {},
      },
      descargarConciliacion: {
        backend: async () => {},
      },
    },
  },
]);
