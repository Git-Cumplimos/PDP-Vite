import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { Fragment, useState, useCallback, useRef, useEffect, useMemo } from "react";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import Tickets from "../../components/TicketsDavivienda";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  depositoCorresponsalGrupoAval,
  consultaCostoGrupoAval,
} from "../../utils/fetchCorresponsaliaGrupoAval";
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

const Deposito = () => {
  const navigate = useNavigate();

  const [limitesMontos, setLimitesMontos] = useState({
    max: 10000000,
    min: 5000,
  });
  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
    equalError: false
  });

  const { roleInfo, infoTicket } = useAuth();

  const [loadingDepositoCorresponsalGrupoAval, fetchDepositoCorresponsalGrupoAval] =
    useFetch(depositoCorresponsalGrupoAval);
  const [loadingConsultaCostoGrupoAval, fetchConsultaCostoGrupoAval] =
    useFetch(consultaCostoGrupoAval);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [numCuenta, setNumCuenta] = useState("")
  const [userDoc, setUserDoc] = useState("")
  const [valor, setValor] = useState("")
  const [nomDepositante, setNomDepositante] = useState("")
  const [summary, setSummary] = useState([])
  const [banco, setBanco] = useState("")
  const [phone, setPhone] = useState("")
  const [showBTNConsulta, setShowBTNConsulta] = useState(true)
  console.log(valor)
  const optionsBanco = [
    { value: "", label: "" },
    { value: "0052", label: "Banco AvVillas" },
    { value: "0001", label: "Banco Bogotá" },
    { value: "0023", label: "Banco Occidente" },
    { value: "0002", label: "Banco Popular" },
    // { value: "0054", label: "ATH" },
  ];

  const DataBanco = useMemo(() => {
    const resp = optionsBanco?.filter((id) => id.value === banco);
    const DataBanco = {nombre: resp[0]?.label, idBanco: resp[0]?.value}
    return DataBanco;
  }, [optionsBanco, banco]);

  const options = [
    { value: "", label: "" },
    { value: "01", label: "Ahorros" },
    { value: "02", label: "Corriente" },    
  ];

  // const optionsDocumento = [
  //   { value: "", label: "" },
  //   { value: "01", label: "Cédula Ciudadanía" },
  //   { value: "02", label: "Cédula Extranjería" },
  //   { value: "04", label: "Tarjeta Identidad" },
  //   { value: "13", label: "Registro Civil" },
  // ];

  const onSubmitModal = useCallback((e) => {
    e.preventDefault();
    const summary = {
      "Banco": DataBanco?.nombre,
      "Número de cuenta": numCuenta,
      "Documento" : userDoc,
      "Numero celular": phone,
      "Valor depósito": formatMoney.format(valor),
    };
    setSummary(summary)
    setShowModal(true)
  }, [userDoc, phone, valor, DataBanco,numCuenta]);
  

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
    setTipoCuenta("")
    setTipoDocumento("")
    setNomDepositante("")
    setNumCuenta("")
    setValor("")
    setUserDoc("")
    setPhone("")
    setBanco("")
    setShowBTNConsulta(true)
    setSummary([])
  }, []);

  const consultarCosto = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);

      const { min, max } = limitesMontos;

      if (valor >= min && valor <= max) {

        const body = {
          comercio : {
            id_comercio: roleInfo?.id_comercio,
            id_usuario: roleInfo?.id_usuario,
            id_terminal: roleInfo?.id_dispositivo,
          },
    
          oficina_propia: roleInfo?.tipo_comercio === 'OFICINAS PROPIAS' ? true : false,
          nombre_comercio: roleInfo?.['nombre comercio'],
          valor_total_trx: valor,
    
          consultaCosto: {
            idBancoAdquiriente: DataBanco?.idBanco,
            numNumeroDocumento: userDoc,
            numValorTransaccion: valor,
    
            location: {
              codDane: roleInfo?.codigo_dane,
              ciudad: roleInfo?.ciudad,
              direccion: roleInfo?.direccion,
    
            }
          }        
        };
        fetchConsultaCostoGrupoAval(body)
          .then((res) => {
            setIsUploading(false);
            if (!res?.status) {
              notifyError(res?.msg);
              handleClose()
              // return;
            } else {
              setDatosConsulta(res?.obj?.Data);
              const summary = {
                "Banco": DataBanco?.nombre,
                "Número de cuenta": numCuenta,
                "Documento" : userDoc,
                "Número celular": phone,
                "Valor depósito": formatMoney.format(valor),
                "Costo transacción": formatMoney.format(res?.obj?.costoTrx)
              };
              setSummary(summary)
              setShowModal(true);
              setShowBTNConsulta(false)
            }
          })
          .catch((err) => {
            setIsUploading(false);
            console.error(err);
            notifyError("No se ha podido conectar al servidor");
          });
      } else {
        setIsUploading(false);
        notifyError(
          `El valor del depósito debe estar entre ${(formatMoney.format(
            min
          )).replace(/(\$\s)/g, "$")} y ${formatMoney.format(max).replace(/(\$\s)/g, "$")}`
        );
      }
    },
    [valor, limitesMontos, DataBanco, roleInfo, userDoc, numCuenta,phone]
  );

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
    const { min, max } = limitesMontos;
    if (valor >= min && valor <= max) {
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
        idBancoAdquiriente: DataBanco?.idBanco,
        numNumeroDocumento: userDoc,
        numValorTransaccion: valor,
        numTipoCuenta: tipoCuenta,
        numCelular: phone,
        numCuenta: numCuenta,

        location: {
          codDane: roleInfo?.codigo_dane,
          ciudad: roleInfo?.ciudad,
          direccion: roleInfo?.direccion,

        }
      }
    };

    fetchDepositoCorresponsalGrupoAval(body)
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
          title: "Depósito A Cuentas " + DataBanco?.nombre,
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
            "Tipo",
            tipoCuenta === 1 ? "Ahorros" : "Corriente",
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
            // ["Identificación depositante", userDoc],
            // ["", ""],
            // ["Nombre depositante", nomDepositante],
            // ["", ""],
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
    }
    else {
      setIsUploading(false);
        notifyError(
          `El valor del depósito debe estar entre ${(formatMoney.format(
            min
          )).replace(/(\$\s)/g, "$")} y ${formatMoney.format(max).replace(/(\$\s)/g, "$")}`
        );
    }
  }, [
    numCuenta,
    valor,
    tipoCuenta,
    userDoc,
    fetchDepositoCorresponsalGrupoAval,
    roleInfo,
    infoTicket,
    ,
    datosConsulta,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Depósitos</h1>
        <br></br>
        <Form onSubmit={onSubmitModal} grid>
          <Select
            id='banco'
            label='Banco a depositar'
            options={optionsBanco}
            value={banco}
            onChange={(e) => {
              setBanco(e.target.value);
            }}
            required
          />
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
            id='docCliente'
            name='docCliente'
            label='Documento cliente'
            type='text'
            autoComplete='off'
            minLength={"5"}
            maxLength={"12"}
            value={userDoc}
            onInput={(e) => {
              const num = e.target.value.replace(/[\s\.]/g, "");
              if (! isNaN(num)){
              setUserDoc(num)  
              }
            }}
            required
          />
          <Input
            id='numCliente'
            name='numCliente'
            label='Número celular'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"10"}
            value={phone}
            onInput={(e) => {
              if ((String(e.target.value).length > 0 & String(e.target.value).slice(0,1) !== "3")) {
                notifyError("El número de celular debe iniciar por 3");
                setPhone("");
              } else {
                const num = parseInt(e.target.value) || "";
                setPhone(num);
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
            <Button type={"submit"} disabled={loadingConsultaCostoGrupoAval}>
              Continuar
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus
              ? goToRecaudo
              : loadingDepositoCorresponsalGrupoAval
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
                  disabled={loadingDepositoCorresponsalGrupoAval}>
                  Realizar deposito
                </Button>
                {showBTNConsulta ? 
                <Button
                type='submit'
                onClick={consultarCosto}
                disabled={loadingDepositoCorresponsalGrupoAval}>
                Consultar costo
                </Button>                
                :
                ""
                }
                
                <Button
                  onClick={handleClose}
                  disabled={loadingDepositoCorresponsalGrupoAval}>
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
