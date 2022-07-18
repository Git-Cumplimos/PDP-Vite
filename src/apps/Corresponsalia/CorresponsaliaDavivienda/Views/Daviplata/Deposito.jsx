import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import Modal from "../../../../../components/Base/Modal";
import useQuery from "../../../../../hooks/useQuery";
import { Fragment, useState, useCallback, useRef, useEffect } from "react";
import PaymentSummary from "../../../../../components/Compound/PaymentSummary";
import Tickets from "../../components/TicketsDavivienda";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  pagoGiroDaviplata,
  consultaGiroDaviplata,
} from "../../utils/fetchCorresponsaliaDavivienda";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../../hooks/useFetch";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Select from "../../../../../components/Base/Select";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";

const Deposito = () => {
  const navigate = useNavigate();
  const [{ phone, userDoc, valor, nomDepositante, summary }, setQuery] =
    useQuery();
  const [verificacionTel, setVerificacionTel] = useState("");

  const { roleInfo, infoTicket } = useAuth();

  const [loadingCashIn, fetchCashIn] = useFetch(pagoGiroDaviplata);
  const [loadingConsultaCashIn, fetchConsultaCashIn] = useFetch(
    consultaGiroDaviplata
  );
  const [, fetchTypes] = useFetch();

  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const options = [
    { value: "", label: "" },
    { value: "01", label: "Cedula Ciudadanía" },
    { value: "02", label: "Cedula Extrangeria" },
    { value: "04", label: "Tarjeta Identidad" },
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
  }, []);

  const onSubmitDeposit = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const { min, max } = limitesMontos;

      if (valor >= min && valor < max) {
        const formData = new FormData(e.target);
        const phone = formData.get("numCliente");
        const userDoc = formData.get("docCliente");
        const nomDepositante = formData.get("nomDepositante");
        const valorFormat = formData.get("valor");

        if (verificacionTel === phone) {
          const body = {
            idComercio: roleInfo?.id_comercio,
            idUsuario: roleInfo?.id_usuario,
            idDispositivo: roleInfo?.id_dispositivo,
            Tipo: roleInfo?.tipo_comercio,
            numIdentificacionDepositante: userDoc,
            numDaviplata: phone,
            valGiro: valor,
            valTipoIdentificacionDepositante: tipoDocumento, /// Tipo de documento
          };
          fetchConsultaCashIn(body)
            .then((res) => {
              setIsUploading(false);
              if (!res?.status) {
                notifyError(res?.msg);
                return;
              } else {
                setDatosConsulta(res?.obj);
                const total =
                  parseInt(res?.obj?.Data?.valComisionGiroDaviplata) + valor;
                const summary = {
                  "Nombre cliente": res?.obj?.Data?.valNumbreDaviplata,
                  "Numero celular": phone,
                  "C.C. del depositante": userDoc,
                  "Nombre del depositante": nomDepositante,
                  "Valor de deposito": valorFormat,
                  "Valor de comisión": formatMoney.format(
                    res?.obj?.Data?.valComisionGiroDaviplata
                  ),
                  "Valor total": formatMoney.format(total),
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
          setIsUploading(false);
          notifyError("Verifique que el celular del cliente es correcto");
        }
      } else {
        setIsUploading(false);
        notifyError(
          `El valor del deposito debe estar entre ${formatMoney.format(
            min
          )} y ${formatMoney.format(max)}`
        );
      }
    },
    [setQuery, valor, limitesMontos, verificacionTel]
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
        const nomDepositante = formData.get("nomDepositante") ?? "";
        setQuery(
          { phone, userDoc, valor: valor ?? "", nomDepositante },
          { replace: true }
        );
      }
    },
    [setQuery, valor]
  );

  const onMoneyChange = useCallback(
    (e, valor) => {
      setQuery(
        {
          phone: phone ?? "",
          userDoc: userDoc ?? "",
          nomDepositante: nomDepositante ?? "",
          valor,
        },
        { replace: true }
      );
    },
    [setQuery, phone, userDoc, nomDepositante]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onMakePayment = useCallback(() => {
    setIsUploading(true);
    const body = {
      idComercio: roleInfo?.id_comercio,
      idUsuario: roleInfo?.id_usuario,
      idDispositivo: roleInfo?.id_dispositivo,
      Tipo: roleInfo?.tipo_comercio,
      numIdentificacionDepositante: userDoc,
      nomDepositante: nomDepositante,
      numDaviplata: phone,
      valGiro: valor,
      valCodigoConvenioDaviplata:
        datosConsulta?.Data?.valCodigoConvenioDaviplata,
      valTipoIdentificacionDepositante: tipoDocumento, /// Tipo de documento
      valComisionGiroDaviplata: datosConsulta?.Data?.valComisionGiroDaviplata,
      id_transaccion: datosConsulta?.DataHeader?.idTransaccion,
      direccion: roleInfo?.direccion,
      cod_dane: roleInfo?.codigo_dane,
    };

    fetchCashIn(body)
      .then((res) => {
        setIsUploading(false);
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        notify("Transaccion satisfactoria");
        const trx_id = res?.obj?.Data?.valTalon ?? 0;
        const comision = res?.obj?.Data?.valComisionGiroDaviplata ?? 0;
        const total = parseInt(comision) + valor;
        const ter = res?.obj?.DataHeader?.total ?? res?.obj?.Data?.total;

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
          ],
          commerceName: "Daviplata",
          trxInfo: [
            ["Ter", ter],
            ["No. de aprobación", trx_id],
            ["Num Daviplata", "****" + phone.slice(-4)],
            ["Valor", formatMoney.format(valor)],
            ["Costo", formatMoney.format(comision)],
            ["Total", formatMoney.format(total)],
          ],
          disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
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
    datosConsulta,
  ]);

  return (
    <>
      <SimpleLoading show={isUploading} />
      <Fragment>
        <h1 className='text-3xl mt-6'>Depositos Daviplata</h1>
        <Form onSubmit={onSubmitDeposit} onChange={onChange} grid>
          <Input
            id='numCliente'
            name='numCliente'
            label='Numero Daviplata'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"10"}
            value={phone ?? ""}
            onInput={() => {}}
            required
          />
          <Input
            id='numCliente'
            name='numCliente'
            label='Verificación'
            type='text'
            autoComplete='off'
            minLength={"10"}
            maxLength={"10"}
            value={verificacionTel}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setVerificacionTel(num);
              }
            }}
            required
          />
          <Select
            id='tipoCuenta'
            label='Tipo de documento'
            options={options}
            value={tipoDocumento}
            onChange={(e) => {
              setTipoDocumento(e.target.value);
            }}
          />
          <Input
            id='docCliente'
            name='docCliente'
            label='CC de quien deposita'
            type='text'
            autoComplete='off'
            minLength={"7"}
            maxLength={"10"}
            value={userDoc ?? ""}
            onInput={() => {}}
            required
          />
          <Input
            id='nomDepositante'
            name='nomDepositante'
            label='Nombre Depositante'
            type='text'
            autoComplete='off'
            value={nomDepositante ?? ""}
            onInput={() => {}}
            required
          />
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a depositar'
            autoComplete='off'
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            onInput={onMoneyChange}
            required
          />
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} disabled={loadingConsultaCashIn}>
              Realizar deposito
            </Button>
          </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={
            paymentStatus ? () => {} : loadingCashIn ? () => {} : handleClose
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
                  disabled={loadingCashIn}>
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
    </>
  );
};

export default Deposito;
