import HNavbar from "../components/Base/HNavbar/HNavbar";
import { useUrls } from "../utils/UrlsHooks";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useMemo } from "react";
import ColpensionesImg from "../assets/img/COLPENSIONES.jpg";
import Banner2 from "../assets/img/BANNER2.jpg";

const Home = () => {
  const { urlsPrivateApps } = useUrls();

  // const [emails, setEmails] = useState([
  //   "directora.mercadeo@puntodepago.com.co",
  //   "maria.valero@puntodepago.com.co",
  // ]);

  const imgs = useMemo(() => {
    return [
      { name: "Colpensiones", url: ColpensionesImg },
      { name: "Punto de pago", url: Banner2 },
    ];
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
      <HNavbar links={urlsPrivateApps} isIcon />
    </>
  );
};

export default Home;
