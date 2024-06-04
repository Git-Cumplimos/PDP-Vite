import { useState, useEffect } from "react";
import classes from "./Button.module.css";

const { formItem, primary, secondary, danger } = classes;

const selectBtnStyle = (design) => {
  switch (design) {
    case "primary":
      return primary;
    case "secondary":
      return secondary;
    case "danger":
      return danger;

    default:
      return secondary;
  }
};

const Button = ({ self = false, design = "", ...button }) => {
  const onClickInitFunc = button.onClick;
  const [isClicking, setIsClicking] = useState(false);
  const [timerOnSubmit, setTimerOnSubmit] = useState(null);
  if (onClickInitFunc && button?.type !== "submit") {
    button.onClick = (e) => {
      e.preventDefault();
      try {
        if (!isClicking) {
          setIsClicking(true);
          onClickInitFunc?.(e);
          setTimerOnSubmit(
            setTimeout(() => {
              setIsClicking(false);
            }, 1000)
          );
        }
      } catch (error) {
        console.error("Button click error:", error);
        setIsClicking(false);
      }
    };
  }
  useEffect(() => {
    return () => {
      if (timerOnSubmit) clearTimeout(timerOnSubmit);
    };
  }, [timerOnSubmit]);
  useEffect(() => {
    setIsClicking(true);
    const timer = setTimeout(() => {
      setIsClicking(false);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  button.onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") e.preventDefault();
  };

  return self ? (
    <button {...button} disabled={isClicking || button.disabled} />
  ) : (
    <div className={formItem}>
      <button
        {...button}
        className={`${
          design && typeof design === "string"
            ? selectBtnStyle(design)
            : ["submit", ""].includes(button?.type)
            ? primary
            : secondary
        }`}
        disabled={isClicking || button.disabled}
      />
    </div>
  );
};

export default Button;
