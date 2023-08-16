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
import { useFetchFDLM } from "../hooks/fetchFDLM";

const url_params = `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`;
const URL_MOSTRAR_CREDITO= `${process.env.REACT_APP_URL_FDLMWSDL}/mostrarcreditos`
const URL_INGRESAR_RECIBO = `${process.env.REACT_APP_URL_FDLMWSDL}/ingresorecibo`
const URL_CONSULTAR_ESTADO_TRX = `${process.env.REACT_APP_URL_FDLMWSDL}/check_estado_recaudo_fdlm`

const Recaudo = () => {
  const navigate = useNavigate();
  const [label, setLabel] = useState("");
  const [limitesMontos, setLimitesMontos] = useState({
    max: 0,
    min: 0,
  });
  const [datosTrx, setDatosTrx] = useState({
    tipobusqueda: "",
    number: "",
    info: "",
    cuota: "",
    formatMon: "",
    permiteCambio: "",
    valueValor: false,
    ticket: false,
  });
  const [uuid, setUuid] = useState(v4());
  const [table, setTable] = useState("");
  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState("");
  const { roleInfo, pdpUser } = useAuth();
  const [tickets, setTickets] = useState("");
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
    if (selected !== true){
      postValorCuota();
    }
  }, [roleInfo, navigate, selected]);
  
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    setUuid(v4());
    setLimitesMontos({
      max: 0,
      min: 0,
    });
    setDatosTrx({
      tipobusqueda: "",
      number: "",
      info: "",
      cuota: "",
      formatMon: "",
      permiteCambio: "",
      valueValor: false,
      ticket: false,
    });
    setSelected(true);
  }, []);

  const [loadingPeticionMostrarCredito, peticionMostrarCredito] = useFetch(
    fetchCustom(URL_MOSTRAR_CREDITO, "POST", "Mostrar Credito")
  );
  const [loadingPeticionIngresarRecibo, peticionIngresarRecibo] = 
    useFetchFDLM(
      URL_INGRESAR_RECIBO,
      URL_CONSULTAR_ESTADO_TRX,
      "Ingresar recibo"
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
        id_trx: datosTrx?.info?.obj?.id_trx,
        valor_total_trx: parseFloat(datosTrx?.formatMon),
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
      const dataAditional = {
        id_uuid_trx: uuid,
      };
      notifyPending(
        peticionIngresarRecibo(data, dataAditional),
        {
          render: () => {
            return "Procesando transacción";
          },
        },
        {
          render: ({data: res }) =>{
            setTickets(res?.obj?.ticket);
            setDatosTrx((old) => ({
              ...old,
              ticket: true,
            }));
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
      datosTrx?.info, 
      pdpUser, 
      datosTrx?.formatMon,
    ]);
  
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setDatosTrx((old) => ({
        ...old,
        info: "",
      }));
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
          nroBusqueda: parseFloat(datosTrx?.number),
          ParametroBusqueda: datosTrx?.tipobusqueda,
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
            setDatosTrx((old) => ({
              ...old,
              info: res,
            }));
            const formattedData = res?.obj?.response.map(row => ({
              Cedula: row.Cedula,
              Mensaje: row.Mensaje,
              Cliente: row.NombreCLiente1,
              Producto: row.NombreProducto,
              Credito: row.Nrocredito,
              Valor: formatMoney.format(row?.ValorPagar1), // Formatear el valor como número con 2 decimales
            }));
            setTable(formattedData);
            setDatosTrx((old) => ({
                ...old,
                formatMon: selected?.Valor,
              }));
            return "Consulta satisfactoria";
          },
        },
        {
          render: ( { data: error}) => {
            return error?.message ?? "Consulte soporte, servicio de Fundación de la mujer presenta fallas";
          },
        }
      );
    },
    [roleInfo, pdpUser, datosTrx?.tipobusqueda, datosTrx?.number]
  );

  const postValorCuota = useCallback(
    (e) => {
      const body = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        id_trx: datosTrx?.info?.obj?.id_trx,
        Datos: {
          Depto: parseInt(roleInfo?.codigo_dane?.slice(0, 2)),
          Municipio: parseInt(roleInfo?.codigo_dane?.slice(2)),
          nroBusqueda: parseFloat(selected?.Cedula),
        },
      };
      consultaValorCuota(body)
      .then((res) => {
        const maximo = parseFloat(res?.obj?.ValorPagarMaximo) + 1
        const minimo = parseFloat(res?.obj?.ValorPagarMin) - 1
        setLimitesMontos({
          max: maximo,
          min: minimo,
        });
        setDatosTrx((old) => ({
          ...old,
          formatMon: res?.obj?.ValorPagar,
          cuota: res?.obj,
          valueValor: true,
          permiteCambio: res?.obj?.PermiteCambio,
        }));
      })
      .catch((err) => {
        console.error(err);
      });
    },
    [roleInfo, pdpUser, selected?.Credito, datosTrx?.info]
  );
  
  const goToRecaudo = useCallback(() => {
    navigate(-1);
  }, [navigate]);

// const params = useCallback(async () => {
//   const queries = { tipo_op: 5 };
//   try {
//     if (datosTrx?.tipobusqueda !== "2"){
//       const res = await fetchData(url_params, "GET", queries);
//       if ("Parametros" in res?.obj?.[0]) {
//         setLimitesMontos({
//           max: res?.obj?.[0].Parametros.monto_maximo + 1,
//           min: res?.obj?.[0].Parametros.monto_minimo - 1,
//         });
//       } else {
//         setLimitesMontos({
//           max: 10000000,
//           min: 0,
//         });
//       }
//       return res;
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }, []);
  
  // useEffect(() => {
  //   params();
  // }, [datosTrx?.info]);

  return (
    <>
      <>
        <h1 className='text-3xl mt-6'>Recaudo Fundación de la mujer</h1>
        <Form onSubmit={onSubmit} grid>
          <Select
            id='searchBySorteo'
            label='Tipo de búsqueda'
            options={[
              { value: "", label: "" },
              {
                value: 1,
                label: `Documento`,
              },
              {
                value: 2,
                label: `Nº crédito`,
              },
            ]}
            required
            value={datosTrx?.tipobusqueda}
            onChange={(e) => {
              setDatosTrx(prevState => ({
                ...prevState,
                tipobusqueda: e.target.value
              }));
              if (e.target.value === 1) {
                setLabel("Documento");
              }
              if (e.target.value === 2) {
                setLabel("Número crédito");
              }
            }}
          />
          
          {datosTrx?.tipobusqueda?.length > 0 && (
            <Input
              id='numpin'
              label= {datosTrx?.tipobusqueda === "2" ? "Número de obligación" : "Número identificación"}
              type='text'
              minLength='5'
              maxLength='12'
              autoComplete='off'
              value={datosTrx?.number}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setDatosTrx(prevState => ({
                ...prevState,
                number: num
              }));
              }}
              required
            />
          )}
          <ButtonBar className='col-auto md:col-span-2'>
            <Button type='submit' disabled={loadingPeticionMostrarCredito}>
              Consultar recaudos
            </Button>
          </ButtonBar>
        </Form>
      </>
      {datosTrx?.info?.status && (
        <>
          <br />
          <TableEnterprise
            title='Información de crédito'
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
              // setShowModal(true);
              if(datosTrx?.valueValor === false) {
                  notify("Procesando consulta valor cuota, intente de nuevo")
              }
              else {
                setShowModal(true);
              }
              // if ((datosTrx?.info?.obj?.Nromensaje1 === 1) && (datosTrx?.tipobusqueda !== "2")){
              //   setShowModal(true);
              // }
              // else if ((datosTrx?.info?.obj?.Nromensaje1 === 1) && (datosTrx?.valueValor)){
              //   setShowModal(true);
              // }
              // else if(datosTrx?.info?.obj?.Nromensaje1 === 1) {
              //   notify("Procesando Consulta Valor Cuota")
              // }
            }}
          ></TableEnterprise>
        </>
      )}
      {(
        <Modal show={showModal} handleClose={datosTrx?.ticket || loadingPeticionIngresarRecibo ? () => {} : handleClose}>
          <>
            {datosTrx?.ticket !== false ? (
              <div className='flex flex-col justify-center items-center'>
                <Tickets refPrint={printDiv} ticket={tickets} />
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button onClick={goToRecaudo}>Cerrar</Button>
                </ButtonBar>
              </div>
            ) : (
              <Form grid onSubmit={bankCollection} style={{ textAlign: 'center' }}>
                <>
                <h1 className='text-2xl font-semibold'>
                  Resumen de la transacción
                </h1>
                <h2 className='sm:text-center font-semibold'>
                  Crédito # {selected?.Credito}
                </h2>
                <h2>{`Nombre del Cliente: ${
                  selected?.Cliente ?? ""
                }`}
                </h2>
                <h2>{`Documento del Cliente: ${
                  selected?.Cedula ?? ""
                }`}
                </h2>
                <h2>{`Valor de pago mínimo: ${formatMoney.format(
                      datosTrx?.cuota?.ValorPagarMin
                    )}`}</h2>
                    <h2>{`Valor de pago máximo: ${formatMoney.format(
                      datosTrx?.cuota?.ValorPagarMaximo
                    )}`}
                </h2>
                </>
                <MoneyInput
                  id='numPago'
                  name='numPago'
                  label='Valor a pagar'
                  type='number'
                  autoComplete='off'
                  max={limitesMontos?.max}
                  min={limitesMontos?.min}
                  value={datosTrx?.formatMon}
                  disabled={datosTrx?.permiteCambio === "N" || loadingPeticionIngresarRecibo}
                  onInput={(e, valor) => {
                    if (!isNaN(valor)) {
                      const num = valor;
                      setDatosTrx((old) => {
                        return { ...old, formatMon: num };
                      });
                    }
                  }}
                  required>
                </MoneyInput>
                <ButtonBar>
                  <Button type='submit' disabled={loadingPeticionIngresarRecibo}>
                    Realizar pago
                  </Button>
                  <Button
                    onClick={() => {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                    disabled={loadingPeticionIngresarRecibo}>
                    Cancelar
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
