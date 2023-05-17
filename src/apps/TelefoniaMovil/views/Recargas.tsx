import React from "react";
import { PropsBackendRecargas } from "../utils/TypesSubModulos";

type PropsRecargas = {
  BackendRecargas: () => Promise<PropsBackendRecargas>;
};

const Recargas = ({ BackendRecargas }: PropsRecargas) => {
  return <div>ppppp</div>;
};

export default Recargas;
