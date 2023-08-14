import { Auth } from "@aws-amplify/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import fetchData from "../utils/fetchData";
import { notifyError } from "../utils/notify";
import useFetchDispatchDebounce from "./useFetchDispatchDebounce";

const urlLog = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/login`;
const urlQuota = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/cupo`;
const urlComisiones = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/servicio-wallet-comisiones/consulta-wallet-comercio`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;
const urlInfoTicket = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones`;
const url_iam_pdp_users = process.env.REACT_APP_URL_IAM_PDP;
const url_user = process.env.REACT_APP_URL_COGNITO;

const validateUser = async (email) => {
  const get = {
    email: email,
  };

  try {
    const res = await fetchData(url_user, "GET", get, {}, {}, false);
    return res;
  } catch (err) {
    throw err;
  }
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
  if (!codigo_dane) {
    return "";
  }
  try {
    const resp_ciudad = await fetchData(
      urlCiudad_dane,
      "GET",
      {
        c_digo_dane_del_municipio: codigo_dane.replace(/\d{2}/i, "$&."),
      },
      {},
      {},
      false
    );
    return resp_ciudad[0].municipio;
  } catch (err) {}
};

const initialUser = {
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  quotaInfo: null,
  pdpUser: null,
  userPermissions: null,
};

const SIGN_IN = "SIGN_IN";
const CONFIRM_SIGN_IN = "CONFIRM_SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SET_USERINFO = "SET_USERINFO";
const SET_ROLEINFO = "SET_ROLEINFO";
const SET_PERMISSIONS = "SET_PERMISSIONS";
const SET_PDPUSER = "SET_PDPUSER";
const SET_QUOTA = "SET_QUOTA";

const reducerAuth = (userState, action) => {
  const { payload } = action;
  switch (action.type) {
    case SIGN_IN:
      const { user } = payload;
      return { ...userState, cognitoUser: user };

    case SIGN_OUT:
      return initialUser;

    case SET_USERINFO:
      const { uInfo } = payload;
      return { ...userState, userInfo: uInfo };

    case SET_ROLEINFO:
      const { roleInfo: role } = userState;
      return { ...userState, roleInfo: { ...role, ...payload } };

    case SET_PERMISSIONS:
      const { uAccess } = payload;
      return { ...userState, userPermissions: uAccess };

    case SET_PDPUSER:
      const { pdpU } = payload;
      return { ...userState, pdpUser: pdpU };

    case SET_QUOTA:
      const { quota } = payload;
      return { ...userState, quotaInfo: quota };

    case CONFIRM_SIGN_IN:
      const { loggedUser } = payload;
      if (!loggedUser) {
        return initialUser;
      }
      return { ...userState, cognitoUser: loggedUser, isSignedIn: true };

    default:
      throw new Error(`Bad action ${JSON.stringify(action, null, 2)}`);
  }
};

export const AuthContext = createContext({
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
  infoTicket,
  handleverifyTotpToken: () => {},
  handleChangePass: () => {},
  forgotPassword: () => {},
  forgotPasswordSubmit: () => {},
  resetTopt: () => {},
  parameters: null,
  qr: null,
  ...initialUser,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useProvideAuth = () => {
  const [qr, setQr] = useState("");

  const [parameters, setParameters] = useState("");

  const [timer, setTimer] = useState(null);

  const [userState, dispatchAuth] = useReducer(reducerAuth, initialUser);

  const { cognitoUser, roleInfo } = userState;
  const id_comercio = roleInfo?.id_comercio;
  const id_dispositivo = roleInfo?.id_dispositivo;

  const navigate = useNavigate();

  const { state, pathname } = useLocation();

  const signIn = useCallback(async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        dispatchAuth({ type: SIGN_IN, payload: { user } });
        setParameters(user.challengeParam.userAttributes);
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const confirmSignIn = useCallback(
    async (totp) => {
      try {
        const loggedUser = await Auth.confirmSignIn(
          cognitoUser,
          totp,
          cognitoUser.challengeName
        );
        dispatchAuth({
          type: CONFIRM_SIGN_IN,
          payload: { loggedUser },
        });
        Auth.currentUserInfo()
          .then((uInfo) =>
            dispatchAuth({ type: SET_USERINFO, payload: { uInfo } })
          )
          .catch(() => {});
        navigate(
          state?.from?.pathname
            ? state?.from?.pathname
            : pathname === "/login"
            ? "/"
            : pathname
        );
        if (timer) {
          clearTimeout(timer);
        }
      } catch (err) {
        if (err.code === "NotAuthorizedException") {
          dispatchAuth({ type: SIGN_OUT });
        }
        throw err;
      }
    },
    [cognitoUser, navigate, state, pathname, timer]
  );

  const signOut = useCallback(() => {
    Auth.signOut()
      .then(() => {
        dispatchAuth({ type: SIGN_OUT });
        navigate("/login", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const handleSetupTOTP = useCallback(async (user) => {
    try {
      const validartoken = await Auth.setupTOTP(user);
      const str =
        "otpauth://totp/AWSCognito:" +
        "Punto de Pago Token" +
        "?secret=" +
        validartoken +
        "&issuer=" +
        "Punto de Pago Multibanco";
      setQr(str);
    } catch (err) {}
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
        dispatchAuth({
          type: SIGN_IN,
          payload: { user: loggedUser },
        });
        if (loggedUser.challengeName === "MFA_SETUP") {
          setTimer(
            setTimeout(() => {
              signOut();
              notifyError("La sesión ha expirado, por favor intente de nuevo");
            }, 90000)
          );
          await handleSetupTOTP(loggedUser);
        }
      } catch (err) {
        throw err;
      }
    },
    [handleSetupTOTP, signOut]
  );

  const forgotPassword = useCallback(async (email) => {
    try {
      await Auth.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const forgotPasswordSubmit = useCallback(async (email, code, confirmPass) => {
    try {
      await Auth.forgotPasswordSubmit(email, code, confirmPass);
    } catch (error) {
      throw error;
    }
  }, []);

  const handlesetPreferredMFA = useCallback(
    async (totp) => {
      try {
        const preferredMFA = await Auth.setPreferredMFA(cognitoUser, "TOTP");
        if (preferredMFA === "SUCCESS") {
          await confirmSignIn(totp);
          signOut();
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    [cognitoUser, confirmSignIn, signOut]
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

  const [getQuota] = useFetchDispatchDebounce({
    onSuccess: useCallback((quota) => {
      const tempRole = { quota: 0, comision: 0, sobregiro: 0 };
      tempRole.quota = quota["cupo disponible"];
      tempRole.comision = quota["comisiones"];
      tempRole.sobregiro = quota["dias sobregiro"] ?? 0;
      dispatchAuth({ type: SET_QUOTA, payload: { quota: tempRole } });
    }, []),
    onError: useCallback((error) => {
      dispatchAuth({
        type: SET_QUOTA,
        payload: { quota: { quota: 0, comision: 0, sobregiro: 0 } },
      });
      if (error?.cause === "custom") {
        notifyError(error.message);
      } else {
        console.error(error);
      }
    }, []),
  });

  const [getSuserInfo] = useFetchDispatchDebounce({
    onSuccess: useCallback((suserInfo) => {
      let _roleinfo = {};
      if (!("msg" in suserInfo)) {
        _roleinfo = structuredClone(suserInfo);
      }
      fetchDane(suserInfo.codigo_dane)
        .then((ciudad) => {
          _roleinfo.ciudad = ciudad;
        })
        .catch(() => {})
        .finally(() => {
          dispatchAuth({
            type: SET_ROLEINFO,
            payload: structuredClone(_roleinfo),
          });
        });
    }, []),
    onError: useCallback((error) => {
      if (error?.cause === "custom") {
        notifyError(error.message);
      } else {
        console.error(error);
      }
    }, []),
  });

  const [getLoginPdp] = useFetchDispatchDebounce({
    onSuccess: useCallback(
      (res) => {
        const pdpU = res?.obj?.pdpU;
        if (!pdpU && !("active" in pdpU) && !pdpU.active) {
          notifyError("Usuario inactivo");
          signOut();
          return;
        }

        dispatchAuth({
          type: SET_PERMISSIONS,
          payload: { uAccess: res?.obj?.uAccess },
        });
        dispatchAuth({ type: SET_PDPUSER, payload: { pdpU } });
      },
      [signOut]
    ),
    onError: useCallback((error) => {
      if (error?.cause === "custom") {
        notifyError(error.message);
      } else {
        console.error(error);
      }
    }, []),
  });

  // Runs only when route change
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        dispatchAuth({
          type: CONFIRM_SIGN_IN,
          payload: { loggedUser: user },
        });
        Auth.currentUserInfo()
          .then((uInfo) =>
            dispatchAuth({ type: SET_USERINFO, payload: { uInfo } })
          )
          .catch(() => {});
      })
      .catch(() => {
        dispatchAuth({ type: SIGN_OUT });
      });
    // if (Auth.user === null || Auth.user === undefined) {
    // } else {
    //   dispatchAuth({ type: SIGN_OUT });
    //   dispatchAuth({
    //     type: CONFIRM_SIGN_IN,
    //     payload: { loggedUser: Auth.user },
    //   });
    // }
  }, [pathname]);

  useEffect(() => {
    if (id_comercio && id_dispositivo) {
      getQuota(
        `${urlQuota}?id_comercio=${id_comercio}&id_dispositivo=${id_dispositivo}`
      );
    }
  }, [pathname, id_comercio, id_dispositivo, getQuota]);

  useEffect(() => {
    const email = userState?.userInfo?.attributes?.email;
    if (email) {
      getSuserInfo(
        `${urlLog}?correo=${userState?.userInfo?.attributes?.email}`
      );
      getLoginPdp(
        `${url_iam_pdp_users}/user-login?email=${userState?.userInfo?.attributes?.email}`
      );
    }
  }, [userState?.userInfo?.attributes?.email, getSuserInfo, getLoginPdp]);

  useEffect(() => {
    const validate = async () => {
      if (cognitoUser?.challengeName === "MFA_SETUP") {
        setTimer(
          setTimeout(() => {
            signOut();
            notifyError("La sesión ha expirado, por favor intente de nuevo");
          }, 90000)
        );
        try {
          const validartoken = await Auth.setupTOTP(cognitoUser);
          const str =
            "otpauth://totp/AWSCognito:" +
            "Punto de Pago Token" +
            "?secret=" +
            validartoken +
            "&issuer=" +
            "Punto de Pago Multibanco";
          setQr(str);
        } catch (err) {}
      }
    };
    validate();
  }, [cognitoUser, signOut]);

  return {
    handleverifyTotpToken,
    handleChangePass,
    signIn,
    confirmSignIn,
    signOut,
    forgotPassword,
    forgotPasswordSubmit,
    qr,
    timer,
    parameters,
    infoTicket,
    validateUser,
    ...userState,
  };
};
