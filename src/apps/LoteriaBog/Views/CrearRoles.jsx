import {useState, useEffect, useCallback} from 'react'
import { useAuth } from '../../../utils/AuthHooks';
import Form from '../../../components/Base/Form/Form';
import Input from '../../../components/Base/Input/Input';
import ButtonBar from '../../../components/Base/ButtonBar/ButtonBar';
import Button from '../../../components/Base/Button/Button';
import Select from '../../../components/Base/Select/Select';
import { toast } from "react-toastify";
import Modal from "../../../components/Base/Modal/Modal"
import UsersForm from '../components/UsersForm/UsersForm';
import { Auth } from 'aws-amplify'


const CrearRoles = () => {
   

    const { crearRol, roles_disponibles } = useAuth();

    
    const [showModal, setShowModal] = useState(false);
    const [pnombre, setPnombre] = useState('')
    const [snombre, setSnombre] = useState('')
    const [papellido, setPapellido] = useState('')
    const [sapellido, setSapellido] = useState('')       
    const [rol, setRol] = useState('')
    const [email, setEmail] = useState('')
    const [identificacion, setIdentificacion] = useState('')
    const [telefono, setTelefono] = useState('')
    const [direccion_residencia, setDireccion_residencia] = useState('')
    const [disabledBtns, setDisabledBtns] = useState(false)
    const [checkedState, setCheckedState] = useState(
        new Array(roles_disponibles.length).fill(false)
      );
      const [roles, setRoles] = useState([]);
    

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
    useEffect(() => {
        setDisabledBtns(false)
    });


    const onSubmit = (e) => {
        setDisabledBtns(true)
        e.preventDefault();
        if(Array.isArray(roles) && roles.length>0){
        crearRol(pnombre,snombre,papellido,sapellido,roles,email,identificacion,telefono,direccion_residencia).then((res) => {
            if(res.msg==='Usuario creado exitosamente'){
                notify(res.msg) 
                signUp(pnombre,snombre,papellido,sapellido,roles,email,identificacion,telefono);
            }                   
                
            else{
                notifyError(res.msg)
            }      
          }); 
        }else{
            notifyError('Seleccione al menos rol para este usuario')
            setDisabledBtns(false)
        }          
    }

    const signUp=async(pnombre,snombre,papellido,sapellido,correo,identificacion,telefono)=>{
        const username=identificacion
        const password='1234' ///////////////////////
        const email=correo
        const phone_number=telefono
        const family_name=papellido + sapellido
        const name=correo//pnombre +""+ snombre

        try{
            const loggedUser = await Auth.signUp({
                username,
                password,
                attributes:{
                    email,
                    phone_number,
                    family_name,
                    name,
            }});
            console.log(loggedUser)
            console.log('successfully signed up!')
        }catch(err){console.log('error signUp: ',err);}
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


    const changeUser = (e) => {
        e.preventDefault();
        setShowModal(true)
    
   
    } 

    const closeModal = useCallback(() => {
        setShowModal(false)
    })


    return (
        
            <>
            <Form formDir="col" onSubmit={changeUser}>
            <Button type="submit" disabled={disabledBtns} >
                    Modificar usuario
            </Button>
            </Form>
            <Modal show={showModal}  handleClose={() => closeModal()}>
              <UsersForm closeModal={closeModal}/>                  
            </Modal>

            <div className="flex flex-col w-1/2 mx-auto">
                <h1>Registrar Usuario</h1>
            </div>
            
            <Form onSubmit={onSubmit} grid>
               
                <Input
                id="pnombre"
                label="Primer nombre:"
                type="text"
                required
                autoComplete="off"
                value={pnombre}
                onInput={(e) => {
                   
                    setPnombre(e.target.value);
                    
                }}
                />
                <Input
                id="snombre"
                label="Segundo nombre:"
                type="text"
                autoComplete="off"
                value={snombre}
                onInput={(e) => {
                   
                    setSnombre(e.target.value);
                    
                }}
                />
                <Input
                id="papellido"
                label="Primer apellido:"
                type="text"
                required
                autoComplete="off"
                value={papellido}
                onInput={(e) => {
                   
                    setPapellido(e.target.value);
                    
                }}
                />
                <Input
                id="sapellido"
                label="Segundo apellido:"
                type="text"
                autoComplete="off"
                value={sapellido}
                onInput={(e) => {
                   
                    setSapellido(e.target.value);
                    
                }}
                />
                {/* <Select
                    id="rol"
                    label="Rol:"
                    required
                    options={[
                        { value: "", label: "" },
                        { value: 1, label: `Administrador` },
                        {
                        value: 2, label: `Vendedor`,
                        },
                    ]}
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                /> */}
                <Input
                id="email"
                label="Correo:"
                type="text"
                required
                autoComplete="off"
                value={email}
                onInput={(e) => {
                    
                    setEmail(e.target.value);
                }}
                />
                <Input
                id="identificacion"
                label="Identificacion:"
                type="text"
                required
                autoComplete="off"
                value={identificacion}
                onInput={(e) => {
                    if(!isNaN(e.target.value)){
                        const num = (e.target.value);
                        setIdentificacion(num);
                        }
                   
                }}
                />
                <Input
                id="telefono"
                label="Telefono:"
                type="text"
                required
                autoComplete="off"
                value={telefono}
                onInput={(e) => {
                    if(!isNaN(e.target.value)){
                        const num = (e.target.value);
                        setTelefono(num);
                        }
                   
                }}
                />
                <Input
                id="Direccion"
                label="Direccion:"
                type="text"
                required
                autoComplete="off"
                value={direccion_residencia}
                onInput={(e) => {
                        const num = (e.target.value);
                        setDireccion_residencia(num);
                        
                   
                }}
                />
                {roles_disponibles.map((role) => {
                   
                   return (
                   <Input
                    id={role.id_rol}
                    label={`${role.nom_rol}:`}
                    type="checkbox"
                    value={role.id_rol}
                    checked={checkedState[role]}
                    onChange={() => handleOnChange(role.id_rol)}
                    />
                    )
                   
                })}
                <ButtonBar className="col-auto md:col-span-2">
                <Button type="submit" disabled={disabledBtns}>
                    Crear
                </Button>                
                </ButtonBar>
            </Form>
            </>
  
        
    )
}

export default CrearRoles
