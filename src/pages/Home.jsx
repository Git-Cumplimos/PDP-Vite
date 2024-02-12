import { useUrls } from "../hooks/UrlsHooks";

import HNavbar from "../components/Base/HNavbar";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useMemo,  } from "react";
import { useImgs } from "../hooks/ImgsHooks";
import { useWindowSize } from "../hooks/WindowSizeHooks";
// import ReconoSERID from "../components/Compound/ReconoSERID/ReconoSERID";

const Home = () => {
  const { urlsPrivateApps, urlsCategorias } = useUrls();
  const { banners } = useImgs();
  const [width] = useWindowSize();

  // const [emails, setEmails] = useState([
  //   "directora.mercadeo@puntodepago.com.co",
  //   "maria.valero@puntodepago.com.co",
  // ]);

  const imgsCarousel = useMemo(() => {
    return Object.entries(banners).map(([name, url]) => ({ name, url }));
  }, [banners]);

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
        showIndicators={width > 1024}
        className="w-3/4 mx-auto hidden md:block"
      >
        {imgsCarousel.map(({ name, url }) => {
          return (
            <div className="aspect-w-16 aspect-h-2" key={url}>
              <img alt={name} src={url} className="object-cover" />
            </div>
          );
        })}
      </Carousel>
      <HNavbar links={urlsPrivateApps} isIcon title="General" />
{/*      {JSON.stringify(urlsCategorias)}*/}
      <HNavbar links={urlsCategorias} isIcon title="Productos" />
      {/* <ReconoSERID /> */}
    </>
  );
};

export default Home;
