import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthHooks";
import { allUrlsPrivateApps, privateUrls, publicUrls } from "./appsRoutes";

export const UrlsContext = createContext({
  urlsPrivate: [],
  urlsPublic: [],
  urlsPrivateApps: [],
});

export const useUrls = () => {
  return useContext(UrlsContext);
};

export const useProvideUrls = () => {
  const [urlsPrivate, setUrlsPrivate] = useState([]);
  const [urlsPublic, setUrlsPublic] = useState([]);
  const [urlsPrivateApps, setUrlsPrivateApps] = useState([]);

  const { userPermissions } = useAuth();

  useEffect(() => {
    setUrlsPublic([...publicUrls]);
    setUrlsPrivate([...privateUrls]);

    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      const rootUrls = [
        ...allUrlsPrivateApps
          .filter(({ permission }) => {
            if (permission[0] === -1) return true;
            for (const per of permission) {
              return userPermissions
                .map(({ id_permission }) => id_permission)
                .includes(per);
            }
            return false;
          })
          .map((el) => {
            const { subRoutes } = el;
            if (subRoutes) {
              el.subRoutes = subRoutes.filter(({ permission }) => {
                for (const per of permission) {
                  if (
                    userPermissions
                      .map(({ id_permission }) => id_permission)
                      .includes(per)
                  ) {
                    return true;
                  }
                }
                return false;
              });
            }
            return el;
          }),
      ];
      setUrlsPrivateApps([...rootUrls]);
    } else {
      setUrlsPrivateApps([]);
    }
  }, [userPermissions]);

  return {
    urlsPrivate,
    urlsPublic,
    urlsPrivateApps,
  };
};
