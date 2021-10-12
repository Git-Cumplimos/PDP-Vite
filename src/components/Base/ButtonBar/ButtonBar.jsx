import classes from "./ButtonBar.module.css";

const ButtonBar = ({ children, full = false }) => {
  const { btnBar } = classes;
  return <div className={`${btnBar} ${full ? "w-full" : ""}`}>{children}</div>;
};

export default ButtonBar;
