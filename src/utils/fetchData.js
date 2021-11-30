export const abortController = new AbortController();

const fetchData = async (url = "", method = "GET", queries = {}, data = {}) => {
  if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
    throw new Error("Method not suported");
  }

  queries = Object.entries(queries).map(([key, value]) => {
    return `${key}=${value}`;
  });
  if (method !== "POST" && queries.length > 0) {
    url += `?${queries.join("&")}`;
  }
  const fetchOtions =
    method === "POST" || method === "PUT"
      ? {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      : {
          method: method,
        };      
  fetchOtions.signal = abortController.signal;
  const response = await fetch(url, fetchOtions);
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
