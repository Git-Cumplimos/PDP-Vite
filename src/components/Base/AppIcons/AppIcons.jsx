import { memo, useMemo } from "react";
import { useImgs } from "../../../hooks/ImgsHooks";

const AppIcons = memo(({ Logo = "", name }) => {
  const { svgs } = useImgs();
  const logo = useMemo(() => {
    if (Logo?.includes("http")) {
      return Logo;
    }
    return svgs?.[Logo];
  }, [Logo, svgs]);
  return (
    <div className="flex flex-col justify-center text-center text-base md:text-xl w-28 md:w-32 m-auto">
      <div className="aspect-w-1 aspect-h-1">
        <img src={logo} alt={name !== undefined ? name : Logo} />
      </div>
      {name !== undefined ? <h1>{name}</h1> : null}
    </div>
  );
});

export default AppIcons;
