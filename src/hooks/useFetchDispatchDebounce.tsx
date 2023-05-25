import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchSecure } from "../utils/functions";
import useDelayedCallback from "./useDelayedCallback";

export interface FetchProps {
  url: RequestInfo | URL;
  options?: RequestInit;
}

export interface ResponseCallbacks {
  onPending?: () => ReactNode | void;
  onSuccess: (response: Response | any) => ReactNode | void;
  onError: (error: Error | any) => ReactNode | void;
  onFinally?: () => void;
}

export interface HookOptions {
  delay?: number;
  isSecure?: boolean;
  checkStatus?: boolean;
  notify?: boolean;
}

export class ErrorPDPFetch extends Error {
  errorJson: any;

  constructor(message: string, obj: any, ...params: any[]) {
    super(message, ...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorPDPFetch);
    }

    this.name = "ErrorPDPFetch";
    // Custom debugging information
    this.errorJson = obj;
  }
}

const handlePDPFetchResponse = async (response: Response) => {
  const jsonResponse = await response.json();
  if ("status" in jsonResponse && !jsonResponse.status) {
    throw new ErrorPDPFetch(jsonResponse?.msg, jsonResponse, { cause: "custom" });
  }
  return jsonResponse;
};

const defaultOnPending: () => ReactNode = () => "Procesando peticion";
const defaultOnSuccess: (response: Response | any) => ReactNode = (_) =>
  "Peticion exitosa";
const defaultOnError: (error: Error | any) => ReactNode = (_) =>
  "Peticion fallida";

const useFetchDispatchDebounce = (
  {
    onPending = defaultOnPending,
    onSuccess = defaultOnSuccess,
    onError = defaultOnError,
    onFinally,
  }: ResponseCallbacks = {
    onPending: defaultOnPending,
    onSuccess: defaultOnSuccess,
    onError: defaultOnError,
  },
  {
    delay = 500,
    isSecure = true,
    checkStatus = true,
    notify = false,
  }: HookOptions = {
    delay: 500,
    isSecure: true,
    checkStatus: true,
    notify: false,
  }
) => {
  const [loading, setLoading] = useState(false);

  const [abortController, setAbortController] = useState(new AbortController());

  const abort = useCallback(
    () => abortController.abort(),
    [abortController]
  );

  const dispatchFetch = useCallback(
    async (url: RequestInfo | URL, options?: RequestInit) => {
      const peticion = async (
        url: RequestInfo | URL,
        options?: RequestInit
      ) => {
        const _abortController = new AbortController();
        setAbortController((old) => {
          old.abort();
          return _abortController;
        });
        try {
          setLoading(true);
          let response;
          if (isSecure) {
            response = await fetchSecure(url, {
              ...options,
              signal: _abortController.signal,
            });
          } else {
            response = await fetch(url, {
              ...options,
              signal: _abortController.signal,
            });
          }
          if (!checkStatus) {
            return response;
          }
          return await handlePDPFetchResponse(response);
        } catch (error: any) {
          // if (error?.name !== "AbortError") {
          // }
          throw error;
        } finally {
          setLoading(false);
          onFinally?.();
        }
      };
      if (!notify) {
        onPending();
        return await peticion(url, options).then(onSuccess).catch(onError);
      }
      return await toast.promise(peticion(url, options), {
        pending: { type: "info", render: () => onPending() },
        error: { type: "warning", render: ({ data: error }) => onError(error) },
        success: { type: "info", render: ({ data }) => onSuccess(data) },
      });
    },
    [isSecure, checkStatus, notify, onPending, onSuccess, onError, onFinally]
  );

  const dispatcher = useDelayedCallback(dispatchFetch, delay);

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, [abortController]);

  // return { loading, abort, dispatcher };
  return [dispatcher, loading, abort] as const;
};

export default useFetchDispatchDebounce;
