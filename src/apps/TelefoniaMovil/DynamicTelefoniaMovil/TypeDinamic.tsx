import { ReactNode, Dispatch, SetStateAction } from "react";

export type TypeInputPromises<TypeDependsModule> = {
  roleInfo: { [key: string]: any };
  pdpUser: { [key: string]: any };
  moduleInfo: TypeDependsModule;
  id_uuid?: string;
  parameters_operador?: { [key: string]: any };
  parameters_submodule?: { [key: string]: any };
};

export type TypeUseBackend<TypeOutputUseBackend_> = (
  name_operador: string,
  autorizador: string,
  module_: string,
  setLoadingPeticionGlobal: Dispatch<SetStateAction<Boolean>>
) => TypeOutputUseBackend_;

//------------recargas ------------------------
export type TypeInputDataRecargas = {
  celular: string;
  valor_total_trx: number;
};
export type TypeOutputDataRecargas = {
  status: boolean;
  id_trx: number | null;
  ticket: { [key: string]: any } | null;
};

export type TypeInputPromisesRecargas =
  TypeInputPromises<TypeInputDataRecargas>;

//tipado UseBackendRecargas
export type TypeOutputUseBackendRecargas = [
  boolean,
  (
    dataInputPromises: TypeInputPromisesRecargas
  ) => Promise<TypeOutputDataRecargas> //funcion
];

export type TypeUseBackendRecargas =
  TypeUseBackend<TypeOutputUseBackendRecargas>;

//------------paquetes ------------------------
export type TypeInputDataGetPaquetesFilters = {
  page: number;
  limit: number;
  codigo?: string; //number
  tipo?: string;
  descripcion_corta?: string;
  valor?: number;
};

export type TypeInputDataGetPaquetes =
  TypeInputPromises<TypeInputDataGetPaquetesFilters>;

export type TypeTableDataGetPaquetes = {
  codigo: string; //str-number
  nombre: string;
  tipo: string;
  descripcion_corta: string;
  descripcion_completa: string;
  valor: string; //str-number
};

export type TypeOutputDataGetPaquetes = {
  maxPages: number;
  results: TypeTableDataGetPaquetes[];
};

export type TypeInputDataPaquetes = {
  celular: string;
  valor_total_trx: number;
  paquete: {
    codigo: number;
    nombre: string;
    tipo: string;
    descripcion_corta: string;
  };
};

export type TypeInputTrxPaquetes = TypeInputPromises<TypeInputDataPaquetes>;

export type TypeOutputTrxPaquetes = {
  status: boolean;
  id_trx: number | null;
  ticket: { [key: string]: any } | null;
};
//tipado UseBackendPaquetes
export type TypeOutputUseBackendPaquetes = [
  boolean,
  (
    dataInputPromises: TypeInputDataGetPaquetes
  ) => Promise<TypeOutputDataGetPaquetes>, //funcion
  boolean,
  (dataInputPromises: TypeInputTrxPaquetes) => Promise<TypeOutputTrxPaquetes> //funcion
];

export type TypeUseBackendPaquetes =
  TypeUseBackend<TypeOutputUseBackendPaquetes>;
//-------------------------------------

export type TypeBackendCargarPaquetes = {
  [key: number | string]: ReactNode;
};

export type TypeBackend = TypeUseBackendRecargas | TypeUseBackendPaquetes;

export type TypeSubModules<_TypeSubModules_> = {
  recargas: _TypeSubModules_;
  paquetes: _TypeSubModules_;
  cargarPaquetes: _TypeSubModules_;
  cargarConciliacion: _TypeSubModules_;
  descargarConciliacion: _TypeSubModules_;
} & { [key: string]: _TypeSubModules_ };

export type PropOperadoresComponent = {
  autorizador: string;
  name: string;
  logo: string;
  operador: string;
  backend: any;
  permission: number[];
  parameters_operador: { [key: string]: any };
  parameters_submodule: { [key: string]: any };
};

export type PropComponectBody = {
  operadorCurrent: PropOperadoresComponent;
  setLoadingPeticionGlobal: Dispatch<SetStateAction<Boolean>>;
  loadingPeticionGlobal: Boolean;
  children: ReactNode;
};
