import {
  ComponentPropsWithRef,
  FormEvent,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import classes from "./Form.module.css";

interface Props extends ComponentPropsWithRef<"form"> {
  grid: boolean;
  formDir?: "row" | "col";
  onLazyChange?: {
    callback: (ev: FormEvent<HTMLFormElement>) => void;
    timeOut: number;
  };
}

const Form = forwardRef<HTMLFormElement, Props>(
  ({ grid = false, formDir = "row", onLazyChange, ...props }, ref) => {
    const { Flex, Grid } = classes;
    const onSubmitInitFunc = props.onSubmit;
    const { children, className = "", ...formProps } = props;
    const isSubmitting = useRef(false);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [timerOnSubmit, setTimerOnSubmit] = useState<NodeJS.Timeout | null>(
      null
    );

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
    if (onSubmitInitFunc) {
      formProps.onSubmit = (e) => {
        e.preventDefault();
        try {
          if (!isSubmitting.current) {
            isSubmitting.current = true;
            onSubmitInitFunc?.(e);
            setTimerOnSubmit(
              setTimeout(() => {
                isSubmitting.current = false;
              }, 5000)
            );
          }
        } catch (error) {
          console.error("Form submission error:", error);
          isSubmitting.current = false;
        }
      };
    }
    formProps.onKeyDown = (e) => {
      if (e.key === "Enter") e.preventDefault();
      if (e.key === " ") {
        const result = (e.target as HTMLInputElement).value;
        // If the target is not an input prevent the default action of the space key
        if (!result) e.preventDefault();
      }
    };
    useEffect(() => {
      return () => {
        if (timerOnSubmit) clearTimeout(timerOnSubmit);
      };
    }, [timerOnSubmit]);

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
