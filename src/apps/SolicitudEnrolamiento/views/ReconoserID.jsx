import React from "react";
import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import { useState, useEffect } from "react";

const ReconoserID = () => {
  const [procesoConvenioGuid, setProcesoConvenioGuid] = useState("");
  useEffect(() => {
    const datos = {
      asesor: "",
      sede: "Bogota",
      tipoDoc: "CC",
      numDoc: 1030652074,
      email: "aitortilla@fundacionmujer.co",
      celular: 3504629570,
    };

    return fetch(`http://127.0.0.1:5000/solicitudvalidacion`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(datos),
    })
      .then((res) => res.json())
      .then((respuesta) =>
        setProcesoConvenioGuid(respuesta.obj.data.procesoConvenioGuid)
      );
  }, []);

  return (
    <Form grid={true}>
      {/*       <Button type={"submit"} onClick={(e) => comenzarValidacion(e)}>
        comenzar validacion
      </Button> */}

      {procesoConvenioGuid ? (
        <iframe
          src={`https://demorcs.olimpiait.com:6319/#/redirect/${procesoConvenioGuid}`}
          /* src="https://demorcs.olimpiait.com:6319/#/redirect/abe5e217-d3e3-4922-89cd-efd53ec473cd" */
          allow="camera"
          title="iframe Example 1"
          width="90%"
          height="600"
        >
          <p>Your browser does not support iframes.</p>
        </iframe>
      ) : (
        ""
      )}
    </Form>
  );
};

export default ReconoserID;
