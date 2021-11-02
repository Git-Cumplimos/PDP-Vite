import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import {toast}  from "react-toastify";
//import { useAuth } from "../../../../utils/AuthHooks";

const SortForm = ({

  closeModal,
  respCon,

  

}) => {
  
  const [respCrearSort, setRespCrearSort] = useState('');
  const [disabledBtns, setDisabledBtns] = useState(false); 

  
  const { CambiarSort } = useLoteria();
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    CambiarSort(respCon)
      .then((res) => {
        //setShowModal(true);
        //setDisabledBtns(false);
        
          setRespCrearSort(res)
          notify(res[0]['msg'])
          closeModal()
          
      })
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
  
  
  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>¿Esta seguro que desea actualizar el sorteo?</h1>
              
            </div>
            
            
        
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Actualizar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
               
              }}
            >
              Cancelar
            </Button>
          </ButtonBar>
        
        </Form>
      </div>
    </>
  );
};

export default SortForm;
