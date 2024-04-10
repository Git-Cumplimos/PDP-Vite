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
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Form from "../../../../components/Base/Form";
import MoneyInput from "../../../../components/Base/MoneyInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { TypeInfTicket } from "../../../../utils/TypingUtils";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { v4 } from "uuid";
import InputLong from "../components/InputLong";
import useHookRecargarCupo from "../hook/useHookRecagarCupo";
import { do_compare, get_value } from "../utils/utils_function";
import {
  TypingDataComercio,
  TypingDataInput,
  TypingDataPay,
} from "../utils/utils_typing";
import classes from "./RecargaCupoConGou.module.css";
import ModalAceptarTerminos from "../components/ModalAceptarTerminos/ModalAceptarTerminos";
import TicketsGou from "../../../Gou/components/TicketsGou";
import ModalExterno from "../components/ModalInfoClient/ModalExterno";
import { useImgs } from "../../../../hooks/ImgsHooks";

const { contendorFather, contendorSoon, contendorSoonTrx, contendorGou } =
  classes;

//FRAGMENT ******************** TYPING *******************************
type TypingProcess = "Ninguno" | "Pay" | "TrxExitosa";

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
  nombre_completo: "",
  correo: "",
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
  documento: "",
  tipo_documento: "",
  referencia: "",
  fecha: "",
  valor_trx: "",
  id_uuid_trx: "",
  tipo_tramite: "Recarga Cupo",
};

const dataInvalidInitial: TypingDataInvalid = {
  nombre_completo: "",
  "correo|confirmacion": "",
  celular: "",
  "celular|confirmacion": "",
};

const RecargaCupoConGou = () => {
  const { imgs } = useImgs();
  const { roleInfo, pdpUser }: any = useAuth();
  const validNavigate = useNavigate();
  const printDiv = useRef(null);
  const [dataInput, setDataInput] = useState<TypingDataInput>(dataInputInitial);
  const [dataInvalid, setDataInvalid] =
    useState<TypingDataInvalid>(dataInvalidInitial);
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalInfoClient, setShowModalInfoClient] = useState<any>(null);
  const [process, setProcess] = useState<TypingProcess>("Ninguno");
  const [acepto, setAcepto] = useState<{ [key: string]: boolean }>({
    open_modal: false,
    acepto: false,
  });

  const {
    loadingPeticion,
    loadingPeticionBlocking,
    PeticionCheckPay,
    dataSeePay,
  } = useHookRecargarCupo();
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
    const date_now = Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    setDataInput((old) => ({
      ...old,
      fecha: `${date_now.substring(6, 10)}-${date_now.substring(
        3,
        5
      )}-${date_now.substring(0, 2)}`,
      referencia: dataComercio.id_comercio.toString(),
      id_uuid_trx: v4(),
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
      if (ev.target.name === undefined && ev.target.id === undefined) return;
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
      if (dataInput.celular !== dataInput["celular|confirmacion"]) {
        notifyError("Verifique el numero celular", 2000, {
          toastId: "notify-validate-dataInput",
        });
        return;
      }
      if (dataInput.correo !== dataInput["correo|confirmacion"]) {
        notifyError("Verifique el correo", 2000, {
          toastId: "notify-validate-dataInput",
        });
        return;
      }
      notifyPending(
        PeticionCheckPay(dataComercio, dataInput, dataInput.id_uuid_trx),
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

  useEffect(() => {
    console.log(showModalInfoClient);
  }, [showModalInfoClient]);

  return (
    <div>
      <SimpleLoading
        show={loadingPeticionBlocking ? true : false}
      ></SimpleLoading>
      <form
        onChange={onChangeDataInput}
        onSubmit={onSubmitCheckPay}
        className="grid grid-cols-1 place-content-center place-items-center"
      >
        <div className={`${contendorFather}`}>
          <img
            className={"mb-2 mt-8"}
            src={`${imgs?.LogoGou}`}
            alt={"LogoGou"}
          />
          <div className={contendorSoon}>
            <div className="col-span-2">
              <Input
                id="nombre_completo/text"
                name="nombre_completo"
                label="Nombre Completo"
                type="text"
                autoComplete="off"
                maxLength={70}
                value={dataInput.nombre_completo}
                invalid={dataInvalid.nombre_completo}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                id="correo/email/correo|confirmacion=>correo"
                name="correo"
                label="Correo electrónico"
                type="email"
                autoComplete="off"
                maxLength={70}
                value={dataInput.correo}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                id="correo|confirmacion/email/correo|confirmacion=>correo"
                name="correo|confirmacion"
                label="Confirmación de correo electrónico"
                type="email"
                autoComplete="off"
                maxLength={70}
                value={dataInput["correo|confirmacion"]}
                invalid={dataInvalid["correo|confirmacion"]}
                required
                onPaste={(ev) => ev.preventDefault()}
                onDrop={(ev) => ev.preventDefault()}
              />
            </div>
            <Input
              id="celular/cel/celular|confirmacion=>celular"
              name="celular"
              label="Número de celular"
              type="text"
              autoComplete="off"
              minLength={10}
              maxLength={10}
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
              minLength={10}
              maxLength={10}
              value={dataInput["celular|confirmacion"]}
              invalid={dataInvalid["celular|confirmacion"]}
              required
              onPaste={(ev) => ev.preventDefault()}
              onDrop={(ev) => ev.preventDefault()}
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
          </div>
          <fieldset className={contendorSoonTrx}>
            <legend className="font-bold text-xl">
              Descripción de la transacción
            </legend>
            <Input
              label="Tipo de trámite"
              type="text"
              autoComplete="off"
              value={dataInput.tipo_tramite}
              required
              disabled
            />
            <Input
              label="Id unico"
              type="text"
              autoComplete="off"
              value={dataInput.id_uuid_trx}
              required
              disabled
            />
            <Input
              label="Número de referencia"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput.referencia}
              required
              disabled
            />
            <Input
              label="Fecha"
              type="text"
              autoComplete="off"
              maxLength={70}
              value={dataInput.fecha}
              required
              disabled
            />
            <MoneyInput
              name="valor_trx"
              label="Valor a pagar"
              // decimalDigits={2} //No Se usa este por que es con decimales
              equalError={false}
              equalErrorMin={false}
              autoComplete="off"
              min={10000}
              maxLength={11}
              // defaultValue={inputData.valor_total_trx} //No Se usa este por que es con decimales
              value={dataInput.valor_trx} //se usa este por que es con decimales
              onInput={(ev: any, valor: any) => {
                setDataInput((old) => ({
                  ...old,
                  [ev.target.name]: valor,
                }));
              }}
              required
            />
            <label className="px-5 pt-6 text-xl font-medium text-center">
              Señor usuario tenga en cuenta que esta transacción tiene un costo
              de $500 el cual será debitado de Cupo
            </label>
          </fieldset>
          <ButtonBar>
            <Button onClick={() => setShowModalInfoClient("Questions")}>
              Preguntas frecuentes
            </Button>
            <Button onClick={() => setShowModalInfoClient("Comunication")}>
              Canales de comunicación
            </Button>
          </ButtonBar>
          <Input
            type="checkbox"
            label="Acepta Términos y Condiciones"
            required={true}
            value={"acepto"}
            onChange={() =>
              setAcepto((old) => {
                if (!old.acepto) {
                  return { ...old, open_modal: true };
                } else {
                  return { ...old, acepto: false };
                }
              })
            }
            checked={acepto.acepto}
          />
        </div>
        <div className="grid grid-cols-2">
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>Realizar Pago</Button>
            <Button onClick={() => handleCloseNinguno(true, routeInicial)}>
              Cancelar
            </Button>
          </ButtonBar>
        </div>
      </form>

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
              <TicketsGou ticket={ticket} refPrint={printDiv} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={handleCloseModal}>Cerrar</Button>
              </ButtonBar>
            </div>
          )}
        </div>
        {/*************** Trx Exitosa **********************/}
      </Modal>
      {acepto.open_modal && (
        <ModalAceptarTerminos
          acepto={acepto.open_modal}
          setAcepto={setAcepto}
        ></ModalAceptarTerminos>
      )}
      {showModalInfoClient && (
        <ModalExterno
          showModalInfoClient={showModalInfoClient}
          setShowModalInfoClient={setShowModalInfoClient}
        ></ModalExterno>
      )}
    </div>
  );
};

export default RecargaCupoConGou;
