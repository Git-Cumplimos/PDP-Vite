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
import { formatMoney } from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notify, notifyError } from "../../../utils/notify";
import { PeticionRecarga } from "../utils/fetchMovistar";

const minValor = 100;
const maxValor = 1000000000;

const RecargasMovistar = () => {
  //Variables
  const printDiv = useRef();
  const { roleInfo } = useAuth();
  const [inputCelular, setInputCelular] = useState(null);
  const [inputValor, setInputValor] = useState(null);
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
    setInputCelular(phone);

    if (e.target.value.length == 1) {
      if (e.target.value[0] == 3) {
        setInvalidCelular("");
      } else {
        setInvalidCelular("Número invalido");
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
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
    //validar datos de la recarga
    let realizarRecarga = 0;
    if (inputCelular[0] == 3) {
      realizarRecarga++;
    } else {
      notifyError("Número invalido");
    }

    if (inputValor >= minValor && inputValor <= maxValor) {
      realizarRecarga++;
    } else {
      notifyError("Valor invalido");
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
    };

    fetchRecarga(data)
      .then((response) => {
        const response_obj = response?.obj;
        const result = response_obj?.result;
        console.log(response);
        if (response?.status == true) {
          setFlagRecarga(true);
          ticketRecarga(result);
        } else {
          setShowModal(false);

          if (response_obj?.identificador == "02") {
            notify("No hay cupo");
          }
          const controlErrores = ["00", "01", "03", "04", "05", "10"];
          if (controlErrores?.indexOf(response_obj?.identificador) > -1) {
            notifyError("Falla en el sistema- no conecta con el servidor");
          }
          if (response_obj?.identificador == "11") {
            notifyError("Recarga rechazada");
          }
        }
      })
      .catch((e) => {
        setShowModal(false);
        notifyError("Falla en el sistema "+ (e));
      });
  };

  const ticketRecarga = (result_) => {
    setInfTicket({
      title: "Recibo de recarga ",
      timeInfo: {
        "Fecha de venta": result_.bandera_recarga_ptopago.slice(4, 16),
        Hora: result_.bandera_recarga_ptopago.slice(17, 26),
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
        ["", ""],
        ["Valor pago", formatMoney.format(inputValor)],
        ["", ""],
      ],
      disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

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
          maxLength={"14"}
          value={inputValor ?? ""}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"}>Realizar Recarga</Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={handleClose}>
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
