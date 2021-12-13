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

const notify = (msg = "Info") => {
  toast.info(msg, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

const notifyError = (msg = "Error") => {
  toast.warning(msg, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

const infoTicket = async (id_trx, Tipo_operacion, ticket) => {
  const get = {
    id_trx: id_trx,
    Tipo_operacion: Tipo_operacion,
  };
  const post = { Ticket: ticket };

  try {
    const res = await fetchData(urlInfoTicket, "PUT", get, post);
    return res;
  } catch (err) {}
};

const fetchDane = async (codigo_dane) => {
  try {
    const resp_ciudad = await fetchData(
      urlCiudad_dane,
      "GET",
      {
        c_digo_dane_del_municipio: codigo_dane,
      },
      {}
    );
    return resp_ciudad[0].municipio;
  } catch (err) {}
};

const fetchOficinaLoteria = async (id_comercio) => {
  try {
    const resp_cod = await fetchData(
      urlCod_loteria_oficina,
      "GET",
      {
        id_comercio: id_comercio,
      },
      {}
    );
    if (!("msg" in resp_cod)) {
      return {
        cod_oficina_lot: resp_cod.cod_oficina_lot,
        cod_sucursal_lot: resp_cod.cod_sucursal_lot,
      };
    } else {
      return {
        cod_oficina_lot: "PPVIR",
        cod_sucursal_lot: "00",
      };
    }
  } catch (err) {}
};

const getPermissions = async (email = "") => {
  if (!email) {
    return { uAccess: [], pdpU: null };
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
      return { uAccess: [], pdpU: null };
    }
    const uuid = user_res_arr?.[0].uuid ?? 0;
    if (uuid === 0) {
      notifyError("User not found in db");
      return { uAccess: [], pdpU: null };
    }

    // Get user
    const permissions = await fetchData(
      `${url_permissions}/users-permissions`,
      "GET",
      { uuid }
    );
    if (!permissions?.status) {
      throw new Error(user_res?.msg);
    }
    const userAccess = permissions?.obj;

    if (userAccess.length === 0) {
      notifyError("User has no permissions in db");
      return { uAccess: [], pdpU: null };
    }
    return { uAccess: userAccess, pdpU: user_res_arr?.[0] };
  } catch (err) {}
};

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

  const [quotaInfo, setQuotaInfo] = useState({ quota: 0, comision: 0 });

  const [pdpUser, setPdpUser] = useState(null);

  const [userPermissions, setUserPermissions] = useState(null);

  const [qr, setQr] = useState("");

  const [username] = useState("CERT");

  const [parameters, setParameters] = useState("");

  const history = useHistory();

  const { state, pathname } = useLocation();

  const signOut = useCallback(() => {
    Auth.signOut()
      .then(() => {
        setSignedIn(false);
        setCognitoUser(null);
        setUserInfo(null);
        setUserSession(null);
        setRoleInfo(null);
        setUserPermissions(null);
        setPdpUser(null);
        setQuotaInfo({ quota: 0, comision: 0 });
        history.replace("/login");
      })
      .catch(() => {});
  }, [history]);

  const getQuota = useCallback(() => {
    if (roleInfo?.id_comercio && roleInfo?.id_dispositivo) {
      fetchData(
        urlQuota,
        "GET",
        {
          id_comercio: roleInfo?.id_comercio,
          id_dispositivo: roleInfo?.id_dispositivo,
        },
        {}
      )
        .then((quota) => {
          const tempRole = { quota: 0, comision: 0 };
          tempRole.quota = quota["cupo disponible"];
          tempRole.comision = quota["comisiones"];
          setQuotaInfo({ ...tempRole });
        })
        .catch(() => setQuotaInfo({ quota: 0, comision: 0 }));
    }
  }, [roleInfo?.id_comercio, roleInfo?.id_dispositivo]);

  const saveUserData = useCallback(
    (user) => {
      // Set user vars
      setSignedIn(true);
      setCognitoUser(user);

      Auth.currentUserInfo()
        .then((uInfo) => {
          setUserInfo(uInfo);
          const email = uInfo?.attributes?.email;

          // Fetch suser info
          fetchData(urlLog, "GET", { correo: email }, {})
            .then((suserInfo) => {
              setRoleInfo({ ...suserInfo });
              fetchDane(suserInfo.codigo_dane)
                .then((ciudad) => {
                  setRoleInfo((role) => {
                    return { ...role, ciudad };
                  });
                })
                .catch(() => {});
              fetchOficinaLoteria(suserInfo.id_comercio)
                .then((oficina) => {
                  setRoleInfo((role) => {
                    return { ...role, ...oficina };
                  });
                })
                .catch(() => {});
            })
            .catch(() => {});

          // Fetch user permissions
          getPermissions(email)
            .then(({ uAccess, pdpU }) => {
              const { active } = pdpU;
              if (!active) {
                signOut();
              } else {
                setUserPermissions(uAccess);
                setPdpUser(pdpU);
              }
            })
            .catch(() => {});
        })
        .catch(() => {});

      Auth.currentSession()
        .then((uSession) => setUserSession(uSession))
        .catch(() => {});
    },
    [signOut]
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

  const checkUser = useCallback(() => {
    if (Auth.user === null || Auth.user === undefined) {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          if (!user) {
            setSignedIn(false);
            setCognitoUser(null);
            return;
          }
          saveUserData(user);
        })
        .catch((err) => {
          setSignedIn(false);
          setCognitoUser(null);
          logger.debug(err);
        });
    } else {
      const user = Auth.user;
      if (!user) {
        setSignedIn(false);
        setCognitoUser(null);
        return;
      }
      saveUserData(user);
    }
  }, [saveUserData]);

  // Runs in first load
  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");
    checkUser();
  }, [checkUser]);

  // Runs when route change
  useEffect(() => {
    getQuota();
    if (pathname?.includes("iam")) {
      getPermissions(userInfo?.attributes?.email)
        .then(({ uAccess, pdpU }) => {
          setUserPermissions(uAccess);
          setPdpUser(pdpU);
        })
        .catch(() => {});
    }
  }, [getQuota, pathname, userInfo?.attributes?.email]);

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
        saveUserData(loggedUser);
        history.push(state?.from || pathname === "/login" ? "/" : pathname);
      } catch (err) {
        if (err.code === "NotAuthorizedException") {
          setCognitoUser(null);
        }
        throw err;
      }
    },
    [cognitoUser, history, state, pathname, saveUserData]
  );

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
