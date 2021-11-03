import {useState, useEffect} from 'react'
import { useLoteria } from "../utils/LoteriaHooks";
import Form from '../../../components/Base/Form/Form';
import Input from '../../../components/Base/Input/Input';
import ButtonBar from '../../../components/Base/ButtonBar/ButtonBar';
import Button from '../../../components/Base/Button/Button';
import Select from '../../../components/Base/Select/Select';
import { toast } from "react-toastify";


const CrearRoles = () => {

    const { crearRol } = useLoteria();

    

    const [pnombre, setPnombre] = useState('')
    const [snombre, setSnombre] = useState('')
    const [papellido, setPapellido] = useState('')
    const [sapellido, setSapellido] = useState('')       
    const [rol, setRol] = useState('')
    const [email, setEmail] = useState('')
    const [comercio, setComercio] = useState('')
    const [disabledBtns, setDisabledBtns] = useState(false)


    useEffect(() => {
        setDisabledBtns(false)
    });

    const onSubmit = (e) => {
        setDisabledBtns(true)
        e.preventDefault();
        crearRol(pnombre,snombre,papellido,sapellido,rol,email,comercio).then((res) => {
            if(res.msg==='Usuario creado con existo')
                notify(res.msg) 
            else{
                notifyError(res.msg)
            }      
          }); 
                  
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


    return (
        
            <>
            <Form onSubmit={onSubmit} grid>
                <Input
                id="pnombre"
                label="Primer nombre:"
                type="text"
                required={true}
                autoComplete="false"
                value={pnombre}
                onInput={(e) => {
                   
                    setPnombre(e.target.value);
                    
                }}
                />
                <Input
                id="snombre"
                label="Segundo nombre:"
                type="text"
                autoComplete="false"
                value={snombre}
                onInput={(e) => {
                   
                    setSnombre(e.target.value);
                    
                }}
                />
                <Input
                id="papellido"
                label="Primer apellido:"
                type="text"
                required={true}
                autoComplete="false"
                value={papellido}
                onInput={(e) => {
                   
                    setPapellido(e.target.value);
                    
                }}
                />
                <Input
                id="sapellido"
                label="Segundo apellido:"
                type="text"
                autoComplete="false"
                value={sapellido}
                onInput={(e) => {
                   
                    setSapellido(e.target.value);
                    
                }}
                />
                <Select
                    id="rol"
                    label="Rol:"
                    options={[
                        { value: "", label: "" },
                        { value: 0, label: `Administrador` },
                        {
                        value: 1, label: `Vendedor`,
                        },
                    ]}
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                />
                <Input
                id="email"
                label="Correo:"
                type="text"
                required={true}
                autoComplete="false"
                value={email}
                onInput={(e) => {
                    
                    setEmail(e.target.value);
                }}
                />
                <Input
                id="comercio"
                label="Comercio:"
                type="number"
                required={true}
                autoComplete="false"
                value={comercio}
                onInput={(e) => {
                    const num = parseInt(e.target.value) || "";
                    setComercio(num);
                }}
                />
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
