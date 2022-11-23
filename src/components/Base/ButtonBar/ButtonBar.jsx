import classes from "./ButtonBar.module.css";
import classes2 from "../Form/Form.module.css";

const ButtonBar = ({ children, full = false, ...btnBarProps }) => {
  const { btnBar } = classes;
  const { form_div_Button_Bar } = classes2;
  const { className: clsName = "" } = btnBarProps;
  return (
    <div
      className={`${form_div_Button_Bar} ${btnBar} ${
        full ? "w-full" : ""
      } ${clsName}`}>
      {children}
    </div>
  );
};

export default ButtonBar;
