import { useCallback, useEffect, useMemo } from "react";
import useFetchDispatchDebounce, {
  FetchProps,
  ResponseCallbacks,
  HookOptions,
} from "./useFetchDispatchDebounce";

type FetchPropsAuto = FetchProps & {
  autoDispatch?: boolean;
  fetchIf?: boolean;
};

const useFetchDebounce = (
  { url, options, autoDispatch = true, fetchIf = true }: FetchPropsAuto,
  responseCallbacks: ResponseCallbacks,
  hookOptions?: HookOptions
) => {
  const [dispatcher, loading, abort] = useFetchDispatchDebounce(
    responseCallbacks,
    hookOptions
  );

  const copyOptions = useMemo<RequestInit>(() => {
    const newOpts: RequestInit = {};
    if (options?.body) {
      newOpts.body = options?.body;
    }
    if (options?.cache) {
      newOpts.cache = options?.cache;
    }
    if (options?.credentials) {
      newOpts.credentials = options?.credentials;
    }
    if (options?.headers) {
      newOpts.headers = options?.headers;
    }
    if (options?.integrity) {
      newOpts.integrity = options?.integrity;
    }
    if (options?.keepalive) {
      newOpts.keepalive = options?.keepalive;
    }
    if (options?.method) {
      newOpts.method = options?.method;
    }
    if (options?.mode) {
      newOpts.mode = options?.mode;
    }
    if (options?.redirect) {
      newOpts.redirect = options?.redirect;
    }
    if (options?.referrer) {
      newOpts.referrer = options?.referrer;
    }
    if (options?.referrerPolicy) {
      newOpts.referrerPolicy = options?.referrerPolicy;
    }
    if (options?.signal) {
      newOpts.signal = options?.signal;
    }
    if (options?.window) {
      newOpts.window = options?.window;
    }
    return newOpts;
  }, [
    options?.body,
    options?.cache,
    options?.credentials,
    options?.headers,
    options?.integrity,
    options?.keepalive,
    options?.method,
    options?.mode,
    options?.redirect,
    options?.referrer,
    options?.referrerPolicy,
    options?.signal,
    options?.window,
  ]);

  const wholeDispacher = useCallback(
    () => fetchIf && dispatcher(url, copyOptions),
    [dispatcher, url, copyOptions, fetchIf]
  );

  useEffect(() => {
    if (autoDispatch) {
      wholeDispacher();
    }
  }, [wholeDispacher, autoDispatch]);

  return [wholeDispacher, loading, abort] as const;
};

export default useFetchDebounce;
