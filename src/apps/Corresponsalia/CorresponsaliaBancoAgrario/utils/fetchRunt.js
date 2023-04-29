import { useAuth } from "../../../../hooks/AuthHooks";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

const urlreintentos = `${process.env.REACT_APP_URL_CORRESPONSALIA_AGRARIO_RUNT}/banco-agrario`;
export const fetchCustom = (url_, metodo_, name_, id_uuid_trx) => {
  return async (params_ = {}, data_ = {}) => {
    // const { roleInfo, pdpUser } = useAuth();
    let urlCompleto = url_;
    //armar parametros
    try {
      if (metodo_ === "GET" || metodo_ === "PUT") {
        if (Object.keys(params_).length > 0) {
          let paramsVector = Object.keys(params_);
          paramsVector.map(
            (valueKey, index) =>
            (paramsVector[index] = `${valueKey}=${params_[valueKey]}`)
            );
            urlCompleto += `?${paramsVector.join("&")}`;
          }
      }
    } catch (error) {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
        );
      }

      //Petición
      let Peticion;
      try {
        if (metodo_ === "GET") {
          Peticion = await fetchData(urlCompleto, "GET", {}, {}, {}, true);
        } else if (metodo_ === "PUT") {
          Peticion = await fetchData(urlCompleto, "PUT", {}, data_, {}, true);
        } else if (metodo_ === "POST") {
          Peticion = await fetchData(urlCompleto, "POST", {}, data_, true);
        }
      } catch (error) {
        throw new ErrorCustomFetch(
          `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
          error.message
          );
        }
    //Evaluar si la respuesta es json
    try {
      if (typeof Peticion !== "object") {
        throw new ErrorCustomFetch(
          `Error respuesta Front-end PDP: Servicio no encontrado (${name_})`,
          "404 not found"
        );
      }
    } catch (error) {
      console.log("error", error)
      throw error;
    }
    console.log("Peticion", Peticion)
    //evaluar respuesta de api gateway
    // console.log("ESO ES FETCHRUNT roleInfo?.id_comercio", roleInfo?.id_comercio)
    try {
      console.log("ESO ES FETCHRUNT PETICION",Peticion)
      console.log("ESO ES FETCHRUNT data_", data_)
      console.log("ESO ES FETCHRUNT id_uuid_trx", id_uuid_trx)
      console.log("ESO ES FETCHRUNT data_?.comercio?.id_comercio", data_?.comercio?.id_comercio)
      console.log("ESO ES FETCHRUNT data_?.comercio?.id_terminal", data_?.comercio?.id_terminal)
      console.log("ESO ES FETCHRUNT data_?.comercio?.id_usuario", data_?.comercio?.id_usuario)
      // if (Peticion?.hasOwnProperty("status") === false) {
      if (Peticion?.status === false) {        
        console.log("Peticion?.hasOwnProperty(status)",Peticion)
        //No es una respuesta directamente del servicio sino del api gateway
        // if (Peticion?.hasOwnProperty("message") === true) {
        if (Peticion?.msg === "Error respuesta Recaudo Banco Agrario: Error respuesta Banco Agrario: ()") {
          console.log("Peticion?.hasOwnProperty(message)", Peticion)
          const message = "Endpoint request timed out"
          // if (Peticion.message === "Endpoint request timed out") {
            if (message === "Endpoint request timed out") {                   
            console.log("Entro al if de Endpoint request timed out")
            notify("Se está procesando la transacción");
            for (let i = 0; i <= 7; i++) {
              try {
                const promesa = await new Promise((resolve, reject) =>
                
                setTimeout(() => {
                    postCheckReintentoRunt({
                      idComercio: data_?.comercio?.id_comercio,
                      idUsuario: data_?.comercio?.id_usuario,
                      idTerminal: data_?.comercio?.id_terminal,
                      id_uuid_trx: id_uuid_trx,
                    })
                      .then((res) => {
                        if (res?.msg !== "No ha terminado el reintento") {
                          if (
                            res?.status === true ||
                            res?.obj?.response?.estado == "00"
                          ) {
                            notify("Venta exitosa");
                          } else {
                            resolve(true);
                          }
                        } else {
                          resolve(false);
                        }
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  }, 9000)
                );
                if (promesa === true) {
                  break;
                }
                if (i >= 3) {
                  // notify(
                  //   "Su transacción quedó en estado pendiente, por favor consulte el estado de la transacción en aproximadamente 1 minuto"
                  // );
                  notify(
                    "Error respuesta practisistemas: No se recibió respuesta del autorizador en el tiempo esperado [0010003]"
                  );
                  throw new ErrorCustomTimeout(
                    `Error respuesta Front-end PDP: Timeout al consumir el servicio (${name_}) [0010002]`,
                    "Timeout"
                  );
                  // break;
                }
              } catch (error) {
                console.error(error);
              }
              if (i <= 3) {
                notify(
                  "Su transacción esta siendo procesada, no recargue la página"
                );

              }
            }


          } else {
            throw new ErrorCustomFetch(
              `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
              Peticion.message
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof ErrorCustomTimeout) {
        throw error;
      } else if (error instanceof ErrorCustomFetch) {
        throw error;
      } else {
        throw new ErrorCustomFetch(
          `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
          error.message
        );
      }
    }

    //evaluar la respuesta que llega del backend
    try {
      return EvaluateResponse(Peticion, name_);
    } catch (error) {
      throw error;
    }
  };
};

export const postCheckReintentoRunt = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  try {
    const res = await fetchData(
      `${urlreintentos}/reintento-runt`,
      "POST",
      {},
      bodyObj,
      {},
      true,
      9000
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const EvaluateResponse = (res, name_ = "") => {
  // trx exitosa
  try {
    if (res?.status === true) {
      return res;
    }
  } catch (error) {
    throw new ErrorCustomFetch(
      `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
      error.message
    );
  }
  // trx no exitosa
  //para los errores customizados del backend
  try {
    if (
      res?.status === false &&
      (res?.obj?.error_status === true || res?.obj?.error === true) &&
      res?.obj?.error_msg
    ) {
      throw new ErrorCustomBackend(`${res?.msg}`, `${res?.msg}`);
    }
  } catch (error) {
    if (error instanceof ErrorCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
  }
  // cuando status es false pero no hay errores
  try {
    if (res?.status === false && res?.obj?.error === false && res?.msg) {
      throw new msgCustomBackend(`${res?.msg}`, `${res?.msg}`);
    }
  } catch (error) {
    if (error instanceof msgCustomBackend) {
      throw error;
    } else {
      throw new ErrorCustomFetch(
        `Error respuesta Front-end PDP: Fallo al consumir el servicio (${name_}) [0010002]`,
        error.message
      );
    }
  }
};

export class ErrorCustom extends Error {
  constructor(message, name, error_msg, notificacion) {
    super(message);
    this.name = name;
    this.error_msg = error_msg;
    this.notificacion = notificacion;
    if (this.notificacion === "notifyError") {
      notifyError(message);
    } else if (this.notificacion === "notify") {
      notify(message);
    }

    if (
      this.name === "ErrorCustomFetch" ||
      this.name === "ErrorCustomTimeout"
    ) {
      console.error(`${message}\n ${this.error_msg}`);
    }
  }
}

export class ErrorCustomFetch extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomFetch", error_msg, "notifyError");
  }
}

export class ErrorCustomTimeout extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomTimeout", error_msg, "notifyError");
  }
}

export class ErrorCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackend", error_msg, null);
  }
}

export class ErrorCustomBackendUser extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "ErrorCustomBackendUser", error_msg, null);
  }
}

export class msgCustomBackend extends ErrorCustom {
  constructor(message, error_msg) {
    super(message, "msgCustomBackend", error_msg, null);
  }
}
