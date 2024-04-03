import { TypeSubModules } from "../DynamicTelefoniaMovil/TypeDinamic";

export type TypeDictServiciosBackendAurorizadores = {
  [key: string]: TypeSubModules<any>;
};

const DictServiciosBackendAurorizadores: TypeDictServiciosBackendAurorizadores =
  {
    movistar: {
      recargas: async () => {},
      paquetes: async () => {},
      cargarPaquetes: async () => {},
      cargarConciliacion: async () => {},
      descargarConciliacion: async () => {},
    },
    practisistemas: {
      recargas: async () => {},
      paquetes: async () => {},
      cargarPaquetes: async () => {},
      cargarConciliacion: async () => {},
      descargarConciliacion: async () => {},
    },
  };

export default DictServiciosBackendAurorizadores;
