import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useState, useEffect } from "react";
import { notifyError } from "../../../../utils/notify";
//import { useAuth } from "../../../../hooks/AuthHooks";

const CargarForm = ({

  selected,
  file,
  disabledBtns,
  closeModal,
  handleSubmit,
  fisiVirtual,
}) => {
  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form onSubmit={onSubmit} grid>
          <div className="flex flex-row text-center justify-between text-lg font-medium">
            <h1>
              ¿Está seguro de subir el archivo "{file}" para {selected === "PlanDePremios" ? "Plan de premios" : selected === "Asignacion" ? "Asignación" : selected} {fisiVirtual === "" ? "" : fisiVirtual === "Fisico/" ? `Física` : ("Virtual")}?


              {/* {fisiVirtual === "" ? `${file} para ${selected}` 
                : `${file} para ${selected}` {fisiVirtual === "Fisico/" ? `Física` : ("Virtual")}} */}
            </h1>
          </div>

          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>
              Aceptar
            </Button>
            <Button
              type="button"
              onClick={() => {
                notifyError("Carga de archivos cancelada por el usuario")
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
