import { ReactComponent as Icon } from "../../../assets/svg/bar.svg";

const BarIcon = () => {
  return (
    <Icon
      className="hidden sm:block"
      width="0.375rem"
      height="6rem"
      fill="var(--secondary-dark)"
      opacity="0.2"
      style={{
        margin: "0 0.5rem",
      }}
    />
  );
};

export default BarIcon;
