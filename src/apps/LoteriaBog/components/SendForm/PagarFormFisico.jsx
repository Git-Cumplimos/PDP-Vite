import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import { useState, useEffect } from "react";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const SendFormFisico = ({
  selected,
  canFrac,
  customer: {
    doc_id,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    direccion,
    telefono,
    fracciones,

  },
  setCustomer,
  closeModal,
  handleSubmit,
}) => {
  const details = {
    "Billete:": selected ? selected['Ganadorboleto'] : "",
    "Serie:": selected ? selected['serie:'] : "",
    "Valor ganado:": selected ? formatMoney.format(selected['valor bruto']) : "",
    "Retención 17%:": selected ? formatMoney.format(selected['valor 17percent']) : "",
    "Retención 20%:": selected ? formatMoney.format(selected['valor 20percent']) : "",
    "Valor a pagar:": selected ? formatMoney.format(selected['valor ganado']) : "", 
    
  };
    // const [frac1, setFrac1] = useState(false);
    // const [frac2, setFrac2] = useState(false);
    // const [frac3, setFrac3] = useState(false);
    
    // console.log(frac1,frac2,frac3)
  
    const params = (number) => {
    
    let resp=number
    
    if(canFrac===1){
      resp=number
           
    }
    if(canFrac===2 && number.length>1 && resp[1]!==',' ){
      resp=resp[0]+","+resp[1]
      
    }
    if(canFrac===3 && number.length>2 && resp[1]!==',' ){
      resp=resp[0]+","+resp[1]+","+resp[2]    
      
    }
    
    return resp;  
    
      
       
  };

  const [disabledBtns, setDisabledBtns] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true)
    handleSubmit()
  }
 

  return (
    <>
      <div className="flex flex-col w-1/2 mx-auto">
        {Object.entries(details).map(([key, val]) => {
          return (
            <div
              className="flex flex-row justify-between text-lg font-medium"
              key={key}
            >
              <h1>{key}</h1>
              <h1>{val}</h1>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col justify-center items-center mx-auto container">
          {/* <form grid>
            <p>Fracciones: </p>
            <div>
                <input type="checkbox" id="frac1" value={frac1} onChange={() => {
                setFrac1(!frac1)}}/> <label for="frac1">1</label>

                <input type="checkbox" id="frac2" value={frac2} onChange={() => {
                setFrac2(!frac2)}}/> <label for="frac2">2</label>

                <input type="checkbox" id="frac3" value={frac3} onChange={() => {
                setFrac3(!frac3)}}/> <label for="frac3">3</label>
            </div>
          </form> */}
          <Input
            id="frac"
            label="Fracciones:"
            type="text"
            maxLength={`${(canFrac-1)*2 + 1}`}
            minLengt={`${(canFrac-1)*2 + 1}`}
            value={fracciones}
            onInput={(e) => {
              
              const cus = {
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
                
              if((parseInt(e.target.value[e.target.value.length-1])>3)||(parseInt(e.target.value[e.target.value.length-1])<1)){
                  
              }else{
                cus.fracciones =params(e.target.value); 
                if(isNaN(cus.fracciones[0])===true || (parseInt(cus.fracciones[0])<1 || parseInt(cus.fracciones[0])>3)){
                  cus.fracciones=''
              }if(cus.fracciones.length>2 && (isNaN(cus.fracciones[2])===true || (parseInt(cus.fracciones[2])<1 || parseInt(cus.fracciones[2])>3) )){
                  cus.fracciones=''
              }if(cus.fracciones.length>3 && (isNaN(cus.fracciones[4])===true || (parseInt(cus.fracciones[4])<1 || parseInt(cus.fracciones[4])>3))){
                cus.fracciones=''
              }               
            
              setCustomer({ ...cus });  
              } 
            }}
          />
        <Form onSubmit={onSubmit} grid>
          {selected["Tipo"]===2 ? 
          (<>
          <Input
            id="num_id"
            label="Identificación:"
            type="text"
            required
            value={doc_id}
            onInput={(e) => {
              const cus = {
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.doc_id = e.target.value;
              if(isNaN(cus.doc_id[cus.doc_id.length-1])===true && cus.doc_id.length>0){
                
              }else{
                setCustomer({ ...cus });
              }
              
            }}
          />
          <Input
            id="pnombre"
            label="Primer nombre:"
            type="text"
            required
            value={primer_nombre}
            onInput={(e) => {
              const cus ={
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.primer_nombre = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="snombre"
            label="Segundo nombre:"
            type="text"
            value={segundo_nombre}
            onInput={(e) => {
              const cus ={
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.segundo_nombre = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="papellido"
            label="Primer apellido:"
            type="text"
            required
            value={primer_apellido}
            onInput={(e) => {
              const cus ={
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.primer_apellido = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="sapellido"
            label="Segundo apellido:"
            type="text"
            value={segundo_apellido}
            onInput={(e) => {
              const cus ={
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.segundo_apellido = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="direccion"
            label="Dirección:"
            type="text"
            required
            value={direccion}
            onInput={(e) => {
              const cus ={
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.direccion = e.target.value;
              setCustomer({ ...cus });
            }}
            
          />
          <Input
            id="telefono"
            label="Telefono:"
            type="text"
            required
            value={telefono}
            onInput={(e) => {
              const cus ={
                doc_id,
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                direccion,
                telefono,
                fracciones,
            
              };
              cus.telefono = e.target.value;
              if(isNaN(cus.telefono[cus.telefono.length-1])===true && cus.telefono.length>0){
                
              }else{
                setCustomer({ ...cus });
              }
            }}
          />          
          </>)
          :""}
          
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Aceptar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setCustomer({
                  doc_id:"",
                  primer_nombre:"",
                  segundo_nombre:"",
                  primer_apellido:"",
                  segundo_apellido:"",
                  direccion:"",
                  telefono:"",
                  fracciones:"",
                
            
                });
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

export default SendFormFisico;
