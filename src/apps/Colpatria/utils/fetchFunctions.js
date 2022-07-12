import { Auth } from "@aws-amplify/auth";

const urlDaviplata = `${process.env.REACT_APP_URL_COLPATRIA}/colpatria`;

export const makeDeposit = async (bodyDep) => {
  if (!bodyDep) {
    throw new Error("", { cause: "custom" });
  }
  let session = null;
  try {
    session = await Auth.currentSession();
  } catch (err) {
    throw new Error(`No user autenticated: ${err}`);
  }
  if (!session) {
    throw new Error("No session for autenticated user");
  }
  console.log(session.getIdToken().getJwtToken());
  try {
    const response = await fetch(`${urlDaviplata}/deposito`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.getIdToken().getJwtToken()}`,
      },
      body: JSON.stringify(bodyDep),
      mode: "no-cors",
    });

    console.log(Object.fromEntries(response.headers.entries()));
    if (response.headers.get("Content-Type") === "application/json") {
      const res = await response.json();
      console.log(res);
      if (!res?.status) {
        throw new Error(res?.msg, { cause: "custom" });
      }
      return res;
    }
    const res = await response.text();
    if (!response.ok) {
      throw new Error(res, { cause: "custom" });
    }
    return res;
  } catch (err) {
    throw err;
  }
};
