import React, { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../../../components/Base/Button";
import ButtonBar from "../../../../../../components/Base/ButtonBar";
import Form from "../../../../../../components/Base/Form";
import Input from "../../../../../../components/Base/Input";
import { useAuth } from "../../../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../../../components/Base/MoneyInput";
import Select from "../../../../../../components/Base/Select";
import { notifyError } from "../../../../../../utils/notify";
import Modal from "../../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../../components/Compound/PaymentSummary";
import PaymentSummaryInicial from "../components/RetiroEfectivo/PaymentSummaryInicial";
import { fetchRetiroEfectivo } from "../utils/fetchRetiro";
import { useFetch } from "../../../../../../hooks/useFetch";
import { ValidationRetiroEfectivo } from "../utils/ErroresCuztomizados";
import ModalTicket from "../components/RetiroEfectivo/ModalTicket";
import { useNavigate } from "react-router-dom";

const limitesMontos = {
  max: 999999999,
  min: 1,
};
const tipo_operacion = 81;

const optionsSelect = [
  { value: "Ahorros", label: "Cuenta Ahorros" },
  { value: "Corriente", label: "Cuenta Corriente" },
];

const RetiroEfectivo = () => {
  const [dataInput, setDataInput] = useState({
    tipoCuenta: "Ahorros",
    cuenta: "",
    OTP: "",
    amount: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState(0);
  const [infTicket, setInfTicket] = useState(null);
  const [loadingPeticionRetiroEfectivo, peticionRetiroEfectivo] =
    useFetch(fetchRetiroEfectivo);
  const validNavigate = useNavigate();
  const { roleInfo, infoTicket: guardarTicket } = useAuth();

  const onCuentaChange = (e) => {
    const cuenta = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    setDataInput((anterior) => ({
      ...anterior,
      [e.target.name]: cuenta,
    }));
  };

  const onOtpChange = (e) => {
    const otp = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    setDataInput((anterior) => ({
      ...anterior,
      [e.target.name]: otp,
    }));
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();

    const minValorFormato = formatMoney
      .format(limitesMontos.min)
      .replace(/\s+/g, "");
    const maxValorFormato = formatMoney.format().replace(/\s+/g, "");

    if (dataInput.amount < limitesMontos.min) {
      notifyError(
        `Valor de la recarga inválido, debe ser mayor o igual a ${minValorFormato}`
      );
      return;
    } else if (dataInput.amount > limitesMontos.max) {
      notifyError(
        `Valor de la recarga inválido, debe ser menor o igual a ${maxValorFormato}`
      );
      return;
    }

    setShowModal(true);
    setTipoModal(1);
  };

  const realizarRetiroEfectivo = () => {
    const dataPeticion = {
      tipoCuenta: dataInput.tipoCuenta,
      cuenta: parseInt(dataInput.cuenta),
      OTP: parseInt(dataInput.OTP),
      amount: parseInt(dataInput.amount),
      codigo_comercio: roleInfo.id_comercio,
      tipo_comercio: roleInfo.tipo_comercio,
      id_terminal: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
      direccion: roleInfo.direccion,
      ciudad: roleInfo.ciudad,
      codigo_dane: roleInfo.codigo_dane,
      nombre_comercio: roleInfo["nombre comercio"],
    };

    peticionRetiroEfectivo(dataPeticion)
      .then((resPeticion) => {
        if (resPeticion?.status) {
          generarTicket(resPeticion?.obj?.result);
        }
      })
      .catch((error) => {
        if (error instanceof ValidationRetiroEfectivo) {
          setShowModal(false);
          setTipoModal(0);
        } else {
          notifyError(
            "Falla en el sistema: Error con el código petición [Front]"
          );
        }
      });
  };

  const generarTicket = (resPeticion_) => {
    const voucher = {
      title: "Recibo de retiro ",
      timeInfo: {
        "Fecha de venta": resPeticion_.fecha,
        Hora: resPeticion_.hora,
      },
      commerceInfo: [
        ["Id Comercio", roleInfo.id_comercio],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Municipio", roleInfo.ciudad],
        ["Dirección", roleInfo.direccion],
        ["Id Trx", resPeticion_.pk_trx],
        ["Id Transacción", resPeticion_.logTrx],
      ],
      commerceName: "RETIRO EFECTIVO BANCO AGRARIO",
      trxInfo: [
        ["Proceso", "Retiro Efectivo OTP"],
        ["", ""],
        ["Cuenta", resPeticion_.cuenta],
        ["Valor", formatMoney.format(resPeticion_.amount)],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };

    setTipoModal(2);
    setInfTicket(voucher);
    guardarTicket(resPeticion_.logTrx, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log("Ticket guardado exitosamente");
      })
      .catch((err) => {
        console.error("Error guardando el ticket");
      });
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTipoModal(0);
  }, []);

  const handleClose2 = useCallback(() => {
    setShowModal(false);
    setTipoModal(0);
    validNavigate("/corresponsalia/corresponsalia-banco-agrario");
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Retiro en efectivo</h1>
      <Form grid onSubmit={onSubmitCheck}>
        <Select
          name="tipoCuenta"
          label="Tipo de cuenta"
          options={optionsSelect}
          value={dataInput.tipoCuenta}
          onChange={(e) => {
            setDataInput((anterior) => ({
              ...anterior,
              [e.target.name]: e.target.value,
            }));
          }}
        />
        <Input
          name="cuenta"
          label="Cuenta"
          type="text"
          minLength="1"
          maxLength="12"
          autoComplete="off"
          value={dataInput.cuenta}
          onChange={(e) => onCuentaChange(e)}
          required
        />
        <Input
          name="OTP"
          label="Token de retiro"
          type="text"
          minLength="1"
          maxLength="8"
          autoComplete="off"
          value={dataInput.OTP}
          onChange={(e) => onOtpChange(e)}
          required
        />
        <MoneyInput
          name="amount"
          label="Valor a retirar"
          autoComplete="off"
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={(e, valor) =>
            setDataInput((anterior) => ({
              ...anterior,
              [e.target.name]: valor,
            }))
          }
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button>Retirar</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          tipoModal == 2
            ? handleClose2
            : loadingPeticionRetiroEfectivo
            ? () => {}
            : handleClose
        }
      >
        {tipoModal == 1 && (
          <PaymentSummaryInicial
            dataInput={dataInput}
            handleClose={handleClose}
            realizarRetiroEfectivo={realizarRetiroEfectivo}
            loadingPeticionRetiroEfectivo={loadingPeticionRetiroEfectivo}
            optionsSelect={optionsSelect}
          ></PaymentSummaryInicial>
        )}

        {tipoModal == 2 && (
          <ModalTicket
            infTicket={infTicket}
            handleClose2={handleClose2}
          ></ModalTicket>
        )}
      </Modal>
    </Fragment>
  );
};

export default RetiroEfectivo;
