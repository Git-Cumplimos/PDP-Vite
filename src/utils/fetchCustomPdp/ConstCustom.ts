import { ParamsError } from "./TypingCustom";

export const defaultParamsError: ParamsError = {
  errorCustomFetch: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomFetchTimeout: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomFetchCode: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomApiGateway: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomApiGatewayTimeout: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomBackend: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
  errorCustomBackendUser: {
    typeNotify: "notify",
    ignoring: true,
    console_error: true,
  },
  errorCustomBackendPending: {
    typeNotify: "notifyError",
    ignoring: true,
    console_error: true,
  },
};
