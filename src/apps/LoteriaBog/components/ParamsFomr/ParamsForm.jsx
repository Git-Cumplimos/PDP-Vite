import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useState, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input/Input";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";
import { queries } from "@testing-library/react";
//import { useAuth } from "../../../../hooks/AuthHooks";


const url_cambioParams=`${process.env.REACT_APP_URL_LOTO_PREMIOS}/cambio_params`;

const ParamsForm = ({

  closeModal,
  params,

}) => {

  const cambio_params = useCallback(async (uvt, max_pago) => {
    const query={params:`{"uvt":${uvt},"max_pago":${max_pago}}`}
    console.log(query)
    try {     
      const res = await fetchData(url_cambioParams, "GET", query );
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const [uvt, setUvt] = useState(null)
  const [max_pago, setMax_pago] = useState(null)
  const [disabledBtns, setDisabledBtns] = useState(false)
  
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true)
    cambio_params(uvt,max_pago).then((res) => {
      if ("msg" in res) {
        notifyError(res.msg);
        setDisabledBtns(true);
      } else {
        console.log(res);
      }
    });
    
  };
 
  useEffect(() => {    
    setUvt(params?.uvt)
    setMax_pago(params?.max_pago)  
  }, [params])


  
  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="flex flex-col justify-center items-center mx-auto container grid"
            >
             ¿Desea cambiar algún parametro?              
            </div>
            <Input
            id="uvt"
            label="UVT"
            type="text"
            autoComplete="off"
            required='true'
            value={uvt}
            onInput={(e) => {
              if(!isNaN(e.target.value)){
                const num = (e.target.value);
                setUvt(num);
                }
            }}     
            />
            <Input
            id="max_pago"
            label="Pago maximo"
            type="text"
            autoComplete="off"
            required='true'
            value={max_pago}
            onInput={(e) => {
              if(!isNaN(e.target.value)){
                const num = (e.target.value);
                setMax_pago(num);
                }
            }}     
            /> 
            
        
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Cambiar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setDisabledBtns(false)
                
               
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

export default ParamsForm;
