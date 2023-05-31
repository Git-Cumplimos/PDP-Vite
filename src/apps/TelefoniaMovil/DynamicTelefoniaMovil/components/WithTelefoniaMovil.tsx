import React, { FunctionComponent, useState } from "react";
import LayoutTelefoniaMovil from "../layouts/LayoutTelefoniaMovil";
import { PropOperadoresComponent } from "../utils/TypesUtils";
import { useImgs } from "../../../../hooks/ImgsHooks";

const WithTelefoniaMovil = (
  operadores: PropOperadoresComponent[],
  ComponectBody: FunctionComponent<any>
) => {
  const [operadorCurrent, setOperadorCurrent] = useState(operadores[0]);
  const { svgs }: any = useImgs();
  return (
    <div>
      <LayoutTelefoniaMovil
        operadores={operadores}
        operadorCurrent={operadorCurrent}
        setOperadorCurrent={setOperadorCurrent}
      />
      <ComponectBody operadorCurrent={operadorCurrent}/>
    </div>
  );
};

export default WithTelefoniaMovil;
