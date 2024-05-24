import { ReactNode } from "react";

export type TypingRoutes = {
  link: string;
  label: ReactNode;
  component: any;
  permission: number[];
  subModules: TypingRoutes[];
  show?: boolean;
};

export type TypeInfTicket = {
  title: string;
  timeInfo: {
    "Fecha de venta": string;
    Hora: string;
  };
  commerceInfo: (string | number)[][];
  commerceName: string;
  trxInfo: (string | number)[][];
  disclamer: string;
};

export type TypingLocation = {
  address: string;
  dane_code: string;
  city: string;
  country: string;
};

export type TypingDataComercioSimple = {
  id_comercio: number;
  id_usuario: number;
  id_terminal: number;
};

export type TypingDataComercio = TypingDataComercioSimple & {
  nombre_comercio: string;
  nombre_usuario: string;
  oficina_propia: boolean;
  location: TypingLocation;
};
