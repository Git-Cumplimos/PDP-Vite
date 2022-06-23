import { memo } from "react";
import { useImgs } from "../../../hooks/ImgsHooks";

const BarIcon = memo(() => {
  const {
    svgs: { bar },
  } = useImgs();
  return (
    <div
      style={{
        width: "0.375rem",
      }}
      className="hidden sm:block h-24 my-0 mx-2"
    >
      <div className="aspect-w-1 aspect-h-1 h-full w-full">
        <img src={bar} alt={"bar"} />
      </div>
    </div>
  );
});

export default BarIcon;
