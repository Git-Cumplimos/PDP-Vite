import React from "react";

import { PropsBackendRecargas } from "../../utils/TypesSubModulos";

type PropsCargarConciliacion = {
  BackendCargaConciliacion: () => Promise<PropsBackendRecargas>;
};

const CargarConciliacion = ({ BackendCargaConciliacion }: PropsCargarConciliacion) => {
  return <div>CargarConciliacion</div>;
};

export default CargarConciliacion;
