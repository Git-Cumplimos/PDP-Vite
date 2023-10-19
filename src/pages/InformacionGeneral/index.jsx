import HNavbar from "../../components/Base/HNavbar";
import { useUrls } from "../../hooks/UrlsHooks";
import Error403 from "../Error403";

const InformacionGeneral = () => {
  const { urlsInformacionGeneral } = useUrls();

  if (!urlsInformacionGeneral.length) {
    return <Error403 />;
  }
  return <HNavbar links={urlsInformacionGeneral} isIcon />;
};

export default InformacionGeneral;
