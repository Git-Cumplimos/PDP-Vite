import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUrls } from "../../hooks/UrlsHooks";
import Error403 from "../Error403";
import classes from "./Subcategorias.module.css";
import { Link } from "react-router-dom";

const Subcategorias = ({ comercios = [], title = "" }) => {
  const { navbar, list, text, icon } = classes;
  const { allRoutes, urlsPrivateApps } = useUrls();

  const [allRoutesArray, setAllRoutesArray] = useState([]);
  // Chatgpt me ayudó
  const hasExtractedData = useRef(false);
  const extractData = useCallback(() => {
    // console.log("private", urlsPrivateApps);
    if (
      !hasExtractedData.current &&
      allRoutes?.props?.children?.[0]?.props?.children
    ) {
      const extractedData = allRoutes.props.children[0].props.children.reduce(
        (accumulator, currentArray) => {
          const arrayData = currentArray.map((route) => ({
            link: route.props.path ?? "",
            label: route.props.element?.props?.children?.props?.label ?? "",
            show: route.props.element?.props?.children?.props?.show ?? true,
            extern:
              route.props.element?.props?.children?.props?.extern ?? false,
          }));
          return [...accumulator, ...arrayData];
        },
        []
      );
      // console.log("allRoutes", allRoutes);
      // console.log("extractedData", extractedData);
      setAllRoutesArray([
        {
          link: "https://portal.solucionesenred.co/",
          extern: true,
          label:
            urlsPrivateApps?.find(
              (app) => app.link === "https://portal.solucionesenred.co/"
            )?.label ?? "SUSER",
        },
        ...extractedData,
      ]);

      // Marcar como ejecutado para evitar futuras ejecuciones
      hasExtractedData.current = true;
    }
  }, [allRoutes, setAllRoutesArray, urlsPrivateApps]);

  useEffect(() => {
    extractData();
  }, [extractData]); // Solo depende de extractData

  const findMatchingApps = useCallback((apps, comercios) => {
    if (!Array.isArray(apps)) {
      console.error("apps debe ser un array");
      return [];
    }
    if (!Array.isArray(comercios)) {
      console.error("comercios debe ser un array");
      return [];
    }

    let matchingApps = [];

    apps.forEach((app) => {
      if (comercios.includes(app?.link)) {
        matchingApps.push(app);
      }

      // if (app.subRoutes && app.subRoutes.length > 0) {
      //   const matchingSubroutes = findMatchingApps(app.subRoutes, comercios);
      //   matchingApps = matchingApps.concat(matchingSubroutes);
      // }
    });

    return matchingApps;
  }, []);

  const filteredComerciosUrls = useMemo(() => {
    return findMatchingApps(allRoutesArray, comercios);
  }, [comercios, findMatchingApps, allRoutesArray]);

  console.log("filteredComerciosUrls", filteredComerciosUrls);

  if (comercios && comercios.length === 0) return <Error403 />;
  return (
    <>
      <nav className={navbar}>
        <ul className={`${list} ${text} ${icon}`}>
          {filteredComerciosUrls
            .filter(({ show, label }) => {
              return label === undefined || label === null
                ? false
                : show === undefined
                ? true
                : show;
            })
            .map(({ label, link, extern }, idx) => {
              return (
                <li key={`${link}_${idx}`}>
                  {link === undefined || link === null ? (
                    label
                  ) : extern ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ) : (
                    <Link to={link}>{label}</Link>
                  )}
                </li>
              );
            })}
        </ul>
      </nav>
      {/* <Bar /> */}
    </>
  );
};

export default Subcategorias;

const Bar = ({ children }) => {
  return (
    <div className="flex flex-col w-full mb-5">
      <span className="w-full h-0.5 my-auto bg-black"></span>
      {children ? <h2 className="pt-5 text-2xl">{children}</h2> : null}
    </div>
  );
};
