import { useUrls } from "../hooks/UrlsHooks";

import HNavbar from "../components/Base/HNavbar/HNavbar";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useMemo, useState } from "react";
import { useImgs } from "../hooks/ImgsHooks";

const Home = () => {
  const { urlsPrivateApps } = useUrls();
  const { imgs } = useImgs();

  const [isSuccess, setIsSuccess] = useState(false);

  // const [emails, setEmails] = useState([
  //   "directora.mercadeo@puntodepago.com.co",
  //   "maria.valero@puntodepago.com.co",
  // ]);

  const imgsCarousel = useMemo(() => {
    const { COLPENSIONES, BANNER2 } = imgs;
    return [
      { name: "Colpensiones", url: COLPENSIONES },
      { name: "Punto de pago", url: BANNER2 },
    ];
  }, [imgs]);

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
    <>
      <Carousel
        autoPlay
        infiniteLoop
        interval={5000}
        transitionTime={1000}
        showArrows={false}
        showThumbs={false}
        showStatus={false}
      >
        {imgsCarousel.map(({ name, url }) => {
          return (
            <div className="aspect-w-16 aspect-h-5" key={url}>
              <img alt={name} src={url} className="object-cover" />
            </div>
          );
        })}
      </Carousel>
      <HNavbar links={urlsPrivateApps} isIcon />
      {isSuccess ? (
        ""
      ) : (
        <iframe
          title="Hola"
          src="https://demorcs.olimpiait.com:6319/#/redirect/fbc8ab99-95ba-40e7-b92f-f43a067baf42"
          className="border-2 border-blueGray-900"
          allow="camera"
          frameBorder="0"
          border="0"
          cellSpacing="0"
          style={{
            // "borderStyle": "none",
            width: "100%",
            height: "770px",
          }}
        ></iframe>
      )}
    </>
  );
};

export default Home;
