import { useCallback, useRef, useState } from "react";
import classes from "./InputSuggestions.module.css";

const { formItem, suggestion, liSelected, liUnSelected } = classes;

const InputSuggestions = ({
  label,
  self = false,
  onLazyInput,
  suggestions,
  onSelectSuggestion,
  ...input
}) => {
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

  const itemsRef = useRef([]);
  const [indexSelected, setIndexSelected] = useState(-1);
  const onKeySuggestion = useCallback(
    (ev) => {
      if (!Array.isArray(suggestions) || !(suggestions.length > 0)) {
        return;
      }
      if (ev.keyCode === 0x28) {
        ev.preventDefault();
        setIndexSelected((old) => {
          if (old === suggestions.length - 1) {
            return old;
          }
          return old + 1;
        });
      } else if (ev.keyCode === 0x26) {
        ev.preventDefault();
        setIndexSelected((old) => {
          if (old === -1) {
            return old;
          }
          return old - 1;
        });
      } else if (ev.keyCode === 0x0d) {
        ev.preventDefault();
        if (indexSelected !== -1) {
          ev.target.blur();
          itemsRef.current[indexSelected].click();
        }
      }
    },
    [suggestions, indexSelected]
  );

  return (
    <div className={`${formItem}`}>
      {label && label !== "" && (
        <label htmlFor={_id} className={`${"text-right"}`}>
          {label}
        </label>
      )}
      <div className={suggestion}>
        <input {...input} onKeyDown={onKeySuggestion} />
        {Array.isArray(suggestions) && suggestions.length > 0 ? (
          <ul>
            {suggestions.map((el, idx) => (
              <li
                key={idx}
                ref={(el) => (itemsRef.current[idx] = el)}
                className={`${
                  indexSelected === idx ? liSelected : liUnSelected
                }`}
                onClick={(ev) => {
                  onSelectSuggestion?.(idx, el);
                  Array.from(ev.currentTarget.childNodes.entries()).forEach(
                    ([, el]) => {
                      el.click();
                    }
                  );
                }}
              >
                {el}
              </li>
            ))}
          </ul>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default InputSuggestions;
