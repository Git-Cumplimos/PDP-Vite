import React from "react";
import Form from "../../components/Base/Form";
import HNavbar from "../../components/Base/HNavbar";
const Domiciliacion = ({ subRoutes }) => {
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={[subRoutes[0]]} isIcon />
        <HNavbar links={[subRoutes[1]]} isIcon />
      </Form>
    </div>
  );
};

export default Domiciliacion;
