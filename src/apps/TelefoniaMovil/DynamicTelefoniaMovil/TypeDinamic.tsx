import { ReactNode } from "react";

export type TypeInputPromises<TypeDependsModule> = {
  roleInfo: { [key: string]: any };
  pdpUser: { [key: string]: any };
  moduleInfo: TypeDependsModule;
  id_uuid?: any;
  parameters_operador?: [key: string | any] | {};
  parameters_submodule?: [key: string | any] | {};
};

//------------recargas ------------------------
export type TypeInputDataRecargas = {
  celular: number;
  valor_total_trx: number;
};
export type TypeOutputDataRecargas = {
  status: boolean;
  ticket: any;
};

export type TypeInputPromisesRecargas =
  TypeInputPromises<TypeInputDataRecargas>;

export type TypeBackendRecargas = any;
//------------paquetes ------------------------
export type TypeInputDataGetPaquetesInsert = {
  page: number;
  limit: number;
};
export type TypeInputDataGetPaquetes =
  TypeInputPromises<TypeInputDataGetPaquetesInsert>;

export type TypeTableDataGetPaquetes = {
  codigo: number;
  tipo: string;
  descripcion: string;
  valor: number;
  additional: { [key: string]: any };
};

export type TypeOutputDataGetPaquetes = {
  maxPages: number;
  results: TypeTableDataGetPaquetes[];
};

export type TypeInputDataTrxPaquetesInsert = {
  celular: number;
  codigo: number;
  tipo: string;
  descripcion: string;
  valor: number;
  additional: { [key: string]: any };
};

export type TypeInputTrxPaquetes =
  TypeInputPromises<TypeInputDataTrxPaquetesInsert>;
export type TypeOutputTrxPaquetes = {
  status: boolean;
  ticket: { [key: string]: any };
};

export type TypeBackendPaquetes = any;

export type TypeBackendCargarPaquetes = {
  [key: number | string]: ReactNode;
};

export type TypeBackend =
  | TypeBackendRecargas
  | TypeBackendPaquetes
  | TypeBackendCargarPaquetes;

export type TypeSubModules<_TypeSubModules_> = {
  recargas: _TypeSubModules_;
  paquetes: _TypeSubModules_;
  cargarPaquetes: _TypeSubModules_;
  cargarConciliacion: _TypeSubModules_;
  descargarConciliacion: _TypeSubModules_;
} & { [key: string]: _TypeSubModules_ };

export type TypeRouteModule = {
  link: string;
  label: ReactNode;
  component: ReactNode;
  permission: number[];
  subRoutes?: TypeRouteModule[];
};

export type PropOperadoresComponent = {
  autorizador: string;
  name: string;
  logo: string;
  backend: TypeBackend;
  permission: number[];
  parameters_operador: [key: string | any] | {};
  parameters_submodule: [key: string | any] | {};
};
