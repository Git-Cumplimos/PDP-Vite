import React from "react";

import { useImgs } from "../../../../../hooks/ImgsHooks";
import TableEnterprise from "../../../../../components/Base/TableEnterprise/TableEnterprise";

type PropsCargarConciliacion = {
  BackendCargaConciliacion: () => Promise<any>;
};

const CargarConciliacion = ({ operadorCurrent }: { operadorCurrent: any }) => {
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
        title={"Cargar conciliación"}
        maxPage={3}
        headers={[
          "Código de la Oferta",
          "Descripción Corta",
          "Valor de la Oferta",
        ]}
        data={[]}
      ></TableEnterprise>
    </div>
  );
};

export default CargarConciliacion;
