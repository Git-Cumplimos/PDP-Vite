//----- importacion react -----
import React, { ReactNode } from "react";

export type PropsBackendRecargas = {
  [key: number | string]: ReactNode;
};

export type PropsBackendPaquetes = {
  [key: number | string]: ReactNode;
};

export type PropsBackendOperador = {
  [key: number | string]: ReactNode;
};

export type PrivateRoute = {
  link: string;
  label: ReactNode;
  component: ReactNode;
  permission: number[];
  subRoutes?: PrivateRoute[];
  show?: boolean;
};
