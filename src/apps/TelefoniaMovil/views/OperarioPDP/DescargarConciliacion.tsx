import React from "react";

import { PropsBackendRecargas } from "../../utils/TypesSubModulos";

type PropsDescargarConciliacion = {
  BackendDescargaConciliacion: () => Promise<PropsBackendRecargas>;
};

const DescargarConciliacion = ({ BackendDescargaConciliacion }: PropsDescargarConciliacion) => {
  return <div>DescargarConciliacion</div>;
};

export default DescargarConciliacion;
