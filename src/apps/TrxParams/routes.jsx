import { lazy } from "react";
import { enumPermisosTrx } from "./enumPermisosTrx";


/** Componente de iconos */
const AppIcons = lazy(() => import("../../components/Base/AppIcons"));


/**
 * Trx params
 */
 const CreatePlanComision = lazy(() => import("./Views/Comisiones/CreatePlanComision"))
 const MainPlanComisiones = lazy(() => import("./Views/Comisiones/MainPlanComisiones"))
 const MainAsignaciones = lazy(() => import("./Views/Comisiones/MainAsignaciones"))
 const Assigns = lazy(() => import("./Views/Comisiones/Assigns"))
 const MainPlanComisionesCampana = lazy(() => import("./Views/Comisiones/MainPlanComisionesCampana"))
 const CreatePlanComisionCampana = lazy(() => import("./Views/Comisiones/CreatePlanComisionCampana"))

 const ParametrosAutorizadores = lazy(() =>
 import("./Views/ParametrosAutorizadores")
);
const TipoContratoComisiones = lazy(() =>
 import("./Views/TipoContratoComisiones")
);
const Comisiones = lazy(() => import("./Views/Comisiones"));
const Com2Pay = lazy(() =>
 import("./Views/Comisiones/Com2Pay")
);
const CreateComision = lazy(() =>
 import("./Views/Comisiones/CreateComision")
);
const Com2Collect = lazy(() =>
 import("./Views/Comisiones/Com2Collect")
);
const Convenios = lazy(() => import("./Views/Convenios"));
const ConvAuto = lazy(() => import("./Views/ConvAuto"));
const Autorizadores = lazy(() =>
 import("./Views/Autorizadores")
);
const CreateComisionCobrada = lazy(() =>
 import("./Views/Comisiones/CreateComisionCobrada")
);
const ConfiguracionComercios = lazy(() =>
 import("./Views/ConfiguracionComercios")
);
const CrearComercios = lazy(() =>
 import("./Views/Comercios/CrearComercios")
);
const ListarComercios = lazy(() =>
 import("./Views/Comercios/ListarComercios")
);
const TipoNivelComercio = lazy(() =>
 import("./Views/TipoNivelComercios")
);
const ListarMensajePublicitario = lazy(() =>
 import(
   "./Views/MensajesPublicitarios/ListarMensajePublicitario"
 )
);
const GruposComercios = lazy(() =>
 import("./Views/GruposComercios")
);
const GruposConvenios = lazy(() =>
 import("./Views/GruposConvenios")
);
/**
 * Editar parametros tipos de transacciones
 */
 const ParamsOperations = lazy(() =>
 import("../ParamsOperations/ParamsOperations")
);
const TypesTrxs = lazy(() =>
 import("../ParamsOperations/Views/TypesTrxs")
);

const listPermissions = Object.values(enumPermisosTrx);
export const listPermissionsTrx = listPermissions.splice(
  listPermissions.length / 2
);

const rutasConfiguraciones =   {
  link: "/params-operations",
  label: <AppIcons Logo={"RECAUDO"} name={"Parametros transaccionales"} />,
  component: ParamsOperations,
  permission: listPermissionsTrx,
  subRoutes: [
    {
      link: "/params-operations/parametros-autorizadores",
      label: (
        <AppIcons Logo={"RECAUDO"} name={"Parametros por autorizador"} />
      ),
      component: ParametrosAutorizadores,
      permission: [enumPermisosTrx.parametros_autorizadores],
    },
    {
      link: "/params-operations/types-trxs",
      label: <AppIcons Logo={"RECAUDO"} name={"Tipos de transacciones"} />,
      component: TypesTrxs,
      permission: [enumPermisosTrx.tipos_transacciones],
    },
    {
      link: "/params-operations/comisiones",
      label: <AppIcons Logo={"IMPUESTO"} name={"Tarifas / Comisiones"} />,
      component: Comisiones,
      permission: [enumPermisosTrx.planes_comision, enumPermisosTrx.asignacion_comision],
      subRoutes: [
        {
          link: "/params-operations/comisiones/pagadas",
          label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones a pagar"} />,
          component: Com2Pay,
          permission: [enumPermisosTrx.planes_comision],
          subRoutes: [
            {
              link: "/params-operations/comisiones/pagadas/personalizadas",
              label: (
                <AppIcons
                  Logo={"IMPUESTO"}
                  name={"Comisiones a pagar por comercio"}
                />
              ),
              component: CreateComision,
              permission: [enumPermisosTrx.planes_comision],
            },
          ],
        },
        {
          link: "/params-operations/comisiones/cobradas",
          label: <AppIcons Logo={"IMPUESTO"} name={"Comisiones a cobrar"} />,
          component: Com2Collect,
          permission: [enumPermisosTrx.asignacion_comision],
          subRoutes: [
            {
              link: "/params-operations/comisiones/cobradas/crear",
              label: (
                <AppIcons
                  Logo={"IMPUESTO"}
                  name={"Comisiones a cobrar por autorizador"}
                />
              ),
              component: CreateComisionCobrada,
              permission: [enumPermisosTrx.asignacion_comision],
            },
          ],
        },
        {
          link: "/params-operations/comisiones/asignaciones",
          label: (
            <AppIcons Logo={"IMPUESTO"} name={"Asignación de comisiones"} />
          ),
          component: MainAsignaciones,
          permission: [enumPermisosTrx.asignacion_comision],
          subRoutes: [
            {
              link: "/params-operations/comisiones/asignaciones/crear",
              label: (
                <AppIcons
                  Logo={"IMPUESTO"}
                  name={"Asignación de comisiones"}
                />
              ),
              component: Assigns,
              permission: [enumPermisosTrx.asignacion_comision],
            },
          ],
        },
        {
          link: "/params-operations/comisiones/plan-comisiones",
          label: <AppIcons Logo={"IMPUESTO"} name={"Plan de comisiones"} />,
          component: MainPlanComisiones,
          permission: [enumPermisosTrx.planes_comision],
          subRoutes: [
            {
              link: "/params-operations/comisiones/plan-comisiones/crear",
              label: (
                <AppIcons Logo={"IMPUESTO"} name={"Crear plan de comisión"} />
              ),
              component: CreatePlanComision,
              permission: [enumPermisosTrx.planes_comision],
            },
          ],
        },
        {
          link: "/params-operations/comisiones/plan-comisiones-campana",
          label: (
            <AppIcons
              Logo={"IMPUESTO"}
              name={"Plan de comisiones campañas"}
            />
          ),
          component: MainPlanComisionesCampana,
          permission: [enumPermisosTrx.planes_comision],
          // subRoutes: [
          //   {
          //     link: "/params-operations/comisiones/plan-comisiones/campana/crear",
          //     label: (
          //       <AppIcons
          //         Logo={"IMPUESTO"}
          //         name={"Crear plan de comisión campaña"}
          //       />
          //     ),
          //     component: CreatePlanComisionCampana,
          //     permission: [19],
          //   },
          // ],
        },
      ],
    },
    {
      link: "/params-operations/convenios",
      label: <AppIcons Logo={"RETIRO"} name={"Convenios"} />,
      component: Convenios,
      permission: [enumPermisosTrx.convenios],
      subRoutes: [
        {
          link: "/params-operations/convenios/autorizadores",
          label: (
            <AppIcons Logo={"RETIRO"} name={"Autorizadores de convenio"} />
          ),
          component: ConvAuto,
          permission: [enumPermisosTrx.convenios],
        },
      ],
    },

    {
      link: "/params-operations/autorizadores",
      label: (
        <AppIcons
          Logo={"PRODUCTOS_FINANCIEROS"}
          name={"Proveedores / Autorizadores"}
        />
      ),
      component: Autorizadores,
      permission: [enumPermisosTrx.autorizadores],
    },
    {
      link: "/params-operations/configuracion_comercios",
      label: <AppIcons Logo={"RETIRO"} name={"Configuración comercios"} />,
      component: ConfiguracionComercios,
      permission: [enumPermisosTrx.configuracion_comercios],
    },
    {
      link: "/params-operations/tipo_contrato_comisiones",
      label: <AppIcons Logo={"RETIRO"} name={"Contratos comisiones"} />,
      component: TipoContratoComisiones,
      permission: [enumPermisosTrx.contratos_comisiones],
      subRoutes: [
        {
          link: "/params-operations/convenios/autorizadores",
          label: (
            <AppIcons Logo={"RETIRO"} name={"Autorizadores de convenio"} />
          ),
          component: ConvAuto,
          permission: [enumPermisosTrx.contratos_comisiones],
        },
      ],
    },
    {
      link: "/params-operations/tipo-nivel-comercios",
      label: <AppIcons Logo={"RECAUDO"} name={"Tipo nivel comercios"} />,
      component: TipoNivelComercio,
      permission: [enumPermisosTrx.tipo_nivel_comercio],
    },
    {
      link: "/params-operations/comercios",
      label: <AppIcons Logo={"RECAUDO"} name={"Comercios"} />,
      component: ListarComercios,
      permission: [enumPermisosTrx.comercios],
    },
    {
      link: "/params-operations/comercios/crear",
      label: <AppIcons Logo={"RECAUDO"} name={"Comercios"} />,
      component: CrearComercios,
      permission: [enumPermisosTrx.comercios],
      show: false,
    },
    {
      link: "/params-operations/mensajes_publicitarios",
      label: <AppIcons Logo={"RECAUDO"} name={"Mensajes publicitarios"} />,
      component: ListarMensajePublicitario,
      permission: [enumPermisosTrx.mensajes_publicitarios],
    },
    {
      link: "/params-operations/grupos-comercio",
      label: <AppIcons Logo={"RECAUDO"} name={"Grupos de comercios"} />,
      component: GruposComercios,
      permission: [enumPermisosTrx.grupos_comercios],
    },
    {
      link: "/params-operations/grupos-convenios",
      label: <AppIcons Logo={"RECAUDO"} name={"Grupos de convenios"} />,
      component: GruposConvenios,
      permission: [enumPermisosTrx.grupos_convenios],
    },
  ],
}

export default rutasConfiguraciones