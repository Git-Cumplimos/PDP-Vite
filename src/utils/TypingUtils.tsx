import { ReactNode } from "react";

export type TypingRoutes = {
  link: string;
  label: ReactNode;
  component: any;
  permission: number[];
  subModules: TypingRoutes[];
};
