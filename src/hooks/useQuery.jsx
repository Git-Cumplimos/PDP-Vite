import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const useQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    const arr = Array.from(searchParams.entries());
    return Object.fromEntries(arr.map(([key, val]) => [key, JSON.parse(val)]));
  }, [searchParams]);

  const setValue = useCallback(
    (newValue, options) => {
      const newSearchParams = new URLSearchParams(searchParams);
      Object.entries(newValue).forEach(([key, val]) => {
        newSearchParams.set(key, JSON.stringify(val));
      });
      setSearchParams(newSearchParams, options);
    },
    [searchParams, setSearchParams]
  );

  return [value, setValue];
};

export default useQuery;
