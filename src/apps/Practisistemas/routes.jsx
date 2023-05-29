import { lazy } from "react";
import { enumPermisosPractisistemas } from "./enumPermisosPractisistemas";
/**
 * * Logos
 */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));
/**
 * Pines
 */
const Pines = lazy(() => import("./Views/Pines/Pines"));
const InformacionPin = lazy(() => import("./Views/Pines/InformacionPin"));
const CompraPin = lazy(() => import("./Views/Pines/CompraPin"));

/**
 * Venta Soat
 */
const VentaSoat = lazy(() => import("./Views/Soat/VentaSoat"));
const FormularioVentaSoat = lazy(() =>
  import("./Views/Soat/FormularioVentaSoat")
);

/**
 * Recargas
 */
const RecargasPaquetes = lazy(() =>
  import("./Views/Recargas/Recargas-Paquetes")
);
const SubPaquetesMoviles = lazy(() =>
  import("./Views/Recargas/SubPaquetesMoviles.jsx")
);
const RecargasOperadores = lazy(() =>
  import("./Views/Recargas/RecargarOperadores.jsx")
);
const RecargarPaquetes = lazy(() =>
  import("./Views/Recargas/RecargarPaquetes.jsx")
);

/**
 * Apuestas
 */
const ApuestasDeportivas = lazy(() =>
  import("./Views/Apuestas/ApuestasDeportivas.jsx")
);
const RecargarCuentaApuestas = lazy(() =>
  import("./Views/Apuestas/RecargarApuestas.jsx")
);

export const rutasPines = {
  link: "/Pines/PinesContenido",
  label: (
    <AppIcons
      Logo={"ServicioContenidoPines"}
      name="Pines Servicio y Contenido"
    />
  ),
  component: Pines,
  permission: [enumPermisosPractisistemas.practisistemasPines],
  subRoutes: [
    {
      link: "/Pines/PinesContenido/InformacionPin",
      label: <AppIcons Logo={"RECAUDO"} name="Pin" />,
      component: InformacionPin,
      permission: [enumPermisosPractisistemas.practisistemasPines],
    },
    {
      link: "/Pines/PinesContenido/CompraPin",
      label: <AppIcons Logo={"RECAUDO"} name="Pin" />,
      component: CompraPin,
      permission: [enumPermisosPractisistemas.practisistemasPines],
    },
  ],
};

export const rutasSoat = {
  link: "/ventaSeguros",
  label: <AppIcons Logo={"VENTA_SEGUROS"} name="Venta De Seguros" />,
  component: VentaSoat,
  permission: [enumPermisosPractisistemas.practisistemasSoat],
  subRoutes: [
    {
      link: "/ventaSeguros/ventaSoat",
      label: <AppIcons Logo={"RECAUDO"} name={"Venta Soat"} />,
      component: FormularioVentaSoat,
      permission: [enumPermisosPractisistemas.practisistemasSoat],
    },
  ],
};

export const rutasRecargas = {
  link: "/recargas-paquetes",
  label: (
    <AppIcons Logo={"RecargaCelular"} name="Recargas y Venta de Paquetes" />
  ),
  component: RecargasPaquetes,
  permission: [enumPermisosPractisistemas.practisistemasRecargas],
  subRoutes: [
    {
      link: "/recargas-paquetes/Recargar",
      label: (
        <AppIcons Logo={"RecargaCelular"} name="Recargas y Venta de Paquetes" />
      ),
      component: RecargasOperadores,
      permission: [enumPermisosPractisistemas.practisistemasSoat],
      show: false,
    },
    {
      link: "/recargas-paquetes/Venta-paquetes",
      label: (
        <AppIcons Logo={"RecargaCelular"} name="Recargas y Venta de Paquetes" />
      ),
      component: SubPaquetesMoviles,
      permission: [enumPermisosPractisistemas.practisistemasRecargas],
    },
    {
      link: "/recargas-paquetes/Recargar-paquete",
      label: <AppIcons Logo={"RecargaCelular"} name="Venta de paquetes" />,
      component: RecargarPaquetes,
      permission: [enumPermisosPractisistemas.practisistemasRecargas],
      show: false,
    },
  ],
};

export const rutasApuestas = {
  link: "/apuestas-deportivas",
  label: <AppIcons Logo={"RECAUDO"} name="Apuestas Deportivas" />,
  component: ApuestasDeportivas,
  permission: [enumPermisosPractisistemas.practisistemasApuestas],
  subRoutes: [
    {
      link: "/apuestas-deportivas/Recargar",
      label: <AppIcons Logo={"RECAUDO"} name="Apuestas Deportivas" />,
      component: RecargarCuentaApuestas,
      permission: [enumPermisosPractisistemas.practisistemasApuestas],
      show: false,
    },
  ],
};
