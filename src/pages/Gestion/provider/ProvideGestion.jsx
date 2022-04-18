import React from "react";
import { GestionContext, useProvideGestion } from "../utils/GestionHooks";

const ProvideGestion = ({ children }) => {
  const LBD = useProvideGestion();
  return (
    <GestionContext.Provider value={LBD}>{children}</GestionContext.Provider>
  );
};

export default ProvideGestion;
