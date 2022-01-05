import { useMemo, useRef, useState } from "react";
import classes from "./ContactMenu.module.css";

const ContactMenu = ({ wa, tl, msg }) => {
  const {
    contactMenu,
    waClass,
    tlClass,
    contactIcons,
    chatIcon,
    animateIn,
    animateOut,
    animateLeft,
    animateRight,
    tooltip,
  } = classes;
  const linkWa = useMemo(() => {
    const init = "https://api.whatsapp.com/send/";
    return `${init}?phone=${wa}&text=${msg}&app_absent=0`;
  }, [wa, msg]);

  const linkTl = useMemo(() => {
    const init = "https://t.me";
    return `${init}/${tl}?text=${msg}`;
  }, [tl, msg]);

  const cIcons = useRef(null);
  const xIcon = useRef(null);
  const cIcon = useRef(null);

  const [visible, setVisible] = useState(false);

  return (
    <div className={`${contactMenu}`}>
      <div className={contactIcons} ref={cIcons}>
        <a
          href={linkWa}
          target="_blank"
          rel="noopener noreferrer"
          className={waClass}
          aria-label="WhatsApp"
        >
          <div className={tooltip}>WhatsApp</div>
          <span className="bi bi-whatsapp" />
        </a>
        <a
          href={linkTl}
          target="_blank"
          rel="noopener noreferrer"
          className={tlClass}
          aria-label="Telegram"
        >
          <div className={tooltip}>Telegram</div>
          <span className="bi bi-telegram" />
        </a>
      </div>
      <div
        className={chatIcon}
        onClick={() => {
          if (visible) {
            cIcons.current.classList.remove(animateIn);
            cIcons.current.classList.add(animateOut);

            xIcon.current.classList.remove(animateRight);
            xIcon.current.classList.add(animateLeft);
            cIcon.current.classList.remove(animateLeft);
            cIcon.current.classList.add(animateRight);
          } else {
            cIcons.current.classList.remove(animateOut);
            cIcons.current.classList.add(animateIn);

            xIcon.current.classList.remove(animateLeft);
            cIcon.current.classList.remove(animateRight);
            xIcon.current.classList.add(animateRight);
            cIcon.current.classList.add(animateLeft);
          }
          setVisible(!visible);
        }}
      >
        <div className={tooltip}>
          Ayuda
        </div>
        <div ref={xIcon}>
          <span className={`bi bi-x-lg ${visible ? "block" : "hidden"}`} />
        </div>
        <div ref={cIcon}>
          <span
            className={`bi bi-chat-left-text-fill ${
              visible ? "hidden" : "block"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactMenu;
