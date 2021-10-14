import { ReactComponent as Icon } from "../../../assets/svg/bar.svg";

const BarIcon = () => {
  return (
    <Icon
      className="hidden sm:block bg-secondary-dark fill-current"
      width="0.375rem"
      height="6rem"
      opacity="0.2"
      style={{
        margin: "0 0.5rem",
      }}
    />
  );
};

export default BarIcon;
