import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsAval from "../../components/TicketsAval";
import {
  postConsultaConveniosAval,
  postConsultaTablaConveniosEspecifico,
  postRecaudoConveniosAval,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";
import { nuraDepositoDale } from "../../utils/nuraDepositoDale";

const NURA_DEPOSITO_DALE = nuraDepositoDale.NURA_DEPOSITO_DALE;

const TransaccionDepositoDale = () => {
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();

  const [{ showModal, estadoPeticion }, setShowModal] = useState({
    showModal: false,
    estadoPeticion: 0,
  });
  const [datosTrans, setDatosTrans] = useState({
    ref1: "",
    ref2: "",
    valor: "",
    valorConst: "",
    valorVar: "",
  });
  const [objTicketActual, setObjTicketActual] = useState({});
  const [datosConsulta, setDatosConsulta] = useState({});
  const [isUploading, setIsUploading] = useState(true);
  const [convenio, setConvenio] = useState([]);
  useEffect(() => {
    if (NURA_DEPOSITO_DALE) {
      fecthTablaConveniosEspecificoFunc();
    } else {
      navigate("../");
    }
  }, [NURA_DEPOSITO_DALE]);

  const fecthTablaConveniosEspecificoFunc = () => {
    postConsultaTablaConveniosEspecifico({
      nura: NURA_DEPOSITO_DALE,
    })
      .then((autoArr) => {
        setConvenio(autoArr?.results[0]);
        setIsUploading(false);
      })
      .catch((err) => console.error(err));
  };
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onSubmit = (e) => {
    e.preventDefault();
    if (parseInt(datosTrans.ref1) <= 0) {
      return notifyError("El número Dale no puede ser 0");
    }
    setIsUploading(true);
    postConsultaConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: datosTrans.valor !== "" ? datosTrans.valor : 0,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        numeroConvenio: convenio.nura,
        valReferencia1: datosTrans.ref1,
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          let valorTrxCons = res?.obj?.valorTrx ?? 0;
          setIsUploading(false);
          notify(res?.msg);
          setDatosConsulta(res?.obj);
          setDatosTrans((old) => ({
            ...old,
            valorConst: valorTrxCons ?? "",
            valorVar: res?.obj?.valorTrx,
          }));
          setShowModal((old) => ({ ...old, showModal: true }));
        } else {
          setIsUploading(false);
          handleClose();
          notifyError(res?.msg);
          navigate(-1);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        handleClose();
        console.error(err);
        navigate(-1);
      });
  };
  const onSubmitpago = (e) => {
    e.preventDefault();
    let valorTransaccion = parseFloat(datosTrans?.valor) ?? 0;
    setIsUploading(true);
    postRecaudoConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: valorTransaccion,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        nombreConvenio: convenio.convenio,
        numeroConvenio: convenio.nura,
        valReferencia1: datosTrans.ref1,
        pila: datosConsulta?.["pila"] ?? "",
        54: datosConsulta?.tipoRecaudo?.["54"] ?? "",
        62: datosConsulta?.tipoRecaudo?.["62"] ?? "",
        103: datosConsulta?.tipoRecaudo?.["103"] ?? "",
        104: datosConsulta?.tipoRecaudo?.["104"] ?? "",
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          setObjTicketActual(res?.obj?.ticket);
          setShowModal((old) => ({ ...old, estadoPeticion: 4 }));
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          handleClose();
          navigate(-1);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        handleClose();
        console.error(err);
        navigate(-1);
      });
  };
  const handleClose = useCallback(() => {
    setShowModal((old) => ({ ShowModal: false, estadoPeticion: 0 }));
    setDatosTrans({
      ref1: "",
      ref2: "",
      valor: "",
      valorConst: "",
      valorVar: "",
    });
    setObjTicketActual({});
    setDatosConsulta({});
    navigate(-1);
  }, [roleInfo]);
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl text-center mb-10 mt-5">Depósito Dale</h1>
      <Form onSubmit={onSubmit}>
        <Input
          id="ref1"
          label="Número de celular"
          type="text"
          name="ref1"
          minLength="10"
          maxLength="10"
          required
          value={datosTrans.ref1}
          autoComplete="off"
          onInput={(e) => {
            let valor = e.target.value;
            let num = valor.replace(/[\s\.\-+eE]/g, "");
            if (!isNaN(num)) {
              if (datosTrans.ref1.length === 0 && num !== "3") {
                return notifyError("El número de celular debe comenzar por 3");
              }
              if (num.length > 0)
                if (num[0] !== "3")
                  return notifyError(
                    "El número de celular debe comenzar por 3"
                  );
              setDatosTrans((old) => {
                return { ...old, ref1: num };
              });
            }
          }}
        ></Input>
        {convenio?.parciales === "1" && (
          <MoneyInput
            id="valCashOut"
            name="valCashOut"
            label="Valor a depositar"
            type="text"
            autoComplete="off"
            maxLength={"10"}
            decimalDigits={2}
            defaultValue={datosTrans.valor ?? ""}
            onInput={(ev, val) => {
              setDatosTrans((old) => {
                return { ...old, valor: val };
              });
            }}
            min={0}
            max={enumParametrosGrupoAval.MAX_RECAUDO_AVAL}
            equalError={false}
            equalErrorMin={false}
          />
        )}
        <ButtonBar>
          <Button
            onClick={() => {
              notifyError("Transacción cancelada por el usuario");
              handleClose();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit">Realizar consulta</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {estadoPeticion === 0 ? (
            <>
              <h1 className="text-2xl text-center mb-5 font-semibold">
                Resultado consulta
              </h1>
              <h2>{`Nombre convenio: ${convenio?.convenio}`}</h2>
              <h2>{`Número convenio: ${convenio?.nura}`}</h2>
              <h2>{`Número de celular: ${datosTrans.ref1}`}</h2>
              <h2 className="text-base font-semibold">
                {`Valor consultado: ${formatMoney.format(
                  datosConsulta?.valorTrx ?? "0"
                )} `}
              </h2>
              {convenio?.parciales === "1" ? (
                <Form grid onSubmit={onSubmitpago}>
                  <MoneyInput
                    id="valCashOut"
                    name="valCashOut"
                    label="Valor a pagar"
                    min={enumParametrosGrupoAval.MIN_RECAUDO_AVAL}
                    max={enumParametrosGrupoAval.MAX_RECAUDO_AVAL}
                    type="text"
                    decimalDigits={2}
                    autoComplete="off"
                    maxLength={"12"}
                    defaultValue={datosTrans.valor ?? ""}
                    // defaultValue={datosTrans.valorConst ?? ""}
                    onInput={(ev, valMoney) =>
                      setDatosTrans((old) => ({
                        ...old,
                        valorConst: valMoney,
                        valorVar: valMoney,
                        valor: valMoney,
                      }))
                    }
                    equalError={false}
                    equalErrorMin={false}
                    required
                  ></MoneyInput>
                  <ButtonBar>
                    <Button
                      onClick={() => {
                        notifyError("Transacción cancelada por el usuario");
                        handleClose();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Realizar pago</Button>
                  </ButtonBar>
                </Form>
              ) : (
                <>
                  <ButtonBar>
                    <Button
                      onClick={() => {
                        notifyError("Transacción cancelada por el usuario");
                        handleClose();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" onClick={onSubmitpago}>
                      Realizar pago
                    </Button>
                  </ButtonBar>
                </>
              )}
            </>
          ) : estadoPeticion === 4 ? (
            <>
              <TicketsAval
                ticket={objTicketActual}
                refPrint={printDiv}
              ></TicketsAval>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button type="button" onClick={handleClose}>
                  Cerrar
                </Button>
              </ButtonBar>
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </>
  );
};

export default TransaccionDepositoDale;
