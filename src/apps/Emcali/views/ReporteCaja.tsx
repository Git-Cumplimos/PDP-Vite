import React, { Fragment, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";

import {
    useFetchEmcali,
    TypeServicesBackendEmcali,
    ErrorFetchEmcali,
  } from "../hooks/useFetchEmcali";

//Typing

//Constantes
const url_consulta = `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/reporte-en-caja`;

const ReporteCaja = () => {    
    const [fecha, setFecha] = useState("");
    const [loadingPeticionGeneracionReporte, peticionGeneracionReporte] = useFetchEmcali(
        url_consulta,
        "generacion reporte de caja",
        "POST"
      );
    
    const validNavigate = useNavigate();
    const { roleInfo, pdpUser } = useAuth();

    const onSubmitConsult = (e: any) => {
        e.preventDefault();
        if (fecha === ""){
            notifyError("Seleccione una fecha para generar el reporte")
        }
        else {
            peticionGeneracionReporte({},{'fecha_reporte':fecha})
                .then((res: TypeServicesBackendEmcali)=>{
                    console.log("res-->",res)
                })
                .catch((error: any) => {
                    console.log("CATCH")
                    if (!(error instanceof ErrorFetchEmcali)) {
                        notifyError(
                            `Error respuesta Frontend PDP: Fallo al consumir el servicio (Emcali - generacion reporte de caja) [0010002]`
                        );
                        console.error({
                            "Error PDP":
                            "Fallo al consumir el servicio (Emcali - generacion reporte de caja) [0010002]",
                            "Error Sequence":
                            "ConsultaGeneracionPin - Error en fetch del modulo directamente",
                            "Error Console": `${error.message}`,
                        });
                    }
                })
        }
    };

    return (
        <Fragment>
            <h1 className="text-3xl font-medium my-6">Reporte de caja</h1>       
            <Input
                id="date"
                label="Fecha reporte"
                type="date"
                value={fecha}
                onInput={(e:any) => setFecha(e.target.value)}
            />
            <Button
                type={"submit"}
                onClick={onSubmitConsult}
            >Descargar reporte</Button>       
        </Fragment>
    );
};

export default ReporteCaja;