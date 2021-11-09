import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";


const SearchForm = ({ selected={}, closeModal,handleSubmit,}) => {
  const details = {
     ...selected
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
          <ButtonBar>
            <Button type="submit" >Aceptar</Button>
            <Button type="button"  onClick={() => { closeModal(); }} >Cancelar </Button>
          </ButtonBar>
        </Form>
      </div>
    </>
  );
};

export default SearchForm;
