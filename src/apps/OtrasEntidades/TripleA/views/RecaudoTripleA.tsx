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
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Form from "../../../../components/Base/Form/Form";
import BarcodeReader from "../../../../components/Base/BarcodeReader/BarcodeReader";
import Input from "../../../../components/Base/Input/Input";
import Select from "../../../../components/Base/Select/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import Tickets from "../../../../components/Base/Tickets/Tickets";
import Modal from "../../../../components/Base/Modal/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary/PaymentSummary";
import { notify, notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { v4 } from "uuid";

import { TypeInf, useFetchTripleARecaudo } from "../hooks/useFetchTripleARecaudo";
import { ErrorCustomFetch } from "../utils/utils";
import { TypeServicesBackendTripleA } from "../utils/typing";

import classes from "./Recaudo.module.css";
import { int } from "aws-sdk/clients/datapipeline";

//Constantes Style
const { styleComponents, styleComponentsInput, formItem } = classes;

//Typing
type TypingPaso =
  | "LecturaBarcode"
  | "LecturaTripleA"
  | "ResumenTrx"
  | "TrxExitosa";

type TypeProcedimiento = "Manual" | "Código de barras";

type TypingInputData = {
  numeroCupon: string;
};
type TypingConsultData = null | {
  numeroCupon: number;
  valorPagado: number;
  id_trx: number;
};

//Constantes
const name_componente = "Recaudo";
const infServiceBackend: TypeInf = {
  barcode: {
    url: `${process.env.REACT_APP_URL_TRIPLE_A}/backend_tripleA/transacciones/get-codigo-barras`,
    name: "tripleA - Lectura código de barras",
    method: "POST",
  },
  validation: {
    url: `${process.env.REACT_APP_URL_TRIPLE_A}/backend_tripleA/transacciones/validacion-facturas`,
    name: "tripleA - validacion",
    method: "POST",
  },
  pay: {
    url: `${process.env.REACT_APP_URL_TRIPLE_A}/backend_tripleA/transacciones/trx-pago-factura`,
    name: "tripleA - pago",
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
  numeroCupon: "",
};

//---------------------------Componente-----------------------------------------------
const RecaudoTripleA = () => {
  // const uniqueId = v4();
  const [paso, setPaso] = useState<TypingPaso>("LecturaBarcode");
  const [showModal2, setShowModal2] = useState(false);
  const [procedimiento, setProcedimiento] =
    useState<TypeProcedimiento>(option_barcode);
  const [inputData, setInputData] = useState<TypingInputData>(inputDataInitial);
  const [consultData, setConsultaData] = useState<TypingConsultData>(null);
  const [infTicket, setInfTicket] = useState(null);
  const printDiv = useRef(null);
  const buttonDelate = useRef<HTMLInputElement>(null);
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [loadingPeticion, PeticionBarcode, PeticionValidation,PeticionPay] =
    useFetchTripleARecaudo(infServiceBackend);

  useEffect(() => {
    setProcedimiento(option_manual);
    setPaso("LecturaTripleA");
  }, []);

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseTrx = useCallback((notify_error_: boolean) => {
    setShowModal2(false);
    if (notify_error_ === true) {
      notifyError("Transacción cancelada", 5000, {
        toastId: "notifyError-HandleCloseTrx",
      });
    }
    setInputData(inputDataInitial);
    // setConsultaData(null);
    setProcedimiento(option_manual);
    setPaso("LecturaTripleA");
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setPaso("LecturaTripleA");
    setShowModal2(false);
    setInfTicket(null);
    setInputData(inputDataInitial);
    // setConsultaData(null);
    setProcedimiento(option_manual);
    validNavigate("/TripleA/recaudos");
  }, [validNavigate]);

  const HandleCloseModal = useCallback(() => {
    if (paso === "LecturaBarcode" && !loadingPeticion) {
      HandleCloseTrx(true);
    } else if (paso === "LecturaTripleA" && !loadingPeticion) {
      HandleCloseTrx(true);
    }  else if (paso === "ResumenTrx" && !loadingPeticion) {
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
      setPaso("LecturaTripleA");
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
        .then((res: TypeServicesBackendTripleA) => {
          setPaso("LecturaTripleA");
          setInputData((old) => ({
            ...old,
            numeroCupon: res?.obj?.result?.numcupon,
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

  const onSubmitValidation = useCallback(
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
        numeroCupon: inputData.numeroCupon,
      };
      PeticionValidation(data)
        .then((res: TypeServicesBackendTripleA) => {
          setPaso("ResumenTrx");
          setConsultaData({
            numeroCupon: res?.obj?.result?.cupon,
            valorPagado: res?.obj?.result?.valorcupon,
            id_trx: res?.obj?.result?.id_trx,
          });
          setShowModal2(true);
        })
        .catch((error: any) => {
          if (!(error instanceof ErrorCustomFetch)) {
            const errorPdp = `Error respuesta Frontend PDP: Fallo al consumir el servicio (${infServiceBackend.validation.name}) [0010002]`;
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
    [PeticionValidation,HandleCloseTrx,inputData.numeroCupon,pdpUser,roleInfo]
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
        numeroCupon: consultData?.numeroCupon,
        id_trx: consultData?.id_trx,
        valorPagado: consultData?.valorPagado,
      };
      PeticionPay(data)
        .then((res: TypeServicesBackendTripleA) => {
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
    [pdpUser,roleInfo,consultData,HandleCloseTrx,PeticionPay]
  );

  //********************Funciones Demas**************************
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  //*********************HTML*************************************
  return (
    <Fragment>
      <SimpleLoading show={loadingPeticion}></SimpleLoading>
      <h1 className="text-3xl mt-6">Recaudo Triple A</h1>
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
        {/******************************Lectura Triple A*******************************************************/}
        {paso === "LecturaTripleA" && (
          <Fragment>
            <h1>Número de cupón</h1>

            <Input
              label=""
              required
              className={styleComponentsInput}
              type="text"
              autoComplete="off"
              maxLength={30}
              value={inputData.numeroCupon}
              disabled={procedimiento === option_barcode ? true : false}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setInputData((old) => ({
                  ...old,
                  numeroCupon: ((e.target.value ?? "").match(/\d/g) ?? []).join(
                    ""

                  ),
                }))
              }
            />

            <ButtonBar className="flex justify-center py-6">
              <Button
                type={"submit"}
                onClick={onSubmitValidation}
                disabled={loadingPeticion}
              >
                Consultar cupón
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

        {/******************************Respuesta Lectura Triple A*******************************************************/}
      </Form>
      <Modal show={showModal2} handleClose={HandleCloseModal}>
        {/******************************Resumen de trx validacion*******************************************************/}
        {paso === "ResumenTrx" && consultData !== null && (
          <PaymentSummary
            title="Respuesta de consulta cupón Triple A"
            subtitle="Resumen de transacción"
            summaryTrx={{
              "Número de cupón": inputData.numeroCupon,
              "Valor a pagar": formatMoney.format(consultData.valorPagado),
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

export default RecaudoTripleA;
