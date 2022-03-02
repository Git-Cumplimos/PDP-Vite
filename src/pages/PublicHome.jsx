import { useMemo } from "react";
import HNavbar from "../components/Base/HNavbar";
import { useUrls } from "../hooks/UrlsHooks";

const PublicHome = () => {
  const { urlsPublic } = useUrls();
  const filteredUrls = useMemo(
    () => urlsPublic.filter(({ link }) => !["", "*"].includes(link)),
    [urlsPublic]
  );
  return <HNavbar links={filteredUrls} isIcon />;
};

export default PublicHome;
