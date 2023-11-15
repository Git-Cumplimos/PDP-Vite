import { useCallback, useState } from "react";
import { ErrorCustomBackend, fetchCustom } from "../utils/fetchNequi";
import { notify, notifyError } from "../../../utils/notify";
import { cifrarAES, decryptAES } from "../../../utils/cryptoUtils";
const sleep = (millisecons) => {
  return new Promise((resolve) => setTimeout(resolve, millisecons));
};
export const useFetchNequi = (
  url_trx_ = "",
  url_consulta_ = "",
  name_ = ""
) => {
  const [state, setState] = useState(false);

  const fetchNequiTrx = useCallback(
    async (data_ = {}, data_additional_ = {}) => {
      const fetchTrx = fetchCustom(
        url_trx_,
        "POST",
        `'Trx ${name_}'`,
        true,
        false
      );
      const fetchConsulta = fetchCustom(
        url_consulta_,
        "POST",
        `'Consultar ${name_}'`,
        false
      );
      let PeticionTrx;
      let PeticionConsulta;
      let banderaConsulta = false;
      let banderaConsultaNequi = false;
      let response;
      setState(true);

      //SECUENCIA ---------------Paso 1-------------------------------
      try {
        let parseObj = JSON.stringify(data_);
        let dataObj = {
          data: cifrarAES(
            `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_DAV}`,
            `${process.env.REACT_APP_IV_AES_ENCRYPT_DAV}`,
            parseObj
          ),
        };
        PeticionTrx = await fetchTrx({}, dataObj);
        const dataDecrypt = PeticionTrx?.obj?.data ?? "";
        const obj = decryptAES(
          `${process.env.REACT_APP_LLAVE_AES_DECRYPT_DAV}`,
          `${process.env.REACT_APP_IV_AES_DECRYPT_DAV}`,
          dataDecrypt
        );
        PeticionTrx.obj = JSON.parse(obj);
        response = PeticionTrx;
        banderaConsultaNequi = true;
      } catch (error) {
        if (error.name === "ErrorCustomTimeout") {
          banderaConsulta = true;
        } else {
          setState(false);
          throw error;
        }
      }

      //SECUENCIA ---------------Paso 2-------------------------------
      if (banderaConsultaNequi) {
        try {
          let data_consulta = {
            id_comercio: data_?.comercio?.id_comercio,
            id_terminal: data_?.comercio?.id_terminal,
            id_uuid_trx: data_additional_?.id_uuid_trx,
          };
          for (let i = 0; i <= 3; i++) {
            PeticionConsulta = await fetchConsulta({}, data_consulta);
            if (PeticionConsulta?.msg.includes("No ha terminado")) {
              notify(
                "Envío Notificación Nequi Satisfactorio, revisar centro de Notificaciones de Nequi para aceptar el débito de la transacción."
              );
              await sleep(15000);
            } else {
              break;
            }
          }
          if (PeticionConsulta?.msg.includes("Error respuesta Nequi:")) {
            response = PeticionConsulta;
            throw new ErrorCustomBackend(
              PeticionConsulta?.msg,
              PeticionConsulta?.msg
            );
          } else if (PeticionConsulta?.obj?.status_trx === "Aprobada") {
            response = PeticionConsulta;
          } else {
            if (PeticionConsulta?.msg === "No ha terminado el reintento") {
              throw new ErrorCustomTimeout(
                `Error respuesta Front-end PDP: Timeout al consumir el servicio (${name_}) [0010002]`,
                "Timeout"
              );
            }
          }
        } catch (error) {
          setState(false);
          throw error;
        }
      }
      else if (banderaConsulta) {
        try {
          let data_consulta = {
            id_comercio: data_?.comercio?.id_comercio,
            id_terminal: data_?.comercio?.id_terminal,
            id_uuid_trx: data_additional_?.id_uuid_trx,
          };
          for (let i = 0; i <= 4; i++) {
            PeticionConsulta = await fetchConsulta({}, data_consulta);
            if (PeticionConsulta?.msg.includes("No ha terminado")) {
              notify(
                "Su transacción esta siendo procesada, no recargue la página"
              );
              await sleep(15000);
            } else {
              break;
            }
          }
          if (PeticionConsulta?.obj?.status_trx === "Rechazada") {
            throw new ErrorCustomBackend(
              PeticionConsulta?.msg,
              PeticionConsulta?.msg
            );
          } else if (PeticionConsulta?.obj?.status_trx === "Aprobada") {
            response = PeticionConsulta;
          } else {
            if (PeticionConsulta?.msg === "No ha terminado el reintento") {
              throw new ErrorCustomTimeout(
                `Error respuesta Front-end PDP: Timeout al consumir el servicio (${name_}) [0010002]`,
                "Timeout"
              );
            } else {
              throw new ErrorCustomBackend(
                PeticionConsulta?.msg,
                PeticionConsulta?.msg
              );
            }
          }
        } catch (error) {
          setState(false);
          throw error;
        }
      }
      setState(false);
      return response;
    },
    [setState, url_trx_, url_consulta_, name_]
  );

  return [state, fetchNequiTrx];
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

export class ErrorCustomTimeout extends ErrorCustom {
  constructor(message, error_msg, notificacion = "notifyError") {
    super(message, "ErrorCustomTimeout", error_msg, notificacion);
  }
}
