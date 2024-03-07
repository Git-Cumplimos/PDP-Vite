import { ReactNode } from "react";

export type TypingRoutes = {
  link: string;
  label: ReactNode;
  component: any;
  permission: number[];
  subModules: TypingRoutes[];
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
