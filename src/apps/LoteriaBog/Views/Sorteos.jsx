import HNavbar from "../../../components/Base/HNavbar";

const Sorteos = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default Sorteos;
