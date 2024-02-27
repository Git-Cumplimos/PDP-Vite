import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Modal from "../../../../../components/Base/Modal";
import TicketsDavivienda from "../../components/TicketsDavivienda";
import Form from "../../../../../components/Base/Form";
import Select from "../../../../../components/Base/Select";
import Input from "../../../../../components/Base/Input";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import { TypeInfTicket } from "../../../../../utils/TypingUtils";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../../utils/notify";
import {
  useFetchPagoDaviplata,
  useTimerCustom,
} from "../../hooks/useFetchPagoDaviplata";
import {
  TypingDataInput,
  TypingDataComercio,
  TypingDataConsult,
  NameVar,
  TypingDataPay,
} from "../../utils/typingPagoDaviplata";

//FRAGMENT ******************** ENUM ***************************
export enum NameVarSee {
  tipoDocumento = "Tipo de documento",
  numeroIdentificacion = "Número de documento",
  valor_total_trx = "Valor a pagar",
}

//FRAGMENT ******************** TYPING ***************************
type TypeProceso = "Ninguno" | "Resumen" | "TrxExitosa";

type TypeSummaryTrx = {
  [NameVarSee.tipoDocumento]?: string;
  [NameVarSee.numeroIdentificacion]?: string;
  [NameVarSee.valor_total_trx]?: string;
};

type TypeDataSee = {
  summaryTrx: TypeSummaryTrx;
  ticket?: TypeInfTicket;
};

//FRAGMENT ******************** CONST *******************************
const tipoDocumentoOptions: { [key: string]: string } = {
  "01": "Cédula de Ciudadanía",
  "02": "Cédula de Extranjería",
  "04": "Tarjeta de Identidad",
};

const options_select: Array<{ value: string; label: string }> = Object.keys(
  tipoDocumentoOptions
).map((key_: string) => ({
  value: key_,
  label: tipoDocumentoOptions[key_],
}));

const dataInputInitial: TypingDataInput = {
  [NameVar.tipoDocumento]: "01",
  [NameVar.numeroIdentificacion]: "",
  [NameVar.valor_total_trx]: 0,
  [NameVar.otp]: "",
};

const dataSeeInitial: TypeDataSee = {
  summaryTrx: {},
};

//FRAGMENT ******************** COMPONENT ***************************
const PagoDaviplata = () => {
  const { roleInfo, pdpUser }: any = useAuth();
  const [dataInput, setDataInput] = useState<TypingDataInput>(dataInputInitial);
  const [dataConsult, setDataConsult] = useState<TypingDataConsult>({});
  const [dataSee, setDataSee] = useState<TypeDataSee>(dataSeeInitial);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [proceso, setProceso] = useState<TypeProceso>("Ninguno");
  const [loadingPeticion, PeticionConsult, PeticionPay] =
    useFetchPagoDaviplata();
  const [startTimer, stopTimer, loadingTimeout, errorTimeout] =
    useTimerCustom(180);
  const validNavigate = useNavigate();
  const printDiv = useRef(null);
  const dataComercio: TypingDataComercio = useMemo(() => {
    const tipo_comercio = roleInfo?.tipo_comercio ?? "";
    return {
      comercio: {
        id_comercio: roleInfo?.id_comercio ?? 0,
        id_usuario: roleInfo?.id_usuario ?? 0,
        id_terminal: roleInfo?.id_usuario ?? 0,
      },
      nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
      nombre_usuario: pdpUser?.uname ?? "",
      address: roleInfo?.direccion ?? "",
      dane_code: roleInfo?.codigo_dane,
      city: roleInfo?.ciudad,
      country: "CO",
      oficina_propia:
        tipo_comercio.search("KIOSCO") >= 0 ||
        tipo_comercio.search("OFICINAS PROPIAS") >= 0
          ? true
          : false,
    };
  }, [roleInfo, pdpUser?.uname]);

  const handleCloseNinguno = useCallback(
    (cancelada: boolean = false, valueNavigate?: string) => {
      if (valueNavigate !== undefined) {
        validNavigate(valueNavigate);
      }
      setDataInput(dataInputInitial);
      if (cancelada === true) {
        notifyError("Transacción cancelada por el usuario");
      }
      setShowModal(false);
    },
    [validNavigate]
  );

  const handleCloseModal = useCallback(() => {
    handleCloseNinguno(false, "/");
  }, [handleCloseNinguno]);

  useEffect(() => {
    if (errorTimeout) {
      handleCloseNinguno(false, "/");
      stopTimer();
    }
  }, [errorTimeout, stopTimer, handleCloseNinguno]);

  const onSubmitConsultOtp = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      notifyPending(
        PeticionConsult(dataComercio, dataInput),
        {
          render: () => {
            return "Procesando Consulta Recaudo";
          },
        },
        {
          render: ({ data: dataConsult_ }: { data: TypingDataConsult }) => {
            setDataSee((old) => ({
              ...old,
              summaryTrx: {
                [NameVarSee.tipoDocumento]:
                  tipoDocumentoOptions[dataInput.tipoDocumento],
                [NameVarSee.numeroIdentificacion]:
                  dataInput.numeroIdentificacion,
                [NameVarSee.valor_total_trx]: formatMoney.format(
                  dataInput.valor_total_trx
                ),
              },
            }));
            setDataConsult(dataConsult_);
            setProceso("Resumen");
            setShowModal(true);
            startTimer();
            return "Consulta OTP satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            handleCloseNinguno(false, "/");
            return error?.message ?? "Consulta OTP fallida";
          },
        }
      );
    },
    [dataComercio, dataInput, PeticionConsult, handleCloseNinguno, startTimer]
  );

  const onSubmitPay = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      stopTimer();
      notifyPending(
        PeticionPay(dataComercio, dataInput, dataConsult),
        {
          render: () => {
            return "Procesando Pago";
          },
        },
        {
          render: ({ data: dataPay_ }: { data: TypingDataPay }) => {
            setDataSee((old) => ({
              ...old,
              ticket: dataPay_.ticket,
            }));
            setProceso("TrxExitosa");
            return "Pago satisfactorio";
          },
        },
        {
          render: ({ data: error }) => {
            handleCloseNinguno(false, "/");
            return error?.message ?? "Pago fallido";
          },
        }
      );
    },
    [
      dataComercio,
      dataInput,
      dataConsult,
      stopTimer,
      PeticionPay,
      handleCloseNinguno,
    ]
  );

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      <SimpleLoading show={loadingPeticion ? true : false}></SimpleLoading>
      <h1 className="text-3xl mt-6">Pago Con DaviPlata</h1>
      <Form onSubmit={onSubmitConsultOtp} grid>
        <div className="col-span-2">
          <div className=" grid grid-cols-4  grid-rows-4">
            <div className="col-start-2 col-span-2">
              <Select
                name={NameVar.tipoDocumento}
                id={NameVar.tipoDocumento}
                label={NameVarSee.tipoDocumento}
                options={options_select}
                onChange={(ev: ChangeEvent<any>) =>
                  setDataInput((old) => ({
                    ...old,
                    [ev.target.name]: ev.target.value,
                  }))
                }
              />
              <br></br>
              <Input
                name={NameVar.numeroIdentificacion}
                label={NameVarSee.numeroIdentificacion}
                type="text"
                autoComplete="off"
                minLength={5}
                maxLength={12}
                value={dataInput.numeroIdentificacion}
                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                  setDataInput((old) => ({
                    ...old,
                    [ev.target.name]: (
                      (ev.target.value ?? "").match(/\d/g) ?? []
                    ).join(""),
                  }))
                }
                required
              />
              <br></br>
              <MoneyInput
                name={NameVar.valor_total_trx}
                label="Ingrese el valor a pagar"
                // decimalDigits={2} //No Se usa este por que es sin decimales
                equalError={false}
                equalErrorMin={true}
                minLength={1}
                maxLength={13}
                autoComplete="off"
                // defaultValue={inputData.valor_total_trx} //No Se usa este por que es con decimales
                value={dataInput.valor_total_trx} //se usa este por que es sin decimales
                onInput={(e: FormEvent<HTMLInputElement>, valor: number) => {
                  setDataInput((old) => ({ ...old, valor_total_trx: valor }));
                }}
                required
              />
              <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"}>Realizar Consulta</Button>
                <Button onClick={() => handleCloseNinguno(true, "/")}>
                  Cancelar
                </Button>
              </ButtonBar>
            </div>
          </div>
        </div>
      </Form>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {/**************** Resumen **********************/}
        {proceso === "Resumen" && (
          <PaymentSummary
            title={"Respuesta de consulta"}
            subtitle="Resumen de la transacción"
            summaryTrx={dataSee.summaryTrx}
          >
            <Form onSubmit={onSubmitPay} grid>
              <Input
                name={NameVar.otp}
                label="Ingrese OTP"
                type="text"
                autoComplete="off"
                minLength={6}
                maxLength={6}
                value={dataInput.otp}
                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                  setDataInput((old) => ({
                    ...old,
                    [ev.target.name]: (
                      (ev.target.value ?? "").match(/\d/g) ?? []
                    ).join(""),
                  }))
                }
                required
              />
              {loadingTimeout && (
                <div className="animate-spin">
                  <span className="bi bi-arrow-clockwise text-2xl" />
                </div>
              )}
              <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"}>Realizar Pago</Button>
                <Button onClick={() => handleCloseNinguno(true, "/")}>
                  Cancelar
                </Button>
              </ButtonBar>
            </Form>
          </PaymentSummary>
        )}
        {/**************** Resumen **********************/}
        {/**************** Trx Exitosa **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {proceso === "TrxExitosa" && dataSee.ticket && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <TicketsDavivienda ticket={dataSee.ticket} refPrint={printDiv} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={handleCloseModal}>Cerrar</Button>
              </ButtonBar>
            </div>
          )}
        </div>
        {/*************** Trx Exitosa **********************/}
      </Modal>
    </Fragment>
  );
};

export default PagoDaviplata;
