import { Auth } from "@aws-amplify/auth";

const fetchData = async (
  url = "",
  method = "GET",
  queries = {},
  data = {},
  headers = {},
  authenticate = true,
  timeout = 60000
) => {
  if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
    throw new Error("Method not suported");
  }
  let session = null;
  if (authenticate) {
    try {
      session = await Auth.currentSession();
    } catch (err) {
      throw new Error(`No user autenticated: ${err}`);
    }
    if (!session) {
      throw new Error("No session for autenticated user");
    }
  }

  if ("URLSearchParams" in window) {
    const params = new URLSearchParams();
    Object.entries(queries).forEach(([key, value]) => {
      params.append(key, value);
    });
    queries = params.toString();
  } else {
    queries = Object.entries(queries)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }
  if (method !== "POST" && queries.length > 0) {
    url += `?${queries}`;
  }

  const fetchOptions = {
    method: method,
  };
  const _headers = {};
  if (authenticate) {
    _headers.Authorization = `Bearer ${session?.idToken?.jwtToken}`;
  }
  fetchOptions.headers = {
    ..._headers,
    ...headers,
  };
  if (method === "POST" || method === "PUT") {
    if (data instanceof FormData) {
      fetchOptions.body = data;
    } else {
      fetchOptions.headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(data);
    }
  }

  async function fetchWithTimeout(resource, options, timeout) {
    const abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: abortController.signal,
    });
    clearTimeout(id);
    return response;
  }

  const response = await fetchWithTimeout(url, fetchOptions, timeout);
  if (response.status === 403) {
    const commerceUseTotp = JSON.parse(
      window.localStorage.getItem("commerce_use_totp") ?? "null"
    );
    if (commerceUseTotp) {
      const _msg = (await response.json())?.message;
      throw new Error(_msg, { cause: "custom-403" });
    }
  }
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const json = await response.json();
    return json;
  } else {
    if (contentType && contentType.includes("charset=ISO-8859-1")) {
      const text = await response.arrayBuffer();
      return text;
    } else {
      const text = await response.text();
      return text;
    }
  }
};

export default fetchData;
