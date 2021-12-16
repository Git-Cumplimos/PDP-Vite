import { useImgs } from "../../../hooks/ImgsHooks";
import classes from "./RightArrow.module.css";

const RightArrow = ({ xlarge = false, large = false, small = false }) => {
  const { xlArr, lgArr, smArr } = classes;
  const {
    svgs: { right_arrow },
  } = useImgs();
  return (
    <div
      className={`${xlarge ? xlArr : ""} ${large ? lgArr : ""} ${
        small ? smArr : ""
      } ${!xlarge && !large && !small ? smArr : ""}`}
    >
      <div className="aspect-w-1 aspect-h-1 h-full w-full">
        <img src={right_arrow} alt={"right_arrow"} />
      </div>
    </div>
  );
};

export default RightArrow;
