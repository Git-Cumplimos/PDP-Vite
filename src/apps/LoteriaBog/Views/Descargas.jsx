import HNavbar from "../../../components/Base/HNavbar/HNavbar";

const Descargas = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default Descargas;
