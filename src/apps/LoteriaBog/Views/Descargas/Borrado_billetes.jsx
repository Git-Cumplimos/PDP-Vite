import { useState, useCallback, useEffect } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Select from "../../../../components/Base/Select/Select";
import fetchData from "../../../../utils/fetchData"
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import { notify, notifyError } from "../../../../utils/notify";


const url_BorrarBilletes = `${process.env.REACT_APP_URL_LOTERIAS}/eliminar_asignacion`;
const url_sorteos = `${process.env.REACT_APP_URL_LOTERIAS}/num_sorteo`;

const Borrado_billetes = ({ route }) => {

  const [cod_distribuidor, setCod_distribuidor] = useState("");
  const [cod_sucursal, setCod_sucursal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [optionsDisponibles, setOptionsDisponibles] = useState([])
  const [num_sorteo, setNum_sorteo] = useState('')
  

  /*Borrar Billetes*/
  const borrar_billetes = useCallback(async (cod_distribuidor,cod_sucursal,num_sorteo) => {
    const query={
                'cod_distribuidor':cod_distribuidor,
                'cod_sucursal':cod_sucursal,
                'sorteo':num_sorteo
              }
    console.log(query)
    try {     
      const res = await fetchData(url_BorrarBilletes, "GET", query);
      console.log(res)
      closeModal();      
      return res;
    } catch (err) {
      closeModal();  
      console.error(err);
    }
  }, []);  

  /*Codigo de sorteos activos*/
  const sorteos = useCallback(async () => {

    try {     
      const res = await fetchData(url_sorteos, "GET");
      console.log(res)     
      return res;
    } catch (err) {
      closeModal();  
      console.error(err);
    }
  }, []);  
 
 
  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal(true)
    
  };
  
  const closeModal = useCallback(async () => {
    setShowModal(false);
    setCod_distribuidor('');
    setCod_sucursal('');
    setNum_sorteo('');
  }, []);

  const borrar = (e) => {
    e.preventDefault()
    borrar_billetes(cod_distribuidor,cod_sucursal,num_sorteo).then((res) => {
      if (res.status===false) {
        notifyError(res.msg);
        setCod_distribuidor('');
        setCod_sucursal('');
        setNum_sorteo('');
        
      } else {
        notify(res.msg)
        setCod_distribuidor('');
        setCod_sucursal('');
        setNum_sorteo(''); 
    
      }
    });
  };

  useEffect(() => {
    sorteos().then((res) => {
      if (res.status===false) {
        
      } else {
        setOptionsDisponibles(res.num_sorteos)  
      }
    });
  }, []);
  
  return (
    <>
      <div>
        <Form formDir="col" onSubmit={onSubmit} grid>
          <Select
            id="searchBySorteo"
            label="Tipo de comercio"
            options={
              Object.fromEntries([
                ["", ""],
                ...optionsDisponibles.map(({sorteo}) => {
                  return [sorteo];
                }),
              ]) || { "": "" }
            }
            value={num_sorteo}
            required
            onChange={(e) => {
              console.log(e.target.value)
              setNum_sorteo(e.target.value)
            }}
          />
          <Input
            id="cod_distribuidor"
            label="Distribuidor"
            type="text"
            minLength="5"
            maxLength="5"
            required
            autoComplete="false"
            value={cod_distribuidor}            
            onInput={(e) => {
                setCod_distribuidor(e.target.value);
            }}
          />
          <Input
            id="cod_sucursal"
            label="Sucursal"
            type="text"
            minLength="1"
            maxLength="5"
            required
            autoComplete="false"
            value={cod_sucursal}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                setCod_sucursal(e.target.value);
              }
            }}
          />
          <ButtonBar>
          <Button type='submit'>Eliminar billetes</Button>
          </ButtonBar>  
        </Form>
        <Modal show={showModal} handleClose={closeModal}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            ¿Esta seguro de eliminar los billetes asignados?
          </h1>
          <Form onSubmit={borrar} grid>
          <Input
            id="sorteo"
            label="Sorteo"
            type="text"
            minLength="1"
            maxLength="4"
            requiered
            autoComplete="false"
            value={num_sorteo}            
          />
          <Input
            id="cod_distribuidor"
            label="Distribuidor"
            type="text"
            minLength="5"
            maxLength="5"
            requiered
            autoComplete="false"
            value={cod_distribuidor}            
          />
          <Input
            id="cod_sucursal"
            label="Sucursal"
            type="text"
            minLength="1"
            maxLength="5"
            requiered
            autoComplete="false"
            value={cod_sucursal}
          />
         
          <ButtonBar>
            <Button 
            type="submit" 
            >
            Aceptar
            </Button>
            <Button 
            type="button" 
            onClick={() => {
              closeModal(false)
              }}>
              Cancelar
            </Button>              
          </ButtonBar>
          </Form>
        </div>
        </Modal>
      </div>
    </>
  );
};

export default Borrado_billetes;
