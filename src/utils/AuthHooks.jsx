import { Auth } from "@aws-amplify/auth";
import { Logger } from "@aws-amplify/core";
import { appendToCognitoUserAgent } from "@aws-amplify/auth";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import fetchData from "./fetchData";

const logger = new Logger("withAuthenticator");

const urlLog = "http://logconsulta.us-east-2.elasticbeanstalk.com/login";
const urlQuota = "http://logconsulta.us-east-2.elasticbeanstalk.com/cupo";

export const AuthContext = createContext({
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
  getQuota: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useProvideAuth = () => {
  const [isSignedIn, setSignedIn] = useState(false);

  const [cognitoUser, setCognitoUser] = useState(null);

  const [userInfo, setUserInfo] = useState(null);

  const [roleInfo, setRoleInfo] = useState(null);

  const [qr, setQr] = useState("");

  const [username, setUsername] = useState("");

  const setUser = useCallback(async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setCognitoUser(user);
      if (user) setSignedIn(true);
      setUserInfo(await Auth.currentUserInfo());
      const suserInfo = await fetchData(
        urlLog,
        "GET",
        { correo: "PRUEBAS@GMAIL.COM" },
        {}
      );
      const quota = await fetchData(
        urlQuota,
        "GET",
        {
          id_comercio: suserInfo.id_comercio,
          id_dispositivo: suserInfo.id_dispositivo,
        },
        {}
      );
      setRoleInfo({
        role: 1,
        ...suserInfo,
        quota: Object.values(quota)[0],
      });
    } catch (err) {
      setSignedIn(false);
      console.error(err);
      logger.debug(err);
    }
  }, []);

  const checkUser = useCallback(() => {
    if (Auth.user === null || Auth.user === undefined) {
      setUser().catch((err) => console.error(err));
    } else {
      setSignedIn(true);
      setCognitoUser(Auth.user);
      Auth.currentUserInfo()
        .then((usr) => setUserInfo(usr))
        .catch((err) => console.error(err));
    }
  }, [setUser]);

  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");

    checkUser();
  }, [checkUser]);

  const history = useHistory();
  const { state, pathname } = useLocation();

  const signIn = useCallback(async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        setCognitoUser(user);
        console.log(user.challengeName, user);
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const handleChangePass = useCallback(
    async (apellido, nombreUsuario, newpassword, cognitoUser, celular) => {
      try {
        const loggedUser = await Auth.completeNewPassword(
          cognitoUser,
          newpassword,
          {
            family_name: apellido,
            name: nombreUsuario,
            phone_number: "+57" + celular,
            given_name: nombreUsuario,
            middle_name: nombreUsuario,
          }
        );
        setCognitoUser(loggedUser);
        if (loggedUser.challengeName === "MFA_SETUP") {
          handleSetupTOTP(loggedUser);
        }
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  const handleSetupTOTP = async (user) => {
    try {
      const validartoken = await Auth.setupTOTP(user);
      const str =
        "otpauth://totp/AWSCognito:" + username + "?secret=" + validartoken;
      setQr(str);
    } catch (err) {
      console.log(err);
    }
  };

  const handleverifyTotpToken = useCallback(async (totp) => {
    try {
      const tokenValidado = await Auth.verifyTotpToken(cognitoUser, totp);
      if (tokenValidado.accessToken.payload.token_use === "access") {
        await handlesetPreferredMFA(totp);
      }
    } catch (err) {
      throw new Error(err);
    }
  });

  const handlesetPreferredMFA = async (totp) => {
    try {
      const preferredMFA = await Auth.setPreferredMFA(cognitoUser, "TOTP");
      if (preferredMFA === "SUCCESS") {
        await confirmSignIn(totp);
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  const confirmSignIn = useCallback(
    async (totp) => {
      try {
        const loggedUser = await Auth.confirmSignIn(
          cognitoUser,
          totp,
          cognitoUser.challengeName
        );
        setCognitoUser(loggedUser);
        setSignedIn(true);
        setUserInfo(await Auth.currentUserInfo());
        const suserInfo = await fetchData(
          urlLog,
          "GET",
          { correo: "PRUEBAS@GMAIL.COM" },
          {}
        );
        const quota = await fetchData(
          urlQuota,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
            id_dispositivo: suserInfo.id_dispositivo,
          },
          {}
        );
        setRoleInfo({
          role: 1,
          ...suserInfo,
          quota: Object.values(quota)[0],
        });
        history.push(
          state ? state.from : pathname === "/login" ? "/" : pathname
        );
      } catch (err) {
        if (err.code === "NotAuthorizedException") {
          setCognitoUser(null);
        }
        throw err;
      }
    },
    [cognitoUser, history, state, pathname]
  );

  const signOut = useCallback(() => {
    Auth.signOut()
      .then(() => {
        setCognitoUser(null);
        setSignedIn(false);
        setRoleInfo({});
        history.push("/login");
      })
      .catch((err) => console.error(err));
  }, [history]);

  const getQuota = useCallback(async () => {
    const tempRole = { ...roleInfo };
    const quota = await fetchData(
      urlQuota,
      "GET",
      {
        id_comercio: roleInfo.id_comercio,
        id_dispositivo: roleInfo.id_dispositivo,
      },
      {}
    );
    tempRole.quota = Object.values(quota)[0];
    setRoleInfo({ ...tempRole });
  }, [roleInfo]);

  return {
    handleverifyTotpToken,
    handleChangePass,
    isSignedIn,
    cognitoUser,
    userInfo,
    roleInfo,
    signIn,
    confirmSignIn,
    signOut,
    getQuota,
    qr,
  };
};
