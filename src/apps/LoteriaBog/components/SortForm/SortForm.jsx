import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import {toast}  from "react-toastify";
import Input from "../../../../components/Base/Input/Input";
//import { useAuth } from "../../../../hooks/AuthHooks";

const SortForm = ({

  closeModal,
  tip_sorteo,
  sorteo,
  setSorteo,
  num_loteria

}) => {
  
  const [respCrearSort, setRespCrearSort] = useState('');
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [fecha, setFecha] = useState(null);
  const [changesorteo, setChangesorteo] = useState(sorteo);



  console.log(sorteo,tip_sorteo)
  const { CambiarSort } = useLoteria();
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    CambiarSort(sorteo,tip_sorteo,fecha,num_loteria)
      .then((res) => {
        //setShowModal(true);
        //setDisabledBtns(false);
          console.log(res)
          setRespCrearSort(res)
          notify(res['msg'])
          closeModal()          
          
      })
    setChangesorteo(sorteo)
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
  
  console.log(tip_sorteo)
  return (
    <>

      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="flex flex-row justify-between text-lg font-medium grid"
            >
             Verifique que el número de sorteo al igual que su fecha de juego!!!

              
            </div>
            <Input
            id="numsorteo"
            label="Sorteo"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="off"
            required='true'
            value={sorteo}
            onInput={(e) => {
              if(!isNaN(e.target.value)){
                const num = (e.target.value);
                setSorteo(num);
                }
            }}     
            />
            <Input
              id="dateEnd"
              label="Fecha sorteo"
              type="date"
              required='true'
              value={fecha}
              onInput={(e) => {
                setFecha(e.target.value);
              }}
            />  
            
        
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
