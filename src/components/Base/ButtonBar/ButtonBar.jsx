import classes from "./ButtonBar.module.css";

const ButtonBar = ({ children, full = false, ...btnBarProps }) => {
  const { btnBar } = classes;
  const { className: clsName } = btnBarProps;
  return (
    <div className={`${btnBar} ${full ? "w-full" : ""} ${clsName}`}>
      {children}
    </div>
  );
};

export default ButtonBar;
