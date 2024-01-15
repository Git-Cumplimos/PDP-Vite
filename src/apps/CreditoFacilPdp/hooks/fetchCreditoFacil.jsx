import { useCallback, useState } from "react";
import { ErrorCustomBackend, fetchCustom } from "../utils/fetchCreditoFacil";
import { notify, notifyError } from "../../../utils/notify";
import { cifrarAES, decryptAES } from "../../../utils/cryptoUtils";
import fetchData from "../../../utils/fetchData";

const URL_DESCARGAR_SIMULACION = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/descarga-simulacion-credito`;
const URL_TERMINOS_CONDICIONES = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/terminos-condiciones-comercios`;
const URL_ENVIAR_CODIGO_OTP = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/generar-codigo-otp`;
const URL_CONSULTAR_CREDITOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil-cea-crc/consulta-creditos`;


const sleep = (millisecons) => {
  return new Promise((resolve) => setTimeout(resolve, millisecons));
};
export const useFetchCreditoFacil = (
  url_trx_ = "",
  url_consulta_ = "",
  name_ = ""
) => {
  const [state, setState] = useState(false);

  const fetchCreditoFacilTrx = useCallback(
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
      let response;
      setState(true);

      //SECUENCIA ---------------Paso 1-------------------------------
      try {
        PeticionTrx = await fetchTrx({}, data_);
        response = PeticionTrx;
      } catch (error) {
        if (error.name === "ErrorCustomTimeout") {
          banderaConsulta = true;
        } else {
          setState(false);
          throw error;
        }
      }

      //SECUENCIA ---------------Paso 2-------------------------------
      if (banderaConsulta) {
        try {
          let data_consulta = {
            id_comercio: data_?.comercio?.id_comercio,
            id_terminal: data_?.comercio?.id_terminal,
            id_uuid_trx: data_additional_?.id_uuid_trx,
          };
          for (let i = 0; i <= 4; i++) {
            let parseObjConsulta = JSON.stringify(data_consulta);
            let dataObjConsulta = {
              data: cifrarAES(
                `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
                `${process.env.REACT_APP_IV_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
                parseObjConsulta
              ),
            };
            PeticionConsulta = await fetchConsulta({}, dataObjConsulta);
            const dataDecryptConsulta = PeticionConsulta?.obj?.data ?? "";
            const objConsulta = decryptAES(
              `${process.env.REACT_APP_LLAVE_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
              `${process.env.REACT_APP_IV_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
              dataDecryptConsulta
            );
            PeticionConsulta.obj = JSON.parse(objConsulta);
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

  return [state, fetchCreditoFacilTrx];
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

export const postDescargarSimulacion = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
      `${process.env.REACT_APP_IV_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
      parseObj
    ),
  };
  try {
    const res = await fetchData(
      `${URL_DESCARGAR_SIMULACION}`,
      "POST",
      {},
      dataObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    if (JSON.stringify(res?.obj) !== JSON.stringify({})) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${process.env.REACT_APP_LLAVE_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
        `${process.env.REACT_APP_IV_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const postTerminosCondiciones = async () => {
  try {
    const res = await fetchData(URL_TERMINOS_CONDICIONES, "GET");
    return res;
  } catch (err) {
    console.error(err);
  }
};

export const postEnviarCodigoOtp = async (bodyObj) => {
  if (!bodyObj) {
    return "Sin datos body";
  }
  let parseObj = JSON.stringify(bodyObj);
  let dataObj = {
    data: cifrarAES(
      `${process.env.REACT_APP_LLAVE_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
      `${process.env.REACT_APP_IV_AES_ENCRYPT_CORRESPONSALIA_OTROS}`,
      parseObj
    ),
  };
  try {
    const res = await fetchData(
      `${URL_ENVIAR_CODIGO_OTP}`,
      "POST",
      {},
      dataObj
    );
    if (!res?.status) {
      console.error(res?.msg);
    }
    if (JSON.stringify(res?.obj) !== JSON.stringify({})) {
      const dataDecrypt = res?.obj?.data;
      const obj = decryptAES(
        `${process.env.REACT_APP_LLAVE_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
        `${process.env.REACT_APP_IV_AES_DECRYPT_CORRESPONSALIA_OTROS}`,
        dataDecrypt
      );
      res.obj = JSON.parse(obj);
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const postConsultaCreditosCEACRC = async () => {
  try {
    const res = await fetchData(URL_CONSULTAR_CREDITOS, "GET");
    return res;
  } catch (err) {
    console.error(err);
  }
};