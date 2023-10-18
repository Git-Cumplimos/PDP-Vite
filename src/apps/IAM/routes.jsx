import { lazy } from "react";
import { PermissionsIAM } from "./permissions";

/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));

/** Rutas */
/**
 * IAM
 */
const IAMIndex = lazy(() => import("./IAMIndex"));
const IAMUsers = lazy(() => import("./Views/IAMUsers/index"));
const HandleUser = lazy(() => import("./Views/IAMUsers/HandleUser"));
const IAMGroups = lazy(() => import("./Views/IAMGroups"));
const IAMRoles = lazy(() => import("./Views/IAMRoles"));
const IAMPermissions = lazy(() => import("./Views/IAMPermissions"));
const IAMPolicies = lazy(() => import("./Views/IAMPolicies"));


const listPermissions = Object.values(PermissionsIAM);

export const listPermissionsIAM = listPermissions.splice(listPermissions.length / 2)

const rutasIAM = {
  link: "/iam",
  label: <AppIcons Logo={"IAM"} name="IAM" />,
  component: IAMIndex,
  permission: listPermissionsIAM,
  subRoutes: [
    {
      link: "/iam/users",
      label: <AppIcons Logo={"MARKETPLACE"} name="Usuarios" />,
      component: IAMUsers,
      permission: [PermissionsIAM.usuarios],
      subRoutes: [
        {
          link: "/iam/users/:uuid",
          label: <AppIcons Logo={"MARKETPLACE"} name="Usuarios" />,
          component: HandleUser,
          permission: [PermissionsIAM.usuarios],
          // show: false
        }
      ]
    },
    {
      link: "/iam/groups",
      label: <AppIcons Logo={"MARKETPLACE"} name="Grupos" />,
      component: IAMGroups,
      permission: [PermissionsIAM.grupos],
    },
    {
      link: "/iam/policies",
      label: <AppIcons Logo={"MARKETPLACE"} name="Políticas" />,
      component: IAMPolicies,
      permission: [PermissionsIAM.politicas],
    },
    {
      link: "/iam/roles",
      label: <AppIcons Logo={"MARKETPLACE"} name="Roles" />,
      component: IAMRoles,
      permission: [PermissionsIAM.roles],
    },
    {
      link: "/iam/permissions",
      label: <AppIcons Logo={"MARKETPLACE"} name="Permisos" />,
      component: IAMPermissions,
      permission: [PermissionsIAM.permisos],
    },
  ],
};

export default rutasIAM;