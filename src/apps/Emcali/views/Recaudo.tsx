import React, {
  Fragment,
  useCallback,
  useRef,
  useState,
  ChangeEvent,
  MouseEvent,
  useEffect,
} from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import BarcodeReader from "../../../components/Base/BarcodeReader/BarcodeReader";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import SimpleLoading from "../../../components/Base/SimpleLoading/SimpleLoading";
import Tickets from "../../../components/Base/Tickets/Tickets";
import Modal from "../../../components/Base/Modal/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { formatMoney } from "../../../components/Base/MoneyInput";
import { v4 } from "uuid";

import { TypeInf, useFetchEmcaliRecaudo } from "../hooks/useFetchEmcaliRecaudo";
import { ErrorCustomFetch } from "../utils/utils";
import { TypeServicesBackendEmcali } from "../utils/typing";

import classes from "./Recaudo.module.css";

//Constantes Style
const { styleComponents, styleComponentsInput, formItem } = classes;

//Typing
type TypingPaso =
  | "LecturaBarcode"
  | "LecturaEmcali"
  | "ResumenTrx"
  | "TrxExitosa";

type TypeProcedimiento = "Manual" | "Código de barras";

type TypingInputData = {
  numcupon: string;
};
type TypingConsultData = null | {
  nombre: string;
  subscriptor: number;
  valorcupon: number;
  id_trx: number;
};

//Constantes
const name_componente = "Recaudo";
const infServiceBackend: TypeInf = {
  barcode: {
    url: `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/transacciones/get-codigo-barras`,
    name: "Emcali - Lectura código de barras",
    method: "POST",
  },
  consult: {
    url: `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/transacciones/consulta-por-referencia`,
    name: "Emcali - consulta",
    method: "POST",
  },
  pay: {
    url: `${process.env.REACT_APP_URL_EMCALI}/backend_emcali/transacciones/trx-pago-cupon`,
    name: "Emcali - pago",
    method: "POST",
  },
};

const option_manual = "Manual";
const option_barcode = "Código de barras";
const options_select = [
  { value: option_barcode, label: option_barcode },
  { value: option_manual, label: option_manual },
];
const inputDataInitial: TypingInputData = {
  numcupon: "",
};

//---------------------------Componente-----------------------------------------------
const Recaudo = () => {
  // const uniqueId = v4();
  const [paso, setPaso] = useState<TypingPaso>("LecturaBarcode");
  const [showModal, setShowModal] = useState(false);
  const [procedimiento, setProcedimiento] =
    useState<TypeProcedimiento>(option_barcode);
  const [inputData, setInputData] = useState<TypingInputData>(inputDataInitial);
  const [consultData, setConsultaData] = useState<TypingConsultData>(null);
  const [infTicket, setInfTicket] = useState(null);
  const printDiv = useRef(null);
  const buttonDelate = useRef<HTMLInputElement>(null);
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [loadingPeticion, PeticionBarcode, PeticionConsult, PeticionPay] =
    useFetchEmcaliRecaudo(infServiceBackend);

  useEffect(() => {
    setProcedimiento(option_manual);
    setPaso("LecturaEmcali");
  }, []);

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseTrx = useCallback((notify_error_: boolean) => {
    setShowModal(false);
    if (notify_error_ === true) {
      notifyError("Transacción cancelada", 5000, {
        toastId: "notifyError-HandleCloseTrx",
      });
    }
    setInputData(inputDataInitial);
    setConsultaData(null);
    setProcedimiento(option_manual);
    setPaso("LecturaEmcali");
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setPaso("LecturaEmcali");
    setShowModal(false);
    setInfTicket(null);
    setInputData(inputDataInitial);
    setConsultaData(null);
    setProcedimiento(option_manual);
    validNavigate("/emcali");
  }, [validNavigate]);

  const HandleCloseModal = useCallback(() => {
    if (paso === "LecturaBarcode" && !loadingPeticion) {
      HandleCloseTrx(true);
    } else if (paso === "LecturaEmcali" && !loadingPeticion) {
      HandleCloseTrx(true);
    } else if (paso === "ResumenTrx" && !loadingPeticion) {
      HandleCloseTrx(true);
    } else if (paso === "TrxExitosa") {
      HandleCloseTrxExitosa();
    }
  }, [paso, HandleCloseTrx, HandleCloseTrxExitosa, loadingPeticion]);

  //********************Funciones onChange**************************
  const onChangeSelect = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setInputData(inputDataInitial);
    if (e.target.value === option_barcode) {
      setPaso("LecturaBarcode");
      setProcedimiento(option_barcode);
    } else if (e.target.value === option_manual) {
      setPaso("LecturaEmcali");
      setProcedimiento(option_manual);
    }
  }, []);

  //********************Funciones onSubmit**************************
  const onSubmitBarcode = useCallback(
    (info: any) => {
      const data = {
        codigo_barras: info,
      };

      PeticionBarcode(data)
        .then((res: TypeServicesBackendEmcali) => {
          setPaso("LecturaEmcali");
          setInputData((old) => ({
            ...old,
            numcupon: res?.obj?.result?.numcupon,
          }));
        })
        .catch((error: any) => {
          if (!(error instanceof ErrorCustomFetch)) {
            const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServiceBackend.barcode.name}) [0010002]`;
            const errorSequence = `${name_componente} - realizar la lectura de codigo de barras directamente en el modulo`;
            console.error({
              "Error PDP": errorPdp,
              "Error Sequence": errorSequence,
              "Error Console": `${error.message}`,
            });
          }
          buttonDelate.current && buttonDelate.current.click(); // no me esta funcionando
        });
    },
    [PeticionBarcode]
  );

  const onSubmitConsult = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      e.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.["id_comercio"] ?? "",
          id_usuario: roleInfo?.["id_usuario"] ?? "",
          id_terminal: roleInfo?.["id_dispositivo"] ?? "",
          nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
          nombre_usuario: pdpUser?.["uname"] ?? "",
        },
        numcupon: inputData.numcupon,
      };

      PeticionConsult(data)
        .then((res: TypeServicesBackendEmcali) => {
          setPaso("ResumenTrx");
          setConsultaData({
            nombre: res?.obj?.result?.nombre,
            valorcupon: parseInt(res?.obj?.result?.valorcupon),
            subscriptor: res?.obj?.result?.suscriptor,
            id_trx: res?.obj?.result?.id_trx,
          });
          setShowModal(true);
        })
        .catch((error: any) => {
          if (!(error instanceof ErrorCustomFetch)) {
            const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServiceBackend.consult.name}) [0010002]`;
            const errorSequence = `${name_componente} - realizar consulta directamente en el modulo`;
            console.error({
              "Error PDP": errorPdp,
              "Error Sequence": errorSequence,
              "Error Console": `${error.message}`,
            });
          }
          HandleCloseTrx(false);
        });
    },
    [PeticionConsult, HandleCloseTrx, inputData.numcupon, pdpUser, roleInfo]
  );

  const onSubmitPay = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      let tipo__comercio = roleInfo?.["tipo_comercio"] ?? "";
      tipo__comercio = tipo__comercio.toLowerCase();
      const data = {
        comercio: {
          id_comercio: roleInfo?.["id_comercio"] ?? "",
          id_usuario: roleInfo?.["id_usuario"] ?? "",
          id_terminal: roleInfo?.["id_dispositivo"] ?? "",
          oficina_propia:
            tipo__comercio.search("kiosco") >= 0 ||
            tipo__comercio.search("oficinas propias") >= 0
              ? true
              : false,
          // id_uuid_trx: uniqueId,
          nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
          nombre_usuario: pdpUser?.["uname"] ?? "",
        },
        numcupon: inputData?.numcupon,
        subscriptor: consultData?.subscriptor,
        valor_total_trx: consultData?.valorcupon,
        id_trx: consultData?.id_trx,
        tipo_recaudo: procedimiento === option_manual ? "manual" : "barcode",
      };
      PeticionPay(data)
        .then((res: TypeServicesBackendEmcali) => {
          setPaso("TrxExitosa");
          setInfTicket(res?.obj?.result?.ticket);
          notify("Transacción exitosa");
        })
        .catch((error: any) => {
          if (!(error instanceof ErrorCustomFetch)) {
            const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServiceBackend.pay.name}) [0010002]`;
            const errorSequence = `${name_componente} - realizar pago directamente en el modulo`;
            console.error({
              "Error PDP": errorPdp,
              "Error Sequence": errorSequence,
              "Error Console": `${error.message}`,
            });
          }
          HandleCloseTrx(false);
        });
    },
    [
      pdpUser,
      roleInfo,
      inputData?.numcupon,
      procedimiento,
      consultData,
      HandleCloseTrx,
      PeticionPay,
    ]
  );

  //********************Funciones Demas**************************
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  //*********************HTML*************************************
  return (
    <Fragment>
      <SimpleLoading show={loadingPeticion}></SimpleLoading>
      <h1 className="text-3xl mt-6">Recaudo Emcali</h1>
      <Form grid={false} className=" flex flex-col content-center items-center">
        <h1>Tipo de captura</h1>
        <div className={styleComponents}>
          <Select
            id="opciones"
            label=""
            options={options_select}
            onChange={onChangeSelect}
            value={procedimiento}
          />
        </div>

        {/******************************Lectura Barcode*******************************************************/}
        {paso === "LecturaBarcode" && (
          <Fragment>
            <BarcodeReader
              onSearchCodigo={onSubmitBarcode}
              disabled={loadingPeticion}
            />

            <div className={formItem} ref={buttonDelate}>
              <button type="reset">Volver a ingresar código de barras</button>
            </div>
          </Fragment>
        )}
        {/******************************Lectura Barcode*******************************************************/}

        {/******************************Lectura Emcali*******************************************************/}
        {paso === "LecturaEmcali" && (
          <Fragment>
            <h1>Número de referencia</h1>

            <Input
              label=""
              required
              className={styleComponentsInput}
              type="text"
              autoComplete="off"
              maxLength={30}
              value={inputData.numcupon}
              disabled={procedimiento === option_barcode ? true : false}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setInputData((old) => ({
                  ...old,
                  numcupon: ((e.target.value ?? "").match(/\d/g) ?? []).join(
                    ""
                  ),
                }))
              }
            />

            <ButtonBar className="flex justify-center py-6">
              <Button
                type={"submit"}
                onClick={onSubmitConsult}
                disabled={loadingPeticion}
              >
                Realizar Consulta
              </Button>
              <Button
                onClick={() => HandleCloseTrx(true)}
                disabled={loadingPeticion}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </Fragment>
        )}

        {/******************************Respuesta Lectura runt*******************************************************/}
      </Form>

      <Modal show={showModal} handleClose={HandleCloseModal}>
        {/******************************Resumen de trx*******************************************************/}
        {paso === "ResumenTrx" && consultData !== null && (
          <PaymentSummary
            title="Respuesta de consulta Emcali"
            subtitle="Resumen de transacción"
            summaryTrx={{
              "Número de referencia": inputData.numcupon,
              Nombre: consultData.nombre,
              "Total a pagar": formatMoney.format(consultData.valorcupon),
            }}
          >
            <ButtonBar>
              <Button type="submit" onClick={onSubmitPay}>
                Realizar Pago
              </Button>
              <Button onClick={() => HandleCloseTrx(true)}>Cancelar</Button>
            </ButtonBar>
          </PaymentSummary>
        )}
        {/******************************Resumen de trx*******************************************************/}

        {/**************** TransaccionExitosa **********************/}
        {infTicket && paso === "TrxExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={HandleCloseTrxExitosa}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default Recaudo;
