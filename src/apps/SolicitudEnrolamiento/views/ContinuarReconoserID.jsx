import React from "react";
import Button from "../../../components/Base/Button";
import Form from "../../../components/Base/Form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import classes from "./ContinuarReconoserID.module.css";
import { notify } from "../../../utils/notify";
const ReconoserID = () => {
  /*   const [procesoConvenioGuid, setProcesoConvenioGuid] = useState(""); */
  const [isSuccess, setIsSuccess] = useState(false);
  /* const [datosUsuario, setDatosUsuario] = useState([]); */

  let navigate = useNavigate();
  const params = useParams();

  const { ContenedorPrincipal } = classes;

  useEffect(() => {
    console.log(params);
    const receiver = (event) => {
      if (event.origin !== "https://demorcs.olimpiait.com:6319") {
        return;
      }
      console.log(event);
      if (event.data.for === "resultData") {
        setIsSuccess(event.data.isSuccess);
        setTimeout(() => navigate("/public/solicitud-enrolamiento"), 2000);
        /* 
        el mensaje que entrega el validador dentro de e.data contiene 
        un mensaje de la siguiente forma: 
        
        { 
          for: 'resultData', // siempre va resultData 
          proccessCode: '6326eea0-ed2b-4d71-814a-ee1c587cdf7a', // guid del proceso 
          isSuccess: true, // indica si la validación es correcta 
          errors: [] // contiene una lista de mensajes en caso de que la validación no pase 
        } 
        
        en caso de isSuccess sea false errors tiene la forma: 
        [ 
          { codigo: '001', descripcion: 'Error al ....'} 
        ]
        */
      }
    };
    window.addEventListener("message", receiver, false);

    return () => {
      window.removeEventListener("message", receiver, false);
    };
  }, []);

  return (
    <Form grid={true}>
      {/*       <Button type={"submit"} onClick={(e) => comenzarValidacion(e)}>
        comenzar validacion
      </Button> */}
      <div className={ContenedorPrincipal}>
        <iframe
          src={`https://demorcs.olimpiait.com:6319/#/redirect/${params.idreconoser}`}
          /* src="https://demorcs.olimpiait.com:6319/#/redirect/abe5e217-d3e3-4922-89cd-efd53ec473cd" */
          className="border-2 border-blueGray-900 "
          allow="camera"
          title="iframe Example 1"
          frameBorder="0"
          border="0"
          cellSpacing="0"
          width="60%"
          height="650"
        >
          <p>Your browser does not support iframes.</p>
        </iframe>
        {isSuccess ? notify("Proceso Exitoso") : ""}
      </div>
    </Form>
  );
};

export default ReconoserID;
