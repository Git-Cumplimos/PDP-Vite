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

    const res = await fetchData(
      url,
      method,
      queries,
      data,
      newheaders,
      authenticate,
      timeout
    );
    return res;
  } catch (error: any) {
    if (error?.cause === "custom-403") {
      notifyError(error?.message);
    }
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

    const response = await fetchSecure(input, newinit);
    if (response.status === 403) {
      const _msg = (await response.json())?.message;
      notifyError(_msg);
      throw new Error(_msg, { cause: "custom-403" });
    }
    return response;
  } catch (error) {
    throw error;
  } finally {
    window.localStorage.setItem("current_totp", JSON.stringify(null));
  }
};
