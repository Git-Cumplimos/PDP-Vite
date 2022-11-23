import { lazy } from "react";

const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

const PublicHome = lazy(() => import("."));

export const publicUrls = [
  { link: "", label: "Inicio", component: PublicHome },
];
