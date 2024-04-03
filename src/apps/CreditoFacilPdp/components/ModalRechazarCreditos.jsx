import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import { notifyPending } from "../../../utils/notify";
import Modal from "../../../components/Base/Modal";
import { useFetch } from "../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import { notifyError } from "../../../utils/notify";


const URL_RECHAZAR_CREDITOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/rechazar-creditos`;

const ModalRechazarCreditos = ({
  dataCredito,
  consultaCreditos,
  showModal,
  setShowModal,
}) => {
  const [loadingPeticionRechazoCredito, peticionRechazoCredito] = useFetch(
    fetchCustom(URL_RECHAZAR_CREDITOS, "POST", "Rechazar Créditos")
  );

  const handleRechazar = () => {
    const data = {
      numero_solicitud: dataCredito?.NroSolicitud,
    };
    notifyPending(
      peticionRechazoCredito({}, data),
      {
        render: () => {
          return "Procesando Rechazar Crédito";
        },
      },
      {
        render: ({ data: res }) => {
          setShowModal(false);
          consultaCreditos();
          return "Crédito rechazado satisfactoriamente";
        },
      },
      {
        render: ({ data: error }) => {
          if (error?.message) {
            setShowModal(false);
            consultaCreditos();
            return error?.message;
          } else {
            setShowModal(false);
            consultaCreditos();
            return "Crédito rechazado fallido";
          }
        },
      }
    );
  };

  return (
    <>
      <Modal show={showModal} className="flex align-middle">
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl text-center mb-2 font-semibold">
            {`¿Está seguro de rechazar el crédito?`}
          </h1>
          <h2 className="text-xl text-center">
            {`Número crédito: ${dataCredito?.NroSolicitud}`}
          </h2>
          <h2 className="text-xl text-center">
            {`Id del comercio: ${dataCredito?.IdComercio}`}
          </h2>
          <ButtonBar>
            <Button
              type="button"
              disabled={loadingPeticionRechazoCredito}
              onClick={() => {
                setShowModal(false);
                notifyError("La anulación del crédito fue cancelada por el usuario");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleRechazar}
              disabled={loadingPeticionRechazoCredito}
            >
              Aceptar
            </Button>
          </ButtonBar>
        </div>
      </Modal>
    </>
  );
};

export default ModalRechazarCreditos;
