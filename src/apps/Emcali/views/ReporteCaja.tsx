import React, { Fragment, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";

import Select from "../../../components/Base/Select/Select";
import classes from "./NotificacionPago.module.css";
import Form from "../../../components/Base/Form/Form";
import BarcodeReader from "../../../components/Base/BarcodeReader/BarcodeReader";

//Constantes Style
const { styleComponents } = classes;

//Typing
type TypingInputData = {
  numcupon: string;
};
//Constantes
const inputDataInitial: TypingInputData = {
  numcupon: "",
};

const ReporteCaja = () => {    
    const [fecha, setFecha] = useState("");
    
    const [inputData, setInputData] = useState<TypingInputData>(inputDataInitial);
    const validNavigate = useNavigate();
    const { roleInfo, pdpUser } = useAuth();

    const onSubmitConsult = (e: any) => {
        e.preventDefault();
        if (fecha === ""){
            notifyError("Seleccione una fecha para generar el reporte")
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