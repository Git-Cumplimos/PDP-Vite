import { useCallback, useMemo, useState } from "react";

export const useHiddenField = () => {
  const [realValue, setRealValue] = useState("");
  const onChangeVal = useCallback((ev) => {
    setRealValue((old) => {
      const newVal = ev.target.value ?? "";
      const diff = newVal.length - old.length;
      const copy = `${old}`;
      if (diff === 0) return copy;
      if (diff < 0) {
        return copy.slice(0, diff);
      }
      return `${copy}${newVal.slice(copy.length, newVal.length)}`;
    });
  }, []);
  const viewValue = useMemo(
    () => (realValue.length > 0 ? "*".repeat(realValue.length) : ""),
    [realValue]
  );
  return [realValue, onChangeVal, viewValue];
};
