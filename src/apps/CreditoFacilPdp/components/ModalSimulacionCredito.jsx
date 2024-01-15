import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoneyInput from "../../../components/Base/MoneyInput";
import Form from "../../../components/Base/Form/Form";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notifyPending } from "../../../utils/notify";
import { enumParametrosCreditosPDP } from "../utils/enumParametrosCreditosPdp";
import Modal from "../../../components/Base/Modal";

const URL_REALIZAR_SIMULACION_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/simulacion-credito-siian`;

const ModalSimulacionCredito = ({
  dataCredito,
  setDataCredito,
  setListadoCuotas,
}) => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();

  const simulacionCredito = useCallback(
    (ev) => {
      ev.preventDefault();
      let plazo_cuotas = 0;
      const valorCredito = dataCredito?.valorSimulacion;
      if (valorCredito >= enumParametrosCreditosPDP.MONTOMINIMOCAMBIOPLAZO) {
        setDataCredito((old) => ({
          ...old,
          plazo: 90,
        }));
        plazo_cuotas = 90;
      } else {
        setDataCredito((old) => ({
          ...old,
          plazo: 30,
        }));
        plazo_cuotas = 30;
      }
      const data = {
        valor_total_trx: dataCredito?.valorSimulacion,
        nombre_comercio: roleInfo?.["nombre comercio"],
        Datos: {
          plazo: plazo_cuotas,
        },
      };
      notifyPending(
        peticionSimulacionCredito({}, data),
        {
          render: () => {
            return "Procesando Simulación Crédito";
          },
        },
        {
          render: ({ data: res }) => {
            setDataCredito((old) => ({
              ...old,
              consultSiian: res?.obj,
              formPeticion: 1,
              showModal: false,
            }));
            setListadoCuotas(res?.obj?.listaCuotas);
            return "Simulación Crédito satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Simulación Crédito fallida";
          },
        }
      );
    },
    [roleInfo, pdpUser, dataCredito, navigate]
  );
  const [loadingPeticionSimulacionCredito, peticionSimulacionCredito] =
    useFetch(
      fetchCustom(
        URL_REALIZAR_SIMULACION_CREDITO,
        "POST",
        "Realizar simulación crédito"
      )
    );

  return (
    <Modal show={dataCredito?.showModal} className="flex align-middle">
      <>
        <Form onSubmit={simulacionCredito}>
          {dataCredito?.estadoPeticion === 1 ? (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
              <h1 className="text-2xl text-center mb-5 font-semibold">
                Simulación de Crédito
              </h1>
              <MoneyInput
                id="valor"
                name="valor"
                label="Valor a simular"
                type="text"
                min={enumParametrosCreditosPDP.MINCREDITOPREAPROBADO}
                max={dataCredito?.valorPreaprobado}
                autoComplete="off"
                maxLength={"12"}
                value={dataCredito?.valorSimulacion}
                required
                onInput={(e, val) => {
                  setDataCredito((old) => ({
                    ...old,
                    valorSimulacion: val,
                  }));
                }}
                equalError={false}
                equalErrorMin={false}
              />
              <>
                <ButtonBar>
                  <Button
                    type="submit"
                    disabled={loadingPeticionSimulacionCredito}
                  >
                    Realizar Simulación
                  </Button>
                </ButtonBar>
              </>
            </div>
          ) : (
            <></>
          )}
        </Form>
      </>
    </Modal>
  );
};

export default ModalSimulacionCredito;
