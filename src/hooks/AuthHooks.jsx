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
import { notify, notifyError } from "../utils/notify";
import useFetchDispatchDebounce from "./useFetchDispatchDebounce";

const urlLog = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/login`;
const urlQuota = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/cupo`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;
const urlInfoTicket = `${process.env.REACT_APP_URL_TRXS_TRX}/transaciones`;
const url_iam_pdp_users = process.env.REACT_APP_URL_IAM_PDP;
const url_user = process.env.REACT_APP_URL_COGNITO;
const public_urls = process.env.REACT_APP_URL_SERVICE_PUBLIC;
const url_pdp_commerce = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const validateUser = async (email) => {
  const get = {
    email: email,
  };
  if (!email) {
    throw new Error("Sin datos de busqueda", {
      cause: "custom",
    });
  }

  try {
    const res = await fetchData(url_user, "GET", get, {}, {}, false);
    if (!res?.Status) {
      throw new Error("Usuario invalido", {
        cause: "custom",
      });
    }
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
  userPermissions: [],
  commerceInfo: null,
};

const SIGN_IN = "SIGN_IN";
const CONFIRM_SIGN_IN = "CONFIRM_SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SET_USERINFO = "SET_USERINFO";
const SET_ROLEINFO = "SET_ROLEINFO";
const SET_PERMISSIONS = "SET_PERMISSIONS";
const SET_PDPUSER = "SET_PDPUSER";
const SET_QUOTA = "SET_QUOTA";
const SET_COMMERCE_INFO = "SET_COMMERCE_INFO";

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

    case SET_COMMERCE_INFO:
      const { commerce } = payload;
      return { ...userState, commerceInfo: commerce };

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
  const [, setSuserInactive] = useState("");

  const [timer, setTimer] = useState(null);

  const [userState, dispatchAuth] = useReducer(reducerAuth, initialUser);

  const { cognitoUser, roleInfo, pdpUser } = userState;
  const id_comercio = roleInfo?.id_comercio;
  const id_dispositivo = roleInfo?.id_dispositivo;

  const navigate = useNavigate();

  const { state, pathname } = useLocation();

  const signIn = useCallback(async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        dispatchAuth({ type: SIGN_IN, payload: { user } });
        dispatchAuth({
          type: SET_PDPUSER,
          payload: { pdpU: { email: username } },
        });
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
        setTimer((old) => {
          if (!old) {
            return old;
          }
          clearTimeout(old);
          return null;
        });
      } catch (err) {
        if (err.code === "NotAuthorizedException") {
          dispatchAuth({ type: SIGN_OUT });
        }
        throw err;
      }
    },
    [cognitoUser, navigate, state, pathname]
  );

  const signOut = useCallback(() => {
    Auth.signOut()
      .then(() => {
        dispatchAuth({ type: SIGN_OUT });
        navigate("/login", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const checkTOTPFlow = useCallback(
    async (user) => {
      if (!user || !(user?.challengeName === "MFA_SETUP")) {
        return;
      }
      setTimer((old) => {
        clearTimeout(old);
        return setTimeout(() => {
          signOut();
          notifyError(
            "La sesión ha expirado, por favor intente de nuevo",
            5000,
            { toastId: "expired-session-not" }
          );
          setQr("");
        }, 90000);
      });

      const session = user?.Session;
      if (!userState?.pdpUser?.email || !session) {
        return;
      }

      try {
        const semillaAws = await Auth.setupTOTP(user);
        const response = await fetch(`${public_urls}/users-totp/generate`, {
          method: "POST",
          body: JSON.stringify({
            email: userState?.pdpUser?.email,
            otp_base32: semillaAws,
          }),
          headers: {
            // Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          notifyError(
            <p>
              Error consultando el servicio de generacion de token:
              <br />
              Error http: {response.statusText} ({response.status})
            </p>
          );
          return;
        }
        const resJson = await response.json();
        if (!resJson?.status) {
          notifyError(resJson?.msg);
          return;
        }

        const strQr = resJson?.obj?.otpauth_url;
        console.log(strQr);
        setQr(strQr);
        setTimer((old) => {
          clearTimeout(old);
          return null;
        });
      } catch (err) {
        console.error(err);
      }
    },
    [signOut, userState?.pdpUser?.email]
  );

  const verifyTOTP = useCallback(
    async (totp) => {
      if (!totp) {
        notifyError("No se ha pasado el totp para verificacion");
        signOut();
        return;
      }

      try {
        const response = await fetch(`${public_urls}/users-totp/verify`, {
          method: "POST",
          body: JSON.stringify({
            email: userState?.pdpUser?.email,
            totp,
          }),
          headers: {
            // Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          notifyError(
            <p>
              Error consultando el servicio de verificacion de token:
              <br />
              Error http: {response.statusText} ({response.status})
            </p>
          );
          return;
        }
        const resJson = await response.json();
        if (!resJson?.status) {
          notifyError(resJson?.msg);
          return;
        }
        notify(resJson?.msg);
      } catch (err) {
        console.error(err);
        signOut();
        throw new Error(err, { cause: "unknown" });
      }
    },
    [signOut, userState?.pdpUser?.email]
  );

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
        await checkTOTPFlow(loggedUser);
      } catch (err) {
        throw err;
      }
    },
    [checkTOTPFlow]
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
        await verifyTOTP(totp);
        const preferredMFA = await Auth.setPreferredMFA(cognitoUser, "TOTP");
        if (preferredMFA === "SUCCESS") {
          await confirmSignIn(totp);
          signOut();
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    [cognitoUser, confirmSignIn, signOut, verifyTOTP]
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
      const tempRole = {
        quota: 0,
        comision: 0,
        sobregiro: 0,
        sobregirovalue: 0,
        alerta: "",
      };
      tempRole.quota = quota["cupo disponible"];
      tempRole.comision = quota["comisiones"];
      tempRole.sobregiro = quota["dias sobregiro"] ?? 0;
      tempRole.sobregirovalue = quota["sobregiro"];
      tempRole.alerta = quota["alerta cupo"];
      dispatchAuth({ type: SET_QUOTA, payload: { quota: tempRole } });
    }, []),
    onError: useCallback((error) => {
      dispatchAuth({
        type: SET_QUOTA,
        payload: { quota: { quota: 0, comision: 0, sobregiro: 0, alerta: "" } },
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
      setSuserInactive((old) => ("msg" in suserInfo ? suserInfo?.msg : old));
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
      if (error?.cause === "custom-403") {
        notifyError(error.message);
        signOut();
      } else if (error?.cause === "custom") {
        notifyError(error.message);
        setSuserInactive(error.message);
      } else {
        console.error(error);
      }
    }, [signOut]),
  });

  const [getLoginPdp] = useFetchDispatchDebounce({
    onSuccess: useCallback(
      (res) => {
        const pdpU = res?.obj?.pdpU;
        if (!pdpU && !pdpU.active) {
          notifyError("Usuario inactivo");
          signOut();
          return;
        }

        dispatchAuth({
          type: SET_PERMISSIONS,
          payload: { uAccess: res?.obj?.uAccess ?? [] },
        });
        dispatchAuth({ type: SET_PDPUSER, payload: { pdpU } });
      },
      [signOut]
    ),
    onError: useCallback(
      (error) => {
        if (error?.cause in ["custom-403", "custom"]) {
          notifyError(error.message);
          signOut();
        } else {
          console.error(error);
        }
      },
      [signOut]
    ),
  });

  const [getComercios] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      const commerce = res?.obj;
      dispatchAuth({ type: SET_COMMERCE_INFO, payload: { commerce } });
    }, []),
    onError: useCallback((error) => {
      if (error?.cause === "custom") {
        signOut();
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
    if (id_comercio) {
      getComercios(
        `${url_pdp_commerce}/comercios/consultar-unique?pk_comercio=${id_comercio}`
      );
    }
  }, [pathname, id_comercio, getComercios]);

  useEffect(() => {
    const email = userState?.userInfo?.attributes?.email;
    if (email) {
      getSuserInfo(
        `${urlLog}?correo=${userState?.userInfo?.attributes?.email}`
      );
    }
  }, [userState?.userInfo?.attributes?.email, getSuserInfo]);

  useEffect(() => {
    const email = userState?.userInfo?.attributes?.email;
    if (email && roleInfo) {
      getLoginPdp(
        `${url_iam_pdp_users}/user-login?email=${userState?.userInfo?.attributes?.email}`
      );
    }
  }, [userState?.userInfo?.attributes?.email, roleInfo, getLoginPdp]);

  useEffect(() => {
    const isPdpCommerce = !!pdpUser?.fk_id_comercio;
    setSuserInactive((old) => {
      if (isPdpCommerce && old) {
        notifyError(old, false, { toastId: "failed-suser" });
        signOut();
      }
      return "";
    });
  }, [pdpUser?.fk_id_comercio, signOut]);

  useEffect(() => {
    checkTOTPFlow(cognitoUser);
  }, [checkTOTPFlow, cognitoUser]);

  useEffect(() => {
    setTimer((old) => {
      if (!userState?.isSignedIn || !old) {
        return old;
      }
      clearTimeout(old);
      return null;
    });
  }, [userState?.isSignedIn]);

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
