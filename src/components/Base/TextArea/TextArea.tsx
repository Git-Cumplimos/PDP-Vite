import {
  ComponentPropsWithRef,
  FormEvent,
  // MouseEvent,
  forwardRef,
  useState,
} from "react";
import classes from "./TextArea.module.css";

export interface CustomInputProps extends ComponentPropsWithRef<"textarea"> {
  label?: string;
  self?: boolean;
  onLazyInput?: {
    callback: (ev: FormEvent<HTMLTextAreaElement>) => void;
    timeOut: number;
  };
  info?: string;
  // invalid?: string;
  // actionBtn?: {
  //   callback: (ev: MouseEvent<HTMLButtonElement>) => void;
  //   label: string;
  // };
}

const TextArea = forwardRef<HTMLTextAreaElement, CustomInputProps>(
  (
    { label, self = false, onLazyInput = undefined, info = "", ...input },
    ref
  ) => {
    const { formItem } = classes;
    const { id: _id } = input;

    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

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
        <textarea
          {...input}
          ref={(realInput) => {
            if (ref) {
              if (typeof ref === "function") {
                ref(realInput);
              } else {
                ref.current = realInput;
              }
            }
          }}
        />
      </>
    ) : (
      <div className={`${formItem}`}>
        {label && label !== "" && (
          <label htmlFor={_id} className={`${"text-right"}`}>
            {label}
          </label>
        )}
        <div>
          <textarea
            {...input}
            ref={(realInput) => {
              if (ref) {
                if (typeof ref === "function") {
                  ref(realInput);
                } else {
                  ref.current = realInput;
                }
              }
            }}
          />
          {info ? <p>{info}</p> : ""}
        </div>
      </div>
    );
  }
);

export default TextArea;
