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

const urlLog = `${process.env.REACT_APP_URL_LOGIN}/login`;
const urlQuota = `${process.env.REACT_APP_URL_LOGIN}/cupo`;
const urlCod_loteria_oficina = `${process.env.REACT_APP_URL_LOTO1}/cod_loteria_oficina`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;
const urlInfoTicket = `${process.env.REACT_APP_URL_TRXS_TRX_BASE}`;
const url_permissions = process.env.REACT_APP_URL_IAM_PDP;

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

const initialUser = {
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  quotaInfo: null,
  userSession: null,
  pdpUser: null,
  userPermissions: null,
};

const SIGN_IN = "SIGN_IN";
const CONFIRM_SIGN_IN = "CONFIRM_SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const FETCH_PERMISSIONS = "FETCH_PERMISSIONS";
const FETCH_QUOTAINFO = "FETCH_QUOTAINFO";
const SET_COGNITOUSER = "SET_COGNITOUSER";
const SET_USERINFO = "SET_USERINFO";
const SET_ROLEINFO = "SET_ROLEINFO";
const SET_PERMISSIONS = "SET_PERMISSIONS";
const SET_PDPUSER = "SET_PDPUSER";
const SET_SESSION = "SET_SESSION";
const SET_QUOTA = "SET_QUOTA";

const reducerAuth = (userState, action) => {
  const { payload } = action;
  const dispatch = payload?.dispatch;
  switch (action.type) {
    case SIGN_IN:
      const { user } = payload;
      return { ...userState, cognitoUser: user };

    case SIGN_OUT:
      return initialUser;

    case SET_COGNITOUSER:
      const { cogUser } = payload;
      return { ...userState, cognitoUser: cogUser, isSignedIn: true };

    case SET_USERINFO:
      const { uInfo } = payload;
      return { ...userState, userInfo: uInfo };

    case SET_ROLEINFO:
      if (payload?.dispatch) {
        delete payload.dispatch;
      }
      const { roleInfo: role } = userState;
      return { ...userState, roleInfo: { ...role, ...payload } };

    case SET_PERMISSIONS:
      const { uAccess } = payload;
      return { ...userState, userPermissions: uAccess };

    case SET_PDPUSER:
      const { pdpU } = payload;
      return { ...userState, pdpUser: pdpU };

    case SET_SESSION:
      const { uSession } = payload;
      return { ...userState, userSession: uSession };

    case SET_QUOTA:
      const { quota } = payload;
      return { ...userState, quotaInfo: quota };

    case FETCH_PERMISSIONS:
      const { email } = payload;
      getPermissions(email)
        .then(({ uAccess, pdpU }) => {
          dispatch?.({ type: SET_PERMISSIONS, payload: { uAccess } });
          dispatch?.({ type: SET_PDPUSER, payload: { pdpU } });
        })
        .catch(() => {});
      return userState;

    case FETCH_QUOTAINFO:
      const { id_comercio, id_dispositivo } = payload;
      fetchData(
        urlQuota,
        "GET",
        {
          id_comercio: id_comercio,
          id_dispositivo: id_dispositivo,
        },
        {}
      )
        .then((quota) => {
          const tempRole = { quota: 0, comision: 0 };
          tempRole.quota = quota["cupo disponible"];
          tempRole.comision = quota["comisiones"];
          dispatch?.({ type: SET_QUOTA, payload: { quota: tempRole } });
        })
        .catch(() =>
          dispatch?.({
            type: SET_QUOTA,
            payload: { quota: { quota: 0, comision: 0 } },
          })
        );
      return userState;

    case CONFIRM_SIGN_IN:
      const { loggedUser } = payload;
      if (!loggedUser) {
        return initialUser;
      }
      Auth.currentUserInfo()
        .then((uInfo) => {
          dispatch?.({ type: SET_USERINFO, payload: { uInfo } });
          const email = uInfo?.attributes?.email;

          // Fetch suser info
          fetchData(urlLog, "GET", { correo: email }, {})
            .then((suserInfo) => {
              dispatch?.({ type: SET_ROLEINFO, payload: suserInfo });
              fetchDane(suserInfo.codigo_dane)
                .then((ciudad) => {
                  dispatch?.({
                    type: SET_ROLEINFO,
                    payload: { ciudad },
                  });
                })
                .catch(() => {});
              fetchOficinaLoteria(suserInfo.id_comercio)
                .then((oficina) => {
                  dispatch?.({
                    type: SET_ROLEINFO,
                    payload: { ...oficina },
                  });
                })
                .catch(() => {});
            })
            .catch(() => {});

          // Fetch user permissions
          dispatch({
            type: FETCH_PERMISSIONS,
            payload: { email, dispatch: dispatch },
          });
        })
        .catch(() => {});

      Auth.currentSession()
        .then((uSession) =>
          dispatch?.({ type: SET_SESSION, payload: { uSession } })
        )
        .catch(() => {});
      return { ...userState, cognitoUser: loggedUser, isSignedIn: true };

    default:
      throw new Error(`Bad action ${JSON.stringify(action, null, 2)}`);
  }
};

export const AuthContext = createContext({
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
  infoTicket: () => {},
  handleverifyTotpToken: () => {},
  handleChangePass: () => {},
  parameters: null,
  qr: null,
  ...initialUser,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useProvideAuth = () => {
  const [qr, setQr] = useState("");

  const [username] = useState("PROD");

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
          payload: { loggedUser, dispatch: dispatchAuth },
        });
        navigate(state?.from || pathname === "/login" ? "/" : pathname);
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

  // Runs in first load
  useEffect(() => {
    if (Auth.user === null || Auth.user === undefined) {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          dispatchAuth({
            type: CONFIRM_SIGN_IN,
            payload: { loggedUser: user, dispatch: dispatchAuth },
          });
        })
        .catch(() => {
          dispatchAuth({ type: SIGN_OUT });
        });
    } else {
      dispatchAuth({
        type: CONFIRM_SIGN_IN,
        payload: { loggedUser: Auth.user, dispatch: dispatchAuth },
      });
    }
  }, []);

  // Runs when route change
  useEffect(() => {
    if (id_comercio && id_dispositivo) {
      dispatchAuth({
        type: FETCH_QUOTAINFO,
        payload: {
          id_comercio: id_comercio,
          id_dispositivo: id_dispositivo,
          dispatch: dispatchAuth,
        },
      });
    }
  }, [pathname, id_comercio, id_dispositivo]);

  // Runs when route change
  useEffect(() => {
    if (pathname?.includes("iam")) {
      const email = userState?.userInfo?.attributes?.email;
      dispatchAuth({
        type: FETCH_PERMISSIONS,
        payload: { email, dispatch: dispatchAuth },
      });
    }
  }, [pathname, userState?.userInfo?.attributes?.email]);

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
  }, [cognitoUser, username, signOut]);

  useEffect(() => {
    const temp = async () => {
      if (cognitoUser?.challengeName === "MFA_SETUP") {
        setTimer(
          setTimeout(() => {
            signOut();
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
    temp();
  }, [cognitoUser, signOut]);

  return {
    handleverifyTotpToken,
    handleChangePass,
    signIn,
    confirmSignIn,
    signOut,
    qr,
    timer,
    parameters,
    infoTicket,
    ...userState,
  };
};
