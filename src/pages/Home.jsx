import HNavbar from "../components/Base/HNavbar/HNavbar";
import { useUrls } from "../utils/UrlsHooks";

import AWS from "aws-sdk";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useEffect, useMemo, useState } from "react";
import ColpensionesImg from "../assets/img/COLPENSIONES.jpg";
import Banner2 from "../assets/img/BANNER2.jpg";
// import { notifyError } from "../utils/notify";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const S3_BUCKET = process.env.REACT_APP_BUCKET_CMS;
const REGION = process.env.REACT_APP_REGION;

const bucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

const Home = () => {
  const { urlsPrivateApps } = useUrls();

  // const [emails, setEmails] = useState([
  //   "directora.mercadeo@puntodepago.com.co",
  //   "maria.valero@puntodepago.com.co",
  // ]);

  const [imgTry, setImgTry] = useState(null);

  const imgs = useMemo(() => {
    return [
      { name: "Colpensiones", url: ColpensionesImg },
      { name: "Punto de pago", url: Banner2 },
    ];
  }, []);

  useEffect(() => {
    const params = {
      Bucket: S3_BUCKET,
      Key: "Presentacion.jpg",
    };
    bucket.getObject(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else setImgTry(data);
    });
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
        <div className="aspect-w-16 aspect-h-5">
          <img
            src={URL.createObjectURL(
              new Blob([imgTry?.Body], { type: "image/png" })
            )}
            alt="Img try"
            className="object-cover"
          />
        </div>
      </Carousel>
      <HNavbar links={urlsPrivateApps} isIcon />
    </>
  );
};

export default Home;
