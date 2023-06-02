import React from "react";

import { PropsBackendRecargas } from "../../utils/TypesSubModulos";
import { useImgs } from "../../../../../hooks/ImgsHooks";
import TableEnterprise from "../../../../../components/Base/TableEnterprise/TableEnterprise";

type PropsDescargarConciliacion = {
  BackendDescargaConciliacion: () => Promise<PropsBackendRecargas>;
};

const DescargarConciliacion = ({ operadorCurrent }: { operadorCurrent: any }) => {
  const { svgs }: any = useImgs();
  return (
    <div className="py-10 flex items-center flex-col">
      <img
          className="w-24  "
          src={
            operadorCurrent?.logo?.includes("http")
              ? operadorCurrent?.logo
              : svgs?.[operadorCurrent?.logo]
          }
        ></img>
      <TableEnterprise
        title={"Descargar Conciliación"}
        maxPage={3}
        headers={[
          "Código de la Oferta",
          "Descripción Corta",
          "Valor de la Oferta",
        ]}
        data={[]}
      ></TableEnterprise>
    </div>
  )
};

export default DescargarConciliacion;
