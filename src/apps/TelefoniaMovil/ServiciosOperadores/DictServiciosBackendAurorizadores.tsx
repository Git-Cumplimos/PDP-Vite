import { TypeSubModules } from "../DynamicTelefoniaMovil/TypeDinamic";
import { useBackendPaquetesMovistar } from "./Movistar/BackendPaquetes";
import { useBackendRecargasMovistar } from "./Movistar/BackendRecargas";
import { useBackendPaquetesPractisistemas } from "./Practisistemas/BackendPaquetes";
import { useBackendRecargasPractisistemas } from "./Practisistemas/BackendRecargas";

export type TypeDictServiciosBackendAurorizadores = {
  [key: string]: TypeSubModules<any>;
};

const DictServiciosBackendAurorizadores: TypeDictServiciosBackendAurorizadores =
  {
    movistar: {
      recargas: useBackendRecargasMovistar,
      paquetes: useBackendPaquetesMovistar,
      cargarPaquetes: async () => {},
      cargarConciliacion: async () => {},
      descargarConciliacion: async () => {},
    },
    practisistemas: {
      recargas: useBackendRecargasPractisistemas,
      paquetes: useBackendPaquetesPractisistemas,
      cargarPaquetes: async () => {},
      cargarConciliacion: async () => {},
      descargarConciliacion: async () => {},
    },
  };

export default DictServiciosBackendAurorizadores;
