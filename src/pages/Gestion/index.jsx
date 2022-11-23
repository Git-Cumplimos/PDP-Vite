import HNavbar from "../../components/Base/HNavbar";
import { useUrls } from "../../hooks/UrlsHooks";
import Error403 from "../Error403";

const Gestion = () => {
  const { urlsGestion } = useUrls();
  if (!urlsGestion.length) return <Error403 />
  return <HNavbar links={urlsGestion} isIcon />;
};

export default Gestion;
