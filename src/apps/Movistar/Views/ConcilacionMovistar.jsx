import React, { Fragment } from "react";
import HNavbar from "../../../components/Base/HNavbar";

const ConcilacionMovistar = ({ subRoutes }) => {
  return (
    <Fragment>
      <h1 className="text-3xl">Conciliaciones Movistar</h1>
      <HNavbar links={subRoutes} isIcon />
    </Fragment>
  );
};

export default ConcilacionMovistar;
