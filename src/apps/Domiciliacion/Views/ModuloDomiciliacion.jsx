import React from "react";
import Form from "../../../components/Base/Form";
import HNavbar from "../../../components/Base/HNavbar";
/* import Form from "../../components/Base/Form";
import HNavbar from "../../components/Base/HNavbar"; */

const ModuloDomiciliacion = ({ subRoutes }) => {
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={subRoutes} isIcon />
      </Form>
    </div>
  );
};

export default ModuloDomiciliacion;
