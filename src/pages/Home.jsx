import { useUrls } from "../hooks/UrlsHooks";

import HNavbar from "../components/Base/HNavbar";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useMemo } from "react";
import { useImgs } from "../hooks/ImgsHooks";
import { useWindowSize } from "../hooks/WindowSizeHooks";
import Modal from "../components/Base/Modal";
import { useAuth } from "../hooks/AuthHooks";
// import ReconoSERID from "../components/Compound/ReconoSERID/ReconoSERID";

const urlAssets = import.meta.env.VITE_ASSETS_URL;

const Home = () => {
  const { showModalPublicidad, setShowModalPublicidad } = useAuth();
  const { urlsPrivateApps, urlsCategorias } = useUrls();
  const { banners } = useImgs();
  const [width] = useWindowSize();

  const imgsCarousel = useMemo(() => {
    return Object.entries(banners).map(([name, url]) => ({ name, url }));
  }, [banners]);

  return (
    <>
      <Modal show={showModalPublicidad} handleClose={() => setShowModalPublicidad(false)}>
        <img
          src={`${urlAssets}/assets/svg/recaudo/MODAL_PUBLICIDAD/MODAL_PUBLICIDAD.jpg`}
          alt="Informacion punto de pago"
        />
      </Modal>
      <Carousel
        autoPlay
        infiniteLoop
        interval={5000}
        transitionTime={1000}
        showArrows={false}
        showThumbs={false}
        showStatus={false}
        showIndicators={width > 1024}
        className="hidden w-3/4 mx-auto md:block"
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
      <HNavbar links={urlsCategorias} isIcon title="Productos" />
      {/* <ReconoSERID /> */}
    </>
  );
};

export default Home;
