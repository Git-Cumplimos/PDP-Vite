import { useState } from "react";
import classes from "./Input.module.css";

const Input = ({ label, self = false, onLazyInput, ...input }) => {
  const { formItem } = classes;
  const { id: _id } = input;

  const [timer, setTimer] = useState(null);

  if (onLazyInput !== undefined) {
    const { callback, timeOut } = onLazyInput;

    if (callback !== undefined && timeOut !== undefined) {
      const onInputCallback = input.onInput;

      input.onInput = (e) => {
        onInputCallback(e);

        if (timer) {
          clearTimeout(timer);
        }

        setTimer(
          setTimeout(() => {
            callback(e);
          }, timeOut)
        );
      };
    }
  }

  return self ? (
    <>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <input {...input} />
    </>
  ) : (
    <div className={formItem}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <input {...input} />
    </div>
  );
};

export default Input;
