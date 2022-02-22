import React from "react";
import Form from "../../components/Base/Form/Form";
import HNavbar from "../../components/Base/HNavbar/HNavbar";

const AdministradorGestoresComerciales = ({ subRoutes }) => {
  return (
    <div>
      <Form>
        <HNavbar links={[subRoutes[0]]} isIcon />
        <HNavbar links={[subRoutes[1]]} isIcon />
        <HNavbar links={[subRoutes[2]]} isIcon />
      </Form>
    </div>
  );
};

export default AdministradorGestoresComerciales;
