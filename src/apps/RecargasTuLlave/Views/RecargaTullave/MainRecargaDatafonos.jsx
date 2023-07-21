import { useNavigate } from "react-router-dom";
import ConsultaDatafonos from "../../components/ConsultaDatafonos/ConsultaDatafonos";
import { useAuth } from "../../../../hooks/AuthHooks";

const MainRecargaDatafonos = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();
  return (
    <ConsultaDatafonos
      navigate={navigate}
      type='Recargar'
      id_comercio={roleInfo?.id_comercio}
    />
  );
};

export default MainRecargaDatafonos;
