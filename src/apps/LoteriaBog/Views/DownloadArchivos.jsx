import HNavbar from "../../../components/Base/HNavbar";

const DownloadArchivos = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default DownloadArchivos;