import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput from "../../../components/Base/MoneyInput";
import Tickets from "../../../components/Base/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { formatMoney } from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notify, notifyError } from "../../../utils/notify";
import { PeticionRecarga } from "../utils/fetchMovistar";

const minValor = 1000;
const maxValor = 500000;
const tipo_operacion = 77;

const RecargasMovistar = () => {
  //Variables
  const printDiv = useRef();
  const { roleInfo, infoTicket } = useAuth();
  const validNavigate = useNavigate();
  const [inputCelular, setInputCelular] = useState("");
  const [inputValor, setInputValor] = useState("");
  const [invalidCelular, setInvalidCelular] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [flagRecarga, setFlagRecarga] = useState(false);
  const [summary, setSummary] = useState({});
  const [infTicket, setInfTicket] = useState(null);

  const [loadingFetchRecarga, fetchRecarga] = useFetch(PeticionRecarga);

  const onMoneyChange = useCallback((e, valor) => {
    setInputValor(valor);
  });

  const onCelChange = (e) => {
    const formData = new FormData(e.target.form);
    const phone = ((formData.get("celular") ?? "").match(/\d/g) ?? []).join("");

    if (phone.length == 1 && inputCelular == "") {
      if (phone[0] == 3) {
        setInvalidCelular("");
      } else {
        setInvalidCelular("Número inválido");
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
      }
    }
    setInputCelular(phone);
  };

  const onSubmitCheck = (e) => {
    e.preventDefault();
    //validar datos de la recarga
    let realizarRecarga = 0;
    if (inputCelular[0] == 3) {
      realizarRecarga++;
    } else {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
    }

    if (inputValor >= minValor && inputValor <= maxValor) {
      realizarRecarga++;
    } else if (inputValor == "") {
      notifyError("Escribir el valor de la recarga");
    } else if (inputValor < minValor) {
      notifyError(
        `Valor de la recarga invalido, debe ser mayor o igual a ${formatMoney.format(
          minValor
        )}`
      );
    } else if (inputValor > maxValor) {
      notifyError(
        `Valor de la recarga invalido, debe ser menor o igual a ${formatMoney.format(
          maxValor
        )}`
      );
    }

    //Realizar recarga
    if (realizarRecarga == 2) {
      setShowModal(true);
      setSummary({
        Celular: `${inputCelular.slice(0, 3)} ${inputCelular.slice(3, 6)} 
        ${inputCelular.slice(6)}`,
        Valor: formatMoney.format(inputValor),
      });
    }
  };

  const recargaMovistar = (e) => {
    const data = {
      celular: inputCelular,
      valor: inputValor,
      codigo_comercio: roleInfo.id_comercio,
      tipo_comercio: roleInfo.tipo_comercio,
      id_dispositivo: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
      direccion: roleInfo.direccion,
      ciudad: roleInfo.ciudad,
      codigo_dane: roleInfo.codigo_dane,
    };

    fetchRecarga(data)
      .then((response) => {
        const response_obj = response?.obj;
        const result = response_obj?.result;
        if (response?.status == true) {
          setFlagRecarga(true);
          ticketRecarga(result);
        } else {
          setShowModal(false);
          switch (response_obj?.identificador) {
            case "00":
              notifyError(
                "Falla en el sistema ______________________ Datos de entrada al servicio erroneos [identificador=00]"
              );
              break;
            case "01":
              notifyError(
                "Falla en el sistema ______________________ Servicio transaccional caido [identificador=01]"
              );
              break;
            case "02":
              notify("No tiene cupo");
              break;
            case "03":
              notifyError(
                "Falla en el sistema ______________________ Error con la conexión inicial a la base de datos [identificador=03]"
              );
              break;
            case "04":
              notifyError(
                "Falla en el sistema ______________________ Error con la trama de envio [identificador=04]"
              );
              break;
            case "05":
              notifyError(
                "Falla en el sistema ______________________ Error con la conexión telnet [identificador=05]"
              );
            case "10":
              notifyError(
                "Falla en el sistema ______________________ Error con la trama recibida [identificador=10]"
              );
              break;
            case "11":
              notifyError(
                "Recarga RECHAZADA por parte de movistar - Verifique el número telefónico [identificador=11]"
              );
              break;
            default:
              break;
          }
        }
      })
      .catch((e) => {
        setFlagRecarga(false);
        setShowModal(false);
        notifyError("Falla en el sistema : " + e);
      });
  };

  const handleCloseRecarga = useCallback(() => {
    setShowModal(false);
    setFlagRecarga(false);
    validNavigate("/movistar");
  }, []);

  const handleClose = useCallback(() => setShowModal(false), []);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const ticketRecarga = (result_) => {
    const now = new Date();
    const voucher = {
      title: "Recibo de recarga ",
      timeInfo: {
        "Fecha de venta": result_.fecha_final_ptopago,
        // Hora: now.getHours() + ':' + now.getMinutes() + ':'+ now.getSeconds(),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
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
        [
          "Celular",
          `${inputCelular.slice(0, 3)} ${inputCelular.slice(3, 6)} 
        ${inputCelular.slice(6)}`,
        ],
        ["Valor", formatMoney.format(inputValor)],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };
    setInfTicket(voucher);
    infoTicket(result_.transaccion_ptopago, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log(resTicket);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  };

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recargas Movistar</h1>
      <Form onSubmit={onSubmitCheck} grid>
        <Input
          name="celular"
          label="Celular"
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          invalid={invalidCelular}
          value={inputCelular ?? ""}
          onChange={onCelChange}
          required
        />

        <MoneyInput
          name="valor"
          label="Valor de la recarga"
          autoComplete="off"
          min={minValor}
          max={maxValor}
          minLength={"4"}
          maxLength={"9"}
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
          flagRecarga
            ? handleCloseRecarga
            : loadingFetchRecarga
            ? () => {}
            : handleClose
        }
      >
        {!flagRecarga ? (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={summary}
          >
            {!loadingFetchRecarga ? (
              <>
                <ButtonBar>
                  <Button type="button" onClick={recargaMovistar}>
                    Aceptar
                  </Button>
                  <Button onClick={handleClose}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        ) : (
          infTicket && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <Tickets refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={handleCloseRecarga}>Cerrar</Button>
              </ButtonBar>
            </div>
          )
        )}
      </Modal>
    </Fragment>
  );
};

export default RecargasMovistar;
