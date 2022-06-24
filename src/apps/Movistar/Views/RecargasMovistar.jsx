import React, { Fragment, useCallback, useState, useRef } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { PeticionRecarga, RealizarPeticionPro } from "../utils/fetchMovistar";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import Tickets from "../../../components/Base/Tickets";
import { useFetch } from "../../../hooks/useFetch";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";



const URL = "http://127.0.0.1:5000/recargasMovistar/prepago";
const messageError = [
  { code: "10", message: "Sistema de Recarga no disponible" },
  { code: "11", message: "Fecha de captura inválida" },
  { code: "12", message: "Tipo de mensaje inválido" },
];

const RecargasMovistar = () => {
  const navigate = useNavigate();
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
  const [resPeticion, setResPeticion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(false);

  const [summary, setSummary] = useState({});
 
  const printDiv = useRef();

  const postCashIn = async (bodyObj) => {
    if (!bodyObj) {
      return new Promise((resolve, reject) => {
        resolve("Sin datos body");
      });
    }
    try {
      const res = await fetchData(`${URL}`, "POST", {}, bodyObj);
      if (!res?.status) {
        console.error(res?.msg);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
  const [loadingCashIn, fetchCashIn] = useFetch(postCashIn);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const { roleInfo } = useAuth();

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const onChange = useCallback((e) => {
    if (e.target.name == "celular") {
      const formData = new FormData(e.target.form);
      const phone = ((formData.get("celular") ?? "").match(/\d/g) ?? []).join(
        ""
      );
      setInputCelular(phone);
    }
  });


  const onSubmitDeposit = useCallback((e) => {
    e.preventDefault();
    const data = {
      celular: inputCelular,
      valor: inputValor,
      codigo_comercio: roleInfo.id_comercio,
      identificador_region: roleInfo.direccion,
    };

    PeticionRecarga(URL, data).then((res) => {
      const trx_id = res?.obj[0]?.pk_trx ?? 0;
      const code_response = res?.obj[0]?.codigo_error ?? 0;
      if (code_response === "00") {
        notify("Transaccion satisfactoria");
      }
      const tempTicket = {
        title: "Recibo de recarga",
        code_response,
        timeInfo: {
          "Fecha de venta": Intl.DateTimeFormat("es-CO", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()),
          Hora: Intl.DateTimeFormat("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date()),
        },
        commerceInfo: [
          ["Id Comercio", roleInfo?.id_comercio],
          ["No. terminal", roleInfo?.id_dispositivo],
          ["Municipio", roleInfo?.ciudad],
          ["Dirección", roleInfo?.direccion],
          ["Id Trx", trx_id],
          ["Id Transacción", res?.obj[0]?.IdTransaccion ?? 0],
        ],
        commerceName: "Recarga Movistar",
        trxInfo: [
          ["Celular", res?.obj[0]?.celular],
          ["", ""],
          ["Valor de recarga", "$ " + new Intl.NumberFormat('es-ES', { maximumSignificantDigits: 3}).format(res?.obj[0]?.valor ?? 0) ],
          ["", ""]
        ],
        disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
      };
      setPaymentStatus(tempTicket);
      //   setResPeticion(result.obj[0][0].codigo_error);
      setShowModal(true)
      //   if(result.obj[0].codigo_error == ""){

      //   }
    });
  });

  const onMoneyChange = useCallback((e, valor) => {
    setInputValor(valor);
  });

  const onShowModal = (e) => {
    e.preventDefault()
    const validation= validatePhoneCompleted()
    if(validation){
      setSummary({
        "Celular": inputCelular,
        "Valor": "$ " + new Intl.NumberFormat('es-ES', { maximumSignificantDigits: 3}).format(inputValor)
      });
      setShowModal(true)
    }
  }

  function validatePhone(e){
    if(e.target.value.length===1){
      if(e.target.value!=3){
        notifyError("Numero invalido")
      }
    }
  }
  function validatePhoneCompleted(){
    const regex= /^[3]{1}[0-9]{9}$/
    if (!regex.test(inputCelular)){
      notifyError("Numero invalido")
      return false
    }
      return true
  }

  return (
    <Fragment>
      <Form onSubmit={onShowModal} onChange={onChange} grid>
        <Input
          onChange={validatePhone}
          id="celular"
          name="celular"
          label="Celular: "
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={inputCelular ?? ""}
          onInput={() => {}}
          required
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={"1000"}
          max={"1000000000"}
          minLength={"4"}
          maxLength={"14"}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
      <Modal  
        show={showModal}
        handleClose={
          paymentStatus ? handleClose : loadingCashIn ? () => {} : handleClose
        }
      >
        {paymentStatus ? paymentStatus.code_response === "00" ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={paymentStatus}/>
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (

          <div>Error: {messageError.find(item => item.code === paymentStatus.code_response)?.message ?? "Error desconocido"}</div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button type="button" disabled={loadingCashIn} onClick={onSubmitDeposit}>
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingCashIn}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};
export default RecargasMovistar;
