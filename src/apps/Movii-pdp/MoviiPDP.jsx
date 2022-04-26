import HNavbar from "../../components/Base/HNavbar";

const MoviiPDP = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default MoviiPDP;
