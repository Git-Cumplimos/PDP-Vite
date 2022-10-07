import React, { Fragment } from "react";
import HNavbar from "../../../../components/Base/HNavbar";

const PaquetesMovistar = ({ subRoutes }) => {
  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Comprar paquetes Movistar</h1>
      <HNavbar links={subRoutes} isIcon />
    </Fragment>
  );
};

export default PaquetesMovistar;
