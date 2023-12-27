import React, { useCallback, useRef, useState } from "react";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../utils/notify";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import { v4 } from "uuid";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import {
  TypeTransaccionConsultaOutput,
  TypeInformacionTransaccionPagoInput,
  useBackendRecaudoGenerico,
  TypeInfTicket,
  TypeTransaccionPagoOutput,
} from "../hook/useHookBackend";
import TicketsAval from "../../Corresponsalia/CorresponsaliaGrupoAval/components/TicketsAval";
import TicketsAgrario from "../../Corresponsalia/CorresponsaliaBancoAgrario/components/TicketsBancoAgrario/TicketsAgrario";

//------ typíng--------
type TypeDataInput = {
  referencia: string; //string de solo numeros
  pk_id_convenio: number;
  convenio_name: string;
  valor_total_trx: string;
};
type TypeProceso = "Ninguno" | "Consulta" | "Resumen" | "TrxExitosa";
type TypeSummaryTrx = {
  Autorizador?: string;
  "Nombre convenio"?: string;
  "Número convenio"?: number;
  "Referencia 1"?: string; //string de solo numeros
  Valor?: string;
};

type TypeDataSee = {
  summaryTrx: TypeSummaryTrx;
  ticket?: TypeInfTicket;
};

//------ constantes generales--------
const valor_total_trx_maximo = 10000000;
const dataInputInitial: TypeDataInput = {
  referencia: "",
  pk_id_convenio: 0,
  convenio_name: "",
  valor_total_trx: "",
};
const dataSeeInitial: TypeDataSee = {
  summaryTrx: {},
};

const RecaudoTrx = () => {
  const { state } = useLocation();
  const { roleInfo, pdpUser }: any = useAuth();
  const [dataInput, setDataInput] = useState<TypeDataInput>({
    referencia: state.referencia ?? dataInputInitial.referencia,
    pk_id_convenio: state.pk_id_convenio,
    convenio_name: state.convenio_name ?? dataInputInitial.convenio_name,
    valor_total_trx: "",
  });

  const [
    loadingPeticionConsulta,
    PeticionConsulta,
    loadingPeticionPago,
    PeticionPago,
  ] = useBackendRecaudoGenerico({
    id_uuid_trx: v4(),
    comercio: {
      id_comercio: roleInfo?.id_comercio ?? "",
      id_terminal: roleInfo?.id_dispositivo ?? "",
      id_usuario: roleInfo?.id_usuario ?? "",
      nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
      nombre_usuario: pdpUser?.uname ?? "",
      oficina_propia:
        (roleInfo?.tipo_comercio ?? "").search("KIOSCO") >= 0 ||
        (roleInfo?.tipo_comercio ?? "").search("OFICINAS PROPIAS") >= 0
          ? true
          : false,
      location: {
        address: roleInfo.direccion ?? "",
        city: roleInfo.ciudad ?? "",
        dane_code: roleInfo.codigo_dane ?? "",
      },
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [proceso, setProceso] = useState<TypeProceso>("Ninguno");
  const [dataSee, setDataSee] = useState<TypeDataSee>(dataSeeInitial);

  const [dataConsult, setDataConsult] =
    useState<TypeTransaccionConsultaOutput | null>(null);
  const validNavigate = useNavigate();
  const printDiv = useRef(null);

  const handleCloseNinguno = useCallback(
    (cancelada: boolean = false, valueNavigate: string = "-1") => {
      setShowModal(false);
      setProceso("Ninguno");
      setDataInput(dataInputInitial);
      setDataSee(dataSeeInitial);
      if (valueNavigate === "-1") {
        validNavigate(-1);
      } else {
        validNavigate(valueNavigate);
      }
      if (cancelada === true) {
        notifyError("Transacción cancelada");
      }
    },
    [validNavigate]
  );

  const handleCloseModal = useCallback(() => {
    if (proceso === "Consulta") {
      handleCloseNinguno(true);
    }
    if (proceso === "Resumen" && !loadingPeticionPago) {
      handleCloseNinguno(true);
    }
    if (proceso === "TrxExitosa") {
      handleCloseNinguno(false, "../recaudo-generico");
    }
  }, [handleCloseNinguno, proceso, loadingPeticionPago]);

  const onSubmitConsult = useCallback(
    (ev) => {
      ev.preventDefault();
      notifyPending(
        PeticionConsulta(dataInput.pk_id_convenio, {
          referencia: dataInput.referencia,
        }),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({ data }) => {
            const dataResponse: TypeTransaccionConsultaOutput = data;
            setDataConsult(dataResponse);
            setDataSee((old) => ({
              ...old,
              summaryTrx: {
                ...old.summaryTrx,
                Autorizador: dataResponse.autorizador.name,
                "Nombre convenio": dataResponse.convenio.convenio_name,
                "Número convenio":
                  dataResponse.convenio.id_especifico_convenio_autorizador,
                "Referencia 1": dataResponse.referencia,
              },
            }));
            if (dataResponse.configuracion.realizar_consulta === true) {
              setDataInput((old) => ({
                ...old,
                valor_total_trx: (
                  dataResponse.valor_total_trx ?? ""
                ).toString(),
              }));
              setDataSee((old) => ({
                ...old,
                summaryTrx: {
                  ...old.summaryTrx,
                  Valor: formatMoney.format(dataResponse.valor_total_trx ?? 0),
                },
              }));
            }
            setShowModal(true);
            setProceso(
              dataResponse.configuracion.realizar_consulta === true &&
                dataResponse.configuracion.modificar_valor === false
                ? "Resumen"
                : "Consulta"
            );
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            handleCloseNinguno();
            return error?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [
      dataInput.pk_id_convenio,
      dataInput.referencia,
      PeticionConsulta,
      handleCloseNinguno,
    ]
  );

  const onSubmitValor = useCallback(
    (ev) => {
      ev.preventDefault();
      setDataSee((old) => ({
        ...old,
        summaryTrx: {
          ...old.summaryTrx,
          Valor: formatMoney.format(parseFloat(dataInput.valor_total_trx) ?? 0),
        },
      }));
      setProceso("Resumen");
    },
    [dataInput.valor_total_trx]
  );

  const onSubmitPay = useCallback(
    (ev) => {
      ev.preventDefault();
      const info_transaccion: TypeInformacionTransaccionPagoInput = {
        referencia: dataInput.referencia,
        convenio_name: dataConsult?.convenio?.convenio_name ?? "",
        datos_adicionales: dataConsult?.datos_adicionales ?? {},
      };
      if (dataInput.valor_total_trx !== "") {
        info_transaccion.valor_total_trx = parseFloat(
          dataInput.valor_total_trx
        );
      }
      if (dataConsult?.id_trx) {
        info_transaccion.id_trx = dataConsult?.id_trx;
      }

      notifyPending(
        PeticionPago(dataInput.pk_id_convenio, info_transaccion),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({ data }) => {
            const dataResponse: TypeTransaccionPagoOutput = data;
            setDataSee((old) => ({
              ...old,
              ticket: dataResponse.ticket,
            }));
            setProceso("TrxExitosa");
            return "Transacción satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            handleCloseNinguno();
            return error?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [
      dataInput.pk_id_convenio,
      dataInput.referencia,
      dataInput.valor_total_trx,
      dataConsult,
      PeticionPago,
      handleCloseNinguno,
    ]
  );

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <div>
      <SimpleLoading
        show={loadingPeticionConsulta || loadingPeticionPago ? true : false}
      ></SimpleLoading>
      <h1 className="text-3xl text-center mb-10 mt-5">
        Recaudo servicios públicos y privados
      </h1>
      <h1 className="text-2xl text-center mb-10">{`Convenio: ${dataInput.convenio_name}`}</h1>
      <Form onSubmit={onSubmitConsult} grid>
        <div className="col-span-2">
          <div className=" grid grid-cols-4  grid-rows-4">
            <div className="row-start-2 col-start-2 col-span-2">
              <Input
                className="col-span-2"
                name="referencia"
                label="Referencia 1"
                type="text"
                autoComplete="off"
                maxLength={20}
                value={dataInput.referencia}
                onChange={(ev) =>
                  setDataInput((old) => ({
                    ...old,
                    [ev.target.name]: (
                      (ev.target.value ?? "").match(/\d/g) ?? []
                    ).join(""),
                  }))
                }
                required
                disabled={
                  loadingPeticionConsulta
                    ? true
                    : (state.referencia ?? null) != null
                    ? true
                    : false
                }
                info={""}
                invalid={""}
              />
            </div>
          </div>
        </div>
        <ButtonBar className={"lg:col-span-2"}>
          <Button
            type={"submit"}
            disabled={loadingPeticionConsulta ? true : false}
          >
            Realizar Consulta
          </Button>
          <Button onClick={handleCloseNinguno}>Cancelar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {/**************** Consulta **********************/}
        {proceso === "Consulta" && (
          <PaymentSummary
            title="Respuesta de consulta"
            subtitle="Resumen de transacción"
            summaryTrx={dataSee.summaryTrx}
          >
            <Form onSubmit={onSubmitValor} grid>
              <MoneyInput
                name="valor_total_trx"
                label="Ingrese el valor a pagar"
                type="text"
                decimalDigits={2} //No Se usa este por que es con decimales
                equalError={false}
                equalErrorMin={true}
                autoComplete="off"
                min={dataConsult?.configuracion.valor_menor ?? 0}
                max={Math.min(
                  valor_total_trx_maximo,
                  dataConsult?.configuracion.valor_mayor ??
                    valor_total_trx_maximo
                )}
                maxLength={15}
                defaultValue={dataInput.valor_total_trx} //No Se usa este por que es con decimales
                // value={dataInput.valor_total_trx ?? "0"} //se usa este por que es con decimales
                disabled={
                  dataConsult?.configuracion.modificar_valor ?? false
                    ? false
                    : true
                }
                onInput={(ev: any, valor: any) => {
                  setDataInput((old) => ({ ...old, [ev.target.name]: valor }));
                }}
                required
              />
              <ButtonBar>
                <Button type="submit">Continuar</Button>
                <Button onClick={() => handleCloseNinguno(true)}>
                  Cancelar
                </Button>
              </ButtonBar>
            </Form>
          </PaymentSummary>
        )}
        {/**************** Consulta **********************/}
        {/**************** Resumen **********************/}
        {proceso === "Resumen" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={dataSee.summaryTrx}
          >
            <ButtonBar>
              <Button type="submit" onClick={onSubmitPay}>
                Realizar Pago
              </Button>
              <Button onClick={() => handleCloseNinguno(true)}>Cancelar</Button>
            </ButtonBar>
          </PaymentSummary>
        )}
        {/**************** Resumen **********************/}
        {/**************** Recarga Exitosa **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {proceso === "TrxExitosa" && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              {dataConsult?.autorizador.name === "AVAL" && (
                <TicketsAval
                  ticket={dataSee?.ticket ?? {}}
                  refPrint={printDiv}
                />
              )}
              {dataConsult?.autorizador.name === "AGRARIO" && (
                <TicketsAgrario
                  ticket={dataSee?.ticket ?? {}}
                  refPrint={printDiv}
                />
              )}
              {/* <Tickets refPrint={printDiv} ticket={dataSee?.ticket ?? {}} /> */}
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button
                  onClick={() =>
                    handleCloseNinguno(false, "../recaudo-generico")
                  }
                >
                  Cerrar
                </Button>
              </ButtonBar>
            </div>
          )}
        </div>
        {/*************** Recarga Exitosa **********************/}
      </Modal>
    </div>
  );
};

export default RecaudoTrx;
