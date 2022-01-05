import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState } from "react";
import {toast}  from "react-toastify";
import Input from "../../../../components/Base/Input/Input";
import { notify, notifyError } from "../../../../utils/notify";
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

  const { CambiarSort } = useLoteria();
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    CambiarSort(sorteo,tip_sorteo,fecha,num_loteria)
      .then((res) => {
          setRespCrearSort(res)
          if(res["estado"]==true){
          notify(res['msg'])
          }
          else{
            notifyError(res['msg'])
          }
          closeModal()          
          
      })
    setChangesorteo(sorteo)
  }
  
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
            <Button type="submit" disabled={disabledBtns}>Crear</Button>
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
