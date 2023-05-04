import { useCallback, useState } from "react";
import { ErrorCustomBackend, EvaluateResponse, fetchCustom, msgCustomBackend } from "../utils/fetchRunt";
import { notify } from "../../../../utils/notify";
const sleep = (millisecons) => {
    return new Promise((resolve) => setTimeout(resolve, millisecons));
};
export const useFetchRunt = (
    url_trx_ = "",
    url_consulta_ = "",
    name_ = "",
) => {
    const [state, setState] = useState(false);

    const fetchRuntTrx = useCallback(
        async (data_ = {}, data_additional_ = {}) => {
            const fetchTrx = fetchCustom(url_trx_, "POST", `'Trx ${name_}'`,true,false);
            const fetchConsulta = fetchCustom(url_consulta_, "POST", `'Consultar ${name_}'`,false);
            let PeticionTrx;
            let PeticionConsulta;
            let banderaConsulta = false;
            let response;
            setState(true);

            //SECUENCIA ---------------Paso 1-------------------------------
            try {
                PeticionTrx = await fetchTrx({}, data_);
                response = PeticionTrx
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
                        idComercio: data_?.comercio?.id_comercio,
                        idUsuario: data_?.comercio?.id_usuario,
                        idTerminal: data_?.comercio?.id_terminal,
                        id_uuid_trx: data_additional_?.id_uuid_trx,
                    };
                    for (let i = 0; i <= 4; i++) { 
                        PeticionConsulta = await fetchConsulta({}, data_consulta);
                        console.log("PetiionConsulta",PeticionConsulta)
                        if (PeticionConsulta?.obj?.status_trx === "Pendiente") {
                            console.log("ENTRO AL IF")
                            notify("Su transacción esta siendo procesada, no recargue la página")
                            await sleep(15000);
                        } else {
                            console.log("ENTRO AL ELSE")
                            break;
                        } 
                    }
                    if (PeticionConsulta?.obj?.status_trx === "Rechazada") {
                        throw new ErrorCustomBackend(PeticionConsulta?.msg, PeticionConsulta?.msg);
                        } else if (PeticionConsulta?.obj?.status_trx === "Aprobada") {
                            response = PeticionConsulta
                    } else {
                        throw new ErrorCustomBackend(PeticionConsulta?.msg, PeticionConsulta?.msg);
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

    return [state, fetchRuntTrx];
};
