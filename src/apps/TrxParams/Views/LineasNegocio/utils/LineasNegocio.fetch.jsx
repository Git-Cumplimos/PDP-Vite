import { Auth } from "@aws-amplify/auth";
import * as LineasNegocioCons from "./LineasNegocio.cons";

const API = `${process.env.REACT_APP_URL_BUSINESS_LINES}`;

export const petitions = {
  get: async ({ uri }) => {
    try {
      const token = Auth.user.signInUserSession.idToken.jwtToken;
      const result = await fetch(API + uri, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.error(`HTTP GET ERROR ON ${uri} : ${error} `);
      return null;
    }
  },
  post: async ({ uri, body = {} }) => {
    try {
      const token = Auth.user.signInUserSession.idToken.jwtToken;
      const result = await fetch(API + uri, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.error(`HTTP POST ERROR ON ${uri} : ${error} `);
      return null;
    }
  },
  put: async ({ uri, body = {} }) => {
    try {
      const token = Auth.user.signInUserSession.idToken.jwtToken;
      const result = await fetch(API + uri, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await result.json();
      return data;
    } catch (error) {
      console.error(`HTTP POST ERROR ON ${uri} : ${error} `);
      return null;
    }
  },
};

/* GETS */
export const getAuthorizers = async () => {
  const response = await petitions.get({
    uri: LineasNegocioCons.PATH_AUTHORIZER,
  });
  return response;
};

export const getBusinessLines = async () => {
  const response = await petitions.get({
    uri: LineasNegocioCons.PATH_BUSINESS_LINES,
  });
  return response;
};

export const getTransactionTypes = async () => {
  const response = await petitions.get({
    uri: LineasNegocioCons.PATH_TRANSACTION_TYPES,
  });
  return response;
};

/* POSTS */
export const putBusinessLine = async (body) => {
  const response = await petitions.put({
    uri: LineasNegocioCons.PATH_BUSINESS_LINES,
    body,
  });
  return response;
};

/* PUTS */
