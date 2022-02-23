import { useCallback, useState } from "react";
import fetchData from "../utils/fetchData";

export const useFetch = (mockFunc = fetchData) => {
  const [state, setState] = useState(false);

  const fetchFunc = useCallback(
    async (...params) => {
      try {
        setState(true);
        const y = await mockFunc(...params);
        setState(false);
        return y;
      } catch (err) {
        setState(false);
        throw err;
      }
    },
    [mockFunc, setState]
  );

  return [state, fetchFunc];
};
