import { useState } from "react";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import Button from "../../components/Base/Button/Button";

const SolicitudEnrolamiento = ({ subRoutes }) => {
  const [temporal, setTemporal] = useState(true);
  return (
    <div>
      {temporal ? (
        <HNavbar links={[subRoutes[0]]} isIcon />
      ) : (
        <HNavbar links={[subRoutes[1]]} isIcon />
      )}
      <div>
        <Button
          type="submit"
          self={false}
          onClick={() => setTemporal((old) => !old)}
        >
          Cambiar Estado
        </Button>
      </div>
    </div>
  );
};

export default SolicitudEnrolamiento;
