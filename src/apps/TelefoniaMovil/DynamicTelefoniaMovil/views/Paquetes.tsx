import React, { useEffect, useState } from "react";
import { PropsBackendRecargas } from "../utils/TypesSubModulos";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import { useImgs } from "../../../../hooks/ImgsHooks";
import { useAuth } from "../../../../hooks/AuthHooks";

type PropsPaquetes = {
  BackendPaquetes: () => Promise<PropsBackendRecargas>;
};

const Paquetes = ({ operadorCurrent }: { operadorCurrent: any }) => {
  const [dataGetPaquetes, setDataGetPaquetes] = useState<any | null>(null);
  const { svgs }: any = useImgs();
  const { roleInfo, pdpUser }: any = useAuth();
  const useHookDynamic = operadorCurrent?.backend;
  const [statePeticion, PeticionGetPaquetes] = useHookDynamic(
    operadorCurrent.name,
    "recargas"
  );

  useEffect(() => {
    PeticionGetPaquetes({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: {},
    })
      .then((response: any) => {
        setDataGetPaquetes(response?.results);
        // setMaxPage(response?.obj?.result?.maxPages);
      })
      .catch((error: any) => {});
  }, [PeticionGetPaquetes, roleInfo, pdpUser]);

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
        title={"Paquetes"}
        maxPage={3}
        headers={[
          "Código de la Oferta",
          "Descripción Corta",
          "Valor de la Oferta",
        ]}
        data={
          dataGetPaquetes?.map((inf: any) => ({
            "Código de la Oferta": inf.codigodelaoferta,
            "Descripción Corta": inf.descripcioncorta,
            "Valor de la Oferta": inf.valordelaoferta,
          })) ?? []
        }
      ></TableEnterprise>
    </div>
  );
};

export default Paquetes;
