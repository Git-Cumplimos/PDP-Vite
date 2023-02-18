import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { makeMoneyFormatter } from "../../../../utils/functions";
import { notify, notifyError } from "../../../../utils/notify";
import {
  postConsultaRecaudoMultiple,
  postInicializacionRecaudoMultiple,
} from "../utils/fetchRecaudoMultiple";
import { v4 } from "uuid";

const formatMoney = makeMoneyFormatter(2);

const MostrarRecaudosPagar = ({
  fileName,
  setIsUploading,
  setEstadoTrx,
  roleInfo,
  pdpUser,
  setUuid,
}) => {
  const [recaudosMultiples, setRecaudosMultiples] = useState({
    valor_total: 0,
    cantidad_transacciones: 0,
  });
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
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    fetchRecaudoMultipleFunc();
  }, [fileName]);
  const fetchRecaudoMultipleFunc = () => {
    setIsUploading(true);
    let obj = {
      filename: fileName,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      },
      ubicacion: {
        address: roleInfo?.direccion,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
      },
    };
    postConsultaRecaudoMultiple(obj)
      .then((res) => {
        if (!res?.status) {
          setIsUploading(false);
          setEstadoTrx(0);
          return notifyError(res?.msg);
        }
        // console.log(res);
        setRecaudosMultiples(
          res?.obj ?? {
            valor_total: 0,
            cantidad_transacciones: 0,
          }
        );
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setIsUploading(false);
        setEstadoTrx(0);
        console.error(err);
      });
  };
  const onSubmit = () => {
    setIsUploading(true);
    const uniqueId = v4();
    let obj = {
      uuid: uniqueId,
      filename: fileName,
      cantidad_transacciones: recaudosMultiples.cantidad_transacciones,
      ticket: objTicketActual,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      },
      ubicacion: {
        address: roleInfo?.direccion,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
      },
    };
    postInicializacionRecaudoMultiple(obj)
      .then((res) => {
        if (!res?.status) {
          setIsUploading(false);
          setEstadoTrx(0);
          return notifyError(res?.msg);
        }
        setIsUploading(false);
        notify(res?.msg);
        setEstadoTrx(2);
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setIsUploading(false);
        setEstadoTrx(0);
        console.error(err);
      });
  };
  return (
    <>
      <ButtonBar>
        <Button
          onClick={() => {
            notifyError("Transacción cancelada por el usuario");
            setEstadoTrx(0);
          }}>
          Cancelar proceso
        </Button>
        <Button
          onClick={() => {
            setShowModal(true);
          }}
          type='submit'>
          Realizar transacción
        </Button>
      </ButtonBar>
      <Fieldset legend='Data acumulado de transacciones'>
        <h1 className='text-2xl text-center mb-10 mt-5'>
          Acumulado de transacciones
        </h1>
        <Form grid>
          <Input
            id='ref1'
            label='Cantidad de transacciones'
            type='text'
            name='ref1'
            minLength='1'
            maxLength='20'
            required
            value={recaudosMultiples.cantidad_transacciones}
            autoComplete='off'
            disabled={true}
            onInput={(e) => {}}
          />
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor a pagar'
            type='text'
            autoComplete='off'
            maxLength={"12"}
            disabled={true}
            value={recaudosMultiples.valor_total ?? "0"}
            onInput={() => {}}
            required></MoneyInput>
        </Form>
      </Fieldset>
      <Modal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
        }}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          <h1 className='text-2xl text-center mb-5 font-semibold'>
            ¿Está seguro de realizar el proceso de recaudo?
          </h1>
          <ButtonBar>
            <Button
              onClick={() => {
                notifyError("Transacción cancelada por el usuario");
                setEstadoTrx(0);
              }}>
              Cancelar
            </Button>
            <Button type='submit' onClick={onSubmit}>
              Realizar pago
            </Button>
          </ButtonBar>
        </div>
      </Modal>
    </>
  );
};

export default MostrarRecaudosPagar;
