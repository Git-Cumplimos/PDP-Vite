import { useState, useCallback, useEffect } from "react";

function timeout(ms: number) {
  let timer: NodeJS.Timeout;
  return {
    promise: new Promise((resolve) => {
      timer = setTimeout(resolve, ms);
    }),
    cancel: () => clearTimeout(timer),
  };
}

function useDelayedCallback<
  FunctionGeneric extends (...args: any) => any,
  A extends Parameters<FunctionGeneric>,
  T extends ReturnType<FunctionGeneric>
>(
  callback: (...args: A) => Promise<T>,
  delay: number
): (...args: A) => Promise<T> {
  const [clearTimer, setClearTimer] = useState(() => () => {});

  const delayedCallback = useCallback(
    async (...args: A): Promise<T> => {
      const { promise, cancel } = timeout(delay);
      setClearTimer((old) => {
        old();
        return cancel;
      });
      await promise;
      return await callback(...args);
    },
    [delay, callback]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return delayedCallback;
}

export default useDelayedCallback;
