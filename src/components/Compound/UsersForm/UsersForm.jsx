import Button from "../../Base/Button/Button";
import ButtonBar from "../../Base/ButtonBar/ButtonBar";
import Form from "../../Base/Form/Form";
import Input from "../../Base/Input/Input";
import { useState, useEffect } from "react";
import {toast}  from "react-toastify";
import { useAuth } from "../../../utils/AuthHooks";

const UsersForm = ({

  closeModal,

  

}) => {
  const {roles_disponibles} = useAuth();
  const [roles, setRoles] = useState([]);

  const [email, setEmail] = useState('');
  const [email_cambio, setEmail_cambio] = useState('');
  const [direccion_cambio, setDireccion_cambio] = useState('');
  const [telefono_cambio, setTelefono_cambio] = useState('');
  const [respConsulta, setRespConsulta] = useState(null);

  const [checkedState, setCheckedState] = useState(
    new Array(roles_disponibles.length).fill(false)
  );
  //const [disabledBtns, setDisabledBtns] = useState(false); 

  
  const { consulta_usuarios, cambiar_rol } = useAuth();

  useEffect(() => {
    setRespConsulta(null)
  }, [closeModal])

  const handleOnChange = (position) => {
    roles.length=0;
    const updatedCheckedState = checkedState.map((item, role) =>
        
      (role) === (position-1) ? !item : item
    );
    setCheckedState(updatedCheckedState);

    for(var i = 0; i<roles_disponibles.length; i++){
        if(updatedCheckedState[i]===true){
            roles.push(roles_disponibles[i].id_rol)
        }
    }   
  }
  
  const Consulta = (e) => {
    e.preventDefault();
   
    consulta_usuarios(email)
      .then((res) => {
        if('msg' in res){
          notifyError(res.msg)
        }else{
          setRespConsulta(res)
          setEmail_cambio(res['email'])
          setDireccion_cambio(res['direccion'])
          setTelefono_cambio(res['telefono'])
          setRoles(res.roles)
          const check=[...checkedState]
          for(let i = 0; i<roles_disponibles.length; i++){
            check[i]=false  
          } 
          for(let i = 0; i<res.roles.length; i++){
            check[res.roles[i]-1]=true
          } 
          setCheckedState([...check])    
          
        }        
      })
  }

  const cambiar = (e) => {
    e.preventDefault();
    console.log(roles)
    if(Array.isArray(roles) && roles.length>0){
    cambiar_rol(roles, email, email_cambio, telefono_cambio, direccion_cambio)
      .then((res) => {
        console.log(res)
        if(res['msg']==='El correo ya existe'){
          notifyError(res.msg)
        }else{
          notify(res.msg)
          closeModal(true)
          setRespConsulta(null)
          setRoles([])
          setTelefono_cambio('')
          setDireccion_cambio('')
          setEmail_cambio('')
          setCheckedState(new Array(roles_disponibles.length).fill(false))          
        }        
      })
    }else{
      notifyError('Selecciones al menos un rol para este usuario')
    }
  }

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }; 
  
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
  
  

  const details = {
    "Nombre:": respConsulta ? respConsulta['nombre'] : "",
    "Identificación:": respConsulta ? respConsulta['identificacion'] : "",
    "Correo:": respConsulta ? respConsulta['email'] : "",  
  };

  

  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        {respConsulta?
        <>
        <div className="flex flex-col  mx-auto">
        {Object.entries(details).map(([key, val]) => {
          return (
            <div
              className="flex flex-row justify-between text-lg font-medium"
              key={key}
            >
              <h1>{key}</h1>
              <h1>{val}</h1>
            </div>
          );
        })}
        </div>
        <Form  onSubmit={cambiar} grid>
        
          <Input
            id="direccion"
            label="Dirección:"
            type="text"
            required={true}
            value={direccion_cambio}
            onInput={(e) => {
            setDireccion_cambio(e.target.value);              
            }}
          />
          <Input
            id="telefono"
            label="Telefono:"
            type="text"
            required={true}
            value={telefono_cambio}
            onInput={(e) => {
              if(!isNaN(e.target.value)){
                setTelefono_cambio(e.target.value);
                }
                          
            }}
          /> 
          {roles_disponibles.map((role,index) => {
                   
                   return (
                   <Input
                    id={role.id_rol}
                    label={`${role.nom_rol}:`}
                    type="checkbox"
                    value={role.id_rol}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(role.id_rol)}
                    />
                    )
                   
                })}           
                    
          <ButtonBar>
            <Button type="submit">Actualizar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setRespConsulta(null)
                setRoles([])
                setTelefono_cambio('')
                setDireccion_cambio('')
                setEmail_cambio('')
                setCheckedState(new Array(roles_disponibles.length).fill(false))
                
               
              }}
            >
              Cancelar
            </Button>
          </ButtonBar>
        
        </Form>
        </>
        :
        <Form  onSubmit={Consulta} grid>
        <Input
            id="email"
            label="Correo de usuario:"
            type="text"
            required={true}
            value={email}
            onInput={(e) => {
            setEmail(e.target.value);              
            }}
          />           
                    
          <ButtonBar>
            <Button type="submit">Buscar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setRespConsulta(null)
                
               
              }}
            >
              Cancelar
            </Button>
          </ButtonBar>
        
        </Form>}
      </div>
    </>
  );
};

export default UsersForm;
