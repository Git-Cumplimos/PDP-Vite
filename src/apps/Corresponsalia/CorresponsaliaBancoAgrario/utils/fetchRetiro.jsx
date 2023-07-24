import fetchData from "../../../../utils/fetchData";
import { notifyError } from "../../../../utils/notify";

const url_retiro_efectivo = `${process.env.REACT_APP_URL_BANCO_AGRARIO}/banco-agrario/retiro-efectivo`;

export class ValidationRetiroEfectivo extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationRetiroEfectivo";
  }
}

export const fetchRetiroEfectivo = async (data_) => {
  let Peticion;
  //Realizar Peticion
  try {
    Peticion = await fetchData(url_retiro_efectivo, "POST", {}, data_);
  } catch (error) {
    notifyError(
      "Error respuesta Frontend PDP: Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]"
    );
    console.error({
      "Error PDP":
        "Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]",
      "Error Sequence": "fetchRetiroEfectivo - Error con la petición del fetch",
      "Error Console": `${error.message}`,
    });
    throw new ValidationRetiroEfectivo(`${Peticion?.msg}`);
  }

  //Evaluar si la respuesta es json
  try {
    if (typeof Peticion !== "object") {
      throw new Error("Pagina no encontrada");
    }
  } catch (error) {
    notifyError(
      "Error respuesta Frontend PDP: Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]"
    );
    console.error({
      "Error PDP":
        "Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]",
      "Error Sequence": "fetchRetiroEfectivo - Evaluar si la respuesta es json",
      "Error Console": `${error.message}`,
    });
    throw error;
  }

  //evaluar respuesta de api gateway
  try {
    if (Peticion?.hasOwnProperty("status") === false) {
      //No es una respuesta directamente del servicio sino del api gateway
      if (Peticion?.hasOwnProperty("message") === true) {
        if (Peticion.message === "Endpoint request timed out") {
          throw new Error(
            "Api gateway respondio -> Endpoint request timed out"
          );
        } else {
          throw new Error(`Api gateway respondio -> ${Peticion?.message}`);
        }
      }
    }
  } catch (error) {
    notifyError(
      "Error respuesta Frontend PDP: Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]"
    );
    console.error({
      "Error PDP":
        "Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]",
      "Error Sequence":
        "fetchRetiroEfectivo - evaluar respuesta de api gateway",
      "Error Console": `${error.message}`,
    });
    throw error;
  }

  //Evaluar peticion
  try {
    if (
      // Evaluar la respuesta de la peticion, cuando status es false pero hay errores
      !Peticion?.status &&
      (Peticion?.obj?.error || Peticion?.obj?.error_status) &&
      Peticion?.obj?.error_msg
    ) {
      console.error({
        "Error PDP": `${Peticion?.msg}`,
        "Error Sequence":
          "fetchRetiroEfectivo - Evaluar la respuesta de la peticion, cuando status es false pero hay errores",
        "Error Console": "Error que proviene del backend",
      });
      throw new ValidationRetiroEfectivo(`${Peticion?.msg}`);
    } else if (
      // Evaluar la respuesta de la peticion, cuando status es false pero no hay errores
      !Peticion?.status &&
      (!Peticion?.obj?.error || !Peticion?.obj?.error_status)
    ) {
      console.error({
        "Error PDP": `${Peticion?.msg}`,
        "Error Sequence":
          "fetchRetiroEfectivo - Evaluar la respuesta de la peticion, cuando status es false pero no hay errores",
        "Error Console": "Msg que proviene del backend",
      });
      throw new ValidationRetiroEfectivo(`${Peticion?.msg}`);
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
      throw new ValidationRetiroEfectivo(`${Peticion?.msg}`);
    }
  } catch (error) {
    if (error instanceof ValidationRetiroEfectivo) {
      notifyError(`${error.message}`);
    } else {
      notifyError(
        "Error respuesta Frontend PDP: Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]"
      );
      console.error({
        "Error PDP":
          "Fallo al consumir el servicio (banco agrario - retiro otp) [0010002]",
        "Error Sequence": "fetchRetiroEfectivo - Evaluar peticion",
        "Error Console": `${error.message}`,
      });
    }
    throw new ValidationRetiroEfectivo(`${error.message}`);
  }
  return Peticion;
};
