import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import Modal from "../../../../../components/Base/Modal";
import { Fragment, useState, useCallback, useRef, useEffect, useMemo } from "react";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import Tickets from "../../components/TicketsBancoAgrario/ModalTicket";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  depositoBancoAgrario,
  consultaCostoBancoAgrario
} from "../../utils/fetchDeposito";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import useMoney from "../../../../../hooks/useMoney";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import {enumParametrosBancoAgrario} from "../../utils/enumParametrosBancoAgrario";

const Deposito = () => {
  const navigate = useNavigate();

  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosBancoAgrario.maxDepositoCuentas,
    min: enumParametrosBancoAgrario.minDepositoCuentas,
  });
  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
    equalError: false
  });

  const { roleInfo, infoTicket } = useAuth();

  const [loadingDepositoCorresponsalBancoAgrario, fetchDepositoCorresponsalBancoAgrario] =
    useFetch(depositoBancoAgrario);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [tipoCuenta, setTipoCuenta] = useState("01");
  const [isUploading, setIsUploading] = useState(false);
  const [numCuenta, setNumCuenta] = useState("")
  const [valor, setValor] = useState("")
  const [summary, setSummary] = useState([])

  const options = [
    { value: "01", label: "Ahorros" },
    { value: "02", label: "Corriente" },    
  ];

  const onSubmitModal = useCallback((e) => {
    e.preventDefault();
    const { min, max } = limitesMontos;
    if (valor >= min && valor <= max) {
    const summary = {
      "Tipo de cuenta" :tipoCuenta === "01" ? "Ahorros" : "Corriente",
      "Número de cuenta": numCuenta,      
      "Valor depósito": formatMoney.format(valor),
    };
    setSummary(summary)
    setShowModal(true)
    } else {
      setIsUploading(false);
      notifyError(
        `El valor del depósito debe estar entre ${(formatMoney.format(
          min
        )).replace(/(\$\s)/g, "$")} y ${formatMoney.format(max).replace(/(\$\s)/g, "$")}`
      );
    }
  }, [valor,numCuenta, tipoCuenta, limitesMontos]);
  

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
    setShowModal(false)
    setTipoCuenta("01")
    setNumCuenta("")
    setValor("")
    setSummary([])
  }, []);

  const onMoneyChange = useCallback(
    (e, valor) => {
      setValor(valor)
    },
    [valor]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const body = {
      comercio : {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },

      oficina_propia: roleInfo?.tipo_comercio === 'OFICINAS PROPIAS' ? true : false,
      nombre_comercio: roleInfo?.['nombre comercio'],
      valor_total_trx: valor,

      depositoCuentas: {
        numValorTransaccion: valor,
        numTipoCuenta: tipoCuenta,
        numCuenta: numCuenta,

        location: {
          codDane: roleInfo?.codigo_dane,
          ciudad: roleInfo?.ciudad,
          direccion: roleInfo?.direccion,

        }
      }
    };

    fetchDepositoCorresponsalBancoAgrario(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          handleClose()
          return;
        }
        else{
        notify("Transaccion satisfactoria");
        const trx_id = parseInt(res?.obj?.respuesta_grupo_aval["11"]) ?? 0;
        const numCuenta = (res?.obj?.respuesta_grupo_aval["104"]) ?? 0;
        // const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;

        const tempTicket = {
          title: "Depósito A Cuentas Banco Agrario",
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
            ["No. de aprobación", trx_id],
            // ["No. terminal", ter],
            ["Municipio", roleInfo?.ciudad],
            ["Dirección", roleInfo?.direccion],
            ["Tipo de operación", "Depósito A Cuentas"],
            ["", ""]
          ],
          commerceName: roleInfo?.["nombre comercio"]
          ? roleInfo?.["nombre comercio"]
          : "No hay datos",
          trxInfo: [
            [
            "Tipo de cuenta",
            tipoCuenta === "01" ? "Ahorros" : "Corriente",
            ],
            ["",""],
            [
            "Nro. Cuenta",
            `****${String(numCuenta)?.slice(-4) ?? ""}`,
            ],
            ["",""],
            ["Valor", formatMoney.format(valor)],
            ["", ""],
            ["Costo transacción", formatMoney.format(res?.obj?.costoTrx)],
            ["", ""],
            ["Total", formatMoney.format(valor)],
            ["", ""],
          ],
          disclamer: "Línea de atención personalizada: #688\nMensaje de texto: 85888",
        };
        setPaymentStatus(tempTicket);
        infoTicket(trx_id, res?.obj?.id_tipo_operacion, tempTicket) ////////////////////////////////////
          .then((resTicket) => {
            console.log(resTicket);
          })
          .catch((err) => {
            console.error(err);
            notifyError("Error guardando el ticket");
          });}
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("No se ha podido conectar al servidor");
      });

  }, [
    numCuenta,
    valor,
    tipoCuenta,
    fetchDepositoCorresponsalBancoAgrario,
    roleInfo,
    infoTicket,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Depósitos</h1>
        <br></br>
        <Form onSubmit={onSubmitModal} grid>
          <Select
            id='tipoCuenta'
            label='Tipo de cuenta'
            options={options}
            value={tipoCuenta}
            required
            onChange={(e) => {
              setTipoCuenta(e.target.value);
            }}
          />
          <Input
            id='numCuenta'
            name='numCuenta'
            label='Número de cuenta'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"14"}
            value={numCuenta}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.]/g, "");
              if (! isNaN(num)){
              setNumCuenta(num)  
              }     
            }}
            required
          />
          <Input
          id="valor"
          name="valor"
          label="Valor a depositar"
          autoComplete="off"
          type="text"
          minLength={"15"}
          maxLength={"15"}
          min={limitesMontos?.min}
          max={limitesMontos?.max}
          value={makeMoneyFormatter(0).format(valor)}
          onInput={(ev) => setValor(onChangeMoney(ev))}
          required
           />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>
              Continuar
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? goToRecaudo
              : loadingDepositoCorresponsalBancoAgrario
              ? () => {}
              : handleClose
          }>
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
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
                  type='submit'
                  onClick={onMakePayment}
                  disabled={loadingDepositoCorresponsalBancoAgrario}>
                  Realizar deposito
                </Button>                
                <Button
                  onClick={handleClose}
                  disabled={loadingDepositoCorresponsalBancoAgrario}>
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
