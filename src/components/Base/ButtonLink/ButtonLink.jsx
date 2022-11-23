import { Link } from "react-router-dom";
import classes from "./ButtonLink.module.css";

const ButtonLink = ({ self = false, ...link }) => {
  const { formItem, button } = classes;

  return self ? (
    <button {...link} />
  ) : (
    <div className={formItem}>
      <Link className={button} {...link} />
    </div>
  );
};

export default ButtonLink;
