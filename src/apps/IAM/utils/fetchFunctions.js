import fetchData from "../../../utils/fetchData";
import { fetchSecure } from "../../../utils/functions";

const urlIam = process.env.REACT_APP_URL_IAM_PDP;

const buildPostFunction = (url) => {
  return async (body) => {
    if (!body) {
      throw new Error("Sin datos en el body", { cause: "custom" });
    }
    try {
      const res = await fetchData(url, "POST", {}, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

const buildPutFunction = (url) => {
  return async (args, body) => {
    if (!args || !body) {
      throw new Error("Sin datos de busqueda y/o modificacion", {
        cause: "custom",
      });
    }
    try {
      const res = await fetchData(url, "PUT", args, body);
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
};

const buildPostFunctionMassive = (url) => {
  return async (body) => {
    try {
      console.log(body)
      // const response = await fetchData(url, "POST", {}, body);
      const response = await fetchSecure(url,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          method: 'POST',
          // body,
          body: JSON.stringify(body)
          // JSON.stringify(body)
        });
      if (response.ok) {
        return response;
      }
      const res = await response.json();
      if (!res?.status) {
        if (res?.msg) {
          throw new Error(res?.msg, { cause: "custom" });
        }

        throw new Error(res, { cause: "custom" });
      }
      throw new Error({ message: "Unhandled error" }, { cause: "custom" });
    } catch (err) {
      throw err;
    }
  };
};

export const createUser = buildPostFunction(`${urlIam}/users`);
export const updateUser = buildPutFunction(`${urlIam}/users`);
export const updateUserGroups = buildPostFunction(`${urlIam}/user-groups`);
export const updateUserMassive = buildPostFunctionMassive(`${urlIam}/users-massive`);
