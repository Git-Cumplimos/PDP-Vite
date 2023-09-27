import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Tickets from "../../../../components/Base/Tickets/Tickets"
import MoneyInput, { formatMoney } from "../../../../components/Base/MoneyInput";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import { enumParametrosCrezcamos } from "../utils/enumParametrosCrezcamos";
import { v4 } from "uuid";
import { fetchCustom } from "../utils/fetchCorresponsaliaCrezcamos";
import { useFetchCrezcamos } from "../hooks/fetchCrezcamos";

const URL_CONSULTAR_SALDOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/crezcamos/consultapagocredito`;
const URL_PAGO_CREDITOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/crezcamos/pagocredito`;
const URL_CONSULTAR_ESTADO_TRX = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/crezcamos/check_estado_pagocredito_crezcamos`;

const PagoCredito = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();
  const [limitesMontos, setLimitesMontos] = useState({
    max: enumParametrosCrezcamos.maxPagoCreditos,
    min: enumParametrosCrezcamos.minPagoCreditos,
  });
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [datosCredito, setDatosCredito] = useState([]);

  const [datosTrx, setDatosTrx] = useState({
    tipoDocumento: "2",
    documento: "",
    // tipoPago: "1",
    credito: "",
  });
  
  const [valor, setValor] = useState("");
  const [uuid, setUuid] = useState(v4());

  const optionsDocumento = [
    { value: "2", label: "Cédula de Ciudadanía" },
    { value: "3", label: "C Extranjeria" },
    { value: "4", label: "NIT" },
    { value: "5", label: "Tarjeta de Identidad" },
    { value: "6", label: "NUIP" },
    { value: "7", label: "Permiso Especial de Permanencia" },
    { value: "8", label: "Permiso por Protección Temporal" },
  ];
  // const optionsTipoPago = [
  //   { value: "1", label: "Valor mínimo" },
  //   { value: "3", label: "Valor Total" },
  // ];

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    notifyError("Transacción cancelada por el usuario")
    setShowModal(false);
    setDatosTrx({
      tipoDocumento: "2",
      documento: "",
      // tipoPago: "1",
      credito: "",
    });
    setDatosCredito([]);
    setValor("");
    setUuid(v4());
  }, []);

  const [loadingPeticionConsultaCosto, peticionConsultaCosto] = useFetch(
    fetchCustom(URL_CONSULTAR_SALDOS, "POST", "Consultar saldo")
  );

  const onSubmitDeposito = useCallback(
    (e) => {
      e.preventDefault();
      setIsUploading(true);
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_usuario: roleInfo?.["nombre comercio"],
        nombre_comercio: roleInfo?.["nombre comercio"],
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        valor_total_trx: 0,
        Datos: {
          tipo_documento: datosTrx?.tipoDocumento,
          num_documento: datosTrx?.documento,
        },
      };
      notifyPending(
        peticionConsultaCosto({}, data),
        {
          render: () => {
            setIsUploading(true);
            return "Procesando consulta";
          },
        },
        {
          render: ({data: res }) =>{
            setIsUploading(false);
            setDatosConsulta(res?.obj);
            const formattedData = res?.obj?.products?.map(row => ({
              NumeroCredito: row.account,
              RolTitular: row.debtorType,
              TipoDocumento: row.documentType,
              NumeroDocumento: row.documentNumber,
              Nombre: row.firstNames,
              PrimerApellido: row.firstSurname,
              SegundoApellido: row.secondLastName,
              ValorMinimo: Math.floor(row?.amount / 100), // Formatear el valor como número con 2 decimales
              ValorTotal: Math.floor(row?.totalAmount / 100)
            }));
            setDatosCredito(formattedData);
            setDatosTrx((old) => ({
              ...old,
              credito: formattedData[0]?.NumeroCredito,
            }));
            setShowModal(true);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ( { data: error}) => {
            setIsUploading(false);
            setDatosTrx({
              tipoDocumento: "2",
              documento: "",
              // tipoPago: "1",
              credito: "",
            });
            setValor("");
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [datosTrx?.documento, roleInfo, peticionConsultaCosto]
  );
  
  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const [loadingPeticionPago, peticionPago] = useFetchCrezcamos(
    URL_PAGO_CREDITOS,
    URL_CONSULTAR_ESTADO_TRX,
    "Realizar Pago créditos Crezcamos"
  );

  const onMakePayment = useCallback((e) => {
    e.preventDefault();
    // if (datosTrx?.tipoPago === "1"){
    //   valor = (datosCredito?.find(item => {
    //     return item.NumeroCredito === datosTrx?.credito;
    //   })?.ValorMinimo)
    // } else{
    //   valor = (datosCredito?.find(item => {
    //     return item.NumeroCredito === datosTrx?.credito;
    //   })?.ValorTotal)
    // }
    // if (valor > limitesMontos.max){
    //   return notifyError(
    //     "El valor debe ser menor o igual a "+ limitesMontos.max
    //   );
    // }
    // if (valor < limitesMontos.min){
    //   return notifyError(
    //     "El valor debe ser mayor o igual a "+ limitesMontos.min
    //   );
    // }
    setIsUploading(true);
    const data = {
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        id_uuid_trx: uuid,
      },
      nombre_usuario: roleInfo?.["nombre comercio"],
      nombre_comercio: roleInfo?.["nombre comercio"],
      oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
      valor_total_trx: (datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.ValorMinimo),
      id_trx: datosConsulta?.id_trx,
      address: roleInfo?.direccion,
      city: roleInfo?.ciudad.substring(0, 7),
      Datos: {
        tipo_documento: (datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.TipoDocumento),
        num_documento: (datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.NumeroDocumento),
        tipo_pago: "PCU",
        num_credito: datosTrx?.credito,
        nombre: (datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.Nombre),
        first_apellido: (datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.PrimerApellido),
        second_apellido: (datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.SegundoApellido),
      },
    };
    const dataAditional = {
      id_uuid_trx: uuid,
    };
    notifyPending(
      peticionPago(data, dataAditional),
      {
        render: () => {
          return "Procesando transacción";
        },
      },
      {
        render: ({ data: res }) => {
          setIsUploading(false);
          setPaymentStatus(res?.obj?.ticket ?? {});
          return "Transacción satisfactoria";
        },
      },
      {
        render({ data: err }) {
          setIsUploading(false);
          goToRecaudo();
          if (err?.cause === "custom") {
            return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
          }
          console.error(err?.message);
          return err?.message ?? "Transacción fallida";
        },
      }
    );
  }, [
    peticionPago,
    roleInfo,
    datosConsulta,
    datosTrx?.credito,
    datosCredito,
    uuid,
    goToRecaudo,
  ]);

  return (
    <>
      <Fragment>
        <h1 className='text-3xl mt-6'>Pago Créditos Crezcamos</h1>
        <Form onSubmit={onSubmitDeposito} grid>
            <Select
              id='tipoDocumento'
              label='Tipo Documento'
              options={optionsDocumento}
              value={datosTrx?.tipoDocumento}
              onChange={(e) => {
                setDatosTrx(prevState => ({
                  ...prevState,
                  tipoDocumento: e.target.value
                }));
              }}
              required
              disabled={loadingPeticionConsultaCosto}
            />
            <Input
                id='docCliente'
                name='docCliente'
                label='Número Documento'
                type='text'
                autoComplete='off'
                maxLength={"15"}
                value={datosTrx?.documento}
                onInput={(e) => {
                  const num = e.target.value.replace(/[\s\.\-+eE]/g, "");
                  if (!isNaN(num)) {
                    setDatosTrx((old) => {
                      return {
                        ...old,
                        documento: num
                      };
                    })
                  }
                }}
                disabled={loadingPeticionConsultaCosto}
                required
            />
            <ButtonBar className={"lg:col-span-2"}>
                <Button type={"submit"} disabled={loadingPeticionConsultaCosto}>
                    Consultar
                </Button>
                <Button  
                    type='button'
                    onClick={() => 
                        {
                        goToRecaudo();
                        notifyError("Transacción cancelada por el usuario");
                        }}
                    disabled={loadingPeticionConsultaCosto}
                    >
                    Cancelar
                </Button>
            </ButtonBar>
        </Form>
        <Modal
          show={showModal}
          handleClose={paymentStatus || loadingPeticionPago ? () => {} : handleClose}>
          {paymentStatus ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={goToRecaudo}>Cerrar</Button>
              </ButtonBar>
              <Tickets refPrint={printDiv} ticket={paymentStatus} />
            </div>
          ) : (
            <Form grid onSubmit={onMakePayment} style={{ textAlign: 'center' }}>
              <h1 className='text-2xl font-semibold'>
                Respuesta de Consulta Crezcamos
              </h1>
              <Select
                  id='numPrestamo'
                  label='Número préstamo'
                  options={datosCredito?.map(item => ({
                    label: item.NumeroCredito.toString(),
                    value: item.NumeroCredito
                  }))}
                  value={datosTrx?.credito}
                  onChange={(e) => {
                    setDatosTrx((old) => {
                      return {
                        ...old,
                        credito: e.target.value
                      };
                    })
                  }}
                  required
                  disabled={loadingPeticionPago}
              />
              {datosCredito?.length > 0 && (
                <>
                  {datosCredito
                    ?.filter(item => item.NumeroCredito === datosTrx?.credito)
                    .map(item => (
                      <h2 key={item.NumeroCredito}>{`Tipo Documento: ${optionsDocumento.find(option => option.value === item.TipoDocumento)?.label || "Desconocido"}`}</h2>
                    ))}
                </>
              )}
              <h2>{`Número Documento: ${(datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.NumeroDocumento)}`}</h2>
              <h2>{`Nombre cliente: 
                  ${(datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.Nombre)} 
                  ${(datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.PrimerApellido)}
                  ${(datosCredito?.find(item => {return item.NumeroCredito === datosTrx?.credito;})?.SegundoApellido)}`
                }
              </h2>
                <MoneyInput
                  id='valor'
                  name='valor'
                  label='Valor a pagar'
                  type='text'
                  min={limitesMontos.min}
                  max={limitesMontos.max}
                  autoComplete='off'
                  maxLength={"12"}
                  value={datosCredito?.find(item => item.NumeroCredito === datosTrx?.credito)?.ValorMinimo}
                  required
                  disabled={true}
                  // onInput={(e, monto) => {
                  //   if (!isNaN(monto)) {
                  //     setValor(monto);
                  //   }
                  // }}
                  equalError={false}
                  equalErrorMin={false}
                />
                {/* <h2>{`Pago mínimo: ${formatMoney.format(datosCredito?.find(item => item.NumeroCredito === datosTrx?.credito)?.ValorMinimo)}`}</h2>
                <h2>{`Pago Total: ${formatMoney.format(datosCredito?.find(item => item.NumeroCredito === datosTrx?.credito)?.ValorTotal)}`}</h2>
                <Select
                  id='tipoPago'
                  label='Indique el tipo de pago'
                  options={optionsTipoPago}
                  defaultValue={datosTrx?.tipoPago}
                  onChange={(e) => {
                    setDatosTrx(prevState => ({
                      ...prevState,
                      tipoPago: e.target.value
                    }));
                  }}
                  required
                  disabled={loadingPeticionPago}
                /> */}
                <ButtonBar>
                  <Button type='submit' disabled= {loadingPeticionPago}>Realizar Pago</Button>
                  <Button type='button' onClick={handleClose} disabled= {loadingPeticionPago}>Cancelar</Button>
                </ButtonBar>
            </Form>
          )}
        </Modal>
      </Fragment>
    </>
  );
};

export default PagoCredito;
