import { useParams, useHistory, useLocation } from "react-router-dom";
import Select from "../../../components/Base/Select/Select";
import CargaArchivos from "../Views/CargaArchivos";
import DescargarArchivos from "../Views/DescargarArchivos";
import CrearRoles from "../Views/CrearRoles";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import Form from "../../../components/Base/Form/Form";
import { useState, useEffect, useCallback} from "react";
import SortForm from "../components/SortForm/SortForm";
import {toast}  from "react-toastify";

import { useLoteria } from "../utils/LoteriaHooks";
import { useAuth } from "../../../utils/AuthHooks";

import dayjs from 'dayjs';
import { ConsoleLogger } from "@aws-amplify/core";

const AdminLoteria = () => {
  const history = useHistory();
  const { page } = useParams();
  const { pathname } = useLocation();

  const [day, setDay] = useState('');
  const [hora, setHora] = useState('');


  const [showModal, setShowModal] = useState(false);

  const closeModal = useCallback(() => {
    setShowModal(false);
    
  });

  


  useEffect(() => {
    setDay(dayjs().day())
    setHora(dayjs().format('HH'))
    
  }, []);

  const SelectPage = () => {
    switch (page) {
      case "cargar":
        return <CargaArchivos />;

      case "descargar":
        return <DescargarArchivos />;
      
      case "crear_rol":
        return <CrearRoles />
      default:
        return "";
    }
  };

  const check = () => {
    const posib = [];
    const opts = [{ value: "", label: "" }];
    opts.push(
      { value: "cargar", label: "Cargar archivos" },
      { value: "descargar", label: "Descargar archivos" },
      { value: "crear_rol", label: "Crear un usuario" }
    );
    posib.push("cargar", "descargar", "crear_rol");
    return [[...opts], [...posib]];
  };

  const [options, posibles] = check();



  const [respCon, setRespCon] = useState('');
  const [disabledBtns, setDisabledBtns] = useState(false); 

  
  const { ConsultaCrearSort } = useLoteria();
  const { consulta_roles  } = useAuth();

  useEffect(() => {
    consulta_roles()
    .then((res) => {
         
        
    })
    
  }, [])
    
  const onSubmit = (e) => {
    e.preventDefault();
    
    ConsultaCrearSort()
      .then((res) => {
        //setShowModal(true);
        //setDisabledBtns(false);
        console.log(res)
        if(res.estado===0){          
          notifyError(res.msg)
        }else{
          setRespCon(res)
          setShowModal(true)}
        
          
      })
  }

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

 
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <Select
        id="pagesLDB"
        label="Elegir operación:"
        options={options}
        value={page}
        onChange={(e) =>
          e.target.value !== undefined && e.target.value === ""
            ? history.push(`/${pathname.split("/")[1]}`)
            : history.push(`/${pathname.split("/")[1]}/${e.target.value}`)
            
        }
      />
      {posibles.includes(page) ? <SelectPage /> : ""}
      { (day===5) ? (
        <Form formDir="col" onSubmit={onSubmit}>
            <ButtonBar>
              <Button type="submit" diabled={disabledBtns}>Crear nuevo sorteo</Button>
            </ButtonBar>
        </Form>
          ) : (
            ""
          )}
      <Modal show={showModal} handleClose={() => closeModal()}>
          <SortForm
            closeModal={closeModal}
            respCon={respCon} 
          />     

      </Modal>
    </div>
  );
};

export default AdminLoteria