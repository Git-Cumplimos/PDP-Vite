import { useCallback, useState, useRef, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput/MoneyInput";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError, notifyPending } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useAuth } from "../../../hooks/AuthHooks";
import fetchData from "../../../utils/fetchData";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { fetchCustom, consultaValorCuota } from "../utils/fetchFDLM";
import { useFetch } from "../../../hooks/useFetch";
import  useMoney from "../../../hooks/useMoney";

const url_params = `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`;
const URL_MOSTRAR_CREDITO= `${process.env.REACT_APP_URL_FDLMWSDL}/mostrarcreditos`
const URL_INGRESAR_RECIBO = `${process.env.REACT_APP_URL_FDLMWSDL}/ingresorecibo`


const Recaudo = () => {
  // const formatMoney = new Intl.NumberFormat("es-CO", {
  //   style: "currency",
  //   currency: "COP",
  //   maximumFractionDigits: 0,
  // });
  const navigate = useNavigate();

  const [label, setLabel] = useState("");
  const [tipobusqueda, setTiposBusqueda] = useState("");
  const [number, setNumber] = useState("");
  const [info, setInfo] = useState("");
  const [table, setTable] = useState("");
  const [cuota, setCuota] = useState("");
  const [formatMon, setFormatMon] = useState("");
  const [ticket, setTicket] = useState(false);
  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState("");
  const [response, setResponse] = useState("");
  const { roleInfo, pdpUser } = useAuth();
  const [permiteCambio, setPermiteCambio] = useState("");
  const [paraMax, setParaMax] = useState(null);
  const [paraMin, setParaMin] = useState(null);
  const [tickets, setTickets] = useState("");
  const [valueValor, setValueValor] = useState(false);
  const [uuid, setUuid] = useState(v4());

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
    setFormatMon("");
    setInfo("");
    setTicket(false);
    setValueValor(false);
    setPermiteCambio("");
    setCuota("");
    setValueValor(false);
    setUuid(v4());
    setParaMax(null);
    setParaMin(null);
  }, []);

  const [loadingPeticionMostrarCredito, peticionMostrarCredito] = useFetch(
    fetchCustom(URL_MOSTRAR_CREDITO, "POST", "Mostrar Credito")
  );
  const [loadingPeticionIngresarRecibo, peticionIngresarRecibo] = useFetch(
    fetchCustom(URL_INGRESAR_RECIBO, "POST", "Ingreso Recibo")
  );
 

  const bankCollection = useCallback(
    (e) => {
      e.preventDefault();
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        id_uuid_trx: uuid,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        id_trx: info?.obj?.id_trx,
        valor_total_trx: parseFloat(formatMon),
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS" || roleInfo?.tipo_comercio === "KIOSCO" ? true : false,
        Datos: {
          Depto: parseInt(roleInfo?.codigo_dane?.slice(0, 2)),
          Municipio: parseInt(roleInfo?.codigo_dane?.slice(2)),
          nroBusqueda: selected?.Credito,
          Direccion: roleInfo?.direccion ? roleInfo?.direccion : "No hay datos",
          Cliente: selected?.Cliente,
          Cedula: selected?.Cedula,
        },
      };
      notifyPending(
        peticionIngresarRecibo({}, data),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({data: res }) =>{
            setResponse(res?.obj);
            setTickets(res?.obj?.ticket);
            setTicket(true);
            return "Transaccion satisfactoria";
          },
        },
        {
          render({ data: err }) {
            handleClose();
            navigate("/funmujer");
            if (err?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{err?.message}</p>;
            }
            console.error(err?.message);
            return err?.message ?? "Transacción fallida";
          },
        }
      );
    },
    [roleInfo,
      selected, 
      info, 
      pdpUser, 
      formatMon,
    ]);
  
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setInfo("");
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        Datos: {
          Depto: parseInt(roleInfo?.codigo_dane?.slice(0, 2)),
          Municipio: parseInt(roleInfo?.codigo_dane?.slice(2)),
          nroBusqueda: parseFloat(number),
          ParametroBusqueda: tipobusqueda,
        },
      };
      notifyPending(
        peticionMostrarCredito({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({data: res }) =>{
            setInfo(res);
            if (tipobusqueda === "2" && res?.obj?.Cedula !== 0) {
              const body = {
                comercio: {
                  id_comercio: roleInfo?.id_comercio,
                  id_usuario: roleInfo?.id_usuario,
                  id_terminal: roleInfo?.id_dispositivo,
                },
                nombre_comercio: roleInfo?.["nombre comercio"],
                nombre_usuario: pdpUser?.uname ?? "",
                id_trx: res?.obj?.id_trx,
                Datos: {
                  Depto: parseInt(roleInfo?.codigo_dane?.slice(0, 2)),
                  Municipio: parseInt(roleInfo?.codigo_dane?.slice(2)),
                  nroBusqueda: parseFloat(number),
                },
              };
              consultaValorCuota(body)
                .then((res) => {
                  setPermiteCambio(res?.obj?.PermiteCambio);
                  const max = parseFloat(res?.obj?.ValorPagarMaximo) + 1
                  const min = parseFloat(res?.obj?.ValorPagarMin)
                  setParaMax(max);
                  setParaMin(min);
                  setFormatMon(res?.obj?.ValorPagar);
                  setCuota(res?.obj);
                  setValueValor(true);
                })
                .catch((err) => {
                  console.log(err);
                });
            }
            [res?.obj].map((row) => {
              setTable([
                {
                  Cedula: row?.Cedula,
                  Mensaje: row?.Mensaje,
                  Cliente: row?.NombreCLiente1,
                  Producto: row?.NombreProducto,
                  Credito: row?.Nrocredito,
                  Valor: formatMoney.format(row?.ValorPagar1),
                },
              ]);
              setFormatMon(row?.ValorPagar1);
            });
            return "Consulta satisfactoria";
          },
        },
        {
          render: ( { data: error}) => {
            return "Consulte soporte, servicio de Fundación de la mujer presenta fallas";
          },
        }
      );
    },
    [roleInfo, pdpUser, tipobusqueda, number]
  );

  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

const params = useCallback(async () => {
  const queries = { tipo_op: 5 };
  try {
    if (!setValueValor){
      const res = await fetchData(url_params, "GET", queries);
      if ("Parametros" in res?.obj?.[0]) {
        setParaMax(res?.obj?.[0].Parametros.monto_maximo);
        setParaMin(res?.obj?.[0].Parametros.monto_minimo);
      } else {
        setParaMax(10000000);
        setParaMin(0);
      }
      return res;
    }
  } catch (err) {
    console.error(err);
  }
}, []);

const onChangeMoney = useMoney({
  limits: [paraMin, paraMax]
});
  
  useEffect(() => {
    params();
  }, [info]);

  return (
    <>
      <>
        <h1 className='text-3xl mt-6'>Recaudo Fundación de la mujer</h1>
        <Form onSubmit={onSubmit} grid>
          <Select
            id='searchBySorteo'
            label='Tipo de busqueda'
            options={[
              { value: "", label: "" },
              {
                value: 1,
                label: `Documento`,
              },
              {
                value: 2,
                label: `Nº credito`,
              },
            ]}
            value={tipobusqueda}
            onChange={(e) => {
              setTiposBusqueda(e.target.value);
              if (e.target.value === 1) {
                setLabel("Documento");
              }
              if (e.target.value === 2) {
                setLabel("Número crédito");
              }
            }}
          />
          {tipobusqueda?.length > 0 && (
            <Input
              id='numpin'
              label={label}
              type='text'
              minLength='5'
              maxLength='12'
              autoComplete='off'
              value={number}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setNumber(num);
              }}
            />
          )}
          <ButtonBar className='col-auto md:col-span-2'>
            <Button type='submit' disabled={loadingPeticionMostrarCredito}>
              Consultar recaudos
            </Button>
          </ButtonBar>
        </Form>
      </>
      {info?.status && (
        <>
          <br />
          <TableEnterprise
            title='Información de credito'
            headers={[
              "Cédula",
              "Mensaje",
              "Cliente",
              "Producto",
              "Crédito",
              "Valor a pagar",
            ]}
            data={table || []}
            onSelectRow={(e, index) => {
              setSelected(table[index]);
              if ((info?.obj?.Nromensaje1 === 1) && (tipobusqueda !== "2")){
                setShowModal(true);
              }
              else if ((info?.obj?.Nromensaje1 === 1) && (valueValor)){
                setShowModal(true);
              }
              else if(info?.obj?.Nromensaje1 === 1) {
                notify("Procesando Consulta Valor Cuota")
              }
            }}
          ></TableEnterprise>
        </>
      )}
      {info?.obj?.Nromensaje1 === 1 && (
        <Modal show={showModal} handleClose={ticket || loadingPeticionIngresarRecibo ? () => {} : handleClose}>
          {ticket !== true && (
            <>
              <h1 className='xl:text-center font-semibold'>
                Resumen de la transacción
              </h1>
              <h2 className='sm:text-center font-semibold'>
                Crédito # {table[0]?.Credito}
              </h2>
            </>
          )}
          <>
            {ticket !== false ? (
              <div className='flex flex-col justify-center items-center'>
                <Tickets refPrint={printDiv} ticket={tickets} />
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button onClick={goToRecaudo}>Cerrar</Button>
                </ButtonBar>
              </div>
            ) : (
              <Form grid onSubmit={bankCollection}>
                <>
                <h2>{`Nombre del Cliente: ${
                  info?.obj?.NombreCLiente1 ?? ""
                }`}
                </h2>
                <h2>{`Documento del Cliente: ${
                  info?.obj?.Cedula ?? ""
                }`}
                </h2>
                </>
                {valueValor !== false ? (
                  <>
                    <h2>{`Valor de pago mínimo: ${formatMoney.format(
                      cuota?.ValorPagarMin
                    )}`}</h2>
                    <h2>{`Valor de pago máximo: ${formatMoney.format(
                      cuota?.ValorPagarMaximo
                    )}`}</h2>
                    <h2>{`Valor a pagar: ${formatMoney.format(
                      cuota?.ValorPagar
                    )}`}</h2>
                  </>
                ): ""}
                <MoneyInput
                  id='numPago'
                  label='Valor a pagar'
                  type='number'
                  autoComplete='off'
                  max={paraMax}
                  min={paraMin}
                  required
                  value={formatMon}
                  disabled={permiteCambio === "N" || loadingPeticionIngresarRecibo}
                  onInput={(ev) => 
                    setFormatMon(onChangeMoney(ev))}
                />
                <ButtonBar>
                  <Button type='submit' disabled={loadingPeticionIngresarRecibo}>
                    Realizar pago
                  </Button>
                </ButtonBar>
              </Form>
            )}
          </>
        </Modal>
      )}
    </>
  );
};
export default Recaudo;
