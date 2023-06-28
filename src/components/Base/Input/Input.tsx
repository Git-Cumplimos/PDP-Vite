import {
  ComponentPropsWithRef,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  forwardRef,
  useState,
} from "react";
import classes from "./Input.module.css";

import classes2 from "../Form/Form.module.css";

interface Props extends ComponentPropsWithRef<"input"> {
  label: string;
  self?: boolean;
  onLazyInput?: {
    callback: (ev: FormEvent<HTMLInputElement>) => void;
    timeOut: number;
  };
  info?: string;
  invalid?: string;
  actionBtn?: {
    callback: (ev: MouseEvent<HTMLButtonElement>) => void;
    label: string;
  };
}

const { formItem, invalid: invalidCls, btn } = classes;
const { div_input_form_item } = classes2;
const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label = "",
      self = false,
      onLazyInput,
      info = "",
      invalid = "",
      actionBtn,
      type,
      id: _id,
      ...input
    },
    ref
  ) => {
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    let inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (type === "email") {
        // for email
        // /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
        input.pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.source;
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
        {label && label !== "" && <label htmlFor={_id}>{label}</label>}
        <input id={_id} type={type} {...input} />
      </>
    ) : (
      <div className={`${div_input_form_item} ${formItem}`}>
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
          {actionBtn && (
            <button type="button" className={btn} onClick={actionBtn.callback}>
              {actionBtn.label}
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default Input;
