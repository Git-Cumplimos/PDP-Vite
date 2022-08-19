import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HNavbar from "../../../components/Base/HNavbar";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import { postConsultaTotalDavivienda } from "./utils/fetchParametrosDavivienda";

const CorresponsaliaGrupoAval = ({ subRoutes }) => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
      fetchIdTotalComercio();
    }
  }, []);
  const fetchIdTotalComercio = useCallback(() => {
    postConsultaTotalDavivienda({
      pk_comercio: roleInfo?.id_comercio ?? 0,
    })
      .then((autoArr) => {
        if (!autoArr?.status) {
          notifyError("El comercio no tiene un ID relacionado a Grupo Aval");
          // navigate("/");
          return;
        }
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
      })
      .catch((err) => console.error(err));
  }, [roleInfo, navigate]);

  return <HNavbar links={subRoutes} isIcon />;
};

export default CorresponsaliaGrupoAval;
