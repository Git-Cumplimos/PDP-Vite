import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import {toast}  from "react-toastify";
//import { useAuth } from "../../../../utils/AuthHooks";

const SortForm = ({

  closeModal,
  fisico,
  tip_sorteo  

}) => {
  
  const [respCrearSort, setRespCrearSort] = useState('');
  const [disabledBtns, setDisabledBtns] = useState(false); 

  
  const { CambiarSort } = useLoteria();
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    CambiarSort(tip_sorteo,fisico)
      .then((res) => {
        //setShowModal(true);
        //setDisabledBtns(false);
          console.log(res)
          setRespCrearSort(res)
          notify(res['msg'])
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
  
  console.log(tip_sorteo,fisico)
  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="flex flex-row justify-between text-lg font-medium"
            >
              {fisico===false&&tip_sorteo===1?<h1>¿Esta seguro de crear SORTEO ORDINARIO VIRTUAL?</h1>:''}
              {fisico===false&&tip_sorteo===2?<h1>¿Esta seguro de crear SORTEO ESTRAORDINARIO VIRTUAL?</h1>:''}
              {fisico===true&&tip_sorteo===1?<h1>¿Esta seguro de crear SORTEO ORDINARIO FISICO?</h1>:''}
              {fisico===true&&tip_sorteo===2?<h1>¿Esta seguro de crear SORTEO ESTRAORDINARIO FISICO?</h1>:''}
              
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
