import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState, useMemo } from "react";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  retiroCorresponsalGrupoAval,
  consultaCostoGrupoAval,
} from "../../utils/fetchCorresponsaliaGrupoAval";
import { notify, notifyError } from "../../../../../utils/notify";
import Tickets from "../../components/TicketsDavivienda";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import HideInput from "../../../../../components/Base/HideInput";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import useMoney from "../../../../../hooks/useMoney";

const Retiro = () => {
  const navigate = useNavigate();

  const { roleInfo, infoTicket } = useAuth();

  const [limitesMontos, setLimitesMontos] = useState({
    max: 3000000,
    min: 10000,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const [loadingRetiroCorresponsalGrupoAval, fetchRetiroCorresponsalGrupoAval] =
    useFetch(retiroCorresponsalGrupoAval);
  const [loadingConsultaCostoGrupoAval, fetchConsultaCostoGrupoAval] =
    useFetch(consultaCostoGrupoAval);
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userDoc, setUserDoc] = useState("")
  const [phone, setPhone] = useState("")
  const [valor, setValor] = useState("")
  const [otp, setOtp] = useState("")
  const [summary, setSummary] = useState([])
  const [banco, setBanco] = useState("")

  const optionsBanco = [
    { value: "", label: "" },
    { value: "0052", label: "Banco AvVillas" },
    { value: "0001", label: "Banco Bogotá" },
    { value: "0023", label: "Banco Occidental" },
    { value: "0002", label: "Banco Popular" },
    { value: "0054", label: "ATH" },
  ];

  const DataBanco = useMemo(() => {
    const resp = optionsBanco?.filter((id) => id.value === banco);
    const DataBanco = {nombre: resp[0]?.label, idBanco: resp[0]?.value}
    return DataBanco;
  }, [optionsBanco, banco]);

  const optionsTipoCuenta = [
    { value: "", label: "" },
    { value: "02", label: "Corriente" },
    { value: "01", label: "Ahorros" },
  ];

  const optionsDocumento = [
    { value: "", label: "" },
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extranjería" },
    { value: "04", label: "Tarjeta Identidad" },
    { value: "13", label: "Regitro Civil" },
  ];

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
    setTipoCuenta("")
    setTipoDocumento("")             
    setValor("")
    setUserDoc("")
    setOtp("")
    setPhone("")
    setBanco("")
    setSummary([])
  }, []);

  const consultaCosto = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);

      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        // const formData = new FormData(e.target);
        // const userDoc = formData.get("docCliente");
        // const valorFormat = formData.get("valor");
        // const otp = formData.get("OTP");

        const body = {
          idComercio: roleInfo?.id_comercio,
          idUsuario: roleInfo?.id_usuario,
          idDispositivo: roleInfo?.id_dispositivo,
          Tipo: roleInfo?.tipo_comercio,
          codDane: roleInfo?.codigo_dane,
          ciudad: roleInfo?.ciudad,
          direccion: roleInfo?.direccion,
          ///////////////////////////////
          idBancoAdquiriente: DataBanco?.idBanco,
          numNumeroDocumento: userDoc,
          numValorTransaccion: valor,

        };
        fetchConsultaCostoGrupoAval(body)
          .then((res) => {
            setIsUploading(false);
            if (!res?.status) {
              notifyError(res?.msg);
              handleClose()
            } else {
              setDatosConsulta(res?.obj?.Data);
              const summary = {
                "Nombre cliente": res?.obj?.Data?.valNombreTitular +" "+res?.obj?.Data?.valApellidoTitular,
                // "Numero celular": numCuenta,
                "C.C. del depositante": userDoc,
                "Codigo OTP": otp,
                "Valor de retiro": valor,
                "Valor cobro": formatMoney.format(
                  res?.obj?.Data?.numValorCobro
                ),
              };
              setSummary(summary)
              setShowModal(true);
            }

            //notify("Transaccion satisfactoria");
          })
          .catch((err) => {
            setIsUploading(false);
            console.error(err);
            notifyError("Error interno en la transaccion");
          });
      } else {
        setIsUploading(false);
        notifyError(
          `El valor del retiro debe estar entre ${formatMoney.format(
            min
          )} y ${formatMoney.format(max)}`
        );
      }
    },
    [valor, limitesMontos, DataBanco]
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

  const onSubmitModal = useCallback((e) => {
    e.preventDefault();
    const summary = {
      "Banco": DataBanco?.nombre,
      "Documento" : userDoc,
      "Numero celular": phone,
      "Valor cobro": formatMoney.format(valor),
    };
    setSummary(summary)
    setShowModal(true)
  }, [banco, userDoc, phone, valor, DataBanco]);

  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const body = {
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      Tipo: roleInfo?.tipo_comercio,
      codDane: roleInfo?.codigo_dane,
      ciudad: roleInfo?.ciudad,
      direccion: roleInfo?.direccion,
      ///////////////////////////////
      idBancoAdquiriente: DataBanco?.idBanco,
      numNumeroDocumento: userDoc,
      numValorTransaccion: valor,
      numTipoCuenta: tipoCuenta,
      numCelular: phone,
      otp: otp
    };

    fetchRetiroCorresponsalGrupoAval(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.DataHeader?.idTransaccion ?? 0;
        const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;

        const tempTicket = {
          title: "Retiro De Cuentas Davivienda",
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
            ["No. terminal", ter],
            ["Municipio", roleInfo?.ciudad],
            ["Dirección", roleInfo?.direccion],
            ["Tipo de operación", "Retiro De Cuentas"],
            ["", ""],
            ["No. de aprobación", trx_id],
            ["", ""],
          ],
          commerceName: roleInfo?.["nombre comercio"]
          ? roleInfo?.["nombre comercio"]
          : "No hay datos",
          trxInfo: [
            [
              "Tipo",
              res?.obj?.Data?.numTipoCuenta === "01" ? "Ahorros" : "Corriente",
            ],
            ["",""],
            [
              "Nro. Cuenta",
              `****${String(res?.obj?.Data?.numNumeroDeCuenta)?.slice(-4) ?? ""}`,
            ],
            ["",""],
            ["Valor", formatMoney.format(valor)],
            ["",""],
            [
              "Costo transacción",
              formatMoney.format(res?.obj?.Data?.numValorCobro),
            ],
            ["",""],
            ["Total", formatMoney.format(valor)],
            ["",""],

            //["Usuario de venta", "Nombre propietario del punto"],
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
          });
      })
      .catch((err) => {
        setIsUploading(false);
        console.error(err);
        notifyError("Error interno en la transaccion");
      });
  }, [
    valor,
    userDoc,
    fetchRetiroCorresponsalGrupoAval,
    roleInfo,
    infoTicket,
    ,
    datosConsulta,
    tipoDocumento,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Retiros</h1>
        <Form onSubmit={onSubmitModal} grid>
          <Select
            id='banco'
            label='Banco a Retirar'
            options={optionsBanco}
            value={banco}
            onChange={(e) => {
              setBanco(e.target.value);
            }}
            required
          />
          <Select
            id='tipCuenta'
            label='Tipo de cuenta'
            options={optionsTipoCuenta}
            value={tipoCuenta}
            onChange={(e) => {
              setTipoCuenta(e.target.value);
            }}
            required
          />
          {/* <Select
            id='tipoDocumento'
            label='Tipo de documento'
            options={optionsDocumento}
            value={tipoDocumento}
            onChange={(e) => {
              setTipoDocumento(e.target.value);
            }}
            required
          /> */}
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
          <HideInput
          id='otp'
          label='Número OTP'
          type='text'
          name='otp'
          minLength='6'
          maxLength='6'
          autoComplete='off'
          required
          value={otp}
          onInput={(e, valor) => {
            let num = valor.replace(/[\s\.]/g, "");
            if (!isNaN(valor)) {
              setOtp(num);
            }
          }}></HideInput>
          <Input
          id="valor"
          name="valor"
          label="Valor a depositar"
          autoComplete="off"
          type="text"
          minLength={"5"}
          maxLength={"10"}
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
              ? () => {}
              : loadingRetiroCorresponsalGrupoAval
              ? () => {}
              : handleClose
          }>
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
            </div>
          ) : (
            <PaymentSummary summaryTrx={summary}>
              <ButtonBar>
                <Button
                  type='submit'
                  onClick={onMakePayment}
                  disabled={loadingRetiroCorresponsalGrupoAval}>
                  Realizar retiro
                </Button>
                <Button
                  type='submit'
                  onClick={consultaCosto}
                  disabled={loadingRetiroCorresponsalGrupoAval}>
                  Consultar costo
                </Button>
                <Button
                  onClick={handleClose}
                  disabled={loadingRetiroCorresponsalGrupoAval}>
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

export default Retiro;
