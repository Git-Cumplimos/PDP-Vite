import { useState, useEffect } from "react";
import classes from "./Button.module.css";

const Button = ({ self = false, ...button }) => {
  const { formItem } = classes;
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
            }, 2000)
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

  return self ? (
    <button {...button} disabled={isClicking || button.disabled} />
  ) : (
    <div className={formItem}>
      <button {...button} disabled={isClicking || button.disabled} />
    </div>
  );
};

export default Button;
