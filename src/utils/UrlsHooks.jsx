import { createContext, useContext, useEffect, useState } from "react";
import AppIcons from "../components/Base/AppIcons/AppIcons";
import SUSER from "../assets/svg/SUSER-01.svg";
import MARKETPLACE from "../assets/svg/MARKETPLACE-01.svg";
import ACTUALIZACION from "../assets/svg/ActualizacionDeDatos.svg";
import LOTERIA from "../assets/svg/LOTERIA-DE-BOGOTA-01.svg";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AuthButton from "../components/Compound/Signout/Signout";
import LoteriaBog from "../apps/LoteriaBog/LoteriaBog";
import FunMujer from "../apps/FundacionMujer/componentsmujer/Pages/FunMujer";
import Transacciones from "../pages/Transacciones";
import CrearRoles from "../pages/CrearRoles";
import FormCommerce from "../apps/UpdateCommerce/FormCommerce";
import MarketPlace from "../apps/MarketPlace/MarketPlace";
import CommerceInfo from "../apps/UpdateCommerce/CommerceInfo";
import { useAuth } from "./AuthHooks";
//import Box from "../components/Base/Cargando/Cargando"

export const UrlsContext = createContext({
  urlsPrivate: [],
  urlsPublic: [],
  urlsPrivApps: [],
});

export const useUrls = () => {
  return useContext(UrlsContext);
};

export const useProvideUrls = () => {
  const [urlsPrivate, setUrlsPrivate] = useState([]);
  const [urlsPublic, setUrlsPublic] = useState([]);
  const [urlsPrivApps, setUrlsPrivApps] = useState([]);

  const emptyComp = () => {
    return <h1 className="text-3xl text-center my-4">En mantenimiento</h1>;
  };

  const { roleInfo } = useAuth();

  useEffect(() => {
    setUrlsPrivate([
      { link: "/", label: "Inicio", component: Home, props: {} },
      {
        link: "/info",
        label: "Informacion general",
        component: emptyComp,
        props: {},
      },
      { link: "/gestion", label: "Gestion", component: emptyComp, props: {} },
      { link: "/reportes", label: "Reportes", component: emptyComp, props: {} },
      {
        link: "/seguridad",
        label: "Seguridad",
        component: roleInfo?.roles?.includes(1) ? CrearRoles : emptyComp,
        props: {},
      },
      {
        link: "/solicitudes",
        label: "Tus solicitudes",
        component: emptyComp,
        props: {},
      },
      {
        label: <AuthButton />,
      },
    ]);

    setUrlsPrivApps([
      {
        link: "/suser",
        label: <AppIcons Logo={SUSER} name="SUSER" />,
        props: {},
        extern: true,
      },
      {
        link: "/loteria-de-bogota",
        label: <AppIcons Logo={LOTERIA} name="Loteria de bogota" />,

        component:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.id_comercio=== 2
            ? LoteriaBog
            : emptyComp,
        props: {},
        show: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.id_comercio=== 2, ///////////////////////////////
        extern: false,
      },
      {
        link: "/fundacion-mujer",
        label: <AppIcons name="Fundacion de la mujer" />,
        component: FunMujer,
        props: {},
        show: false,
        extern: false,
      },
      {
        link: "/loteria-de-bogota/:page",
        component:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.id_comercio=== 2
            ? LoteriaBog
            : emptyComp,
        props: {},
        exact: false,
        show: false,
      },
      {
        link: "/fundacion-mujer/:page",
        component: FunMujer,
        props: {},
        exact: false,
        show: false,
      },
      {
        link: "/marketplace",
        label: <AppIcons Logo={MARKETPLACE} name="Marketplace" />,
        component: emptyComp,
        props: {},
        show: false,
        extern: false,
      },
      {
        link: "/transacciones",
        label: <AppIcons Logo={MARKETPLACE} name="Transacciones" />,
        component: Transacciones,
        props: {},
        extern: false,
      },
      {
        link: "/update-commerce",
        label: <AppIcons Logo={ACTUALIZACION} name="Actualizacion de datos" />,
        component: FormCommerce,
        props: {},
        extern: false,
      },
      {
        link: "/review-commerce-forms",
        label: (
          <AppIcons
            Logo={ACTUALIZACION}
            name="Revisar actualizacion de datos"
          />
        ),
        component: CommerceInfo,
        props: {},
        extern: false,
        show: false,
      },
      {
        link: "/marketplace/payorder/:orden",
        // label: <AppIcons Logo={MARKETPLACE} name="Marketplace" />,
        component: MarketPlace,
        props: {},
        extern: false,
        show: false,
      },
    ]);

    setUrlsPublic([
      {
        link: "/login",
        label: "Login",
        component: Login,
        props: {},
      },
    ]);
  }, [roleInfo]);
  console.log(roleInfo);
  return {
    urlsPrivate,
    urlsPublic,
    urlsPrivApps,
  };
};
