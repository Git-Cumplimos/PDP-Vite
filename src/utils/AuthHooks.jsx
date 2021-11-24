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

//////////////////////Despliegue de estos servicios anterior
// const urlLog = "http://logconsulta.us-east-2.elasticbeanstalk.com/login";
// const urlQuota = "http://logconsulta.us-east-2.elasticbeanstalk.com/cupo";

const urlLog = `${process.env.REACT_APP_URL_LOGIN}/login`;
const urlQuota = `${process.env.REACT_APP_URL_LOGIN}/cupo`;
const urlcrearRol = `${process.env.REACT_APP_URL_USRS}/crear_rol`;
const urlconsulta_roles = `${process.env.REACT_APP_URL_USRS}/consulta_rol`;
const urlconsulta_usuarios = `${process.env.REACT_APP_URL_USRS}/consulta_usuario`;
const urlcambiar_rol = `${process.env.REACT_APP_URL_USRS}/modificar_rol`;
// const urlCod_loteria_oficina = `${process.env.REACT_APP_URL_LOTO1}/cod_loteria_oficina`;

export const AuthContext = createContext({
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  crearRolresp: null,
  setCrearRolresp: null,
  roles_disponibles: null,
  setRoles_disponibles: null,
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
  getQuota: () => {},
  crearRol: () => {},
  consulta_roles: () => {},
  consulta_usuarios: () => {},
  cambiar_rol: () => {},
  checkUser: () => {},
  parameters: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useProvideAuth = () => {
  const [isSignedIn, setSignedIn] = useState(false);

  const [cognitoUser, setCognitoUser] = useState(null);

  const [userInfo, setUserInfo] = useState(null);

  const [roleInfo, setRoleInfo] = useState(null);

  const [crearRolresp, setCrearRolresp] = useState(null);

  const [roles_disponibles, setRoles_disponibles] = useState(null);

  const [qr, setQr] = useState("");

  const [parameters, setParameters] = useState("");

  const consulta_roles = useCallback(async () => {
    try {
      const res = await fetchData(urlconsulta_roles, "GET", {});
      setRoles_disponibles(res);
      return res;
    } catch (err) {}
  }, []);

  const consulta_usuarios = useCallback(async (email) => {
    try {
      const res = await fetchData(urlconsulta_usuarios, "GET", {
        email: email,
      });

      return res;
    } catch (err) {}
  }, []);

  const crearRol = useCallback(
    async (
      pnombre,
      snombre,
      papellido,
      sapellido,
      rol,
      email,
      identificacion,
      telefono,
      direccion_residencia
    ) => {
      const req = {
        nombre: `${pnombre} ${snombre} ${papellido} ${sapellido}`,
        rol: rol,
        email: email,
        identificacion: identificacion,
        telefono: telefono,
        direccion_residencia: direccion_residencia,
      };
      try {
        const res = await fetchData(urlcrearRol, "POST", {}, req);
        setCrearRolresp(res);
        return res;
      } catch (err) {
        setCrearRolresp(null);
      }
    },
    []
  );

  const cambiar_rol = useCallback(
    async (rol, email, email_cambio, telefono_cambio, direccion_residencia) => {
      const req = {
        rol: rol,
        email: email,
        email_cambio: email_cambio,
        telefono: telefono_cambio,
        direccion_residencia: direccion_residencia,
      };
      try {
        const res = await fetchData(urlcambiar_rol, "PUT", {}, req);
        return res;
      } catch (err) {}
    },
    []
  );

  const handleSetupTOTP = useCallback(async (user) => {
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
  }, [cognitoUser?.username]);

  const setUser = useCallback(async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setCognitoUser(user);

      if (user) setSignedIn(true);
      const usrInfo = await Auth.currentUserInfo();
      setUserInfo(usrInfo);
      if (usrInfo?.attributes?.email) {
        const suserInfo = await fetchData(
          urlLog,
          "GET",
          { correo: usrInfo?.attributes?.email },
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
          role: suserInfo.rol,
          ...suserInfo,

          quota: quota["cupo disponible"],
          comision: quota["comisiones"],
        });

        // const resp_cod = await fetchData(
        //   urlCod_loteria_oficina,
        //   "GET",
        //   {
        //     id_comercio: suserInfo.id_comercio,
        //   },
        //   {}
        // );

        // if ("msg" in resp_cod) {
        //   setRoleInfo({
        //     role: suserInfo.rol,
        //     ...suserInfo,

        //     quota: quota["cupo disponible"],
        //     comision: quota["comisiones"],
        //   });
        // } else {
        //   setRoleInfo({
        //     role: suserInfo.rol,
        //     ...suserInfo,

        //     quota: quota["cupo disponible"],
        //     comision: quota["comisiones"],
        //     cod_oficina_lot: resp_cod.cod_oficina_lot,
        //     cod_sucursal_lot: resp_cod.cod_sucursal_lot,
        //   });
        // }
      }
    } catch (err) {
      setSignedIn(false);
      logger.debug(err);
    }
  }, []);

  const checkUser = useCallback(() => {
    if (Auth.user === null || Auth.user === undefined) {
      setUser();
    } else {
      setSignedIn(true);
      setCognitoUser(Auth.user);
      Auth.currentUserInfo()
        .then((usr) => setUserInfo(usr))
        .catch(() => {});

      fetchData(urlLog, "GET", { correo: Auth.user?.attributes?.email }, {})
        .then((suserInfo) => {
          fetchData(
            urlQuota,
            "GET",
            {
              id_comercio: suserInfo.id_comercio,
              id_dispositivo: suserInfo.id_dispositivo,
            },
            {}
          )
            .then((quota) => {
              setRoleInfo({
                role: suserInfo.rol,
                ...suserInfo,

                quota: quota["cupo disponible"],
                comision: quota["comisiones"],
              });
              // fetchData(
              //   urlCod_loteria_oficina,
              //   "GET",
              //   {
              //     id_comercio: suserInfo.id_comercio,
              //   },
              //   {}
              // )
              //   .then((resp_cod) => {
              //     if ("msg" in resp_cod) {
              //       setRoleInfo({
              //         role: suserInfo.rol,
              //         ...suserInfo,

              //         quota: quota["cupo disponible"],
              //         comision: quota["comisiones"],
              //       });
              //     } else {
              //       setRoleInfo({
              //         role: suserInfo.rol,
              //         ...suserInfo,

              //         quota: quota["cupo disponible"],
              //         comision: quota["comisiones"],
              //         cod_oficina_lot: resp_cod.cod_oficina_lot,
              //         cod_sucursal_lot: resp_cod.cod_sucursal_lot,
              //       });
              //     }
              //   })
              //   .catch(() => {});
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, [setUser]);

  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");
    // consulta_roles();
    checkUser();
    if (cognitoUser?.challengeName === "MFA_SETUP") {
      handleSetupTOTP(cognitoUser);
    }
  }, [checkUser, consulta_roles, cognitoUser, handleSetupTOTP]);

  const history = useHistory();
  const { state, pathname } = useLocation();

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
        const usrInfo = await Auth.currentUserInfo();
        setUserInfo(usrInfo);
        try {
          if (usrInfo?.attributes?.email) {
            const suserInfo = await fetchData(
              urlLog,
              "GET",
              { correo: usrInfo?.attributes?.email },
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
              role: suserInfo.rol,
              ...suserInfo,

              quota: quota["cupo disponible"],
              comision: quota["comisiones"],
            });

            // const resp_cod = await fetchData(
            //   urlCod_loteria_oficina,
            //   "GET",
            //   {
            //     id_comercio: suserInfo.id_comercio,
            //   },
            //   {}
            // );

            // if ("msg" in resp_cod) {
            //   setRoleInfo({
            //     role: suserInfo.rol,
            //     ...suserInfo,

            //     quota: quota["cupo disponible"],
            //     comision: quota["comisiones"],
            //   });
            // } else {
            //   setRoleInfo({
            //     role: suserInfo.rol,
            //     ...suserInfo,

            //     quota: quota["cupo disponible"],
            //     comision: quota["comisiones"],
            //     cod_oficina_lot: resp_cod.cod_oficina_lot,
            //     cod_sucursal_lot: resp_cod.cod_sucursal_lot,
            //   });
            // }
          }
        } catch (err) {}
        history.push(state?.from || pathname === "/login" ? "/" : pathname);
      } catch (err) {
        if (err.code === "NotAuthorizedException") {
          setCognitoUser(null);
          setSignedIn(false);
          signOut();
        }
        throw err;
      }
    },
    [cognitoUser, history, state, pathname, signOut]
  );

  const handlesetPreferredMFA = useCallback(
    async (totp) => {
      try {
        const preferredMFA = await Auth.setPreferredMFA(cognitoUser, "TOTP");
        signOut();
        if (preferredMFA === "SUCCESS") {
          await confirmSignIn(totp);
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
          history.push("/login");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    [cognitoUser, handlesetPreferredMFA, history]
  );

  const getQuota = useCallback(async () => {
    const tempRole = { ...roleInfo };
    try {
      const quota = await fetchData(
        urlQuota,
        "GET",
        {
          id_comercio: roleInfo.id_comercio,
          id_dispositivo: roleInfo.id_dispositivo,
        },
        {}
      );
      tempRole.quota = quota["cupo disponible"];
      tempRole.comision = quota["comisiones"];
    } catch (err) {}
    setRoleInfo({ ...tempRole });
  }, [roleInfo]);

  return {
    handleverifyTotpToken,
    handleChangePass,
    isSignedIn,
    cognitoUser,
    userInfo,
    roleInfo,
    crearRolresp,
    setCrearRolresp,
    roles_disponibles,
    setRoles_disponibles,
    signIn,
    confirmSignIn,
    signOut,
    getQuota,
    crearRol,
    consulta_roles,
    consulta_usuarios,
    cambiar_rol,
    checkUser,
    qr,
    parameters,
  };
};
