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

const urlLog = "http://loginconsulta.us-east-2.elasticbeanstalk.com/login";
const urlQuota = "http://loginconsulta.us-east-2.elasticbeanstalk.com/cupo";
const urlcrearRol = "http://lot-crear-rol.us-east-2.elasticbeanstalk.com/crear_rol";
const urlconsulta_roles = 'http://lot-crear-rol.us-east-2.elasticbeanstalk.com/consulta_rol';
const urlconsulta_usuarios = 'http://lot-crear-rol.us-east-2.elasticbeanstalk.com/consulta_usuario';
const urlcambiar_rol = 'http://lot-crear-rol.us-east-2.elasticbeanstalk.com/modificar_rol';
const urlCod_loteria_oficina = "http://loteriacons.us-east-2.elasticbeanstalk.com/cod_loteria_oficina";

//////////////////////Despliegue de estos servicios anterior
// const urlLog = "http://logconsulta.us-east-2.elasticbeanstalk.com/login";
// const urlQuota = "http://logconsulta.us-east-2.elasticbeanstalk.com/cupo";

export const AuthContext = createContext({
  isSignedIn: false,
  cognitoUser: null,
  userInfo: null,
  roleInfo: null,
  crearRolresp:null,
  setCrearRolresp:null,
  roles_disponibles:null,
  setRoles_disponibles:null,
  signIn: () => {},
  confirmSignIn: () => {},
  signOut: () => {},
  getQuota: () => {},
  crearRol: () => {},
  consulta_roles: () => {},
  consulta_usuarios: () => {},
  cambiar_rol: () => {},
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



  const consulta_roles = useCallback(async () => {
    try {
      const res = await fetchData(urlconsulta_roles, "GET", {});
      setRoles_disponibles(res);
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const consulta_usuarios = useCallback(async (email) => {
    try {
      const res = await fetchData(urlconsulta_usuarios, "GET", {
        email:email,
      });
    
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);
  
  const crearRol = useCallback(
    async (pnombre,snombre,papellido,sapellido, rol, email, identificacion,telefono,direccion_residencia) => {

      
      const req = {
        
          nombre:pnombre+" "+snombre+" "+papellido+" "+sapellido,
          rol:rol,
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
        console.error(err);
      }
    },
    []
  );

  const cambiar_rol = useCallback(
    async (rol, email, email_cambio, telefono_cambio, direccion_residencia) => {

      
      const req = {
        
          rol:rol,
          email: email,
          email_cambio:email_cambio,
          telefono: telefono_cambio,
          direccion_residencia: direccion_residencia,
      

      };
      try {
        const res = await fetchData(urlcambiar_rol, "PUT", {}, req);
        
        return res;
      } catch (err) {
        console.error(err);
      }
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
       
        const quota = await fetchData(
          urlQuota,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
            id_dispositivo: suserInfo.id_dispositivo,
          },
          {}
        );

        const resp_cod = await fetchData(
          urlCod_loteria_oficina,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
          },
          {}
        );

        console.log(resp_cod)
        if('msg' in resp_cod){
          setRoleInfo({
            role: suserInfo.rol,
            ...suserInfo,
            
            quota: quota['cupo disponible'],
            comision: quota['comisiones'],
          });
        }else{
          setRoleInfo({
            role: suserInfo.rol,
            ...suserInfo,
            
            quota: quota['cupo disponible'],
            comision: quota['comisiones'],
            cod_oficina_lot: resp_cod.cod_oficina_lot,
            cod_sucursal_lot: resp_cod.cod_sucursal_lot,
          });
        }
      }
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

      fetchData(
        urlLog,
        "GET",
        { correo: Auth.user?.attributes?.email },
        {}
      ).then((suserInfo) => {
        fetchData(
          urlQuota,
          "GET",
          {
            id_comercio: suserInfo.id_comercio,
            id_dispositivo: suserInfo.id_dispositivo,
          },
          {}
        ).then((quota) => {

          fetchData(
            urlCod_loteria_oficina,
            "GET",
            {
              id_comercio: suserInfo.id_comercio,
            },
            {}
          ).then((resp_cod) => {
            if('msg' in resp_cod){
              setRoleInfo({
                role: suserInfo.rol,
                ...suserInfo,
                
                quota: quota['cupo disponible'],
                comision: quota['comisiones'],
              });
            }else{
              setRoleInfo({
                role: suserInfo.rol,
                ...suserInfo,
                
                quota: quota['cupo disponible'],
                comision: quota['comisiones'],
                cod_oficina_lot: resp_cod.cod_oficina_lot,
                cod_sucursal_lot: resp_cod.cod_sucursal_lot,
              });
            }

          });
        });
      });
    }
  }, [setUser]);

  useEffect(() => {
    appendToCognitoUserAgent("withCustomAuthenticator");
    consulta_roles();
    checkUser();
  }, [checkUser]);

  const history = useHistory();
  const { state, pathname } = useLocation();

  const signIn = useCallback(async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      if (user) {
        setCognitoUser(user);
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
          
          const quota = await fetchData(
            urlQuota,
            "GET",
            {
              id_comercio: suserInfo.id_comercio,
              id_dispositivo: suserInfo.id_dispositivo,
            },
            {}
          );

          const resp_cod = await fetchData(
            urlCod_loteria_oficina,
            "GET",
            {
              id_comercio: suserInfo.id_comercio,
            },
            {}
          );
  
  
          if('msg' in resp_cod){
            setRoleInfo({
              role: suserInfo.rol,
              ...suserInfo,
              
              quota: quota['cupo disponible'],
              comision: quota['comisiones'],
            });
          }else{
            setRoleInfo({
              role: suserInfo.rol,
              ...suserInfo,
              
              quota: quota['cupo disponible'],
              comision: quota['comisiones'],
              cod_oficina_lot: resp_cod.cod_oficina_lot,
              cod_sucursal_lot: resp_cod.cod_sucursal_lot,
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
    tempRole.quota = quota['cupo disponible'];
    tempRole.comision= quota['comisiones']
    setRoleInfo({ ...tempRole });
  }, [roleInfo]);

  
  console.log(roleInfo)
  return {
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
  };
};
