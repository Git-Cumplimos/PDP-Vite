import { useCallback, useState } from "react";
import { notifyError } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";

//--------- Constantes ------------------
const name_module = "Emcali";
const name_fetch = "fetchEmcali";

//--------- Clases ------------------
export class ErrorFetchEmcali extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorFetchEmcali";
  }
}

//--------- Typing ------------------
type TypePeticion = {
  params?: { [key: string]: any };
  body?: { [key: string]: any };
};

type TypeServicesBackendEmcaliObj = {
  error_status: boolean;
  error_msg: { [key: string]: any } | {};
  result: any;
  valor_total: any;
};

export type TypeServicesBackendEmcali = {
  status: boolean;
  msg: string;
  obj: TypeServicesBackendEmcaliObj;
};

//---------  hook ------------------
export const useFetchEmcali = (
  url: string,
  name: string,
  metodo: "POST" | "PUT" | "GET"
) => {
  const [loadingPeticion, setLoadingPeticion] = useState<boolean>(false);

  const Peticion = useCallback(
    async (params, body): Promise<any> => {
      setLoadingPeticion(true);
      let urlCompleto = url;

      //armar parametros
      try {
        if (metodo === "GET" || metodo === "PUT") {
          if (params !== undefined) {
            const params_: any = params;
            const paramsVector = Object.keys(params).map(
              (valueKey) => `${valueKey}=${params_[valueKey]}`
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
          "Error Sequence": `${name_fetch} - Error al armar parámetros`,
          "Error Console": `${error.message}`,
        });
        setLoadingPeticion(false);
        throw new ErrorFetchEmcali(`${error.message}`);
      }

      //Realizar Peticion
      let Peticion;
      try {
        if (metodo === "GET") {
          Peticion = await fetchData(urlCompleto, "GET", {}, {});
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
          "Error Sequence": `${name_fetch} - Error al realizar Peticion`,
          "Error Console": `${error.message}`,
        });
        setLoadingPeticion(false);
        throw new ErrorFetchEmcali(`${error.message}`);
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
        setLoadingPeticion(false);
        throw new ErrorFetchEmcali(`${error.message}`);
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
        setLoadingPeticion(false);
        throw new ErrorFetchEmcali(`${error.message}`);
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
          throw new ErrorFetchEmcali(`${Peticion?.msg}`);
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
          throw new ErrorFetchEmcali(`${Peticion?.msg}`);
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
          throw new ErrorFetchEmcali(`${Peticion?.msg}`);
        }
      } catch (error: any) {
        if (error instanceof ErrorFetchEmcali) {
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
        setLoadingPeticion(false);
        throw new ErrorFetchEmcali(`${error.message}`);
      }
      setLoadingPeticion(false);
      return Peticion;
    },
    [url, name, metodo]
  );

  return [loadingPeticion, Peticion] as const;
};