import HNavbar from "../components/Base/HNavbar/HNavbar";
import { useUrls } from "../utils/UrlsHooks";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useState } from "react";
import ColpensionesImg from "../assets/img/COLPENSIONES.jpg";
import Banner2 from "../assets/img/BANNER2.jpg";
import { Link } from "react-router-dom";
import AppIcons from "../components/Base/AppIcons/AppIcons";
import ACTUALIZACION from "../assets/svg/ActualizacionDeDatos.svg";
import { useAuth } from "../utils/AuthHooks";

const Home = () => {
  const { urlsPrivApps: urls } = useUrls();
  const { cognitoUser } = useAuth();

  const [emails, setEmails] = useState([
    "directora.mercadeo@puntodepago.com.co",
    "maria.valero@puntodepago.com.co",
  ]);

  const [imgs, setImgs] = useState([]);

  useEffect(() => {
    setImgs([
      { name: "Colpensiones", url: ColpensionesImg },
      { name: "Punto de pago", url: Banner2 },
    ]);
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
        {imgs.map(({ name, url }) => {
          return (
            <div className="aspect-w-16 aspect-h-5" key={url}>
              <img alt={name} src={url} className="object-cover" />
            </div>
          );
        })}
      </Carousel>
      <HNavbar links={urls} isIcon />
      {emails.includes(cognitoUser?.attributes?.email) ? (
        <Link to={"/review-commerce-forms"}>
          <AppIcons
            Logo={ACTUALIZACION}
            name="Revisar actualizacion de datos"
          />
        </Link>
      ) : (
        ""
      )}
    </>
  );
};

export default Home;
