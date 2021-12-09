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
import { toast } from "react-toastify";

const logger = new Logger("withAuthenticator");

//////////////////////Despliegue de estos servicios anterior
// const urlLog = "http://logconsulta.us-east-2.elasticbeanstalk.com/login";
// const urlQuota = "http://logconsulta.us-east-2.elasticbeanstalk.com/cupo";

const urlLog = `${process.env.REACT_APP_URL_LOGIN}/login`;
const urlQuota = `${process.env.REACT_APP_URL_LOGIN}/cupo`;
const urlCod_loteria_oficina = `${process.env.REACT_APP_URL_LOTO1}/cod_loteria_oficina`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;
const urlInfoTicket = `${process.env.REACT_APP_URL_TRXS_TRX_BASE}`;
const url_permissions = process.env.REACT_APP_URL_IAM_PDP;

export const AuthContext = createContext({
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  quotaInfo: null,
  userSession: null,
  pdpUser: null,
  userPermissions: null,
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
  getQuota: () => {},
  infoTicket: () => {},
  handleverifyTotpToken: () => {},
  handleChangePass: () => {},
  parameters: null,
  qr: null,
  notify: () => {},
  notifyError: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useProvideAuth = () => {
  const [isSignedIn, setSignedIn] = useState(false);

  const [cognitoUser, setCognitoUser] = useState(null);

  const [userInfo, setUserInfo] = useState(null);

  const [userSession, setUserSession] = useState(null);

  const [roleInfo, setRoleInfo] = useState(null);

  const [quotaInfo, setQuotaInfo] = useState(null);

  const [pdpUser, setPdpUser] = useState(null);

  const [userPermissions, setUserPermissions] = useState(null);

  const [qr, setQr] = useState("");

  const [username] = useState("CERT");

  const [parameters, setParameters] = useState("");

  const history = useHistory();

  const { state, pathname } = useLocation();

  const notify = useCallback((msg = "Info") => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []);

  const notifyError = useCallback((msg = "Error") => {
    toast.warning(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []);

  const infoTicket = useCallback(async (id_trx, Tipo_operacion, ticket) => {
    const get = {
      id_trx: id_trx,
      Tipo_operacion: Tipo_operacion,
    };
    const post = { Ticket: ticket };

    try {
      const res = await fetchData(urlInfoTicket, "PUT", get, post);
      return res;
    } catch (err) {}
  }, []);

  const getQuota = useCallback(async () => {
    const tempRole = { quota: 0, comision: 0 };
    if (roleInfo?.id_comercio && roleInfo?.id_dispositivo) {
      const quota = await fetchData(
        urlQuota,
        "GET",
        {
          id_comercio: roleInfo?.id_comercio,
          id_dispositivo: roleInfo?.id_dispositivo,
        },
        {}
      );
      tempRole.quota = quota["cupo disponible"];
      tempRole.comision = quota["comisiones"];
    }
    setQuotaInfo({ ...tempRole });
  }, [roleInfo?.id_comercio, roleInfo?.id_dispositivo]);

  const fetchAwsAuth = useCallback(async () => {
    try {
      const usrInfo = await Auth.currentUserInfo();
      setUserInfo(usrInfo);

      const userSession = await Auth.currentSession();
      setUserSession(userSession);
      return usrInfo?.attributes?.email;
    } catch (err) {
      setSignedIn(false);
      logger.debug(err);
    }
  }, []);

  const fetchSuserInfo = useCallback(async (email) => {
    try {
      let roleObj = {};
      const suserInfo = await fetchData(urlLog, "GET", { correo: email }, {});
      roleObj = { ...suserInfo };

      try {
        const resp_ciudad = await fetchData(
          urlCiudad_dane,
          "GET",
          {
            c_digo_dane_del_municipio: suserInfo.codigo_dane,
          },
          {}
        );
        roleObj = {
          ...roleObj,
          ciudad: resp_ciudad[0].municipio,
        };
      } catch (err) {}

      try {
        const resp_cod = await fetchData(
          urlCod_loteria_oficina,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
          },
          {}
        );
        if (!("msg" in resp_cod)) {
          roleObj = {
            ...roleObj,
            cod_oficina_lot: resp_cod.cod_oficina_lot,
            cod_sucursal_lot: resp_cod.cod_sucursal_lot,
          };
        }
      } catch (err) {}

      setRoleInfo({ ...roleObj });
    } catch (err) {}
  }, []);

  const getPermissions = useCallback(
    async (email = "") => {
      if (!email) {
        return;
      }
      try {
        // Get user
        const user_res = await fetchData(`${url_permissions}/users`, "GET", {
          email: email,
        });
        if (!user_res?.status) {
          throw new Error(user_res?.msg);
        }
        const user_res_arr = user_res?.obj?.results;
        if (!Array.isArray(user_res_arr) || user_res_arr.length === 0) {
          notifyError("User not found in db");
          return;
        }
        const uuid = user_res_arr?.[0].uuid ?? 0;
        if (uuid === 0) {
          notifyError("User not found in db");
          return;
        }
        setPdpUser(user_res_arr?.[0]);

        // Get group of the user
        const user_group_res = await fetchData(
          `${url_permissions}/users-groups`,
          "GET",
          {
            Users_uuid: uuid,
          }
        );
        if (!user_group_res?.status) {
          throw new Error(user_group_res?.msg);
        }
        if (
          !Array.isArray(user_group_res?.obj) ||
          user_group_res?.obj.length === 0
        ) {
          return;
        }

        const userAccess = [];

        for (const group of user_group_res?.obj) {
          const id_group = group.Groups_id_group ?? 0;
          if (id_group !== 0) {
            // Get roles of the group
            const group_roles_res = await fetchData(
              `${url_permissions}/groups-roles`,
              "GET",
              {
                Groups_id_group: id_group,
              }
            );
            if (!group_roles_res?.status) {
              throw new Error(group_roles_res?.msg);
            }
            const gr_res = group_roles_res?.obj;
            if (Array.isArray(gr_res) && gr_res.length > 0) {
              for (const role of gr_res) {
                const id_role = role.Roles_id_role ?? 0;
                if (id_role !== 0) {
                  // Get permissions of the role
                  const role_permissions_res = await fetchData(
                    `${url_permissions}/roles-permissions`,
                    "GET",
                    {
                      Roles_id_role: id_role,
                    }
                  );
                  if (!role_permissions_res?.status) {
                    throw new Error(role_permissions_res?.msg);
                  }
                  if (
                    Array.isArray(role_permissions_res?.obj) &&
                    role_permissions_res?.obj.length > 0
                  ) {
                    for (const permission of role_permissions_res?.obj) {
                      const id_permission =
                        permission.Permissions_id_permission ?? 0;
                      if (id_permission !== 0) {
                        const permissions_res = await fetchData(
                          `${url_permissions}/permissions`,
                          "GET",
                          {
                            id_permission,
                          }
                        );
                        if (!permissions_res?.status) {
                          throw new Error(permissions_res?.msg);
                        }
                        const per_res = permissions_res?.obj?.results;
                        if (Array.isArray(per_res) && per_res.length > 0) {
                          userAccess.push(...per_res);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (userAccess.length === 0) {
          notifyError("User has no permissions in db");
          return;
        }
        setUserPermissions(userAccess);
        return userAccess;
      } catch (err) {}
    },
    [notifyError]
  );

  const saveUserData = useCallback(
    async (user, email) => {
      setSignedIn(true);
      setCognitoUser(user);
      await fetchSuserInfo(email);
      await getPermissions(email);
    },
    [fetchSuserInfo, getPermissions]
  );

  const handleSetupTOTP = useCallback(
    async (user) => {
      try {
        const validartoken = await Auth.setupTOTP(user);
        const str =
          "otpauth://totp/AWSCognito:" +
          cognitoUser?.username +
          "?secret=" +
          validartoken +
          "&issuer=" +
          "Punto de Pago Multibanco";
        setQr(str);
      } catch (err) {}
    },
    [cognitoUser?.username]
  );

  const checkUser = useCallback(async () => {
    let user = null;
    let email = null;
    try {
      if (Auth.user === null || Auth.user === undefined) {
        user = await Auth.currentAuthenticatedUser();
        email = await fetchAwsAuth();
      } else {
        user = Auth.user;
        email = Auth.user?.attributes?.email;
        await fetchAwsAuth();
      }
      if (!user) {
        setSignedIn(false);
        setCognitoUser(null);
        return;
      }
      await saveUserData(user, email);
    } catch (err) {
      setSignedIn(false);
      setCognitoUser(null);
      logger.debug(err);
    }
  }, [fetchAwsAuth, saveUserData]);

  // Runs in first load
  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");
    checkUser();
  }, [checkUser]);

  // Runs when route change
  useEffect(() => {
    getQuota();
    if (pathname?.includes("iam")) {
      getPermissions(userInfo?.attributes?.email);
    }
  }, [getQuota, getPermissions, pathname, userInfo?.attributes?.email]);

  useEffect(() => {
    const validate = async () => {
      if (cognitoUser?.challengeName === "MFA_SETUP") {
        try {
          const validartoken = await Auth.setupTOTP(cognitoUser);
          const str =
            "otpauth://totp/AWSCognito:" +
            username +
            "?secret=" +
            validartoken +
            "&issuer=" +
            "Punto de Pago Multibanco";
          setQr(str);
        } catch (err) {}
      }
    };
    validate();
  }, [cognitoUser, username]);

  useEffect(() => {
    const temp = async () => {
      if (cognitoUser?.challengeName === "MFA_SETUP") {
        try {
          const validartoken = await Auth.setupTOTP(cognitoUser);
          const str =
            "otpauth://totp/AWSCognito:" +
            "PROD" +
            "?secret=" +
            validartoken +
            "&issuer=" +
            "Punto de Pago Multibanco";
          setQr(str);
        } catch (err) {}
      }
    };
    temp();
  }, [cognitoUser]);

  const signIn = useCallback(async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        setCognitoUser(user);
        setParameters(user.challengeParam.userAttributes);
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const handleChangePass = useCallback(
    async (
      nombreUsuario,
      apellido,
      cognitoUser,
      direccion,
      ciudad,
      newpassword
    ) => {
      try {
        const loggedUser = await Auth.completeNewPassword(
          cognitoUser,
          newpassword,
          {
            name: nombreUsuario,
            family_name: apellido,
            address: direccion,
            locale: ciudad,
          }
        );
        setCognitoUser(loggedUser);
        if (loggedUser.challengeName === "MFA_SETUP") {
          await handleSetupTOTP(loggedUser);
        }
      } catch (err) {
        throw err;
      }
    },
    [handleSetupTOTP]
  );

  const confirmSignIn = useCallback(
    async (totp) => {
      try {
        const loggedUser = await Auth.confirmSignIn(
          cognitoUser,
          totp,
          cognitoUser.challengeName
        );
        let email = await fetchAwsAuth();

        await saveUserData(loggedUser, email);
        history.push(state?.from || pathname === "/login" ? "/" : pathname);
      } catch (err) {
        if (err.code === "NotAuthorizedException") {
          setCognitoUser(null);
        }
        throw err;
      }
    },
    [cognitoUser, history, state, pathname, fetchAwsAuth, saveUserData]
  );

  const signOut = useCallback(() => {
    Auth.signOut()
      .then(() => {
        setCognitoUser(null);
        setSignedIn(false);
        setRoleInfo({});
        history.push("/login");
      })
      .catch(() => {});
  }, [history]);

  const handlesetPreferredMFA = useCallback(
    async (totp) => {
      try {
        const preferredMFA = await Auth.setPreferredMFA(cognitoUser, "TOTP");
        if (preferredMFA === "SUCCESS") {
          await confirmSignIn(totp);
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    [cognitoUser, confirmSignIn]
  );

  const handleverifyTotpToken = useCallback(
    async (totp) => {
      try {
        const tokenValidado = await Auth.verifyTotpToken(cognitoUser, totp);
        if (tokenValidado.accessToken.payload.token_use === "access") {
          await handlesetPreferredMFA(totp);
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    [cognitoUser, handlesetPreferredMFA]
  );

  return {
    handleverifyTotpToken,
    handleChangePass,
    isSignedIn,
    cognitoUser,
    userInfo,
    roleInfo,
    quotaInfo,
    userSession,
    pdpUser,
    userPermissions,
    signIn,
    confirmSignIn,
    signOut,
    getQuota,
    qr,
    parameters,
    infoTicket,
    notify,
    notifyError,
  };
};
