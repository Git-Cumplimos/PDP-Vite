import HNavbar from "../../components/Base/HNavbar/HNavbar";

const ColCard = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default ColCard;
