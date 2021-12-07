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
  const [urlsPrivateApps, setUrlsPrivateApps] = useState([]);

  const { userPermissions } = useAuth();

  useEffect(() => {
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      const rootUrls = [
        ...allUrlsPrivateApps
          .filter(({ permission }) => {
            if (permission[0] === -1) return true;
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
    urlsPrivate: privateUrls,
    urlsPublic: publicUrls,
    urlsPrivateApps,
  };
};
