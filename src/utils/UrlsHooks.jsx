import { createContext, useContext, useEffect, useState } from "react";
import AppIcons from "../components/Base/AppIcons/AppIcons";
import SUSER from "../assets/svg/SUSER-01.svg";
import MARKETPLACE from "../assets/svg/MARKETPLACE-01.svg";
import LOTERIA from "../assets/svg/LOTERIA-DE-BOGOTA-01.svg";
import Home from "../pages/Home";
import Login from "../pages/Login";
import AuthButton from "../components/Compound/Signout/Signout";
import LoteriaBog from "../apps/LoteriaBog/LoteriaBog";

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
    return <h1>Componente vacio</h1>;
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
      { link: "/gestion", label: "Gestion", component: emptyComp, props: {} },
      { link: "/reportes", label: "Reportes", component: emptyComp, props: {} },
      {
        link: "/seguridad",
        label: "Seguridad",
        component: emptyComp,
        props: {},
      },
      {
        link: "/solicitudes",
        label: "Tus solicitudes",
        component: emptyComp,
        props: {},
      },
      {
        label: <AuthButton />
      }
    ]);

    setUrlsPrivApps([
      {
        link: "/suser",
        label: <AppIcons Logo={SUSER} name="SUSER" />,
        component: emptyComp,
        props: {},
      },
      {
        link: "/loteria-de-bogota",
        label: <AppIcons Logo={LOTERIA} name="Loteria de bogota" />,
        component: LoteriaBog,
        props: {},
      },
      {
        link: "/marketplace",
        label: <AppIcons Logo={MARKETPLACE} name="Marketplace" />,
        component: emptyComp,
        props: {},
      },
    ]);

    setUrlsPublic([
      {
        link: "/login",
        label: "Login",
        component: Login,
        props: {
          /* style: {
            backgroundImage: "url(../assets/img/personas.png)",
          }, */
        },
      },
    ]);
  }, []);

  return {
    urlsPrivate,
    urlsPublic,
    urlsPrivApps,
  };
};
