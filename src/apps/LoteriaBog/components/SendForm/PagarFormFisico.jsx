import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";

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
    "Billete": selected ? selected['Ganadorboleto'] : "",
    "Serie": selected ? selected['serie:'] : "",
    "Valor ganado": selected ? "$"+selected['valor ganado'] : "",
    
  };

  const params = (number) => {
    let resp=number
    
    if(canFrac===1){
       resp=number
    }
    if(canFrac===2 && number.length>1 && resp[1]!==',' ){
       resp=resp[0]+","+resp[1]
    }

    if(canFrac===3 && number.length>2 && resp[1]!==',' ){
      console.log(resp[0])
       resp=resp[0]+","+resp[1]+","+resp[2]
      
    }

    return resp;   
  };
 

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

              cus.fracciones =params(e.target.value);
              setCustomer({ ...cus });
            }}
          />
        <Form onSubmit={handleSubmit} grid>
          {selected["Tipo"]===2 ? 
          (<>
          <Input
            id="num_id"
            label="Identificación:"
            type="text"
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
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="pnombre"
            label="Primer nombre:"
            type="text"
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
            id="pnombre"
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
              setCustomer({ ...cus });
            }}
          />          
          </>)
          :""}
          
          <ButtonBar>
            <Button type="submit">Aceptar</Button>
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
