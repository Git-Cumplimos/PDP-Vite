import HNavbar from "../components/Base/HNavbar";
import { useUrls } from "../hooks/UrlsHooks";
import ProvideGestion from "../menu/gestion/provider/ProvideGestion";

const Gestion = () => {
  const { urlsGestion } = useUrls();
<<<<<<< HEAD:src/pages/Gestion.jsx

  return (
    <ProvideGestion>
      <HNavbar links={urlsGestion} isIcon />
    </ProvideGestion>
  );
=======
  return <HNavbar links={urlsGestion} isIcon />;
>>>>>>> ac0e4af02d1e3407e60543e7eeab37793dc43120:src/pages/Gestion/index.jsx
};

export default Gestion;
