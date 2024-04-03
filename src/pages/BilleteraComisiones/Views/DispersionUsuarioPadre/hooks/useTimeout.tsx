import { useEffect } from "react";

/**
 * Crear una ejecucion de un ser interval
 * @param callback funcion creada con useCallback
 * @param delay delay del intervalo
 */
const useTimeout = (callback?: () => void, delay?: number) => {
  useEffect(() => {
    const tick = () => callback?.();
    if (callback != null && delay != null) {
      let id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
  }, [callback, delay]);
};

export default useTimeout;
