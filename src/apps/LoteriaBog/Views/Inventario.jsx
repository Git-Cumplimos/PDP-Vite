import HNavbar from "../../../components/Base/HNavbar";

const Inventario = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default Inventario;
