import { Link } from "react-router-dom";
import classes from "./HNavbar.module.css";

const HNavbar = ({ links = [], isText = true, isIcon = false }) => {
  const { navbar, list, text, icon, lineaSup, lineaInf } = classes;
  return (
    <>
      <div className={lineaSup}></div>
      <nav className={navbar}>
        <ul className={`${list} ${isText ? text : ""} ${isIcon ? icon : ""}`}>
          {links
            .filter(({ show, label }) => {
              return label === undefined || label === null
                ? false
                : show === undefined
                ? true
                : show;
            })
            .map(({ label, link, extern }, idx) => {
              return (
                <li key={`${link}_${idx}`}>
                  {link === undefined || link === null ? (
                    label
                  ) : extern ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ) : (
                    <Link to={link}>{label}</Link>
                  )}
                </li>
              );
            })}
        </ul>
      </nav>
      <div className={lineaInf}></div>
    </>
  );
};

export default HNavbar;
