import { useCallback, useEffect } from "react";
import HNavbar from "../../../../components/Base/HNavbar/HNavbar";
import { useAuth } from "../../../../hooks/AuthHooks";
import { fetchGetDataOficinasValidation } from "../../utils/tarifas";
import { notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";

const Cerolio = ({ subRoutes }) => {
  const { roleInfo } = useAuth();
  const navigate = useNavigate();

  const validateComercio = useCallback(async () => {
    try {
      const res = await fetchGetDataOficinasValidation(roleInfo.id_comercio);
      if (res.results.length > 0) {
        return res;
      } else {
        notifyError("El comercio actual no está relacionado a Cerolío.");
        navigate(-1);
      }
    } catch (err) {
      throw err;
    }
  }, [roleInfo]);

  useEffect(() => {
    if (!roleInfo.id_comercio) {
      notifyError("No se pudo obtener la información del comercio.");
      navigate(-1);
      return;
    }
    validateComercio();
  }, [roleInfo, validateComercio]);

  return <HNavbar links={subRoutes} isIcon />;
};

export default Cerolio;

