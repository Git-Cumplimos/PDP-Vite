import { Dispatch, SetStateAction, useCallback, useState } from "react";

const useLocalStorage = <T extends unknown = undefined>(
  keyName: string,
  defaultValue?: T | (() => T)
) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const value = window.localStorage.getItem(keyName);

      if (value) {
        return JSON.parse(value);
      } else {
        const _value =
          defaultValue instanceof Function ? defaultValue() : defaultValue;
        window.localStorage.setItem(keyName, JSON.stringify(_value));
        return _value;
      }
    } catch (err) {
      return defaultValue instanceof Function ? defaultValue() : defaultValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (newValue: SetStateAction<T>) => {
      setStoredValue((old) => {
        const _value = newValue instanceof Function ? newValue(old) : newValue;
        window.localStorage.setItem(keyName, JSON.stringify(_value));
        return _value;
      });
    },
    [keyName]
  );

  return [storedValue, setValue] as const;
};

export default useLocalStorage;
