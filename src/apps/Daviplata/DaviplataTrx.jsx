import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HNavbar from "../../components/Base/HNavbar";
import { useAuth } from "../../hooks/AuthHooks";
import { notifyError } from "../../utils/notify";

const DaviplataTrx = ({ subRoutes }) => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  useEffect(() => {
    if (Object.keys(roleInfo).length === 0) {
      navigate(-1);
    } else {
      let hasKeys = true;
      const keys = [
        "id_comercio",
        "id_usuario",
        "tipo_comercio",
        "id_dispositivo",
        "ciudad",
        "direccion",
      ];
      for (const key of keys) {
        if (!(key in roleInfo)) {
          hasKeys = false;
          break;
        }
      }
      if (!hasKeys) {
        notifyError(
          "El usuario no cuenta con datos de comercio, no se permite la transaccion"
        );
        navigate(-1);
      }
    }
  }, [roleInfo, navigate]);

  return <HNavbar links={subRoutes} isIcon />;
};

export default DaviplataTrx;
