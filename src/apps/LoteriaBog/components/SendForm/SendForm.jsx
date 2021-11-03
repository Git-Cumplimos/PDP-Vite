import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";

const SendForm = ({
  selected,
  customer: { fracciones, phone, doc_id },
  setCustomer,
  closeModal,
  handleSubmit,
}) => {
  const details = {
    "Valor por fraccion": selected ? selected.Valor_fraccion : "",
    Numero: selected ? selected.Num_billete : "",
    Serie: selected ? selected.serie : "",
    "Fracciones disponibles": selected ? selected.Fracciones_disponibles : "",
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
        <Form onSubmit={handleSubmit} grid>
          <Input
            id="cantFrac"
            label="Fracciones a comprar"
            type="number"
            max={selected ? `${selected.Fracciones_disponibles}` : "3"}
            min="1"
            value={fracciones}
            onInput={(e) => {
              const cus = { fracciones, phone, doc_id };
              cus.fracciones = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="numCel"
            label="Celular"
            type="tel"
            minLength="10"
            maxLength="10"
            value={phone}
            onInput={(e) => {
              const cus = { fracciones, phone, doc_id };
              cus.phone = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="num_id"
            label="Documento de identidad"
            type="text"
            value={doc_id}
            onInput={(e) => {
              const cus = { fracciones, phone, doc_id };
              cus.doc_id = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <ButtonBar>
            <Button type="submit">Aceptar</Button>
            <Button
              type="button"
              onClick={() => {
                closeModal();
                setCustomer({ fracciones: "", phone: "", doc_id: "" });
              }}
            >  Cancelar
            </Button>
          </ButtonBar>
        </Form>
      </div>
    </>
  );
};

export default SendForm;
