import React from "react";
import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import classes from "./ReconoserID.module.css";
import { notify } from "../../../utils/notify";

const ReconoserID = () => {
  const [procesoConvenioGuid, setProcesoConvenioGuid] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState([]);

  let navigate = useNavigate();
  const params = useParams();
  /* console.log(params.numCedula); */

  const { ContenedorPrincipal } = classes;
  useEffect(() => {
    console.log(params.numCedula);
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?numDoc=${params.numCedula}`
    )
      .then((res) => res.json())
      .then((respuesta) => setDatosUsuario(respuesta.obj.results));
  }, []);
  /* console.log(datosUsuario[0]["id_proceso"]); */
  useEffect(() => {
    if (datosUsuario?.length > 0) {
      /* console.log(datosUsuario); */
      const datos = {
        asesor: datosUsuario[0]["asesor"],
        sede: datosUsuario[0]["sede"],
        tipoDoc: datosUsuario[0]["tipodoc"],
        numDoc: datosUsuario[0]["numdoc"],
        email: datosUsuario[0]["email"],
        celular: datosUsuario[0]["celular"],
      };
      console.log(datos);
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/solicitud-validacion-reconoserid`,
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
        .then((respuesta) =>
          setProcesoConvenioGuid(respuesta.obj.data.procesoConvenioGuid)
        );
    }
  }, [datosUsuario]);

  useEffect(() => {
    if (datosUsuario?.length > 0) {
      console.log(procesoConvenioGuid);
      const datos = {
        id_reconocer: procesoConvenioGuid,
      };
      fetch(
        `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/edit-reconoserid?id_proceso=${datosUsuario[0]["id_proceso"]}`,
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
        setTimeout(
          () => navigate("/public/solicitud-enrolamiento/consultar"),
          2000
        );
      }
    };
    window.addEventListener("message", receiver, false);

    return () => {
      window.removeEventListener("message", receiver, false);
    };
  }, []);

  /*   useEffect(()=>{
    const datos = {
      validation_state: "200",
    };
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?id_proceso=${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta.obj.data));
    [],}) */

  const cambiarEstadoProceso = () => {
    const datos = {
      validation_state: "200",
    };
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_PUBLIC}/edit-reconoserid?id_proceso=${datosUsuario[0]["id_proceso"]}`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta.obj.data));
    notify("Su Proceso ha Termiando con Exito.");
  };
  return (
    <Form grid={true}>
      <div className={ContenedorPrincipal}>
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
            width="95%"
            height="550"
          >
            <p>Your browser does not support iframes.</p>
          </iframe>
        ) : (
          ""
        )}
        {isSuccess ? cambiarEstadoProceso() : ""}
      </div>
    </Form>
  );
};

export default ReconoserID;
