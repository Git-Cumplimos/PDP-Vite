import fetchData from "../../../../../../utils/fetchData";
import { notify, notifyError } from "../../../../../../utils/notify";
import { ValidationRetiroEfectivo } from "../utils/ErroresCuztomizados";
const url_retiro_efectivo = `${process.env.REACT_APP_URL_BANCO_AGRARIO}/banco-agrario/retiro-efectivo`;

// export ValidationRetiroEfectivo

export const fetchRetiroEfectivo = async (data_) => {
  try {
    var Peticion = await fetchData(url_retiro_efectivo, "POST", {}, data_);

    try {
      console.log(Peticion);
      if (
        // Para los errores
        !Peticion?.status &&
        Peticion?.obj?.error &&
        Peticion?.obj?.error_msg
      ) {
        const error_msg = Peticion?.obj?.error_msg;
        const error_msg_key = Object.keys(error_msg);
        const error_msg_vector = [];
        error_msg_key.map((nombre_error) => {
          const error_msg_ind = error_msg[nombre_error];
          if (error_msg_ind?.see && error_msg_ind?.see == true) {
            error_msg_vector.push(`${error_msg_ind?.global} (${nombre_error})`);
          }
        });
        console.log("gg");
        if (error_msg_vector.length > 0) {
          notifyError(`Retiro NO EXITOSO >> ${error_msg_vector.join(", ")} `);
        }
        throw new ValidationRetiroEfectivo(`${Peticion?.msg}`);
      }

      if (!Peticion?.status && !Peticion?.obj?.error) {
        // cuando status es false pero no hay errores
        notify(`${Peticion?.msg}`); //cupo insuficiente
        throw new ValidationRetiroEfectivo(`${Peticion?.msg}`);
      }
    } catch (error) {
      if (error instanceof ValidationRetiroEfectivo) {
        throw new ValidationRetiroEfectivo(`${error.message}`);
      } else {
        notifyError(
          "Falla en el sistema: Error con el código del fetch [Front]"
        );
      }
    }
    return Peticion;
  } catch (error) {
    if (error instanceof ValidationRetiroEfectivo) {
      throw new ValidationRetiroEfectivo(`${error.message}`);
    } else {
      notifyError(
        "Falla en el sistema: no conecta con el servicio /banco-agrario/retiro-efectivo"
      );
    }
  }

  try {
    if (!Peticion?.status && Peticion?.obj?.error && Peticion?.obj?.error_msg) {
      const error_msg = Peticion?.obj?.error_msg;
      const error_msg_key = Object.keys(error_msg);
      const error_msg_vector = [];
      error_msg_key.map((nombre_error) => {
        const error_msg_ind = error_msg[nombre_error];
        error_msg_vector.push(`${error_msg_ind.global} [${nombre_error}]`);
      });

      notifyError(`"Falla en el sistema: ${error_msg_vector.join(", ")}`);
    }
  } catch (error) {}
};
