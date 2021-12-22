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
