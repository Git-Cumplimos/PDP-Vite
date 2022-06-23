import { useState } from "react";
import classes from "./InputSuggestions.module.css";

const InputSuggestions = ({
  label,
  self = false,
  onLazyInput,
  suggestions,
  onSelectSuggestion,
  ...input
}) => {
  const { formItem, suggestion } = classes;
  const { id: _id, type } = input;

  const [timer, setTimer] = useState(null);

  if (type === "email") {
    // for email
    // /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    input.pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  } else if (type === "file") {
    throw new Error("Invalid type");
  }

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
  return (
    <div className={`${formItem}`}>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-right"}`}>
          {label}
        </label>
      )}
      <div className={suggestion}>
        <input {...input} />
        {Array.isArray(suggestions) && suggestions.length > 0 ? (
          <ul>
            {suggestions.map((el, idx) => {
              return (
                <li
                  key={idx}
                  onClick={() => {
                    onSelectSuggestion?.(idx, el);
                  }}
                >
                  {el}
                </li>
              );
            })}
          </ul>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default InputSuggestions;
