export type ParamsSubError = {
  typeNotify?: string | undefined;
  ignoring?: boolean;
  console_error?: boolean;
};

export type ParamsError = {
  errorCustomFetch?: ParamsSubError;
  errorCustomFetchTimeout?: ParamsSubError;
  errorCustomFetchCode?: ParamsSubError;
  errorCustomApiGateway?: ParamsSubError;
  errorCustomApiGatewayTimeout?: ParamsSubError;
  errorCustomBackend?: ParamsSubError;
  errorCustomBackendUser?: ParamsSubError;
  errorCustomBackendPending?: ParamsSubError;
};
