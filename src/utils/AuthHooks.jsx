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
const urlCod_loteria_oficina = `${process.env.REACT_APP_URL_LOTO1}/cod_loteria_oficina`;
const urlCiudad_dane = `${process.env.REACT_APP_URL_DANE_MUNICIPIOS}`;

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

  const [username, setUsername] = useState("CERT");

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

  // const crearRol = useCallback(
  //   async (
  //     pnombre,
  //     snombre,
  //     papellido,
  //     sapellido,
  //     rol,
  //     email,
  //     identificacion,
  //     telefono,
  //     direccion_residencia
  //   ) => {
  //     const req = {
  //       nombre: `${pnombre} ${snombre} ${papellido} ${sapellido}`,
  //       rol: rol,
  //       email: email,
  //       identificacion: identificacion,
  //       telefono: telefono,
  //       direccion_residencia: direccion_residencia,
  //     };
  //     try {
  //       const res = await fetchData(urlcrearRol, "POST", {}, req);
  //       setCrearRolresp(res);
  //       return res;
  //     } catch (err) {
  //       setCrearRolresp(null);
  //     }
  //   },
  //   []
  // );

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
        console.log(suserInfo);
        const quota = await fetchData(
          urlQuota,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
            id_dispositivo: suserInfo.id_dispositivo,
          },
          {}
        );

        const resp_ciudad = await fetchData(
          urlCiudad_dane,
          "GET",
          {
            c_digo_dane_del_municipio: suserInfo.codigo_dane,
          },
          {}
        );

        setRoleInfo({
          ...suserInfo,
          quota: quota["cupo disponible"],
          comision: quota["comisiones"],
          ciudad: resp_ciudad[0].municipio,
        });

        const resp_cod = await fetchData(
          urlCod_loteria_oficina,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
          },
          {}
        );

        console.log(resp_cod);
        if (!("msg" in resp_cod)) {
          setRoleInfo({
            ...suserInfo,
            quota: quota["cupo disponible"],
            comision: quota["comisiones"],
            cod_oficina_lot: resp_cod.cod_oficina_lot,
            cod_sucursal_lot: resp_cod.cod_sucursal_lot,
            ciudad: resp_ciudad[0].municipio,
          });
        }
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
          console.log(suserInfo);
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
              fetchData(
                urlCiudad_dane,
                "GET",
                {
                  c_digo_dane_del_municipio: suserInfo.codigo_dane,
                },
                {}
              )
                .then((resp_ciudad) => {
                  fetchData(
                    urlCod_loteria_oficina,
                    "GET",
                    {
                      id_comercio: suserInfo.id_comercio,
                    },
                    {}
                  )
                    .then((resp_cod) => {
                      setRoleInfo({
                        ...suserInfo,
                        quota: quota["cupo disponible"],
                        comision: quota["comisiones"],
                        ciudad: resp_ciudad[0].municipio,
                      });
                      if (!("msg" in resp_cod)) {
                        setRoleInfo({
                          ...suserInfo,
                          quota: quota["cupo disponible"],
                          comision: quota["comisiones"],
                          cod_oficina_lot: resp_cod.cod_oficina_lot,
                          cod_sucursal_lot: resp_cod.cod_sucursal_lot,
                          ciudad: resp_ciudad[0].municipio,
                        });
                      }
                    })
                    .catch(() => {});
                })
                .catch(() => {});
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, [setUser]);

  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");
    consulta_roles();
    checkUser();
  }, [checkUser, consulta_roles]);

  useEffect(async () => {
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
  }, [cognitoUser]);

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

  const handleSetupTOTP = useCallback(
    async (user) => {
      try {
        const validartoken = await Auth.setupTOTP(user);
        const str =
          "otpauth://totp/AWSCognito:" +
          username +
          "?secret=" +
          validartoken +
          "&issuer=" +
          "Punto de Pago Multibanco";
        setQr(str);
      } catch (err) {}
    },
    [username]
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
        setCognitoUser(loggedUser);
        if (loggedUser.challengeName === "MFA_SETUP") {
          handleSetupTOTP(loggedUser);
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
        setCognitoUser(loggedUser);
        setSignedIn(true);
        const usrInfo = await Auth.currentUserInfo();
        setUserInfo(usrInfo);
        if (usrInfo?.attributes?.email) {
          const suserInfo = await fetchData(
            urlLog,
            "GET",
            { correo: usrInfo?.attributes?.email },
            {}
          );
          console.log(suserInfo);
          const quota = await fetchData(
            urlQuota,
            "GET",
            {
              id_comercio: suserInfo.id_comercio,
              id_dispositivo: suserInfo.id_dispositivo,
            },
            {}
          );

          const resp_ciudad = await fetchData(
            urlCiudad_dane,
            "GET",
            {
              c_digo_dane_del_municipio: suserInfo.codigo_dane,
            },
            {}
          );

          setRoleInfo({
            ...suserInfo,
            quota: quota["cupo disponible"],
            comision: quota["comisiones"],
            ciudad: resp_ciudad[0].municipio,
          });

          const resp_cod = await fetchData(
            urlCod_loteria_oficina,
            "GET",
            {
              id_comercio: suserInfo.id_comercio,
            },
            {}
          );

          console.log(resp_cod);
          if (!("msg" in resp_cod)) {
            setRoleInfo({
              ...suserInfo,
              quota: quota["cupo disponible"],
              comision: quota["comisiones"],
              cod_oficina_lot: resp_cod.cod_oficina_lot,
              cod_sucursal_lot: resp_cod.cod_sucursal_lot,
              ciudad: resp_ciudad[0].municipio,
            });
          }
        }
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
    tempRole.quota = quota["cupo disponible"];
    tempRole.comision = quota["comisiones"];
    setRoleInfo({ ...tempRole });
  }, [roleInfo]);
  console.log(cognitoUser);
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
    // crearRol,
    consulta_roles,
    consulta_usuarios,
    cambiar_rol,
    checkUser,
    qr,
    parameters,
  };
};
