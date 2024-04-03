import React, { useCallback, useState, FormEvent, useRef } from "react";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import { notifyPending } from "../../../utils/notify";
import { useFetchAlmaseg } from "../hooks/useFetchAlmaseg";
import { v4 } from "uuid";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetchAlmasegTrx } from "../hooks/useFetchAlmasegTrx";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Base/Modal";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";

//--------- Typing ------------------
type TypeDataInput = {
  numero_factura: string;
  numero_identificacion_retiro: string;
};
type TypeDataOutput = null | {
  numero_identificacion: string;
  tipo_identificacion: string;
  nombres: string;
  valor_total: string;
  valor_total_trx: number;
  id_trx_retiro_directo: number;
  tipo_trx_retiro_directo: number;
  pk_id_recaudo: number;
  numero_factura: string;
};

//--------- constantes ------------------
const dataInputInitial = {
  numero_factura: "",
  numero_identificacion_retiro: "",
};
const url_consulta = `${process.env.REACT_APP_URL_ALMASEG}/servicio_almaseg/consulta-generacion-pin`;
const URL_REALIZAR_RETIRO_ALMASEG = `${process.env.REACT_APP_URL_ALMASEG}/servicio_almaseg/retiro-almaseg`;
const URL_CONSULTAR_RETIRO_ALMASEG = `${process.env.REACT_APP_URL_ALMASEG}/servicio_almaseg/check-estado-retiro-almaseg`;

//--------- componente ------------------
const ConsultaGeneracionPin = (): JSX.Element => {
  const { roleInfo, pdpUser } = useAuth();
  const uniqueId = v4();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [peticion, setPeticion] = useState(false);
  const [dataInput, setDataInput] = useState<TypeDataInput>(dataInputInitial);
  const [dataOutput, setDataOutput] = useState<TypeDataOutput>(null);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [loadingPeticionConsultaPin, peticionConsultaPin] = useFetchAlmaseg(
    url_consulta,
    "consulta generación pin",
    "POST"
  );
  const fetchAlmasegFunc = useFetchAlmasegTrx(
    URL_REALIZAR_RETIRO_ALMASEG,
    URL_CONSULTAR_RETIRO_ALMASEG,
    "Realizar retiro Almaseg"
  );
  const { loadingState, fetchAlmasegTrx } = fetchAlmasegFunc;

  const doOnReset = useCallback(() => {
    setShowModal(false);
    setPeticion(false);
    setDataInput((old) => ({
      ...old,
      ...dataInputInitial,
    }));
    setDataOutput(null);
  }, []);
  const doOnResetAll = useCallback(() => {
    doOnReset();
    navigate(-1);
  }, [doOnReset, navigate]);

  const doOnSubmit = useCallback(
    (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.["id_comercio"] ?? 0,
          id_usuario: roleInfo?.["id_usuario"] ?? 0,
          id_terminal: roleInfo?.["id_dispositivo"] ?? 0,
        },
        oficina_propia:
          roleInfo?.["tipo_comercio"] === "OFICINAS PROPIAS" ||
          roleInfo?.["tipo_comercio"] === "KIOSCO"
            ? true
            : false,

        nombre_usuario: pdpUser?.["uname"] ?? "",
        numero_factura: dataInput.numero_factura,
      };
      notifyPending(
        peticionConsultaPin({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setDataOutput(res?.obj?.result);
            setDataInput((old) => ({
              ...old,
              numero_factura: res?.obj?.result?.numero_factura,
            }));
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            doOnResetAll();
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [peticionConsultaPin, dataInput, doOnResetAll, pdpUser, roleInfo]
  );
  const checkSubmit = useCallback((ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setShowModal(true);
    setPeticion(false);
  }, []);

  const doOnSubmitCashout = useCallback(
    (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.["tipo_comercio"] === "OFICINAS PROPIAS" ||
          roleInfo?.["tipo_comercio"] === "KIOSCO"
            ? true
            : false,
        comercio: {
          id_comercio: roleInfo?.["id_comercio"] ?? 0,
          id_usuario: roleInfo?.["id_usuario"] ?? 0,
          id_terminal: roleInfo?.["id_dispositivo"] ?? 0,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.["uname"] ?? "",
        numero_factura: dataInput.numero_factura,
        id_uuid_trx: uniqueId,
        direccion: roleInfo?.["direccion"],
        id_trx_retiro_directo: dataOutput?.["id_trx_retiro_directo"] ?? 0,
        pk_id_retiro: dataOutput?.["pk_id_recaudo"] ?? 0,
        valor_total_trx: dataOutput?.["valor_total_trx"] ?? 0,
        numero_identificacion: dataInput.numero_identificacion_retiro,
      };

      notifyPending(
        fetchAlmasegTrx(data, {}),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setPeticion(true);
            return "Transacción satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            doOnResetAll();
            return error?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [
      dataOutput,
      roleInfo,
      uniqueId,
      dataInput,
      pdpUser,
      doOnResetAll,
      fetchAlmasegTrx,
    ]
  );
  const printDiv = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  return (
    <>
      <h1 className="text-3xl mt-6">Consulta y pago de facturas Almaseg</h1>
      <div className="px-6 py-8 mt-6 flex items-center flex-col border-solid border-2 border-slate-600 rounded-2xl">
        <Form onSubmit={doOnSubmit} grid>
          <Input
            name="numero_factura"
            label="Número de factura"
            type="text"
            autoComplete="off"
            minLength={1}
            maxLength={20}
            value={dataInput.numero_factura}
            onChange={(ev) =>
              setDataInput((old) => ({
                ...old,
                [ev.target.name]: ev.target.value,
              }))
            }
            required
            disabled={dataOutput ? true : false}
          />
          <ButtonBar className={"lg:col-span-2"}>
            {!dataOutput && (
              <Button
                disabled={loadingState || loadingPeticionConsultaPin}
                type={"submit"}
              >
                Buscar
              </Button>
            )}
          </ButtonBar>
        </Form>
        {dataOutput ? (
          <>
            <Form grid onSubmit={checkSubmit}>
              <Input
                name="numero_identificacion_retiro"
                label="Número documento cliente"
                type="text"
                autoComplete="off"
                minLength={1}
                maxLength={12}
                value={dataInput.numero_identificacion_retiro}
                onChange={(ev) =>
                  setDataInput((old) => ({
                    ...old,
                    [ev.target.name]: (
                      (ev.target.value ?? "").match(/\d/g) ?? []
                    ).join(""),
                  }))
                }
                required
              />
              <ButtonBar className={"lg:col-span-2"}>
                <Button
                  disabled={loadingState || loadingPeticionConsultaPin}
                  type="reset"
                  onClick={doOnReset}
                >
                  Búsqueda nueva
                </Button>
              </ButtonBar>

              <div className="px-4 py-8 mt-6  grid gap-4 grid-cols-2 grid-rows-3 justify-items-center border-solid border-2 border-gray-400 rounded-2xl">
                <h2 className="font-semibold">Número de factura: </h2>
                <h2>{dataOutput?.numero_factura ?? ""}</h2>
                <h2 className="font-semibold">Tipo de identificación: </h2>
                <h2>{dataOutput?.tipo_identificacion ?? ""} </h2>
                <h2 className="font-semibold">Número de identificación: </h2>
                <h2>{dataOutput?.numero_identificacion ?? ""} </h2>
                <h2 className="font-semibold">Nombres y Apellidos: </h2>
                <h2>{dataOutput?.nombres ?? ""} </h2>
                <h2 className="font-semibold">Valor del PIN: </h2>
                <h2>{`$ ${dataOutput?.valor_total ?? ""}`} </h2>
              </div>
              <ButtonBar className="lg:col-span-2">
                <Button
                  disabled={loadingState || loadingPeticionConsultaPin}
                  type="submit"
                >
                  Realizar retiro
                </Button>
              </ButtonBar>
            </Form>
          </>
        ) : (
          <></>
        )}
      </div>
      <Modal show={showModal} handleClose={false}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {!peticion ? (
            <>
              <h1 className="text-2xl font-semibold">
                ¿Está seguro de realizar el retiro?
              </h1>
              <h2>{`Número de factura: ${
                dataOutput?.numero_factura ?? ""
              }`}</h2>
              <h2 className="text-base">
                {`Valor de transacción: $ ${dataOutput?.valor_total ?? ""} COP`}
              </h2>
              <Form grid onSubmit={doOnSubmitCashout}>
                <ButtonBar className="lg:col-span-2">
                  <Button
                    disabled={loadingState || loadingPeticionConsultaPin}
                    onClick={doOnResetAll}
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={loadingState || loadingPeticionConsultaPin}
                    type="submit"
                  >
                    Realizar retiro
                  </Button>
                </ButtonBar>
              </Form>
            </>
          ) : (
            <>
              <Tickets ticket={objTicketActual} refPrint={printDiv} />
              <h2>
                <ButtonBar>
                  <Button type="submit" onClick={doOnResetAll}>
                    Aceptar
                  </Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
                </ButtonBar>
              </h2>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ConsultaGeneracionPin;
