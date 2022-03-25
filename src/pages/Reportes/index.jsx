import HNavbar from "../../components/Base/HNavbar";
import { useUrls } from "../../hooks/UrlsHooks";

const Reportes = () => {
  const { urlsReportes } = useUrls();
  return <HNavbar links={urlsReportes} isIcon />;
};

export default Reportes;
