import { ComponentPropsWithRef, FormEvent, forwardRef, useState } from "react";
import classes from "./Form.module.css";

interface Props extends ComponentPropsWithRef<"form"> {
  grid: boolean;
  formDir?: "row" | "col";
  onLazyChange?: {
    callback: (ev: FormEvent<HTMLFormElement>) => void;
    timeOut: number;
  };
};

const Form = forwardRef<HTMLFormElement, Props>(
  ({ grid = false, formDir = "row", onLazyChange, ...props }, ref) => {
    const { Flex, Grid } = classes;
    const { children, className = "", ...formProps } = props;

    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    if (onLazyChange !== undefined) {
      const { callback, timeOut } = onLazyChange;

      if (callback !== undefined && timeOut !== undefined) {
        const onChangeCallback = formProps.onChange;

        formProps.onChange = (e) => {
          onChangeCallback?.(e);

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
      <form
        className={`${grid ? Grid : `${Flex} flex-${formDir}`} ${className}`}
        ref={ref}
        {...formProps}
      >
        {children}
      </form>
    );
  }
);

export default Form;
