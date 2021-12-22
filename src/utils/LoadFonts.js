import AWS from "aws-sdk";
import { fonts } from "./AssetsObjects";

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

const allFonts = fonts;

const loadFonts = () => {
  for (const { fontName, fontParams } of allFonts) {
    const params = {
      Bucket: S3_BUCKET,
      Key: fontName,
    };
    bucket.getObject(params, (err, data) => {
      if (err) console.error(fontName, err);
      else {
        const fonts = new FontFace("Montserrat", data?.Body, fontParams);
        fonts
          .load()
          .then((loadedFont) => {
            document.fonts.add(loadedFont);
          })
          .catch((err) => console.error(err));
      }
    });
  }
};

loadFonts();