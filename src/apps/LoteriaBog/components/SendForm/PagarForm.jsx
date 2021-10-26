import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
//import { useAuth } from "../../../../utils/AuthHooks";

const SendForm = ({
  selected,
  customer: {
    doc_id,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    direccion,
    telefono,

  },
  num_tele,
  setCustomer,
  closeModal,
  handleSubmit,
  

}) => {
  const details = {
    "Billete": selected ? selected['Ganadorboleto'] : "",
    "Serie": selected ? selected['serie:'] : "",
    "Valor ganado": selected ? "$"+selected['valor ganado'] : "",
    
  };
  // const { getQuota } = useAuth();

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
            
              };
              cus.direccion = e.target.value;
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

export default SendForm;
