import React, {
  FormEvent,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import Input from "../../../../components/Base/Input/Input";
import MoneyInput from "../../../../components/Base/MoneyInput/MoneyInput";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Form from "../../../../components/Base/Form/Form";
import { notify, notifyError } from "../../../../utils/notify";
import Modal from "../../../../components/Base/Modal/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary/PaymentSummary";
import { formatMoney } from "../../../../components/Base/MoneyInputDec";
import { toPhoneNumber } from "../../../../utils/functions";
import { useAuth } from "../../../../hooks/AuthHooks";
import {
  PropOperadoresComponent,
  TypeOutputDataRecargas,
} from "../TypeDinamic";
import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useReactToPrint } from "react-to-print";
import { ErrorCustomFetch } from "../utils/utils";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";

//------ typíng--------
type TypeInfo = "Ninguno" | "Resumen" | "TrxExitosa";
type TypeDataRecarga = {
  celular: string;
  valor_total_trx: number;
};
type TypeInfTicket = { [key: string]: any } | null;

//------ constantes generales--------
const minValor = 1000;
const maxValor = 100000;
const dataRecargaInitial = {
  celular: "",
  valor_total_trx: 0,
};

const Recargas = ({
  operadorCurrent,
  children,
}: {
  operadorCurrent: PropOperadoresComponent;
  children: ReactNode;
}) => {
  const [dataRecarga, setDataRecarga] =
    useState<TypeDataRecarga>(dataRecargaInitial);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [infTicket, setInfTicket] = useState<TypeInfTicket>(null);
  const [typeInfo, setTypeInfo] = useState<TypeInfo>("Ninguno");
  const printDiv = useRef(null);
  const validNavigate = useNavigate();

  const id_uuid = v4();
  const { roleInfo, pdpUser }: any = useAuth();
  const useHookDynamic = operadorCurrent?.backend;
  const [statePeticionRecargar, PeticionRecargar] = useHookDynamic(
    operadorCurrent.name,
    operadorCurrent.autorizador,
    "recargas"
  );

  const onCelChange = (e: any) => {
    let valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    if (valueInput[0] != 3) {
      if (valueInput != "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        valueInput = "";
      }
    }
    setDataRecarga((old) => ({ ...old, celular: valueInput }));
  };

  const onMoneyChange = (e: any, valor: any) => {
    setDataRecarga((old) => ({ ...old, valor_total_trx: valor }));
  };

  const onSubmitSummary = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowModal(true);
    setTypeInfo("Resumen");
  };

  const RealizarTrx = (e: any) => {
    e.preventDefault();
    console.log(operadorCurrent);
    PeticionRecargar({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: dataRecarga,
      id_uuid: id_uuid,
      parameters_operador: operadorCurrent.parameters_operador,
      parameters_submodule: operadorCurrent.parameters_submodule,
    })
      .then((result: TypeOutputDataRecargas) => {
        if (result?.status === true) {
          if (result?.ticket) {
            setInfTicket(result?.ticket);
          }
          notify(`Recarga ${operadorCurrent.name} exitosa`);
          setTypeInfo("TrxExitosa");
        } else {
          notifyError(
            `Error respuesta PDP: Fallo al consumir el servicio (${operadorCurrent.name} - status) [0010002]`
          );
          handleCloseError();
        }
      })
      .catch((error: any) => {
        handleCloseError();
        let msg = `Error respuesta PDP: Fallo al consumir el servicio (${operadorCurrent.name} - catch) [0010002]`;
        if (error instanceof ErrorCustomFetch) {
        } else {
          notifyError(msg);
        }
      });
  };

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setDataRecarga(dataRecargaInitial);
    setInfTicket(null);
    validNavigate("/telefonia-movil");
  }, []);

  const handleCloseError = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    setTypeInfo("Ninguno");
    setDataRecarga(dataRecargaInitial);
  }, []);

  const handleCloseCancelada = useCallback(() => {
    setShowModal(false);
    setTypeInfo("Ninguno");
    notify("Recarga cancelada");
    setDataRecarga(dataRecargaInitial);
    setInfTicket(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (typeInfo === "Resumen" && !statePeticionRecargar) {
      handleCloseCancelada();
    } else if (typeInfo === "TrxExitosa") {
      handleCloseRecarga();
    } else if (statePeticionRecargar) {
      notify("Se está procesando la transacción, por favor esperar");
    }
  }, [
    typeInfo,
    statePeticionRecargar,
    handleCloseCancelada,
    handleCloseRecarga,
  ]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <div className="py-8 mt-6 flex items-center flex-col border-solid border-2 border-slate-600 rounded-2xl">
      {children}
      <Form onSubmit={onSubmitSummary} grid>
        <div className="col-span-2">
          <div className=" grid grid-cols-4  grid-rows-4">
            <div className="row-start-2 col-start-2 col-span-2">
              <Input
                className="col-span-2"
                name="celular"
                label="Número de celular"
                type="tel"
                autoComplete="off"
                minLength={10}
                maxLength={10}
                value={dataRecarga.celular}
                onChange={onCelChange}
                required
                info={""}
                invalid={""}
              />
            </div>

            <div className="row-start-4 col-start-2 col-span-2">
              <MoneyInput
                name="valor"
                label="Valor a recargar"
                equalError={false}
                equalErrorMin={false}
                autoComplete="off"
                min={minValor}
                max={maxValor}
                minLength={"4"}
                maxLength={"9"}
                value={dataRecarga.valor_total_trx}
                onInput={onMoneyChange}
                required
              />
            </div>
          </div>
        </div>
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Recarga</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {/**************** Resumen de la recarga **********************/}
        {typeInfo === "Resumen" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Operador: operadorCurrent.name,
              Celular: toPhoneNumber(dataRecarga.celular),
              Valor: formatMoney.format(dataRecarga.valor_total_trx),
            }}
          >
            {!statePeticionRecargar ? (
              <>
                <ButtonBar>
                  <Button type="submit" onClick={(e: any) => RealizarTrx(e)}>
                    Aceptar
                  </Button>
                  <Button onClick={handleCloseCancelada}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        )}
        {/**************** Resumen de la recarga **********************/}
        {/**************** Recarga Exitosa **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {infTicket && typeInfo === "TrxExitosa" && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <Tickets refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={handleCloseRecarga}>Cerrar</Button>
              </ButtonBar>
            </div>
          )}
        </div>
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </div>
  );
};

export default Recargas;
