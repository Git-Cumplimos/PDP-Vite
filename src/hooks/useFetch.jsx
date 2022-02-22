import { useCallback, useState } from "react";
import fetchData from "../utils/fetchData";

export const useFetch = (mockFunc = fetchData) => {
  const [state, setState] = useState(false);

  const fetchFunc = useCallback(
    async (...params) => {
      setState(true);
      const y = await mockFunc(...params);
      setState(false);
      return y;
    },
    [mockFunc, setState]
  );

  return [state, fetchFunc];
};
