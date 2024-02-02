import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Tickets from "../../../../components/Base/Tickets";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { postTransferenciaComisiones } from "../../utils/fetchTransferenciaCom";

const MovimientoComisionesCupo = () => {
  const { quotaInfo, roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: 1000000,
    inferior: 100,
  });

  useEffect(() => {
    if (!quotaInfo || 
      (quotaInfo && Object.keys(quotaInfo).length === 0) ||
      (quotaInfo && Object.values(quotaInfo).every(val => [""," ",0].includes(val)) )
    ) {
      navigate("/");
    } else {
      let hasKeys = true;
      if (["TRANSFERENCIA_MENSUAL"].includes(String(quotaInfo?.tipo_pago_comision).toUpperCase() ?? "")){
        hasKeys = false
      }
      if (!hasKeys) {
        notifyError(
          "No se permite la transferencia de comisión, esta se realiza mensualmente"
        );
        navigate("/");
      }
    }
  }, [quotaInfo, navigate]);

  const isComercioPadre = useMemo(
    () => pdpUser?.is_comercio_padre ?? false,
    [pdpUser]
  );
  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de transferencia comisiones a cupo",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id transaccion recarga*/
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 0],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0],
      /*ciudad*/
      ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Sin datos"],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
      ["Tipo de operación", "Transferencia comisiones a cupo"],
      ["", ""],
    ],
    commerceName: roleInfo?.["nombre comercio"]
      ? roleInfo?.["nombre comercio"]
      : "Sin datos",
    trxInfo: [],
    disclamer:
      "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
  });
  const [datosTrans, setDatosTrans] = useState({
    valor: 0,
    seleccion: "",
    saldoComision: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    console.log(quotaInfo?.comision);
    setDatosTrans((old) => ({
      ...old,
      saldoComision: quotaInfo?.comision,
    }));
  }, [quotaInfo?.comision]);

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans.seleccion === "Parcial") {
      if (datosTrans.valor > limiteRecarga.superior)
        return notifyError(
          "El valor de la transferencia debe ser menor a " +
            formatMoney.format(limiteRecarga.superior)
        );
      if (datosTrans.valor < limiteRecarga.inferior)
        return notifyError(
          `El valor de la transferencia debe ser mayor a ${formatMoney.format(
            limiteRecarga.inferior
          )}`
        );
    }
    habilitarModal();
  };

  /*Funcion para habilitar el modal*/
  const habilitarModal = () => {
    setShowModal(!showModal);
  };
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const hideModal = () => {
    setShowModal(false);
    setDatosTrans((old) => ({
      ...old,
      valor: 0,
      seleccion: "",
    }));
    setEstadoPeticion(0);
    setObjTicketActual({
      title: "Recibo de transferencia comisiones a cupo",
      timeInfo: {
        "Fecha de venta": "",
        Hora: "",
      },
      commerceInfo: [
        /*id transaccion recarga*/
        /*id_comercio*/
        ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 0],
        /*id_dispositivo*/
        [
          "No. terminal",
          roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
        ],
        /*ciudad*/
        ["Municipio", roleInfo?.ciudad ? roleInfo?.ciudad : "Sin datos"],
        /*direccion*/
        ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "Sin datos"],
        ["Tipo de operación", "Transferencia comisiones a cupo"],
        ["", ""],
      ],
      commerceName: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "Sin datos",
      trxInfo: [],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    });
  };

  const transferenciaComision = () => {
    const obj = {};
    if (datosTrans.seleccion === "Parcial") obj["valor"] = datosTrans.valor;
    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    setIsUploading(true);
    postTransferenciaComisiones({
      ...obj,
      id_comercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 0,
      id_usuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 0,
      id_terminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
      nombre_usuario: pdpUser?.uname ?? "",
      nombre_comercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "No hay datos",
      opcion: datosTrans.seleccion,
      ticket: objTicket,
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          objTicket["trxInfo"].push([
            "No. de aprobación PDP",
            res?.obj?.id_trx,
          ]);
          objTicket["trxInfo"].push(["", ""]);
          objTicket["trxInfo"].push([
            "Valor",
            formatMoney.format(res?.obj?.valor_transferencia),
          ]);
          objTicket["trxInfo"].push(["", ""]);
          setObjTicketActual(objTicket);
          setEstadoPeticion(1);
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          hideModal();
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        hideModal();
        console.error(err);
      });
  };

  if (isComercioPadre) {
    return (
      <Navigate
        to={"/billetera-comisiones/movimiento-comisiones-cupo-usuario-padre"}
        replace
      />
    );
  }

  if (datosTrans.saldoComision === undefined) {
    return <Fragment />;
  }

  if (parseInt(datosTrans.saldoComision) <= 0) {
    return (
      <>
        <SimpleLoading show={isUploading} />
        <h1 className="text-3xl mb-10 text-center">
          No tiene saldo de comisiones suficiente para realizar la transferencia
          a cupo
        </h1>
      </>
    );
  }

  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl mb-10 text-center">
        Movimiento billetera comisiones al cupo PDP
      </h1>
      <Form grid onSubmit={onSubmit} autoComplete="off">
        <MoneyInput
          id="comisionActual"
          name="comisionActual"
          label="Saldo comisión Actual"
          autoComplete="off"
          maxLength={"15"}
          defaultValue={datosTrans.saldoComision}
          disabled
        />
        <Select
          id="seleccion"
          name="seleccion"
          label="Tipo de transferencia"
          options={{
            "": "",
            Total: "Total",
            Parcial: "Parcial",
          }}
          value={datosTrans.seleccion ?? ""}
          onChange={(e) => {
            setDatosTrans((old) => {
              return { ...old, seleccion: e.target.value };
            });
          }}
          required
        />
        {datosTrans.seleccion === "Parcial" && (
          <MoneyInput
            id="valor"
            name="valor"
            label="Valor a transferir"
            type="text"
            autoComplete="off"
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={(e, valor) => {
              if (!isNaN(valor)) {
                const num = valor;
                setDatosTrans((old) => {
                  return { ...old, valor: num };
                });
              }
            }}
            required
          ></MoneyInput>
        )}
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          {estadoPeticion === 0 ? (
            <>
              <h1 className="text-2xl font-semibold">
                ¿Está seguro de realizar la transferencia de comisión?
              </h1>
              {datosTrans.seleccion === "Parcial" ? (
                <h2 className="text-base">
                  {`Valor de transferencia: ${formatMoney.format(
                    datosTrans.valor
                  )} `}
                </h2>
              ) : (
                <h2 className="text-base">
                  {`Valor de transacción: ${formatMoney.format(
                    datosTrans.saldoComision ?? 0
                  )} `}
                </h2>
              )}
              <ButtonBar>
                <Button onClick={hideModal}>Cancelar</Button>
                <Button type="submit" onClick={transferenciaComision}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          ) : (
            <>
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      hideModal();
                      navigate(-1);
                    }}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
              <Tickets ticket={objTicketActual} refPrint={printDiv}></Tickets>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MovimientoComisionesCupo;
