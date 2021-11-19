import HNavbar from "../components/Base/HNavbar/HNavbar";
import { useUrls } from "../utils/UrlsHooks";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useState } from "react";
import ColpensionesImg from "../assets/img/COLPENSIONES.jpg"

const Home = () => {
  const { urlsPrivApps: urls } = useUrls();

  const [imgs, setImgs] = useState([]);

  useEffect(() => {
    setImgs([
      { name: "Ad1", url: ColpensionesImg },
      // { name: "Ad2", url: "https://picsum.photos/600" },
      // { name: "Ad3", url: "https://picsum.photos/100" },
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
            <div
              className="aspect-w-16 aspect-h-5"
              key={url}
            >
              <img alt={name} src={url} className="object-cover" />
            </div>
          );
        })}
      </Carousel>
      <HNavbar links={urls} isIcon />
    </>
  );
};

export default Home;
