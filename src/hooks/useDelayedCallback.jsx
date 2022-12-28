import { useState, useCallback } from "react";

const useDelayedCallback = (callback, delay) => {
  const [, setTimer] = useState(null);

  const delayedCallback = useCallback(() => {
    setTimer((oldTimer) => {
      if (oldTimer) {
        clearTimeout(oldTimer);
      }
      return setTimeout(() => {
        callback();
      }, delay);
    });
  }, [delay, callback]);

  return delayedCallback;
};

export default useDelayedCallback;
