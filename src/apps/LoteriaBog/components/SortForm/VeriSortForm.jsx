import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import {toast}  from "react-toastify";
//import { useAuth } from "../../../../utils/AuthHooks";

const VeriSortForm = ({

  closeModal,
  handleSubmit

}) => {
  
  const [disabledBtns, setDisabledBtns] = useState(false); 
  
  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit()
  }
  
  
  
  
  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              <h1>Asegurese de que el sorteo que va a crear es el correcto</h1>
              
            </div>
            
            
        
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Continuar</Button>
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

export default VeriSortForm;
