import React, { Fragment, useState, useEffect } from "react";
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
type TypeDataInput = {
    filename: string;
  };
//Constantes
const dataInitial: number[] = [];
const dataInputInitial = {
    filename: "",
  };
const url_consulta = `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/reporte-en-caja`;
const url_descarga = `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/read-reporte-caja-s3`;
// const url_descarga = `http://emcali-servicios-pdp-bk-cert.us-east-2.elasticbeanstalk.com/backend_emcali/read-reporte-caja-s3?filename=reporteCaja_2023-08-07.xlsx`;

const ReporteCaja = () => {    
    const [fecha, setFecha] = useState("");
    const [dataInput, setDataInput] = useState<TypeDataInput>(dataInputInitial);
    const [loadingPeticionGeneracionReporte,peticionGeneracionReporte] = useFetchEmcali(
        url_consulta,
        "generacion reporte de caja",
        "POST"
    );
    const [loadingPeticionDescargaReporte,peticionDescargaReporte] = useFetchEmcali(
        url_descarga,
        "descarga reporte de caja",
        "GET"
    );
    const [showTable,setShowTable] = useState(false)
    const [data, setData] = useState(dataInitial);
    const { roleInfo } = useAuth();
  
    const descargarReporte = (()=>{
        peticionDescargaReporte(dataInput,{})
            .then((res:any)=>{
                if (!res.status) {
                    notifyError(res?.msg);
                }
                window.open(res?.obj,"_blank");
            })
            .catch((error: any) => {
                if (!(error instanceof ErrorFetchEmcali)) {
                    notifyError(
                        `Error respuesta Frontend PDP: Fallo al consumir el servicio (Emcali - descarga reporte de caja) [0010002]`
                    );
                    console.error({
                        "Error PDP":
                        "Fallo al consumir el servicio (Emcali - descarga reporte de caja) [0010002]",
                        "Error Sequence":
                        "ConsultaGeneracionPin - Error en fetch del modulo directamente",
                        "Error Console": `${error.message}`,
                    });
                }
            })
    })

    const onSubmitConsult = (e: any) => {
        e.preventDefault();
        if (fecha === ""){
            notifyError("Seleccione una fecha para generar el reporte")
        }
        else {
            peticionGeneracionReporte({},{'fecha_reporte':fecha,'comercio':roleInfo?.["nombre_comercio"]})
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
                        descargarReporte();
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

    useEffect(()=>{
        if (roleInfo?.["nombre_comercio"] !== undefined){
            const comercio: string = roleInfo?.["nombre_comercio"];
            const nombre_comercio = comercio.replace(/[^a-zA-Z0-9]/g, '');
            const filename_= `reporteCaja_${nombre_comercio}_${fecha}.xlsx`;
            setDataInput((old) => ({
                ...old,
                filename: filename_,
            }));
        }
    },[fecha])

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