import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Modal from "../../../components/Base/Modal";
import useQuery from "../../../hooks/useQuery";
import { Fragment, useState, useCallback, useRef, useEffect } from "react";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { pagoGiroDaviplata, consultaGiroDaviplata } from "../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../utils/notify";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../../hooks/AuthHooks";

const Deposito = () => {
  const navigate = useNavigate();
  const [{ phone, userDoc, valor, summary }, setQuery] = useQuery();

  const { roleInfo, infoTicket } = useAuth();

  const [loadingCashIn, fetchCashIn] = useFetch(pagoGiroDaviplata);
  const [loadingConsultaCashIn, fetchConsultaCashIn] = useFetch(consultaGiroDaviplata);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("")

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });
  
  const printDiv = useRef();

  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
      let hasKeys = true;
      const keys = [
        "id_comercio",
        "id_usuario",
        "tipo_comercio",
        "id_dispositivo",
        "ciudad",
        "direccion",
      ];
      for (const key of keys) {
        if (!(key in roleInfo)) {
          hasKeys = false;
          break;
        }
      }
      if (!hasKeys) {
        notifyError(
          "El usuario no cuenta con datos de comercio, no se permite la transaccion"
        );
        navigate("/");
      }
    }
  }, [roleInfo, navigate]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();

      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        const formData = new FormData(e.target);
        const phone = formData.get("numCliente");
        const userDoc = formData.get("docCliente");
        const valorFormat = formData.get("valor");
        
        const body = {
          idComercio: roleInfo?.id_comercio,
          idUsuario: roleInfo?.id_usuario,
          idDispositivo: roleInfo?.id_dispositivo,
          Tipo: roleInfo?.tipo_comercio,
          numIdentificacionDepositante: userDoc,
          numDaviplata: phone,
          valGiro: valor,
          valTipoIdentificacionDepositante: 1, /// Tipo de documento
    
        };
        fetchConsultaCashIn(body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }else{
            setDatosConsulta(res?.obj?.Data)
            const summary = {
              "Nombre cliente": res?.obj?.Data?.valNumbreDaviplata,
              "Numero celular": phone,
              "C.C. del depositante": userDoc,
              "Valor de deposito": valorFormat,
            };
            setQuery({ phone, valor, summary }, { replace: true });
            setShowModal(true);
          }          
          
          //notify("Transaccion satisfactoria");          
        })
        .catch((err) => {
          console.error(err);
          notifyError("Error interno en la transaccion");
        });
        
      } else {
        notifyError(
          `El valor del deposito debe estar entre ${formatMoney.format(
            min
          )} y ${formatMoney.format(max)}`
        );
      }
    },
    [setQuery, valor, limitesMontos]
  );

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name !== "valor") {
        const formData = new FormData(ev.target.form);
        const phone = (
          (formData.get("numCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        const userDoc = (
          (formData.get("docCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        setQuery({ phone, userDoc, valor: valor ?? "" }, { replace: true });
      }
    },
    [setQuery, valor]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setQuery(
        { phone: phone ?? "", userDoc: userDoc ?? "", valor },
        { replace: true }
      );
    },
    [setQuery, phone, userDoc]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    const body = {
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      Tipo: roleInfo?.tipo_comercio,
      numIdentificacionDepositante: userDoc,
      numDaviplata: phone,
      valGiro: valor,
      valCodigoConvenioDaviplata: datosConsulta?.valCodigoConvenioDaviplata,
      valTipoIdentificacionDepositante: 1, /// Tipo de documento

    };

    fetchCashIn(body)
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.trxId ?? 0;
        const tempTicket = {
          title: "Recibo de deposito",
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
            ["Id Transacción", res?.obj?.IdTransaccion],
          ],
          commerceName: "Daviplata",
          trxInfo: [
            ["Celular", phone],
            ["C.C.", userDoc],
            ["Valor de deposito", formatMoney.format(valor)],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
        };
        setPaymentStatus(tempTicket);
        infoTicket(trx_id, 20, tempTicket)
          .then((resTicket) => {
            console.log(resTicket);
          })
          .catch((err) => {
            console.error(err);
            notifyError("Error guardando el ticket");
          });
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error interno en la transaccion");
      });
  }, [
    phone,
    valor,
    userDoc,
    fetchCashIn,
    roleInfo,
    infoTicket,
    ,
    datosConsulta
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Depositos Daviplata</h1>
      <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
        <Input
          id="numCliente"
          name="numCliente"
          label="Número telefónico de cliente"
          type="text"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={phone ?? ""}
          onInput={() => {}}
          required
        />
        <Input
          id="docCliente"
          name="docCliente"
          label="CC de quien deposita"
          type="text"
          autoComplete="off"
          minLength={"7"}
          maxLength={"13"}
          value={userDoc ?? ""}
          onInput={() => {}}
          required
        />
        <MoneyInput
          id="valor"
          name="valor"
          label="Valor a depositar"
          autoComplete="off"
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} disabled={loadingConsultaCashIn}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          paymentStatus ? () => {} : loadingCashIn ? () => {} : handleClose
        }
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={goToRecaudo}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="submit"
                onClick={onMakePayment}
                disabled={loadingCashIn}
              >
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

export default Deposito;