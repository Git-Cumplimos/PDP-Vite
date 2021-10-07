import { ReactComponent as Icon } from "../../../assets/svg/right-arrow.svg";
import classes from "./RightArrow.module.css";

const RightArrow = ({ xlarge = false, large = false, small = false }) => {
  const { xlArr, lgArr, smArr } = classes;
  return (
    <Icon
      className={`${xlarge ? xlArr : ""} ${large ? lgArr : ""} ${
        small ? smArr : ""
      } ${!xlarge && !large && !small ? smArr : ""}`}
      fill="var(--secondary)"
    />
  );
};

export default RightArrow;
