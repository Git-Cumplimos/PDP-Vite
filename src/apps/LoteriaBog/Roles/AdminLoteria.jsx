import { useParams, useHistory, useLocation, Link } from "react-router-dom";
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
import AppIcons from "../../../components/Base/AppIcons/AppIcons";

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
      
      // case "crear_rol":
      //   return <CrearRoles />
      // default:
      //   return "";
    }
  };

  const LotoIcons = ({ Logo, name }) => {
    return (
      <div className="flex flex-col justify-center flex-1 text-center text-base md:text-xl">
        <AppIcons Logo={Logo} />
        <h1>{name}</h1>
      </div>
    );
  };

  const options = [
    { value: "cargar", label: <LotoIcons Logo={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_1-P9wrhr8RWkx5zt3f64Ogy-Yr5DoQ_5ww&usqp=CAU'} name="cargar" /> },
    {
      value: "descargar",
      label: <LotoIcons Logo={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ra0nfafOoCnsF9kD-Q1BH_J-kkz4CsP4Yw&usqp=CAU'} name="descargar" />,
    },
  ];

  const posibles = ["cargar", "descargar"];
  // const check = () => {
  //   const posib = [];
  //   const opts = [{ value: "", label: "" }];
  //   opts.push(
  //     { value: "cargar", label: "Cargar archivos" },
  //     { value: "descargar", label: "Descargar archivos" },
  //     // { value: "crear_rol", label: "Crear un usuario" }
  //   );
  //   posib.push("cargar", "descargar", "crear_rol");
  //   return [[...opts], [...posib]];
  // };

  // const [options, posibles] = check();



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
      <>
      {pathname === `/${pathname.split("/")[1]}` ? (
        <div className="flex flex-row flex-wrap justify-center gap-8">
          {options.map(({ value, label }) => {
            return (
              <Link to={`/${pathname.split("/")[1]}/${value}`} key={value}>
                {label}
              </Link>
            );
          })}
        </div>
      ) : (
        ""
      )}
      {posibles.includes(page) ? (
        <div className="flex flex-col md:flex-row justify-evenly w-full">
          <div className="flex flex-col">
            <div className="hidden md:block">
              {options.find(({ value }) => page === value).label}
            </div>
            <div>
              <Link to={`/${pathname.split("/")[1]}`}>
                <Button>Volver</Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center flex-1">
            <SelectPage />
          </div>
        </div>
      ) : (
        ""
      )}
    </>
      {/* <Select
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
      {posibles.includes(page) ? <SelectPage /> : ""} */}
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