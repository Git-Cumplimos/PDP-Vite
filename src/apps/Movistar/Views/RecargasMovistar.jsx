import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput from "../../../components/Base/MoneyInput";
import Tickets from "../../../components/Base/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notify, notifyError } from "../../../utils/notify";
import { PeticionRecarga } from "../utils/fetchMovistar";

const URL = `${process.env.REACT_APP_URL_MOVISTAR}/recargasmovistar/prepago`;

const RecargasMovistar = () => {
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
  const [loadingFetchRecarga, fetchRecarga] = useFetch(PeticionRecarga);
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
      codigo_dane:roleInfo.codigo_dane
    };

    fetchRecarga(URL, data).then((response) => {
      const response_obj = response?.obj;
      const result = response_obj?.result;
      console.log(response);
      if (response?.status == true) {
        setFlagRecarga(true);
        ticketRecarga(result);
      } else {
        setShowModal(false);
        
        if (response_obj?.identificador == "02") {
          notifyError("No hay cupo");
        }
        const controlErrores = ["00", "01", "03", "04", "05", "10"];
        if (controlErrores?.indexOf(response_obj?.identificador) > -1) {
          notifyError("Sistema caido");
        }
        if (response_obj?.identificador == "11") {
          notifyError("Recarga rechazada");
        }
      }

      //   if (response.status == false && response.error == false) {
      //     setShowModal(false);
      //     notifyError("no hay cupo");
      //   }
    });
  };

  const ticketRecarga = (result_) => {
    setInfTicket({
      title: "Recibo de recarga ",
      timeInfo: {
        "Fecha de venta": result_.fecha_hora_final.substr(4, 13),
        Hora: result_.fecha_hora_final.substr(17, 18),
      },
      commerceInfo: [
        ["Id Comercio", roleInfo.id_comercio],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Municipio", roleInfo.ciudad],
        ["Dirección", roleInfo.direccion],
        ["Id Trx", result_.pk_trx],
        ["Id Transacción", result_.transaccion_ptopago],
      ],
      commerceName: "RECARGAS MOVISTAR",
      trxInfo: [
        ["Celular", inputCelular],
        ["", ""],
        ["Valor pago", inputValor],
        ["", ""],
      ],
      disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const [loadingCashIn, fetchCashIn] = useFetch();

  // useEffect(() => {
  //   console.log(roleInfo);
  // }, []);

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
        handleClose={
          paymentStatus ? handleClose : loadingCashIn ? () => {} : handleClose
        }
      >
        {!flagRecarga ? (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="button"
                onClick={recargaMovistar}
                disabled={loadingFetchRecarga}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingFetchRecarga}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        ) : (
          infTicket && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <Tickets refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Link to="/movistar">
                  <Button>Cerrar</Button>
                </Link>
              </ButtonBar>
            </div>
          )
        )}
      </Modal>
    </Fragment>
  );
};

export default RecargasMovistar;
