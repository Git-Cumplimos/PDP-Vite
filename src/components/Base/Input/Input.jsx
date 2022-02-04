import { useEffect, useMemo, useRef, useState } from "react";
import classes from "./Input.module.css";

const Input = ({
  label,
  self = false,
  onLazyInput,
  info = "",
  invalid = "",
  ...input
}) => {
  const { formItem, invalid: invalidCls } = classes;
  const { id: _id, type } = input;

  const [timer, setTimer] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (type === "email") {
      // for email
      // /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      input.pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    }
  }, [input, type]);

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
  
  const invalidMsg = useMemo(() => {
    return invalid
      ? invalid
      : inputRef.current?.validity?.valid
      ? ""
      : inputRef.current?.validationMessage;
  }, [
    invalid,
    inputRef.current?.validity?.valid,
    inputRef.current?.validationMessage,
  ]);

  return self ? (
    <>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-right"}`}>
          {label}
        </label>
      )}
      <input {...input} />
    </>
  ) : (
    <div className={`${formItem}`}>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-right"}`}>
          {label}
        </label>
      )}
      <div>
        <input {...input} ref={inputRef} />
        {info ? <p>{info}</p> : ""}
        {invalidMsg && inputRef.current?.value !== "" ? (
          <p className={`${invalidCls}`}>{invalidMsg}</p>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Input;
