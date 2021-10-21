import { Auth } from "@aws-amplify/auth";
import { Logger } from "@aws-amplify/core";
import { appendToCognitoUserAgent } from "@aws-amplify/auth";

import { createContext, useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import fetchData from "./fetchData";

const logger = new Logger("withAuthenticator");

const urlLog = "http://logconsulta.us-east-2.elasticbeanstalk.com/login";

export const AuthContext = createContext({
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const checkUser = (setSignedIn, setAuthInfo, setUserInfo, setRoleInfo) => {
  if (Auth.user === null || Auth.user === undefined) {
    setUser(setSignedIn, setAuthInfo, setUserInfo, setRoleInfo).catch((err) =>
      console.error(err)
    );
  } else {
    setSignedIn(true);
    setAuthInfo(Auth.user);
    Auth.currentUserInfo()
      .then((usr) => setUserInfo(usr))
      .catch((err) => console.error(err));
  }
};

const setUser = async (setSignedIn, setAuthInfo, setUserInfo, setRoleInfo) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    setAuthInfo(user);
    if (user) setSignedIn(true);
    setUserInfo(await Auth.currentUserInfo());
    setRoleInfo({
      role: 1,
      ...(await fetchData(
        urlLog,
        "GET",
        { correo: "PRUEBAS@GMAIL.COM" },
        {}
      )),
    });
  } catch (err) {
    setSignedIn(false);
    console.error(err);
    logger.debug(err);
  }
};

export const useProvideAuth = () => {
  const [isSignedIn, setSignedIn] = useState(false);

  const [cognitoUser, setCognitoUser] = useState(null);

  const [userInfo, setUserInfo] = useState(null);

  const [roleInfo, setRoleInfo] = useState(null);

  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");

    checkUser(setSignedIn, setCognitoUser, setUserInfo, setRoleInfo);
  }, []);

  const history = useHistory();
  const location = useLocation();

  const signIn = async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        setCognitoUser(user);
      }
    } catch (err) {
      throw err;
    }
  };

  const confirmSignIn = async (totp) => {
    try {
      const loggedUser = await Auth.confirmSignIn(
        cognitoUser,
        totp,
        cognitoUser.challengeName
      );
      setCognitoUser(loggedUser);
      setSignedIn(true);
      setUserInfo(await Auth.currentUserInfo());
      setRoleInfo({
        role: 1,
        ...(await fetchData(
          urlLog,
          "GET",
          { correo: "PRUEBAS@GMAIL.COM" },
          {}
        )),
      });
      history.push(
        location.state
          ? location.state.from
          : location.pathname === "/login"
          ? "/"
          : location.pathname
      );
    } catch (err) {
      if (err.code === "NotAuthorizedException") {
        setCognitoUser(null);
      }
      throw err;
    }
  };

  const signOut = () => {
    Auth.signOut()
      .then(() => {
        setCognitoUser(null);
        setSignedIn(false);
        setRoleInfo({});
        history.push("/login");
      })
      .catch((err) => console.error(err));
  };

  return {
    isSignedIn,
    cognitoUser,
    userInfo,
    roleInfo,
    signIn,
    confirmSignIn,
    signOut,
  };
};
