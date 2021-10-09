import Button from "../../../../components/Base/Button/Button";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";

const SendForm = ({
  selected,
  customer: { fracciones, phone },
  setCustomer,
  setShowModal,
  handleSubmit,
}) => {
  return (
    <>
      <h1>Valor por fraccion: {selected ? selected.Val_fraccion : ""}</h1>
      <h1>Numero: {selected ? selected.Num_loteria : ""}</h1>
      <h1>Serie: {selected ? selected.Serie : ""}</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          id="cantFrac"
          label="Facciones a comprar"
          type="number"
          max="3"
          min="1"
          value={fracciones}
          onChange={(e) => {
            const cus = { fracciones, phone };
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
          onChange={(e) => {
            const cus = { fracciones, phone };
            cus.phone = e.target.value;
            setCustomer({ ...cus });
          }}
        />
        <Button type="submit">Aceptar</Button>
        <Button
          type="button"
          onClick={() => {
            setShowModal(false);
            setCustomer({ fracciones: "", phone: "" });
          }}
        >
          Cancelar
        </Button>
      </Form>
    </>
  );
};

export default SendForm;
