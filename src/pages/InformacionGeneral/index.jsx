import { Fragment, useCallback, useState } from "react";
import HNavbar from "../../components/Base/HNavbar";
import { useUrls } from "../../hooks/UrlsHooks";
import Error403 from "../Error403";
import FileInput from "../../components/Base/FileInput";

const InformacionGeneral = () => {
  const { urlsInformacionGeneral } = useUrls();
  const [imgGet, setImgGet] = useState("");

  const functFiles = useCallback((files) => {
    console.log(files);
    setImgGet(URL.createObjectURL(files[0]));
  }, []);

  if (!urlsInformacionGeneral.length) {
    return <Error403 />;
  }
  return (
    <Fragment>
      <HNavbar links={urlsInformacionGeneral} isIcon />
      <br />
      <br />
      <FileInput
        name="aver"
        id="123_file"
        label={"Cargar"}
        onGetFile={functFiles}
      />
      <img src={imgGet} alt="no img" />
    </Fragment>
  );
};

export default InformacionGeneral;
