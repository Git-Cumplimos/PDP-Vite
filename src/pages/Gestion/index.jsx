import HNavbar from "../../components/Base/HNavbar";
import { useUrls } from "../../hooks/UrlsHooks";

const Gestion = () => {
  const { urlsGestion } = useUrls();
  return <HNavbar links={urlsGestion} isIcon />;
};

export default Gestion;
