import { createContext, useContext, useEffect, useState } from "react";
import AppIcons from "../components/Base/AppIcons/AppIcons";
import SUSER from "../assets/svg/SUSER-01.svg";
import MARKETPLACE from "../assets/svg/MARKETPLACE-01.svg";
import LOTERIA from "../assets/svg/LOTERIA-DE-BOGOTA-01.svg";
import ACTUALIZACION from "../assets/svg/ActualizacionDeDatos.svg";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AuthButton from "../components/Compound/Signout/Signout";
import LoteriaBog from "../apps/LoteriaBog/LoteriaBog";
import FunMujer from "../apps/FundacionMujer/componentsmujer/Pages/FunMujer";
import Transacciones from "../pages/Transacciones";
// import CrearRoles from "../pages/CrearRoles";
import FormCommerce from "../apps/UpdateCommerce/FormCommerce";
import MarketPlace from "../apps/MarketPlace/MarketPlace";
import CommerceInfo from "../apps/UpdateCommerce/CommerceInfo";

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
    return <h1 className="text-4xl text-center mt-8">En mantenimiento</h1>;
  };

  useEffect(() => {
    setUrlsPrivate([
      { link: "/", label: "Inicio", component: Home, props: {} },
      {
        link: "/info",
        label: "Informacion general",
        component: emptyComp,
        props: {},
      },
      {
        link: "/gestion",
        label: "Gestion",
        component: emptyComp,
        props: {},
      },
      { link: "/reportes", label: "Reportes", component: emptyComp, props: {} },
      {
        link: "/seguridad",
        label: "Seguridad",
        component: emptyComp /* CrearRoles */,
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
        link: "https://portal.solucionesenred.co/",
        label: <AppIcons Logo={SUSER} name="SUSER" />,
        component: emptyComp,
        props: {},
        extern: true,
      },
      {
        link: "/loteria-de-bogota",
        label: <AppIcons Logo={LOTERIA} name="Loteria de bogota" />,
        component: LoteriaBog,
        props: {},
        show: false,
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
        component: LoteriaBog,
        props: {},
        exact: false,
        show: false,
        extern: false,
      },
      {
        link: "/fundacion-mujer/:page",
        component: FunMujer,
        props: {},
        exact: false,
        show: false,
        extern: false,
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
        show: false,
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
      // REACT_APP_URL_FORM_COMMERCE
      {
        link: "/marketplace/payorder/:orden",
        // label: <AppIcons Logo={MARKETPLACE} name="Marketplace" />,
        component: MarketPlace,
        props: {},
        extern: false,
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
  }, []);

  return {
    urlsPrivate,
    urlsPublic,
    urlsPrivApps,
  };
};
