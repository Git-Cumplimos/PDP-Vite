import HNavbar from "../../components/Base/HNavbar";

const API_SMS = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default API_SMS;
