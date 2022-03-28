import HNavbar from "../../components/Base/HNavbar";
import { useUrls } from "../../hooks/UrlsHooks";
import Error403 from "../Error403";

const Reportes = () => {
  const { urlsReportes } = useUrls();

  if (!urlsReportes.length) {
    return <Error403 />;
  }
  return <HNavbar links={urlsReportes} isIcon />;
};

export default Reportes;
