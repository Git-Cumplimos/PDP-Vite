import React from "react";
import HNavbar from "../../components/Base/HNavbar";
import { useAuth } from "../../hooks/AuthHooks";

const Cupo = ({ subRoutes }) => {
  return <HNavbar links={subRoutes} isIcon />;
};

export default Cupo;
