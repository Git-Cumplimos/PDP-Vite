import { ReactNode } from "react";

export type TypeInputPromises<TypeDependsModule> = {
  roleInfo: { [key: string]: any };
  pdpUser: { [key: string]: any };
  moduleInfo: TypeDependsModule;
  id_uuid?: any;
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
export type TypeInputDataGetPaquetes = any;
export type TypeInputPromisesGetPaquetes =
  TypeInputPromises<TypeInputDataGetPaquetes>;
export type TypeOutputDataGetPaquetes = {
  maxElems: number;
  maxPages: number;
  results: any;
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
};

export type TypeRouteModule = {
  link: string;
  label: ReactNode;
  component: ReactNode;
  permission: number[];
  subRoutes?: TypeRouteModule[];
};
