import React from "react";
import Form from "../../components/Base/Form";
import HNavbar from "../../components/Base/HNavbar";
import { useAuth } from "../../hooks/AuthHooks";

const Domiciliacion = ({ subRoutes }) => {
  const { quotaInfo, roleInfo } = useAuth();
  console.log(quotaInfo);
  console.log(roleInfo);
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={[subRoutes[0]]} isIcon />
        <HNavbar links={[subRoutes[1]]} isIcon />
        <HNavbar links={[subRoutes[2]]} isIcon />
      </Form>
    </div>
  );
};

export default Domiciliacion;
