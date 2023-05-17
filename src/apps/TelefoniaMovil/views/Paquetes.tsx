import React from "react";
import { PropsBackendRecargas } from "../utils/TypesSubModulos";

type PropsPaquetes = {
  BackendPaquetes: () => Promise<PropsBackendRecargas>;
};


const Paquetes = ({ BackendPaquetes }: PropsPaquetes) => {
  return <div>paquetes</div>;
};

export default Paquetes;
