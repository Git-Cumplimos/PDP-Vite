import { ReactNode } from "react";

type PropsDefRoutes = {
  link: string;
  label: ReactNode;
  component: ReactNode;
  permissionUso: Number[];
  permissionOperario: Number[];
};

type PropsEstRoutes = {
  link: string;
  label: ReactNode;
  component: ReactNode;
  permissionUso?: Number[];
  permissionOperario?: Number[];
  subRoutes?: PropsDefRoutes[];
};

export type PropsRoutes = {
  link: string;
  label: ReactNode;
  component: ReactNode;
  permission: Number[];
  subRoutes: PropsRoutes[];
};

export const RoutesPaquetes = {
  link: "/paquetes",
  //label: <AppIcons Logo={"MARKETPLACE"} name="Paquetes" />,
  //component: Paquetes,
  permissionUso: [],
  // subRoutes: [],
};

export function getRoutes(
  DefRoutes: PropsDefRoutes[],
  EstRoutes: PropsEstRoutes[]
): PropsRoutes[] {
  return DefRoutes.map((indexDefRoute) => {
    const subRoutesP = getSubRoutes(indexDefRoute, EstRoutes);

    return {
      link: indexDefRoute.link,
      label: indexDefRoute.label,
      component: indexDefRoute.component,
      permission: [
        ...indexDefRoute.permissionUso,
        ...indexDefRoute.permissionOperario,
      ],
      subRoutes: subRoutesP,
    };
  });
}

function getSubRoutes(
  indexDefRoute_: PropsDefRoutes,
  estSubRoutes_: PropsEstRoutes[]
): PropsRoutes[] {
  return estSubRoutes_.map((indexEstRoute: PropsEstRoutes) => {
    let subRoutes: PropsRoutes[] = [];

    if (indexEstRoute.subRoutes !== undefined) {
      if (indexEstRoute.subRoutes.length > 0) {
        subRoutes = getSubRoutes(indexDefRoute_, indexEstRoute.subRoutes);
      }
    }
    let permission: Number[] = [];
    if (indexEstRoute.permissionUso !== undefined) {
      permission = [...permission, ...indexDefRoute_.permissionUso];
    }
    if (indexEstRoute.permissionOperario !== undefined) {
      permission = [...permission, ...indexDefRoute_.permissionOperario];
    }

    return {
      link: indexDefRoute_.link + indexEstRoute.link,
      label: indexEstRoute.label,
      component: indexEstRoute.component,
      permission: permission,
      subRoutes: subRoutes,
    };
  });
}
