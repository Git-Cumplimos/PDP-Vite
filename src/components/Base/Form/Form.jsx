import { forwardRef, useState } from "react";
import classes from "./Form.module.css";

const Form = forwardRef(
  ({
    children,
    grid = false,
    formDir = "row",
    className = "",
    onLazyChange,
    ...formProps
  }, ref) => {
    const { Flex, Grid } = classes;

    const [timer, setTimer] = useState(null);

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
