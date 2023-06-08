import { lazy } from "react";
import { PermissionsColpatria } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
const ColpatriaTrx = lazy(() => import("./ColpatriaTrx"));
const Deposito = lazy(() => import("./Views/Deposito"));

const PinesConsulta = lazy(() => import("./Views/Pines/ConsultaPines"));
const PinesVenta = lazy(() => import("./Views/Pines/VentaPines"));
const AnulacionPines = lazy(() => import("./Views/Anulacion"));
const PagoGiro = lazy(() => import("./Views/PagoGiro"));
const PinDePago = lazy(() => import("./Views/PinDePago"));

const ConsultaManual = lazy(() => import("./Views/Recaudo/ConsultaManual"));
const ConsultaBarras = lazy(() => import("./Views/Recaudo/ConsultaBarras"));
const TrxRecaudo = lazy(() => import("./Views/Recaudo/TrxRecaudo"));

const AdminColpatria = lazy(() => import("./Views/Admin"));
const ListaErrores = lazy(() => import("./Views/Admin/ListaErrores"));
const ConveniosPines = lazy(() => import("./Views/Admin/ConveniosPines"));
const ConveniosRecaudo = lazy(() => import("./Views/Admin/ConveniosRecaudo"));



const listPermissions = Object.values(PermissionsColpatria);

export const listPermissionsPinesCrc = listPermissions.splice(
  listPermissions.length / 2
);

const rutasPinesCrc = {
  link: "/Pines/PinesCrc",
  label: (
    <AppIcons
      Logo={"CrearPines"}
      name={"Pines CRC"}
    />
  ),
  component: ColpatriaTrx,
  permission: listPermissionsPinesCrc,
  subRoutes: [


    {
      link: "/Pines/PinesCrc/Ventapines",
      label: (
        <AppIcons
          Logo={"VentaPinRecaudoColpatria"}
          name={"Venta de Pines de Recaudo"}
        />
      ),
      component: PinesConsulta,
      permission: [PermissionsColpatria.venta_pines],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"CrearPines"} name={"Venta de Pines de Recaudo"} />
          ),
          component: PinesVenta,
          permission: [PermissionsColpatria.venta_pines],
          show: false,
        },
      ],
    },
    {
      link: "/Pines/PinesCrc/AnulacionPines",
      label: (
        <AppIcons
          Logo={"VentaPinRecaudoColpatria"}
          name={"Anulación"}
        />
      ),
      component: AnulacionPines,
      permission: [63,53],
      subRoutes: [
        {
          link: "/corresponsalia/colpatria/pines/:id_convenio_pin",
          label: (
            <AppIcons Logo={"CrearPines"} name={"Venta de Pines de Recaudo"} />
          ),
          component: PinesVenta,
          permission: [63,53],
          show: false,
        },
      ],
    },
  ],
};

export default rutasPinesCrc;
