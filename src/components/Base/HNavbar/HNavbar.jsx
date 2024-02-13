import { Link } from "react-router-dom";
import classes from "./HNavbar.module.css";

const HNavbar = ({ links = [], isText = true, isIcon = false, title = "" }) => {
  const { navbar, list, text, icon } = classes;
  return (
    <>
      <Bar>{title}</Bar>
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
      {/* <Bar /> */}
    </>
  );
};

export default HNavbar;

const Bar = ({ children }) => {
  return (
    <div className="flex justify-center my-5 mx-20">
      <span className="w-full h-0.5 my-auto bg-gradient-to-r from-red-500 to-rose-600"></span>
      {children ? <h2 className="px-2 text-2xl">{children}</h2> : null}
      <span className="w-full h-0.5 my-auto bg-gradient-to-r from-red-500 to-rose-600"></span>
    </div>
  );
};
