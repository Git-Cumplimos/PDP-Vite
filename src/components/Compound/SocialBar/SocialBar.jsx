import classes from "./SocialBar.module.css";

const socialUrls = [
  {
    href: {
      href: "https://twitter.com/",
      "aria-label": "Twitter",
    },
    span: {
      className: "bi bi-twitter",
    },
  },
  {
    href: {
      href: "https://www.facebook.com/PDPmultibanco/",
      "aria-label": "Facebook",
    },
    span: {
      className: "bi bi-facebook",
    },
  },
  {
    href: {
      href: "https://www.instagram.com/",
      "aria-label": "Instagram",
    },
    span: {
      className: "bi bi-instagram",
    },
  },
  {
    href: {
      href: "https://youtube.com",
      "aria-label": "Youtube",
    },
    span: {
      className: "bi bi-youtube",
    },
  },
];

const SocialBar = () => {
  const { socials } = classes;
  return (
    <div className={socials}>
      <ul>
        {socialUrls.map(({ href, span }) => (
          <li>
            <a {...href} target="_blank" rel="noopener noreferrer">
              <span {...span} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SocialBar;
