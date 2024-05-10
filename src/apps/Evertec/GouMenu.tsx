import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthHooks";
import { useCallback, useEffect } from "react";
import { notifyError } from "../../utils/notify";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import { TypingRoutes } from "../../utils/TypingUtils";

const GouMenu = ({ subRoutes }: { subRoutes: TypingRoutes[] }) => {
  const navigate = useNavigate();
  const { roleInfo }: any = useAuth();

  const fetchComercio = useCallback(() => {
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
      navigate("/");
    }
  }, [roleInfo, navigate]);

  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
      fetchComercio();
    }
  }, [fetchComercio, navigate, roleInfo]);

  return <HNavbar links={subRoutes} isIcon />;
};

export default GouMenu;
