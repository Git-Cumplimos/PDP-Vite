import classes from "./SocialBar.module.css";

const SocialBar = () => {
  const { socials } = classes;
  return (
    <div className={socials}>
      <ul>
        <li>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <span className="bi bi-twitter" />
          </a>
        </li>
        <li>
          <a
            href="https://www.facebook.com/PDPmultibanco/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <span className="bi bi-facebook" />
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <span className="bi bi-instagram" />
          </a>
        </li>
        <li>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Youtube"
          >
            <span className="bi bi-youtube" />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default SocialBar;
