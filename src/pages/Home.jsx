import { useUrls } from "../hooks/UrlsHooks";

import HNavbar from "../components/Base/HNavbar/HNavbar";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useMemo } from "react";
import { useImgs } from "../hooks/ImgsHooks";
import ReconoSERID from "../components/Compound/ReconoSERID/ReconoSERID";

const Home = () => {
  const { urlsPrivateApps } = useUrls();
  const { imgs } = useImgs();

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
      <ReconoSERID />
    </>
  );
};

export default Home;
