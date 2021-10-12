import { Link } from "react-router-dom";
import classes from "./HNavbar.module.css";

const HNavbar = ({ links = [], isText = true, isIcon = false }) => {
  const { navbar, list, text, icon } = classes;
  return (
    <nav className={navbar}>
      <ul className={`${list} ${isText ? text : ""} ${isIcon ? icon : ""}`}>
        {links
          .filter(({ show }) => {
            return show === undefined ? true : show;
          })
          .map(({ label, link }, idx) => {
            return (
              <li key={`${link}_${idx}`}>
                {link === undefined || link === null ? (
                  label
                ) : (
                  <Link to={link}>{label}</Link>
                )}
              </li>
            );
          })}
      </ul>
    </nav>
  );
};

export default HNavbar;
