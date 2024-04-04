import { ComponentPropsWithRef, useEffect, useRef, forwardRef } from "react";
import classes from "./InputLong.module.css";

export interface CustomInputProps extends ComponentPropsWithRef<"input"> {
  label?: string;
  info?: string;
  invalid?: string;
}

const { formItem, invalid: invalidCls } = classes;

const InputLong = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label = "", info = "", invalid = "", type, id: _id, ...input }, ref) => {
    let inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (type === "email") {
        input.pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.source;
      }
    }, [input, type]);

    return (
      <div className={`${formItem}`}>
        <div>
          {label && label !== "" && <label htmlFor={_id}>{label}</label>}
          <div>
            <input
              id={_id}
              type={type}
              {...input}
              ref={(realInput) => {
                inputRef.current = realInput;
                if (ref) {
                  if (typeof ref === "function") {
                    ref(realInput);
                  } else {
                    ref.current = realInput;
                  }
                }
              }}
            />

            {info && <p>{info}</p>}
            {inputRef.current?.value !== "" && invalid && (
              <p className={`${invalidCls}`}>{invalid}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default InputLong;
