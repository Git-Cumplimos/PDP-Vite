import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import useQuery from "../../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { retiroCorresponsal, consultaCostoCB } from "../../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../../utils/notify";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import MoneyInput, { formatMoney } from "../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";

const Retiro = () => {
  const navigate = useNavigate();
  const [{ userDoc, valor, summary }, setQuery] = useQuery();

  const { roleInfo, infoTicket } = useAuth();

  const [loadingRetiroCorresponsal, fetchRetiroCorresponsal] = useFetch(retiroCorresponsal);
  const [loadingConsultaCostoCB, fetchConsultaCostoCB] = useFetch(consultaCostoCB);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");

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

  const onSubmitRetiro = useCallback(
    (e) => {
      e.preventDefault();

      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        const formData = new FormData(e.target);
        const userDoc = formData.get("docCliente");
        const valorFormat = formData.get("valor");
        
        const body = {
          idComercio: roleInfo?.id_comercio,
          idUsuario: roleInfo?.id_usuario,
          idDispositivo: roleInfo?.id_dispositivo,
          Tipo: roleInfo?.tipo_comercio,
          tipoTransaccion: 2130, /// retiro
          tipoDocumento: "01", /// Cedula
          numDocumento: userDoc,
          valTransaccion: valor,
          tipoCuenta: tipoCuenta,
          //nomDepositante: nomDepositante,
          valToken: "valToken", /// De donde viene
          numCuenta: 123,       
        };
        fetchConsultaCostoCB(body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }else{
            setDatosConsulta(res?.obj?.Data)
            const summary = {
              "Nombre cliente": res?.obj?.Data?.valNumbreDaviplata,
              // "Numero celular": numCuenta,
              "C.C. del depositante": userDoc,
              "Valor de retiro": valorFormat,
            };
            setQuery({ valor, summary }, { replace: true });
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
          `El valor del retiro debe estar entre ${formatMoney.format(
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
        const numCuenta = (
          (formData.get("numCuenta") ?? "").match(/\d/g) ?? []
        ).join("");
        const userDoc = (
          (formData.get("docCliente") ?? "").match(/\d/g) ?? []
        ).join("");
        const nomDepositante = (formData.get("nomDepositante") ?? "")
        setQuery({ numCuenta, userDoc, valor: valor ?? "" , nomDepositante}, { replace: true });
      }
    },
    [setQuery, valor]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setQuery(
        { userDoc: userDoc ?? "", valor},
        { replace: true }
      );
    },
    [setQuery, userDoc]
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
      numTipoDocumento: '01',
      numNumeroDocumento: userDoc,
      numValorRetiro: valor,
      numOtp: 1234,
      //numIdDepositante: IdDepositante,
      valToken: "valToken",
      numTalonRetiro: 1111,    
    };

    fetchRetiroCorresponsal(body)
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.DataHeader?.idTransaccion ?? 0;
        const tempTicket = {
          title: "Recibo de retiro",
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
            //["Id Transacción", res?.obj?.IdTransaccion],
          ],
          commerceName: "Retiro en Corresponsal Davivienda",
          trxInfo: [
            ["Tipo de cuenta", res?.obj?.Data?.numTipoCuenta==="01" ? "Ahorros" : "Corriente"],
            ["",""],
            ["Numero de cuenta", '*****'+res?.obj?.Data?.numNumeroDeCuenta?.slice(-4)],
            ["",""],
            ["Valor del retiro", formatMoney.format(valor)],
            ["",""],
            ["Cobro transacción", formatMoney.format(res?.obj?.Data?.numValorCobro)],
            ["",""],
            ["Código de autorización", "????"],
            ["",""],
            ["Usuario de venta", "Nombre propietario del punto"],
            ["",""],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
        };
        setPaymentStatus(tempTicket);
        infoTicket(trx_id, res?.obj?.id_tipo_operacion, tempTicket)////////////////////////////////////
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
    valor,
    userDoc,
    fetchRetiroCorresponsal,
    roleInfo,
    infoTicket,
    ,
    datosConsulta
  ]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">retiros Daviplata</h1>
      <Form onSubmit={onSubmitRetiro} onChange={onChange} grid>
        <Input
          id="docCliente"
          name="docCliente"
          label="Documento Cliente"
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
          label="Valor a retirarr"
          autoComplete="off"
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          onInput={onMoneyChange}
          required
        />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} disabled={loadingConsultaCostoCB}>Realizar retiro</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          paymentStatus ? () => {} : loadingRetiroCorresponsal ? () => {} : handleClose
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
                disabled={loadingRetiroCorresponsal}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingRetiroCorresponsal}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};

export default Retiro;
