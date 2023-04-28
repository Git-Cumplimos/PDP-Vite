import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import classes from "./Input.module.css";

import classes2 from "../Form/Form.module.css";
const { formItem, invalid: invalidCls, btn } = classes;
const { div_input_form_item } = classes2;
const Input = ({
  label,
  self = false,
  onLazyInput,
  info = "",
  invalid = "",
  actionBtn,
  ...input
}) => {
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

  return self ? (
    <>
      {label && label !== "" && (
        <label htmlFor={_id}>
          {/* className={`${"text-right"}`}> */}
          {label}
        </label>
      )}
      <input {...input} />
    </>
  ) : (
    <div className={`${div_input_form_item} ${formItem}`}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <div>
        <input {...input} ref={inputRef} />
        {info ? <p>{info}</p> : ""}
        {inputRef.current?.value !== ""
          ? invalid && <p className={`${invalidCls}`}>{invalid}</p>
          : ""}
        {actionBtn && (
          <button type="button" className={btn} onClick={actionBtn.callback}>
            {actionBtn.label}
          </button>
        )}
      </div>
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  self: PropTypes.bool,
  onLazyInput: PropTypes.shape({
    callback: PropTypes.func,
    timeOut: PropTypes.number,
  }),
  actionBtn: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string,
  }),
  info: PropTypes.string,
  invalid: PropTypes.string,
};

export default Input;
