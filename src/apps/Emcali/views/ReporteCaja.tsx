import React, { Fragment, useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise/TableEnterprise";
import Table from "../../../components/Base/Table/Table";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";

import {
    useFetchEmcali,
    TypeServicesBackendEmcali,
    ErrorFetchEmcali,
  } from "../hooks/useFetchEmcali";

//Typing

//Constantes
const dataInitial: number[] = [];
const url_consulta = `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/reporte-en-caja`;

const ReporteCaja = () => {    
    const [fecha, setFecha] = useState("");
    const [loadingPeticionGeneracionReporte, peticionGeneracionReporte] = useFetchEmcali(
        url_consulta,
        "generacion reporte de caja",
        "POST"
    );
    const [showTable,setShowTable] = useState(false)
    const [data, setData] = useState(dataInitial);
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
                    if (res.obj.result.length !== 0) {
                        var respuesta = [];
                        var result = res.obj.result;
                        for (let i = 0; i < result.length; i++) {
                            respuesta.push(result[i]);
                        }
                        respuesta.push([
                            "Totalizado de cupones",
                            result.length,
                            res.obj.valor_total,
                        ]);
                      
                        setShowTable(true);
                        setData(respuesta);
                    }
                    else {
                        notifyError(res.msg); 
                        setShowTable(false);
                    }
                })
                .catch((error: any) => {
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
            { showTable ? (                
                <Table
                    title="Reporte general"
                    headers={[
                    "Cupón",
                    "Fecha y hora",
                    "Valor",
                    ]}
                    data={data}
                    onSelectRow={() => {}}x
                ></Table>                
            ):(" ")}
        </Fragment>
    );
};

export default ReporteCaja;