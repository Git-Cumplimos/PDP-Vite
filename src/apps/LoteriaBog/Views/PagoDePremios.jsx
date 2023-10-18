import HNavbar from "../../../components/Base/HNavbar";

const PagoDePremios = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default PagoDePremios;