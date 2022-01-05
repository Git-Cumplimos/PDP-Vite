import HNavbar from "../../components/Base/HNavbar/HNavbar";

const IAMIndex = ({ subRoutes, route: { label } }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default IAMIndex;
