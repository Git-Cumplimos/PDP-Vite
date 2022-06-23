import { Link } from "react-router-dom";
import classes from "./PublicNav.module.css";

const publicLayouts = [
  {
    href: {
      to: "/login",
      "aria-label": "Login",
    },
    span: {
      className: "bi bi-person-circle",
    },
    help: "Login",
  },
  {
    href: {
      to: "/public",
      "aria-label": "Mas informacion",
    },
    span: {
      className: "bi bi-clipboard",
    },
    help: "Mas informacion",
  },
];

const PublicNav = ({ wa, tl, msg }) => {
  const { socials, tooltip } = classes;
  return (
    <div className={socials}>
      <ul>
        {publicLayouts.map(({ href, span, help }, idx) => (
          <li key={idx}>
            <Link {...href}>
              <span {...span} />
            </Link>
            {help ? <div className={tooltip}>{help}</div> : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicNav;
