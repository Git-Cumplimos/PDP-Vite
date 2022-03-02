import { useState } from "react";
import HNavbar from "../../components/Base/HNavbar";
import { useWindowSize } from "../../hooks/WindowSizeHooks";
import { useEffect } from "react";
import { useImgs } from "../../hooks/ImgsHooks";
import Form from "../../components/Base/Form";

const SolicitudEnrolamiento = ({ subRoutes }) => {
  const [temporal, setTemporal] = useState(true);

  const [clientWidth] = useWindowSize();
  const {
    imgs: { personas },
    svgs: { backIcon, backIconSecondary },
  } = useImgs();
  useEffect(() => {
    if (clientWidth > 768) {
      document.body.style.backgroundImage = `url("${personas}"), url("${backIcon}"), url("${backIconSecondary}")`;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "2.5% 100%, center, center";
      document.body.style.backgroundSize = "500px, cover, cover";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [backIcon, personas, backIconSecondary, clientWidth]);
  return (
    <div className="flex flex-row justify-center">
      <Form>
        <HNavbar links={[subRoutes[0]]} isIcon />
        <HNavbar links={[subRoutes[1]]} isIcon />
        {/*         <HNavbar links={[subRoutes[3]]} isIcon />
        <HNavbar links={[subRoutes[5]]} isIcon /> */}
      </Form>
      {/*   <Table></Table> */}
    </div>
  );
};

export default SolicitudEnrolamiento;
