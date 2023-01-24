import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useLoteria } from "../../utils/LoteriaHooks";
import { useState, useEffect } from "react";
import { notify, notifyError } from "../../../../utils/notify";

const CloseForm = ({ closeModal, tip_sorteo }) => {
  const { cargueVentasExtra_S3 } = useLoteria();
  const [disabledBtns, setDisabledBtns] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    cargueVentasExtra_S3(tip_sorteo).then((res) => {
      if (res.estado === true) {
        notify(res.msg);
      } else {
        notifyError(res.msg);
      }
      closeModal();
    });
  };
  const [tipo_sorteo, setTipo_sorteo] = useState(null);

  useEffect(() => {
    if (tip_sorteo === 1) {
      setTipo_sorteo("ordinario");
    } else {
      setTipo_sorteo("extraordinario");
    }
  }, [tip_sorteo]);

  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form onSubmit={onSubmit} grid>
          <div className="flex flex-row justify-center text-lg font-medium">
            <h1>¿Cerrar sorteo {tipo_sorteo}?</h1>
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

export default CloseForm;
