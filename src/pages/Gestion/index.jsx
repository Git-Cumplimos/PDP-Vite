import HNavbar from "../components/Base/HNavbar";
import { useUrls } from "../hooks/UrlsHooks";
import ProvideGestion from "../menu/gestion/provider/ProvideGestion";

const Gestion = () => {
  const { urlsGestion } = useUrls();
  return <HNavbar links={urlsGestion} isIcon />;
};

export default Gestion;
