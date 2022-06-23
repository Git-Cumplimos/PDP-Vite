import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Modal from "../../../../components/Base/Modal";
import useQuery from "../../../../hooks/useQuery";
import { Fragment, useState, useCallback, useRef, useEffect } from "react";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import Tickets from "../../components/TicketsDavivienda";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { depositoCorresponsal, consultaCostoCB } from "../../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../../utils/notify";
import MoneyInput, { formatMoney } from "../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const Deposito = () => {
  const navigate = useNavigate();
  const [{ numCuenta, userDoc, valor, nomDepositante, summary }, setQuery] = useQuery();

  const { roleInfo, infoTicket } = useAuth();

  const [loadingDepositoCorresponsal, fetchDepositoCorresponsal] = useFetch(depositoCorresponsal);
  const [loadingConsultaCostoCB, fetchConsultaCostoCB] = useFetch(consultaCostoCB);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false)

  const options = [
    { value: "", label: "" },
    { value: "02", label: "Corriente" },
    { value: "01", label: "Ahorros" },
  ];

  const optionsDocumento = [
    { value: "", label: "" },
    { value: "01", label: "Cedula Ciudadanía" },
    { value: "02", label: "Cedula Extrangeria" },
    { value: "04", label: "Tarjeta Identidad" },
    { value: "13", label: "Regitro Civil" },
  ];

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
      setIsUploading(true)

      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        const formData = new FormData(e.target);
        const numCuenta = formData.get("numCuenta");
        const userDoc = formData.get("docCliente");
        const valorFormat = formData.get("valor");
        const nomDepositante = formData.get("nomDepositante");
        
        const body = {
          idComercio: roleInfo?.id_comercio,
          idUsuario: roleInfo?.id_usuario,
          idDispositivo: roleInfo?.id_dispositivo,
          Tipo: roleInfo?.tipo_comercio,
          numTipoTransaccion: 5706, /// Deposito
          numTipoDocumento: tipoDocumento, /// Cedula
          numNumeroDocumento: userDoc,
          numValorTransaccion: valor,
          numTipoCuenta: tipoCuenta,
          //nomDepositante: nomDepositante,
          //valToken: "valToken", /// De donde viene
          numNumeroDeCuenta: numCuenta,       
        };
        fetchConsultaCostoCB(body)
        .then((res) => {
          setIsUploading(false)
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }else{
            setDatosConsulta(res?.obj?.Data)
            const summary = {
              "Nombre titular": res?.obj?.Data?.valNombreTitular,
              "Apellito titular": res?.obj?.Data?.valApellidoTitular,
              "Numero cuenta": numCuenta,
              "Valor de deposito": valorFormat,
              "Valor cobro": formatMoney.format(res?.obj?.Data?.numValorCobro),
            };
            setQuery({ numCuenta, valor, summary }, { replace: true });
            setShowModal(true);
          }          
          
          //notify("Transaccion satisfactoria");          
        })
        .catch((err) => {
          setIsUploading(false)
          console.error(err);
          notifyError("Error interno en la transaccion");
        });
        
      } else {
        setIsUploading(false)
        notifyError(
          `El valor del deposito debe estar entre ${formatMoney.format(
            min
          )} y ${formatMoney.format(max)}`
        );
      }
    },
    [setQuery, valor, limitesMontos, tipoCuenta]
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
        { numCuenta: numCuenta ?? "", userDoc: userDoc ?? "", nomDepositante: nomDepositante ?? "", valor},
        { replace: true }
      );
    },
    [setQuery, numCuenta, userDoc, nomDepositante]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    setIsUploading(true)
    const body = {
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      Tipo: roleInfo?.tipo_comercio,
      numTipoCuenta: tipoCuenta,
      numNumeroCuenta: numCuenta,
      numIdDepositante: userDoc,
      //valToken: "valToken",
      numValorConsignacion: valor,
      direccion: roleInfo?.direccion,
      cod_dane: roleInfo?.codigo_dane,
      nomdepositante: nomDepositante,
      tip_id_depositante: tipoDocumento    
    };

    fetchDepositoCorresponsal(body)
      .then((res) => {
        setIsUploading(false)
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.DataHeader?.idTransaccion ?? 0;
        const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;

        const tempTicket = {
          title: "Deposito A Cuentas Davivienda",
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
          ],
          trxInfo: [
            ["Nro. Cuenta", '****'+res?.obj?.Data?.numNumeroCuenta?.slice(-4)],
            ["Tipo", res?.obj?.Data?.numTipoCuenta==="01" ? "Ahorros" : "Corriente"],
            ["Valor", formatMoney.format(valor)],
            ["Costo Transacción", formatMoney.format(res?.obj?.Data?.numValorCobro)],
            ["Total", formatMoney.format(valor)],
            ["Cod. autorización", trx_id],
            ["Ter", ter],            
            ["Id. Despositante", userDoc],
            ["Depositante", nomDepositante]            
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
        setIsUploading(false)
        console.error(err);
        notifyError("Error interno en la transaccion");
      });
  }, [
    numCuenta,
    valor,
    tipoCuenta,
    userDoc,
    fetchDepositoCorresponsal,
    roleInfo,
    infoTicket,
    ,
    datosConsulta
  ]);
  console.log(tipoCuenta)

  return (
    <>
    <SimpleLoading show={isUploading}/>
    <Fragment>
      <h1 className="text-3xl mt-6">Depositos</h1>
      <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
        <Select
          id="tipoCuenta"
          label="Tipo de Cuenta"
          options={options}
          value={tipoCuenta}
          onChange={(e) => {
            setTipoCuenta(e.target.value);
          }}
        />
        <Input
          id="numCuenta"
          name="numCuenta"
          label="Número de cuenta"
          type="text"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={numCuenta ?? ""}
          onInput={() => {}}
          required
        />
        <Select
          id="tipoDocumento"
          label="Tipo de documento"
          options={optionsDocumento}
          value={tipoDocumento}
          onChange={(e) => {
            setTipoDocumento(e.target.value);
          }}
        />
        <Input
          id="docCliente"
          name="docCliente"
          label="CC de quien deposita"
          type="text"
          autoComplete="off"
          minLength={"7"}
          maxLength={"10"}
          value={userDoc ?? ""}
          onInput={() => {}}
          required
        />
        <Input
          id="nomDepositante"
          name="nomDepositante"
          label="Nombre Depositante"
          type="text"
          autoComplete="off"
          value={nomDepositante ?? ""}
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
          <Button type={"submit"} disabled={loadingConsultaCostoCB}>Realizar deposito</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          paymentStatus ? () => {} : loadingDepositoCorresponsal ? () => {} : handleClose
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
                disabled={loadingDepositoCorresponsal}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingDepositoCorresponsal}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
    </>
  );
};

export default Deposito;
