import fetchData from "./fetchData";
import { fetchSecure } from "./functions";
import { notifyError } from "./notify";

type StringObject = { [key: string]: string };
type AnyObject = { [key: string]: string };

export const fetchDataTotp = async (
  url: string = "",
  method: string = "GET",
  queries: StringObject = {},
  data: AnyObject = {},
  headers: StringObject = {},
  authenticate: boolean = true,
  timeout: number = 60000
): Promise<any> => {
  const commerceUseTotp = JSON.parse(
    window.localStorage.getItem("commerce_use_totp") ?? "null"
  );
  const currentTotp = JSON.parse(
    window.localStorage.getItem("current_totp") ?? "null"
  );

  if (!commerceUseTotp) {
    return await fetchData(
      url,
      method,
      queries,
      data,
      headers,
      authenticate,
      timeout
    );
  }
  if (!currentTotp) {
    notifyError("Error intentando peticion: totp invalido");
    return;
  }
  try {
    const newheaders = structuredClone(headers);
    newheaders["X-Pdp-Totp"] = currentTotp;

    return await fetchData(
      url,
      method,
      queries,
      data,
      newheaders,
      authenticate,
      timeout
    );
  } catch (error) {
    throw error;
  } finally {
    window.localStorage.setItem("current_totp", JSON.stringify(null));
  }
};

export const fetchSecureTotp = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const commerceUseTotp = JSON.parse(
    window.localStorage.getItem("commerce_use_totp") ?? "null"
  );
  const currentTotp = JSON.parse(
    window.localStorage.getItem("current_totp") ?? "null"
  );

  if (!commerceUseTotp) {
    return await fetchSecure(input, init);
  }
  if (!currentTotp) {
    notifyError("Error intentando peticion: totp invalido");
    return new Response();
  }
  try {
    const newinit = init ? structuredClone(init) : {};
    newinit.headers = new Headers(
      newinit.headers ?? structuredClone(newinit.headers)
    );
    newinit.headers.append("X-Pdp-Totp", currentTotp);

    return await fetchSecure(input, newinit);
  } catch (error) {
    throw error;
  } finally {
    window.localStorage.setItem("current_totp", JSON.stringify(null));
  }
};
