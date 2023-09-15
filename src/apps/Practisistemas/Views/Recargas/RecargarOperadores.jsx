import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import useMoney from "../../../../hooks/useMoney";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import { v4 } from "uuid";
import { enumLimiteApuestas } from "../enumLimiteApuestas";
import { useFetchPractisistemas } from "../../hooks/fetchPractisistemasHook";

const minValor = enumLimiteApuestas.minRecagas;
const maxValor = enumLimiteApuestas.maxRecargas;

const URL_RECARGA = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/recarga`;
const URL_CONSULTA_RECARGA = `${process.env.REACT_APP_PRACTISISTEMAS}/recargasCelular/consulta-estado-trx`;


const RecargasOperadores = () => {
  //Variables
  const [inputCelular, setInputCelular] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [respuesta, setRespuesta] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { roleInfo, pdpUser } = useAuth();
  const { state } = useLocation();
  const printDiv = useRef();
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const [infTicket, setInfTicket] = useState({});

  const onChangeMoney = useMoney({
    limits: [minValor, maxValor],
    equalError: false,
  });

  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && inputCelular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setInputCelular(valueInput);
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();
    if (inputValor != 0) {
      setShowModal(true);
      setTypeInfo("ResumenRecarga");
    } else {
      notify(
        `El valor de la recarga debe ser mayor a ${formatMoney.format(
          minValor
        )}`
      );
    }
    if (inputCelular[0] != 3) {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      handleClose();
    }
  };

  const [loadingPeticionRecarga, peticionRecarga] = useFetchPractisistemas(
    URL_RECARGA,
    URL_CONSULTA_RECARGA,
    "Realizar recarga practisistemas"
  );

  const fecthEnvioTransaccion = useCallback(
    (ev) => {
      ev.preventDefault();
      setRespuesta(true);
      const data = {
        comercio: {
          id_comercio: roleInfo.id_comercio,
          id_terminal: roleInfo.id_dispositivo,
          id_usuario: roleInfo.id_usuario,
          id_uuid_trx: id_uuid,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        nombre_comercio: roleInfo["nombre comercio"],
        valor_total_trx: parseInt(inputValor),
        nombre_usuario: pdpUser?.uname ?? "",
        address: roleInfo?.direccion,
        datos_recargas: {
          celular: inputCelular,
          operador: state?.producto,
          jsonAdicional: {
            operador: state?.operador_recargar,
          },
        },
      };
      const dataAditional = {
        id_uuid_trx: id_uuid,
      };
      notifyPending(
        peticionRecarga(data, dataAditional),
        {
          render: () => {
            return "Procesando recarga";
          },
        },
        {
          render: ({ data: res }) => {
            setInfTicket(res?.obj?.ticket);
            setTypeInfo("RecargaExitosa");
            return "Recarga satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate("/recargas-paquetes");
            return error?.message ?? "Recarga fallida";
          },
        }
      );
    },
    [roleInfo, pdpUser, id_uuid, state, inputCelular, inputValor, validNavigate]
  );
  const handleClose = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setInputCelular("");
    setInputValor("");
    setInfTicket({});
    validNavigate("/recargas-paquetes");
  }, []);

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    validNavigate("/recargas-paquetes");
    handleClose();
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Recarga cancelada");
    validNavigate("/recargas-paquetes");
    handleClose();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  useEffect(() => {
    if (!state?.operador_recargar) {
      validNavigate("../recargas-paquetes");
    }
  }, [state?.operador_recargar]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recargas a {state?.operador_recargar}</h1>
      <Form onSubmit={onSubmitCheck} grid>
        <Input
          name="celular"
          label="Número de celular"
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular}
          onChange={onCelChange}
          required
          disabled={loadingPeticionRecarga}
        />

        <MoneyInput
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={minValor}
          max={maxValor}
          equalError={false}
          equalErrorMin={false}
          minLength={"4"}
          maxLength={"9"}
          value={inputValor}
          onInput={(ev) => setInputValor(onChangeMoney(ev))}
          required
          disabled={loadingPeticionRecarga}
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Recarga</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleClose}>
        {/**************** Resumen de la recarga **********************/}
        {typeInfo === "ResumenRecarga" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputCelular),
              Valor: formatMoney.format(inputValor),
            }}>
            <>
              <ButtonBar>
                <Button 
                  onClick={handleCloseCancelada}
                  disabled={loadingPeticionRecarga}>
                  Cancelar
                </Button>
                <Button 
                  type={"submit"} 
                  onClick={fecthEnvioTransaccion}
                  disabled= {loadingPeticionRecarga}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
            <SimpleLoading show={respuesta} />
          </PaymentSummary>
        )}
        {/**************** Recarga Exitosa **********************/}
        {infTicket && typeInfo === "RecargaExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleCloseRecarga}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default RecargasOperadores;
