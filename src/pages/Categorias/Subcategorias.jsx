import { useCallback, useMemo } from "react";
import { useUrls } from "../../hooks/UrlsHooks";
import Error403 from "../Error403";
import classes from "./Subcategorias.module.css";
import { Link } from "react-router-dom";

const Subcategorias = ({ comercios = [], title = "" }) => {
  const { navbar, list, text, icon } = classes;
  const { urlsPrivateApps } = useUrls();

  // console.log("urlsPrivateApps", urlsPrivateApps);

  // const filteredComerciosUrls = useMemo(() => {
  //   const filtrados = urlsPrivateApps.filter((app) =>
  //     comercios.includes(app?.label?.props?.name)
  //   );
  //   return filtrados;
  // }, [comercios, urlsPrivateApps]);

  const findMatchingApps = useCallback((apps, comercios) => {
    let matchingApps = [];

    apps.forEach((app) => {
      if (comercios.includes(app?.link)) {
        matchingApps.push(app);
      }

      if (app.subRoutes && app.subRoutes.length > 0) {
        const matchingSubroutes = findMatchingApps(app.subRoutes, comercios);
        matchingApps = matchingApps.concat(matchingSubroutes);
      }
    });

    return matchingApps;
  }, []);

  const filteredComerciosUrls = useMemo(() => {
    return findMatchingApps(urlsPrivateApps, comercios);
  }, [comercios, findMatchingApps, urlsPrivateApps]);

  if (comercios.length === 0) return <Error403 />;
  return (
    <>
      <Bar>{title}</Bar>
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
