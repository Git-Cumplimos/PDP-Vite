import { lazy } from "react";
import withOperadorMovilPDP from "./components/HOC/withOperadorMovilPDP";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

export default withOperadorMovilPDP([
  {
    name: "claro",
    label: <AppIcons Logo={"MARKETPLACE"} name="Claro" />,
    permissionRecargas: [1],
    permissionPaguetes: [1],
    permissionOperario: [1],
    subModulos: {
      BackendRecargas: async () => {},
      BackendPaquetes: async () => {},
      BackendCargaPaquetes: async () => {},
      BackendCargaConciliacion: async () => {},
    },
  },
  {
    name: "movistar",
    label: <AppIcons Logo={"MARKETPLACE"} name="movistar" />,
    permissionRecargas: [1],
    permissionPaguetes: [1],
    permissionOperario: [1],
    subModulos: {
      BackendRecargas: async () => {},
      BackendDescargaConciliacion: async () => {},
    },
  },
]);
