import React from "react";
import HNavbar from "../../components/Base/HNavbar";
import { useAuth } from "../../hooks/AuthHooks";

const Cupo = ({ subRoutes }) => {
  const { roleInfo } = useAuth();
  console.log(roleInfo);
  return <HNavbar links={subRoutes} isIcon />;
};

export default Cupo;
