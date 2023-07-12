import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";

const name_module = "Almaseg";
const name_fetch = "fetchAlmaseg";

//--------- Clases ------------------
export class ErrorFetchAlmaseg extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorFetchAlmaseg";
  }
}

//--------- Typing ------------------
type TypeServicesBackendAlmasegObj = {
  error_status: boolean;
  error_msg: { [key: string]: any } | {};
  result: any;
};

export type TypeServicesBackendAlmaseg = {
  status: boolean;
  msg: string;
  obj: TypeServicesBackendAlmasegObj;
};

//--------- fetch ------------------
export const fetchAlmaseg = (
  url: string,
  name: string,
  metodo: "POST" | "PUT" | "GET"
) => {
  return async (
    params: { [key: string]: any } | {},
    body: { [key: string]: any } = {}
  ) => {
    let urlCompleto = url;
    //armar parametros
    try {
      if (metodo === "GET" || metodo === "PUT") {
        if (Object.keys(params).length > 0) {
          let paramsVector = Object.keys(params);
          const params_: any = params;
          paramsVector.map(
            (valueKey, index) =>
              (paramsVector[index] = `${valueKey}=${params_[valueKey]}`)
          );
          urlCompleto += `?${paramsVector.join("&")}`;
        }
      }
    } catch (error: any) {
      notifyError(
        `Error respuesta Frontend PDP: Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`
      );
      console.error({
        "Error PDP": `Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`,
        "Error Sequence": `${name_fetch} - Error al armar parametros`,
        "Error Console": `${error.message}`,
      });
      throw new ErrorFetchAlmaseg(`${error.message}`);
    }

    //Realizar Peticion
    let Peticion;
    try {
      if (metodo === "GET") {
        Peticion = await fetchData(urlCompleto, "GET", {}, {}, {}, true);
      } else if (metodo === "PUT") {
        Peticion = await fetchData(urlCompleto, "PUT", {}, body, {}, true);
      } else if (metodo === "POST") {
        Peticion = await fetchData(urlCompleto, "POST", {}, body, true);
      }
    } catch (error: any) {
      notifyError(
        `Error respuesta Frontend PDP: Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`
      );
      console.error({
        "Error PDP": `Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`,
        "Error Sequence": `${name_fetch} - Error al armar parametros`,
        "Error Console": `${error.message}`,
      });
      throw new ErrorFetchAlmaseg(`${error.message}`);
    }

    //Evaluar si la respuesta es json
    try {
      if (typeof Peticion !== "object") {
        throw new Error(`Servicio no encontrado (${name})`);
      }
    } catch (error: any) {
      notifyError(
        `Error respuesta Frontend PDP: Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`
      );
      console.error({
        "Error PDP": `Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`,
        "Error Sequence": `${name_fetch} - Error al evaluar si la respuesta es json`,
        "Error Console": `${error.message}`,
      });
      throw new ErrorFetchAlmaseg(`${error.message}`);
    }

    //evaluar respuesta de api gateway
    try {
      if (Peticion?.hasOwnProperty("status") === false) {
        //No es una respuesta directamente del servicio sino del api gateway
        if (Peticion?.hasOwnProperty("message") === true) {
          if (Peticion.message === "Endpoint request timed out") {
            throw new Error(`${Peticion.message}`);
          } else {
            throw new Error(`${Peticion.message}`);
          }
        }
      }
    } catch (error: any) {
      notifyError(
        `Error respuesta Frontend PDP: Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`
      );
      console.error({
        "Error PDP": `Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`,
        "Error Sequence": `${name_fetch} - Error al evaluar respuesta de api gateway`,
        "Error Console": `${error.message}`,
      });
      throw new ErrorFetchAlmaseg(`${error.message}`);
    }

    //Evaluar peticion
    try {
      if (
        // Evaluar la respuesta de la peticion, cuando status es false pero hay errores
        !Peticion?.status &&
        Peticion?.obj?.error_status &&
        Peticion?.obj?.error_msg
      ) {
        console.error({
          "Error PDP": `${Peticion?.msg}`,
          "Error Sequence":
            "fetchRetiroEfectivo - Evaluar la respuesta de la peticion, cuando status es false pero hay errores",
          "Error Console": "Error que proviene del backend",
        });
        throw new ErrorFetchAlmaseg(`${Peticion?.msg}`);
      } else if (
        // Evaluar la respuesta de la peticion, cuando status es false pero no hay errores
        !Peticion?.status &&
        !Peticion?.obj?.error_status
      ) {
        console.error({
          "Error PDP": `${Peticion?.msg}`,
          "Error Sequence":
            "fetchRetiroEfectivo - Evaluar la respuesta de la peticion, cuando status es false pero no hay errores",
          "Error Console": "Msg que proviene del backend",
        });
        throw new ErrorFetchAlmaseg(`${Peticion?.msg}`);
      } else if (
        // Evaluar la respuesta de la peticion, cuando status es false pero no se sabe si hay errores
        !Peticion?.status
      ) {
        console.error({
          "Error PDP": `${Peticion?.msg}`,
          "Error Sequence":
            "fetchRetiroEfectivo - Evaluar la respuesta de la peticion, cuando status es false pero no se sabe si hay errores",
          "Error Console": "Msg que proviene del backend",
        });
        throw new ErrorFetchAlmaseg(`${Peticion?.msg}`);
      }
    } catch (error: any) {
      if (error instanceof ErrorFetchAlmaseg) {
        notifyError(`${error.message}`);
      } else {
        notifyError(
          `Error respuesta Frontend PDP: Fallo al consumir el servicio (${name_module} - ${name}) [0010002]`
        );
        console.error({
          "Error PDP":
            "Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]",
          "Error Sequence": "fetchRetiroEfectivo - Evaluar peticion",
          "Error Console": `${error.message}`,
        });
      }
      throw new ErrorFetchAlmaseg(`${error.message}`);
    }
    return Peticion;
  };
};
