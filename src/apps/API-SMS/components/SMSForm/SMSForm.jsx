import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import TextArea from "../../../../components/Base/TextArea/TextArea";
import { useState, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input/Input";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";
import { queries } from "@testing-library/react";
//import { useAuth } from "../../../../hooks/AuthHooks";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const url_enviarSMS = `${process.env.REACT_APP_URL_APISMS_CONEXION_ONURIX}/envioSMS`;

const SMSForm = ({

  closeModal,
  SMS,
  setSMS,
  tipComercio,
  Nivel,
  setResEnvioSMS,
  resEnvioSMS,
  phones

}) => {

  

  /*Enviar mensaje*/ 
  const enviarSMS = useCallback(async (SMS,phones) => {
    const body={'sms':SMS,"phone":phones}
    try {     
      const res = await fetchData(url_enviarSMS, "POST", {}, body );
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

 
  const [disabledBtns, setDisabledBtns] = useState(false)
  
  const onSubmit = (e) => {
    e.preventDefault();
    enviarSMS(SMS,phones).then((res) => {
      if (res.status===false) {
        notifyError(res.msg);
      } else {
        console.log(res);
        notify(res?.obj?.msg)
        setResEnvioSMS(res)
      }
    });
    closeModal()
    
  };
 
  // useEffect(() => {    
  //   setUvt(params?.uvt)
  //   setMax_pago(params?.max_pago)  
  // }, [params])


  console.log(phones, typeof phones)  
  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
            <div
              className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center"
            >
             <h1 className="text-2xl font-semibold">¿Desea enviar el mensaje? </h1>
             <div 
              className="max-width: 8.75rem;
              @apply rounded-full px-6 bg-secondary-dark text-white mx-2 text-center;"
              >
              Mensajes: {phones?.length || "0"}
              </div>             
            </div>
            <TextArea
            id="SMS"
            label="Mensaje"
            type="input"
            minLength="1"
            maxLength="60"
            autoComplete="off"
            value={SMS}
            onInput={(e) => {
              setSMS(e.target.value)        
            }}
            />
            <Input
            id="tipComercio"
            label="Tipo de comercio"
            type="text"
            autoComplete="off"
            value={tipComercio}  
            />
            {/* <Input
            id="Nivel"
            label="Nivel"
            type="text"
            autoComplete="off"
            value={Nivel}  
            /> */}
            
        
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Enviar</Button>
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

export default SMSForm;
