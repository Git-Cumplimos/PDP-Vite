import { useCallback, useEffect } from "react";
import HNavbar from "../../../../components/Base/HNavbar/HNavbar";
import { useAuth } from "../../../../hooks/AuthHooks";
import { fetchGetDataOficinas } from "../../utils/tarifas";
import { notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";

const Cerolio = ({ subRoutes }) => {
  const { roleInfo } = useAuth();
  const navigate = useNavigate();

  const validateComercio = useCallback(async () => {
    try {
      const res = await fetchGetDataOficinas(roleInfo.id_comercio);
      console.log(res);
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
    validateComercio();
  }, [roleInfo, validateComercio]);

  return <HNavbar links={subRoutes} isIcon />;
};

export default Cerolio;

