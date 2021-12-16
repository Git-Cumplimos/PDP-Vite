import { UrlsContext, useProvideUrls } from "../../../hooks/UrlsHooks";

const ProvideUrls = ({ children }) => {
  const urls = useProvideUrls();
  return <UrlsContext.Provider value={urls}>{children}</UrlsContext.Provider>;
};

export default ProvideUrls;
