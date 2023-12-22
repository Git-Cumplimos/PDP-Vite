import { useEffect } from "react";

/**
 * Crear una ejecucion de un ser interval
 * @param callback funcion creada con useCallback
 * @param delay delay del intervalo
 */
const useInterval = (callback?: () => void, delay?: number) => {
  useEffect(() => {
    const tick = () => callback?.();

    if (callback != null && delay != null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [callback, delay]);
};

export default useInterval;
