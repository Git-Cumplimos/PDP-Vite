import { useState } from "react";
import classes from "./TextArea.module.css";

const TextArea = ({ label, self = false, onLazyInput, info='', ...input }) => {
  const { formItem } = classes;
  const { id: _id } = input;

  const [timer, setTimer] = useState(null);  

  if (onLazyInput !== undefined) {
    const { callback, timeOut } = onLazyInput;

    if (callback !== undefined && timeOut !== undefined) {
      const onInputCallback = input?.onInput;

      input.onInput = (e) => {
        onInputCallback?.(e);

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
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-right"}`}>
          {label}
        </label>
      )}
      <textarea {...input} />
    </>
  ) : (
    <div className={`${formItem}`}>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-right"}`}>
          {label}
        </label>
      )}
    <div>  
      <textarea {...input} />
      {info ? <p>{info}</p> : ""}
    </div>  
    </div>
  );
}

export default TextArea
