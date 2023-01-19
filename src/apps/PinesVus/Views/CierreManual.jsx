import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { notifyError, notify} from "../../../utils/notify";
import { usePinesVus } from "../utils/pinesVusHooks";
import { enumParametrosPines } from "../utils/enumParametrosPines";
import { useNavigate } from "react-router-dom";


const CierreManual = () => {

  const navigate = useNavigate();

  const { consultaCierreManual, cierreManual } = usePinesVus();
  const [showModal, setShowModal] = useState(false)
  const [disabledBtns, setDisabledBtns] = useState(false)

  const horaCierre = useMemo(() => { 
    const dia = (new Date()).getDay()  
    if (dia === enumParametrosPines.diaFinSemana) {
      return enumParametrosPines.horaCierreFinSemana.split(":")
    }
    else{
      return enumParametrosPines.horaCierre.split(":")
    }
     
  }, [showModal]);

  const onSubmit = (e) => {
    
    setDisabledBtns(true);
    const hora_actual=Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
    const hora = hora_actual.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(hora[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(hora[1])
    if (deltaHora<0 || (deltaHora===0 & deltaMinutos<5) ){
      notifyError("El módulo ya ha sido cerrado desde las " + horaCierre[0] + ":" + horaCierre[1])
      navigate("/PinesVus/Administrar",{replace:true});
    }
    else{
      consultaCierreManual()
      .then((res) => {
        if (!res?.status) {
          cierreManual()
            .then((res) => {
              setDisabledBtns(false);
              if (res?.status) {
                setDisabledBtns(false);
                navigate("/PinesVus/Administrar",{replace:true});
                notify(res?.msg);
              } else {
                setDisabledBtns(false);
                notifyError(res?.msg)
              }
            })
            .catch(() => {
              setDisabledBtns(false);
              console.log("Falla en cierre manual")
            });
        } else {
          setDisabledBtns(false);
          notifyError("Ya se ha realizado el cierre manual")
          navigate("/PinesVus/Administrar",{replace:true});
        }
      })
      .catch(() => {
        setDisabledBtns(false);
        console.log("Falla en consulta estado cierre manual")
      });
    }
  };

  const closeModal = useCallback(async () => {    
    setShowModal(false);      
    setDisabledBtns(false);
  }, []);


  
  return (
    <div className="flex flex-col w-1/2 mx-auto">
    <h1 className="text-3xl mt-6 mx-auto">Cierre Manual</h1>
    <ButtonBar className="col-auto md:col-span-2">
      <Button 
      type="submit"
      onClick={() => {
        setShowModal(true)
      }}
      >
        Cerrar Módulo
      </Button>
    </ButtonBar>
    <Modal show={showModal} handleClose={() => closeModal()}>
      <div className="flex flex-col w-1/2 mx-auto">
      <h1 className="text-3x2 mt-2 mx-auto">¿Desea cerrar el módulo de pines?</h1>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            onSubmit();
          }}
          disabled = {disabledBtns}
        >
          Cerrar Módulo
        </Button>
        <Button
          onClick={() => {
            closeModal();
          }}
        >
          Cancelar
        </Button>
      </ButtonBar>
      </div>
    </Modal>
    </div>
  );
};
export default CierreManual;
