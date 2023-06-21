import { lazy } from "react";
import GetRoutesTelefoniaMovil from "./DynamicTelefoniaMovil/GetRoutesTelefoniaMovil";
import { useBackendRecargasMovistar } from "./ServiciosOperadores/Movistar/BackendRecargas";
import { useBackendRecargasPractisistemas } from "./ServiciosOperadores/Practisistemas/BackendRecargas";
import { useBackendPaquetesMovistar } from "./ServiciosOperadores/Movistar/BackendPaquetes";
import { useBackendPaquetesPractisistemas } from "./ServiciosOperadores/Practisistemas/BackendPaquetes";
import { useBackendPaquetesClaro } from "./ServiciosOperadores/Claro/BackendPaquetes";
import { useBackendRecargasClaro } from "./ServiciosOperadores/Claro/BackendRecargas";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

//Routes --- si desea agregar un operador  MODIFIQUE AQUI-------

export default GetRoutesTelefoniaMovil([
  {
    name: "movistar",
    logo: "TELEFONIA_MOVIL_MOVISTAR",
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
    name: "claro",
    logo: "TELEFONIA_MOVIL_CLARO",
    subModules: {
      recargas: {
        backend: useBackendRecargasClaro,
      },
      paquetes: {
        backend: useBackendPaquetesClaro,
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
    logo: "TELEFONIA_MOVIL_TIGO",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
    logo: "TELEFONIA_MOVIL_WOM",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
    logo: "TELEFONIA_MOVIL_UFF",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
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
    logo: "TELEFONIA_MOVIL_EXITO",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
    logo: "TELEFONIA_MOVIL_VIRGIN",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
    logo: "TELEFONIA_MOVIL_DIRECTV",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
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
    logo: "TELEFONIA_MOVIL_UNE",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
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
    logo: "TELEFONIA_MOVIL_AVANTEL",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
    logo: "TELEFONIA_MOVIL_ETB",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
    logo: "TELEFONIA_MOVIL_FLASHMOBILE",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
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
    logo: "TELEFONIA_MOVIL_COMUNICATE",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
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
    logo: "TELEFONIA_MOVIL_BUENOFON",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
        backend: useBackendPaquetesPractisistemas,
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
