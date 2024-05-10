import React from "react";
import { useImgs } from "../../../../hooks/ImgsHooks";

const DestinoLogoGou = () => {
  const { imgs } = useImgs();
  return (
    <img className={"mb-2 mt-8"} src={`${imgs.LogoGou}`} alt={"LogoPasarela"} />
  );
};

export default DestinoLogoGou;
