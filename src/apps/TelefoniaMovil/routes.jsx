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
    logo: "TELEFONIAMOVIL_MOVISTAR",
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
    logo: "TELEFONIAMOVIL_CLARO",
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
    logo: "TELEFONIAMOVIL_TIGO",
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
    logo: "TELEFONIAMOVIL_WOM",
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
    logo: "TELEFONIAMOVIL_UFF",
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
    logo: "TELEFONIAMOVIL_EXITO",
    subModules: {
      recargas: {
        backend: useBackendRecargasPractisistemas,
      },
      paquetes: {
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
    name: "Virgin",
    logo: "TELEFONIAMOVIL_VIRGIN",
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
    logo: "TELEFONIAMOVIL_DIRECTV",
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
    logo: "TELEFONIAMOVIL_UNE",
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
    logo: "TELEFONIAMOVIL_AVANTEL",
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
    logo: "TELEFONIAMOVIL_ETB",
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
    logo: "TELEFONIAMOVIL_FLASHMOBILE",
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
    logo: "TELEFONIAMOVIL_COMUNICATE",
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
    logo: "TELEFONIAMOVIL_BUENOFON",
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
