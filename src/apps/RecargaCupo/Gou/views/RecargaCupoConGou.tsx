import React, {
  ChangeEvent,
  Fragment,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Form from "../../../../components/Base/Form";
import MoneyInput from "../../../../components/Base/MoneyInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import InputLong from "../components/InputLong";
import { do_compare, get_value } from "../utils/utils_function";
import { useAuth } from "../../../../hooks/AuthHooks";
import {
  TypingDataComercio,
  TypingDataCrearSesion,
  TypingDataPay,
} from "../utils/utils_typing";
import classes from "./RecargaCupoConGou.module.css";
import { notifyError, notifyPending } from "../../../../utils/notify";
import useHookRecargarCupo from "../hook/useHookRecagarCupo";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useNavigate } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Tickets from "../../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import { TypeInfTicket } from "../../../../utils/TypingUtils";

const { contendorFather, contendorSoon, contendorSoonTrx } = classes;

//FRAGMENT ******************** TYPING *******************************
type TypingProcess = "Ninguno" | "Pay" | "TrxExitosa";

type TypingDataInput = {
  nombre_completo: string;
  correo: string;
  "correo|confirmacion": string;
  celular: string;
  "celular|confirmacion": string;
  documento: string;
  tipo_documento: string;
  referencia: string;
  fecha: string;
  valor_trx: string;
};

type TypingDataInvalid = {
  nombre_completo: string;
  "correo|confirmacion": string;
  celular: string;
  "celular|confirmacion": string;
};

//FRAGMENT ******************** CONST *******************************
const valor_total_trx_maximo = 10000000;
const routeInicial = "../recarga-cupo";
const tipoDocumentoOptions: { [key: string]: string } = {
  "Cedula de Ciudadanía": "Cédula de Ciudadanía",
  "Cédula de Extranjería": "Cédula de Extranjería",
  NIT: "NIT",
  Pasaporte: "Pasaporte",
  "Permiso Especial de Permanecía": "Permiso Especial de Permanecía",
};

const options_select: Array<{ value: string; label: string }> = Object.keys(
  tipoDocumentoOptions
).map((key_: string) => ({
  value: key_,
  label: tipoDocumentoOptions[key_],
}));

const dataInputInitial: TypingDataInput = {
  nombre_completo: "alisson",
  correo: "",
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
  documento: "",
  tipo_documento: "",
  referencia: "",
  fecha: "",
  valor_trx: "1000",
};

const dataInvalidInitial: TypingDataInvalid = {
  nombre_completo: "",
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
};

const RecargaCupoConGou = () => {
  const { roleInfo, pdpUser }: any = useAuth();
  const validNavigate = useNavigate();
  const printDiv = useRef(null);
  const [dataInput, setDataInput] = useState<TypingDataInput>(dataInputInitial);
  const [dataInvalid, setDataInvalid] =
    useState<TypingDataInvalid>(dataInvalidInitial);
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);

  const {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    dataSeePay,
  } = useHookRecargarCupo();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [process, setProcess] = useState<TypingProcess>("Ninguno");

  const dataComercio: TypingDataComercio = useMemo(() => {
    const tipo_comercio = roleInfo?.tipo_comercio ?? "";
    return {
      id_comercio: roleInfo?.id_comercio ?? 0,
      id_usuario: roleInfo?.id_usuario ?? 0,
      id_terminal: roleInfo?.id_usuario ?? 0,
      nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
      nombre_usuario: pdpUser?.uname ?? "",
      oficina_propia:
        tipo_comercio.search("KIOSCO") >= 0 ||
        tipo_comercio.search("OFICINAS PROPIAS") >= 0
          ? true
          : false,
      location: {
        address: roleInfo?.direccion ?? "",
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
        country: "CO",
      },
    };
  }, [roleInfo, pdpUser?.uname]);

  useEffect(() => {
    setDataInput((old) => ({
      ...old,
      fecha: Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
      referencia: dataComercio.id_comercio.toString(),
    }));
  }, [dataComercio]);

  useEffect(() => {
    if (dataSeePay) {
      setProcess("Pay");
      setShowModal(true);
    }
  }, [dataSeePay]);

  const onChangeDataInput = useCallback(
    (ev: ChangeEvent<HTMLFormElement>) => {
      const structure_get_value = ev.target.id.split("/")[1];
      if (structure_get_value) {
        const [value, is_change, msg_invalid_get_value] = get_value(
          structure_get_value,
          ev.target.value ?? ""
        );
        if (is_change) {
          setDataInput((old) => ({ ...old, [ev.target.name]: value }));
        }
        if (dataInvalid.hasOwnProperty(ev.target.name)) {
          setDataInvalid((old) => ({
            ...old,
            [ev.target.name]: msg_invalid_get_value,
          }));
        }
        const structure_compare = ev.target.id.split("/")[2];
        if (structure_compare) {
          const [, key_change, msg_invalid_do_compare] = do_compare(
            { ...dataInput },
            ev.target.name,
            value,
            structure_compare
          );
          if (
            dataInvalid.hasOwnProperty(key_change) &&
            msg_invalid_get_value === ""
          ) {
            setDataInvalid((old) => ({
              ...old,
              [key_change]: msg_invalid_do_compare,
            }));
          }
        }
      }
    },
    [dataInput, dataInvalid]
  );

  const handleCloseNinguno = useCallback(
    (cancelada: boolean = false, valueNavigate?: string) => {
      if (valueNavigate !== undefined) {
        validNavigate(valueNavigate);
      }
      setDataInput(dataInputInitial);
      if (cancelada === true) {
        notifyError("Transacción cancelada por el usuario");
      }
      setProcess("Ninguno");
      setShowModal(false);
    },
    [validNavigate]
  );

  const handleCloseModal = useCallback(() => {
    if (process === "Pay" && loadingPeticion) {
      notifyError(
        "La transacción continua en verificación, por favor esperar un momento",
        5000,
        {
          toastId: "notify-lot",
        }
      );
    }
    if (process === "TrxExitosa") {
      handleCloseNinguno(false, routeInicial);
    }
  }, [handleCloseNinguno, loadingPeticion, process]);

  const onSubmitCheckPay = useCallback(
    (ev: MouseEvent<HTMLFormElement>) => {
      ev.preventDefault();
      notifyPending(
        PeticionCheckPay(dataComercio, dataInput, "rrr"),
        {
          render: () => {
            return "Procesando";
          },
        },
        {
          render: ({ data }: { data: TypingDataPay }) => {
            setTicket(data.ticket);
            setProcess("TrxExitosa");
            return "Pago aprobado";
          },
        },
        {
          render: ({ data: error }) => {
            handleCloseNinguno(false, routeInicial);
            return error?.message ?? "Pago rechazado";
          },
        }
      );
    },
    [PeticionCheckPay, dataComercio, dataInput, handleCloseNinguno]
  );

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <Fragment>
      <SimpleLoading
        show={loadingPeticionBlocking ? true : false}
      ></SimpleLoading>
      <div className={contendorFather}>
        <div className={contendorSoon}>
          <Form onChange={onChangeDataInput} grid>
            <InputLong
              id="nombre_completo/letters"
              name="nombre_completo"
              label="Nombre Completo"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput.nombre_completo}
              invalid={dataInvalid.nombre_completo}
              required
            />
            <InputLong
              id="correo/email/correo|confirmacion=>correo"
              name="correo"
              label="Correo electrónico"
              type="email"
              autoComplete="off"
              maxLength={70}
              value={dataInput.correo}
              required
            />
            <InputLong
              id="correo|confirmacion/email/correo|confirmacion=>correo"
              name="correo|confirmacion"
              label="Confirmación de correo electrónico"
              type="email"
              autoComplete="off"
              maxLength={70}
              value={dataInput["correo|confirmacion"]}
              invalid={dataInvalid["correo|confirmacion"]}
              required
            />
            <Input
              id="celular/cel/celular|confirmacion=>celular"
              name="celular"
              label="Número de celular"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput.celular}
              invalid={dataInvalid.celular}
              required
            />
            <Input
              id="celular|confirmacion/cel/celular|confirmacion=>celular"
              name="celular|confirmacion"
              label="Confirmar número de celular"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput["celular|confirmacion"]}
              invalid={dataInvalid["celular|confirmacion"]}
              required
            />
            <Select label="Tipo de documento" options={options_select} />

            <Input
              id="documento/number"
              name="documento"
              label="Número de documento"
              type="text"
              autoComplete="off"
              minLength={5}
              maxLength={10}
              value={dataInput.documento}
              required
            />
          </Form>
        </div>

        <fieldset className={contendorSoonTrx}>
          <legend className="font-bold text-xl">
            Descripción de la transacción
          </legend>
          <Form onChange={onChangeDataInput} grid>
            <Input
              label="Tipo de trámite"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={"Recarga Cupo"}
              required
            />
            <Input
              label="Número de referencia"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput.referencia}
              required
            />
            <Input
              label="Fecha"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput.fecha}
              required
            />
            <MoneyInput
              name="valor_trx"
              label="Ingrese el valor a pagar"
              // decimalDigits={2} //No Se usa este por que es con decimales
              equalError={false}
              equalErrorMin={true}
              autoComplete="off"
              min={0}
              // max={Math.min(
              //   valor_total_trx_maximo,
              //   consultData?.valor_faltante
              // )}
              // maxLength={len_valor_total_trx_maximo}
              // defaultValue={inputData.valor_total_trx} //No Se usa este por que es con decimales
              value={dataInput.valor_trx} //se usa este por que es con decimales
              onInput={(ev: any, valor: any) => {
                setDataInput((old) => ({ ...old, [ev.target.name]: valor }));
              }}
              required
            />
          </Form>
        </fieldset>
        <Input
          type="radio"
          name="valor_total_trx_checkbox"
          id={"valor_total_trx_checkbox_1"}
          label="Acepta Términos y Condiciones"
          required={true}
          value={0}
          // onChange={(ev: ChangeEvent<HTMLInputElement>) =>
          //   setDataInput((old) => ({
          //     ...old,
          //     valor_total_trx: parseFloat(ev.target.value),
          //   }))
          // }
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button
            // disabled={loadingState || loadingPeticionConsultaPin}
            type={"submit"}
            onClick={onSubmitCheckPay}
          >
            Realizar Pago
          </Button>
        </ButtonBar>
      </div>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {/**************** Pay **********************/}
        {process === "Pay" && (
          <PaymentSummary
            title="Por favor realizar el pago"
            subtitle="Si ya realizo el pago, espere un momento, estamos verificando"
            summaryTrx={dataSeePay}
          >
            <></>
          </PaymentSummary>
        )}
        {/**************** Pay **********************/}
        {/**************** Trx Exitosa **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {process === "TrxExitosa" && ticket && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <Tickets ticket={ticket} refPrint={printDiv} />
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

export default RecargaCupoConGou;
