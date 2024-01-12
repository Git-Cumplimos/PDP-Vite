import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../../../hooks/AuthHooks";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notifyPending, notifyError } from "../../../utils/notify";
import Modal from "../../../components/Base/Modal";
import { useMFA } from "../../../components/Base/MFAScreen";
import { useFetchCreditoFacil } from "../hooks/fetchCreditoFacil";

const URL_CONSULTAR_ESTADO_SIMULACION = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/check-estado-credito-facil`;
const URL_REALIZAR_DESEMBOLSO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/desembolso-credito-facil`;

const ModalDesembolso = ({
  dataCredito,
}) => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const { submitEventSetter } = useMFA();
  const uniqueId = v4();

  const desembolsoCredito = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataCredito?.valorSimulacion,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        address: roleInfo?.["direccion"],
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        Datos: {
          codigo_otp: 0,
          reintento_otp: 0,
          plazo: dataCredito?.consultSiian?.plazo,
          fechaPrimerPago: dataCredito?.consultSiian?.fechaPrimerPago,
          fechaDesembolso: dataCredito?.consultSiian?.fechaDesembolso,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionDesembolsoCredito(data, dataAditional),
        {
          render: () => {
            return "Procesando Desembolso del Crédito";
          },
        },
        {
          render: ({ data: res }) => {
            navigate(-1);
            return "Crédito desembolsado al cupo satisfactoriamente";
          },
        },
        {
          render: ({ data: error }) => {
            if (error?.message) {
              navigate(-1);
              return error?.message;
            } else {
              navigate(-1);
              return "Desembolso del Crédito fallido";
            }
          },
        }
      );
    },
    [roleInfo, pdpUser, dataCredito, uniqueId]
  );
  const [loadingPeticionDesembolsoCredito, peticionDesembolsoCredito] =
    useFetchCreditoFacil(
      URL_REALIZAR_DESEMBOLSO_CREDITO,
      URL_CONSULTAR_ESTADO_SIMULACION,
      "Realizar desembolso crédito"
    );

  return (
    <Modal show={dataCredito?.showModal} className="flex align-middle">
      <>
        <h1 className="text-2xl font-semibold text-center">
          ¿Está seguro de realizar el desembolso del crédito? Este se
          desembolsará a su cupo
        </h1>
        <ButtonBar>
          <Button
            type="button"
            onClick={(e) => {
              navigate(-1);
              notifyError("Transacción cancelada por el usuario");
            }}
            disabled={loadingPeticionDesembolsoCredito}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={submitEventSetter(desembolsoCredito)}
            disabled={loadingPeticionDesembolsoCredito}
          >
            Aceptar
          </Button>
        </ButtonBar>
      </>
    </Modal>
  );
};

export default ModalDesembolso;
