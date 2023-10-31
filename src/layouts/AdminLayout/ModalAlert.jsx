import Modal from "../../components/Base/Modal";
import { useCallback, useState ,useEffect} from "react";
import { useAuth } from "../../hooks/AuthHooks";
import { useLocation } from "react-router-dom";

const rutaAlert = ['/','/info','/gestion','/seguridad','/solicitudes','/reportes']

const ModalAlert = () => {
  const { quotaInfo} = useAuth();
  const [showModalAlertCupo, setShowModalAlertCupo] = useState(false);
  const { pathname } = useLocation();

  const handleClose = useCallback(() => {
    setShowModalAlertCupo(false);
  }, []);

  useEffect(() => {
    if (rutaAlert.includes(pathname)) {
      if (quotaInfo?.alerta !== '' && quotaInfo?.quota !== 0) {
        let valorLimit = quotaInfo?.alerta
        const valorCupo = quotaInfo?.quota
        const sobregiro = quotaInfo?.sobregirovalue
        if (valorLimit?.includes('%')) {
          let alert = parseFloat(valorLimit.replace("%", ""))
          let porcent = Math.floor(sobregiro*alert)/100
          if (valorCupo < porcent) {
            setShowModalAlertCupo(true)
          }
        }else{
          let alert = parseFloat(valorLimit)
          if(valorCupo <= alert){
            setShowModalAlertCupo(true)
          }
        }
      }
    }
  }, [pathname,quotaInfo]);

  return (
    <Modal show={showModalAlertCupo} handleClose={handleClose}>
      ALERTA DE CUPO EXCEDIDO
    </Modal>
  );
};

export default ModalAlert;
