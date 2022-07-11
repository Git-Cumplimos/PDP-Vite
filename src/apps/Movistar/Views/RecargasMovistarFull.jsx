import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput from "../../../components/Base/MoneyInput";
import Tickets from "../../../components/Base/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import { PeticionRecarga } from "../utils/fetchMovistar";

const URL = "http://127.0.0.1:5000/recargasMovistar/prepago";

const RecargasMovistarFull = () => {
  //Variables
  const { roleInfo } = useAuth();
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [summary, setSummary] = useState({});
  const [infTicket, setInfTicket] = useState(null);
  const [flagRecarga, setFlagRecarga] = useState(false);
  const printDiv = useRef();

  const onMoneyChange = useCallback((e, valor) => {
    setInputValor(valor);
  });

  const onCelChange = (e) => {
    const formData = new FormData(e.target.form);
    const phone = ((formData.get("celular") ?? "").match(/\d/g) ?? []).join("");
    setInputCelular(phone);
    if (e.target.value.length === 1) {
      if (e.target.value != 3) {
        notifyError("Numero invalido");
      }
    }
  };

  const handleClose = useCallback(() => {
    setShowModal(false);
    setInputValor(null);
    setInputCelular(null);
    setFlagRecarga(false);
  }, []);

  const onSubmitCheck = (e) => {
    e.preventDefault();
    setShowModal(true);
    setSummary({
      Celular: inputCelular,
      Valor:
        "$ " +
        new Intl.NumberFormat("es-ES", {
          maximumSignificantDigits: 3,
        }).format(inputValor),
    });
  };

  const recargaMovistar = (e) => {
    const data = {
      celular: inputCelular,
      valor: inputValor,
      codigo_comercio: roleInfo.id_comercio,
      identificador_region: roleInfo.direccion,
      tipo_comercio: roleInfo.tipo_comercio,
      id_dispositivo: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
    };

    PeticionRecarga(URL, data).then((response) => {
      //   console.log(response);
      if (response.error == true) {
        setShowModal(false);
        notifyError("sistema caido");
      } else if (response.status == false) {
        setShowModal(false);
        notifyError("no hay cupo");
      } else {
        setFlagRecarga(true);
        // const trx_id = response?.obj[0]?.pk_trx ?? 0;
        // const code_response = response?.obj[0]?.codigo_error ?? 0;
        // if (code_response === "00") {
        //   notify("Transaccion satisfactoria");
        // }
        setInfTicket({
          title: "Recibo de pago",
          timeInfo: {
            "Fecha de venta": "28/01/2022",
            Hora: "12:22:00",
          },
          commerceInfo: [
            ["Id Comercio", 2],
            ["No. terminal", 233],
            ["Municipio", "Bogota"],
            ["Dirección", "Calle 11 # 11 - 2"],
            ["Id Trx", 233],
            ["Id Transacción", 99],
          ],
          commerceName: "Loteria de bogotá",
          trxInfo: [
            ["Billete", "0222"],
            ["Serie", "231"],
            ["Valor pago", 20000.0],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
        });
        // setPaymentStatus(tempTicket);
        //   setResPeticion(result.obj[0][0].codigo_error);
        // setShowModal(true);
        //   if(result.obj[0].codigo_error == ""){

        //   }
      }
    });
  };

  const recargaExitosa = () => {
    setFlagRecarga(true);
    setInfTicket({
      title: "Recibo de recarga",
      //   code_response,
      //   timeInfo: {
      //     "Fecha de venta": Intl.DateTimeFormat("es-CO", {
      //       year: "2-digit",
      //       month: "2-digit",
      //       day: "2-digit",
      //     }).format(new Date()),
      //     Hora: Intl.DateTimeFormat("es-CO", {
      //       hour: "2-digit",
      //       minute: "2-digit",
      //       second: "2-digit",
      //     }).format(new Date()),
      //   },
      //   commerceInfo: [
      //     ["Id Comercio", roleInfo?.id_comercio],
      //     ["No. terminal", roleInfo?.id_dispositivo],
      //     ["Municipio", roleInfo?.ciudad],
      //     ["Dirección", roleInfo?.direccion],
      //     // ["Id Trx", trx_id],
      //     // ["Id Transacción", res?.obj[0]?.IdTransaccion ?? 0],
      //   ],
      //   commerceName: "Recarga Movistar",
      //   //   trxInfo: [
      //   //     ["Celular", res?.obj[0]?.celular],
      //   //     ["", ""],
      //   //     [
      //   //       "Valor de recarga",
      //   //       "$ " +
      //   //         new Intl.NumberFormat("es-ES", {
      //   //           maximumSignificantDigits: 3,
      //   //         }).format(res?.obj[0]?.valor ?? 0),
      //   //     ],
      //   //     ["", ""],
      //   //   ],
      //   disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
    });
  };

  useEffect(() => {
    console.log(infTicket);
  }, [infTicket]);

  return (
    <Fragment>
      <Form onSubmit={onSubmitCheck} grid>
        <Input
          name="celular"
          label="Celular: "
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular ?? ""}
          onChange={onCelChange}
          required
        />
        <br />
        <MoneyInput
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={"1000"}
          max={"1000000000"}
          minLength={"4"}
          maxLength={"14"}
          value={inputValor ?? ""}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Recarga</Button>
        </ButtonBar>
      </Form>

      <Modal
        show={showModal}
        handleClose={paymentStatus ? handleClose : () => {}}
      >
        {!flagRecarga ? (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button type="button" onClick={recargaMovistar}>
                Aceptar
              </Button>
              <Button onClick={handleClose}>Cancelar</Button>
            </ButtonBar>
          </PaymentSummary>
        ) : (
          infTicket && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <Tickets refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button>Imprimir</Button>
                <Button onClick={handleClose}>Cerrar</Button>
              </ButtonBar>
            </div>
          )
        )}
      </Modal>
    </Fragment>
  );
};

export default RecargasMovistarFull;
