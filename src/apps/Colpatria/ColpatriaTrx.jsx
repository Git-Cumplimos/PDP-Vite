import { Navigate } from "react-router-dom";
import HNavbar from "../../components/Base/HNavbar";
import { useAuth } from "../../hooks/AuthHooks";
import { notifyError } from "../../utils/notify";

const keys = [
  "id_comercio",
  "id_usuario",
  "tipo_comercio",
  "id_dispositivo",
  "ciudad",
  "direccion",
];

const ColpatriaTrx = ({ subRoutes }) => {
  const { roleInfo } = useAuth();

  if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
    return <Navigate to={"/"} replace />;
  }

  let hasKeys = true;
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
    return <Navigate to={"/"} replace />;
  }

  return <HNavbar links={subRoutes} isIcon />;
};

export default ColpatriaTrx;
