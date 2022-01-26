import { useEffect, useState } from "react";

const ReconoSERID = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const receiver = (event) => {
      if (event.origin !== "https://demorcs.olimpiait.com:6319") {
        return;
      }
      console.log(event);
      if (event.data.for === "resultData") {
        setIsSuccess(event.data.isSuccess);
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
    <div>
      {isSuccess ? (
        ""
      ) : (
        <iframe
          title="Hola"
          src="https://demorcs.olimpiait.com:6319/#/redirect/f02b426a-cae8-4d69-87be-3ae94ea94df7"
          className="border-2 border-blueGray-900 w-full"
          allow="camera"
          frameBorder="0"
          border="0"
          cellSpacing="0"
          style={{ height: "770px" }}
        ></iframe>
      )}
    </div>
  );
};

export default ReconoSERID;
