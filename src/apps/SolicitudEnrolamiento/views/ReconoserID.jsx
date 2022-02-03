import React from "react";
import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";

const ReconoserID = () => {
  const [procesoConvenioGuid, setProcesoConvenioGuid] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState([]);

  let navigate = useNavigate();
  const params = useParams();
  /* console.log(params.numCedula); */
  useEffect(() => {
    fetch(
      `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/actualizacionestado?numDoc=${params.numCedula}`
    )
      .then((res) => res.json())
      .then((respuesta) => setDatosUsuario(respuesta.obj.results));
  }, []);
  /* console.log(datosUsuario[0]["id_proceso"]); */

  useEffect(() => {
    if (datosUsuario?.length > 0) {
      const datos = {
        id_reconocer: procesoConvenioGuid,
        id_proceso: datosUsuario[0]["id_proceso"],
      };
      fetch(
        `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/actualizacionestado?id_proceso=${datosUsuario[0]["id_proceso"]}`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      )
        .then((res) => res.json())
        .then((respuesta) => console.log(respuesta));
    }
  }, [procesoConvenioGuid, datosUsuario]);

  useEffect(() => {
    const receiver = (event) => {
      if (event.origin !== "https://demorcs.olimpiait.com:6319") {
        return;
      }
      console.log(event);
      if (event.data.for === "resultData") {
        setIsSuccess(event.data.isSuccess);
        setTimeout(() => navigate("/Solicitud-enrolamiento"), 2000);
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

  useEffect(() => {
    if (datosUsuario?.length > 0) {
      const datos = {
        asesor: datosUsuario[0]["asesor"],
        sede: datosUsuario[0]["sede"],
        tipoDoc: datosUsuario[0]["tipodoc"],
        numDoc: datosUsuario[0]["numdoc"],
        email: datosUsuario[0]["email"],
        celular: datosUsuario[0]["celular"],
      };

      fetch(
        `http://servicios-comercios-pdp-dev.us-east-2.elasticbeanstalk.com/solicitudvalidacion`,
        /* `http://127.0.0.1:5000/solicitudvalidacion` */
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      )
        .then((res) => res.json())
        .then(
          (
            respuesta /* console.log(respuesta.obj.data.procesoConvenioGuid) */
          ) => setProcesoConvenioGuid(respuesta.obj.data.procesoConvenioGuid)
        );
    }
  }, [datosUsuario]);

  return (
    <Form grid={true} className="flex flex-col justify-center items-center">
      {/*       <Button type={"submit"} onClick={(e) => comenzarValidacion(e)}>
        comenzar validacion
      </Button> */}

      {procesoConvenioGuid ? (
        <iframe
          src={`https://demorcs.olimpiait.com:6319/#/redirect/${procesoConvenioGuid}`}
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
      ) : (
        ""
      )}
      {isSuccess ? <h1>hola mundo</h1> : ""}
    </Form>
  );
};

export default ReconoserID;
