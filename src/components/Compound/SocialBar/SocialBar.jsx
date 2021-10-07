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
          >
            <span className="bi bi-twitter" />
          </a>
        </li>
        <li>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="bi bi-facebook" />
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="bi bi-instagram" />
          </a>
        </li>
        <li>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="bi bi-youtube" />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default SocialBar;
