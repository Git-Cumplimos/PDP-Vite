import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useState, useEffect } from "react";
//import { useAuth } from "../../../../hooks/AuthHooks";

const CargarForm = ({
  selected,
  file,
  disabledBtns,
  closeModal,
  handleSubmit,
}) => {
  const onSubmit = (e) => {
    e.preventDefault();

    handleSubmit();
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form onSubmit={onSubmit} grid>
          <div className="flex flex-row justify-between text-lg font-medium">
            <h1>
              ¿Seguro que desea subir el archivo "{file}" como "{selected}"?
            </h1>
          </div>

          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>
              Aceptar
            </Button>
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

export default CargarForm;
