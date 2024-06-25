import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";

import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import HNavbar from "../../../components/Base/HNavbar";
import { TypingRoutes } from "../../../utils/TypingUtils";

const MenuAlmaseg = ({ subRoutes }: { subRoutes: TypingRoutes[] }) => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

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
    if (roleInfo)
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
  }, [navigate, roleInfo, fetchComercio]);

  return <HNavbar links={subRoutes} isIcon />;
};

export default MenuAlmaseg;
