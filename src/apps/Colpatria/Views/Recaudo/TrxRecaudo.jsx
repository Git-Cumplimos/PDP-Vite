import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
  Navigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import MoneyInput from "../../../../components/Base/MoneyInput/MoneyInput";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../hooks/AuthHooks";
import useMoney from "../../../../hooks/useMoney";
import {
  makeSellRecaudo,
  searchConveniosRecaudoList,
  makeInquiryRecaudo,
} from "../../utils/fetchFunctions";

import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  makeMoneyFormatter,
  onChangeNumber,
  // onChangeNumber,
} from "../../../../utils/functions";
import fetchData from "../../../../utils/fetchData";
import ScreenBlocker from "../../components/ScreenBlocker";
import TicketColpatria from "../../components/TicketColpatria";

const formatMoney = makeMoneyFormatter(2);

const TrxRecaudo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { id_convenio_pin } = useParams();

  const { roleInfo, pdpUser } = useAuth();

  const [searchingConvData, setSearchingConvData] = useState(false);
  const [datosConvenio, setDatosConvenio] = useState(null);
  const [userReferences, setUserReferences] = useState({});
  const [disableRefs, setDisableRefs] = useState([]);
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [valTrxRecaudo, setValTrxRecaudo] = useState(0);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [inquiryStatus, setInquiryStatus] = useState(null);

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const [loadingSell, setLoadingSell] = useState(false);
  const [loadingInquiry, setLoadingInquiry] = useState(false);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const [validacionPago, setValidacionPago] = useState({
    trueCodbarras: false,
    valorCodBarras: 0,
    peticion: 0,
    valorSinModificar: 0
  });
  
  const summary = useMemo(
    () => ({
      ...Object.fromEntries(
        Object.entries(userReferences).map(([, val], index) => [
          datosConvenio[`referencia_${index + 1}`],
          val,
        ])
      ),
      Valor:
        datosConvenio?.fk_tipo_valor !== 3 ? (
          formatMoney.format(valTrxRecaudo)
        ) : datosConvenio?.fk_tipo_valor === 3 && validacionPago?.trueCodbarras ? (
          <MoneyInput
            id='valor'
            name='valor'
            // label="Valor a pagar"
            autoComplete='off'
            type='tel'
            minLength={"5"}
            maxLength={"10"}
            value={validacionPago?.valorCodBarras}
            min={limitesMontos?.min}
            max={limitesMontos?.max}
            equalError={false}
            equalErrorMin={false}
            onInput={(e, val) => {
              if (!isNaN(val)) {
                const num = val;
                setValidacionPago((old) => {
                  return { ...old, valorCodBarras: num };
                });
                setValTrxRecaudo(num);
              }
            }}
            required
          />
        ) : (
          <Input
            id='valor'
            name='valor'
            // label="Valor a pagar"
            autoComplete='off'
            type='tel'
            minLength={"5"}
            maxLength={"10"}
            value={formatMoney.format(valTrxRecaudo)}
            onInput={(ev) => setValTrxRecaudo(onChangeMoney(ev))}
            required
          />
        ),
      // "Valor": formatMoney.format(valTrxRecaudo),
      // "Valor de la comision": formatMoney.format(valorComision),
      // "Valor total": formatMoney.format(valor + valorComision),
    }),
    [userReferences, datosConvenio, valTrxRecaudo, onChangeMoney, validacionPago?.valorCodBarras]
  );

  const handleClose = useCallback(() => {
    if (!paymentStatus) {
      notifyError("Transacción cancelada por el usuario");
    }
    navigate("/corresponsalia/colpatria");
  }, [navigate, paymentStatus]);

  const onMakeInquiry = useCallback(
    (ev) => {
      ev.preventDefault();
      for (const key in userReferences) {
        if (userReferences.hasOwnProperty(key)) {
          const valorStr = userReferences[key];
          const valorNum = parseInt(valorStr, 10);
          if (!isNaN(valorNum) && valorNum <= 0) {
            notifyError("La referencia no puede ser 0");
            return;
          }
        }
      }
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        valor_total_trx: valTrxRecaudo,
        nombre_usuario: pdpUser?.uname ?? "",

        // Datos trx colpatria
        colpatria: {
          codigo_convenio_pdp: datosConvenio?.fk_id_convenio,
          codigo_convenio: datosConvenio?.pk_codigo_convenio,
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };

      notifyPending(
        makeInquiryRecaudo(data),
        {
          render: () => {
            setLoadingInquiry(true);
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setLoadingInquiry(false);
            setInquiryStatus(res?.obj);
            setValidacionPago((old) => ({
              ...old,
              peticion: 1,
            }));
            if (datosConvenio?.fk_tipo_valor === 3 && validacionPago?.trueCodbarras){
              setValTrxRecaudo(validacionPago?.valorCodBarras);
            }
            else {
              setValidacionPago((old) => ({
                ...old,
                valorSinModificar: res?.obj?.valor,
              }));
              setValTrxRecaudo(res?.obj?.valor);
            }
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingInquiry(false);
            navigate("/corresponsalia/colpatria", { replace: true });
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            console.error(error?.message);
            return "Consulta fallida";
          },
        }
      );
    },
    [
      datosConvenio,
      userReferences,
      userAddress,
      valTrxRecaudo,
      roleInfo,
      pdpUser?.uname,
      navigate,
    ]
  );

  const onMakePayment = useCallback(
    (ev) => {
      ev.preventDefault();
      if (valTrxRecaudo <= 0) {
        notifyError("El valor debe ser mayor a cero");
        return;
      }
      if ((parseInt(valTrxRecaudo) !== parseInt(validacionPago?.valorSinModificar)) && datosConvenio?.fk_tipo_valor !== 3 && validacionPago?.trueCodbarras) {
        let error = `Error, el valor a pagar es diferente al valor de validación`;
        return notifyError(error);
      }
      for (const key in userReferences) {
        if (userReferences.hasOwnProperty(key)) {
          const valorStr = userReferences[key];
          const valorNum = parseInt(valorStr, 10);
          if (!isNaN(valorNum) && valorNum <= 0) {
            notifyError("La referencia no puede ser 0");
            return;
          }
        }
      }
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        valor_total_trx: valTrxRecaudo,
        nombre_usuario: pdpUser?.uname ?? "",
        nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
        ticket_init: [
          ["Convenio", datosConvenio?.nombre_convenio],
          ...Object.entries(userReferences).map(([, val], index) => [
            datosConvenio[`referencia_${index + 1}`],
            val,
          ]),
          ["Valor", formatMoney.format(valTrxRecaudo)],
        ].reduce((list, elem, i) => {
          list.push(elem);
          if ((i + 1) % 1 === 0) list.push(["", ""]);
          return list;
        }, []),

        id_trx: inquiryStatus?.id_trx,
        // Datos trx colpatria
        colpatria: {
          codigo_convenio_pdp: datosConvenio?.fk_id_convenio,
          codigo_convenio: datosConvenio?.pk_codigo_convenio,
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };

      notifyPending(
        makeSellRecaudo(data),
        {
          render: () => {
            setLoadingSell(true);
            return "Procesando transacción";
          },
        },
        {
          render: ({ data: res }) => {
            setLoadingSell(false);
            setPaymentStatus(res?.obj?.ticket ?? {});
            setValidacionPago((old) => ({
              ...old,
              peticion: 2,
            }));
            return "Transacción satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingSell(false);
            navigate("/corresponsalia/colpatria", { replace: true });
            if (error?.cause === "custom") {
              return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
            }
            console.error(error?.message);
            return "Transacción fallida";
          },
        }
      );
    },
    [
      datosConvenio,
      userReferences,
      userAddress,
      valTrxRecaudo,
      inquiryStatus,
      validacionPago?.valorCodBarras,
      roleInfo,
      pdpUser?.uname,
      navigate,
    ]
  );

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`,
      "GET",
      { tipo_op: 85 }
    )
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        const _parametros = res?.obj?.[0]?.Parametros;
        setLimitesMontos({
          max: parseFloat(_parametros?.monto_maximo),
          min: parseFloat(_parametros?.monto_minimo),
        });

        // setRevalTrxParams({
        //   idcliente: parseFloat(_parametros?.idcliente) ?? 0,
        //   idpersona: parseFloat(_parametros?.idpersona) ?? 0,
        //   NoidentificacionCajero: _parametros?.NoidentificacionCajero ?? "",
        // });
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error consultando parametros de la transacción");
      });
  }, []);

  useEffect(() => {
    setSearchingConvData(true);
    searchConveniosRecaudoList({
      pk_codigo_convenio: id_convenio_pin,
    })
      .then((res) => {
        setSearchingConvData(false);
        const received = res?.obj?.[0] ?? null;
        setDatosConvenio(received);
        if (received) {
          setUserReferences(
            Object.fromEntries(
              [1, 2, 3, 4, 5]
                .filter((ref) => received[`referencia_${ref}`])
                .map((ref) => [`referencia_${ref}`, ""])
            )
          );
        }
      })
      .catch((error) => {
        setSearchingConvData(false);
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, [id_convenio_pin]);

  useEffect(() => {
    const urlData = Object.fromEntries(searchParams);
    if ("refs" in urlData && datosConvenio) {
      setUserReferences(
        Object.fromEntries(
          [1, 2, 3]
            .filter((ref) => datosConvenio[`referencia_${ref}`])
            .map((ref) => [
              `referencia_${ref}`,
              JSON.parse(urlData.refs)?.[`referencia_${ref}`] ?? "",
            ])
        )
      );
      setDisableRefs(
        [1, 2, 3]
          .filter((ref) => datosConvenio[`referencia_${ref}`])
          .map((ref) =>
            Boolean(JSON.parse(urlData.refs)?.[`referencia_${ref}`])
          )
      );
    }
    if ("valor" in urlData) {
      setValTrxRecaudo(urlData.valor);
      setValidacionPago((old) => ({
        ...old,
        valorCodBarras: urlData.valor,
      }));
    }
    if ("true_codbarras" in urlData) {
      setValidacionPago((old) => ({
        ...old,
        trueCodbarras: true,
      }));
    }
  }, [searchParams, datosConvenio]);

  /**
   * Check if has commerce data
   */

  const hasData = useMemo(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      return false;
    }
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
      "codigo_dane",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        return false;
      }
    }
    return true;
  }, [roleInfo]);

  if (!hasData) {
    notifyError(
      "El usuario no cuenta con datos de comercio, no se permite la transacción"
    );
    return <Navigate to={"/"} replace />;
  }

  if (searchingConvData || !(searchingConvData || datosConvenio)) {
    return (
      <Fragment>
        <h1 className='text-3xl mt-6'>Recaudo PSP en Efectivo</h1>
        <h1 className='text-xl mt-6'>
          {searchingConvData
            ? "Buscando infomacion de convenio ..."
            : "No se ha encontrado informacion del convenio"}
        </h1>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <h1 className='text-3xl mt-6 mb-10'>Recaudo PSP en Efectivo</h1>
      <Form
        onSubmit={inquiryStatus ? (ev) => ev.preventDefault() : onMakeInquiry}
        grid>
        <Input
          label='Número de convenio'
          type='text'
          autoComplete='off'
          value={datosConvenio.pk_codigo_convenio}
          disabled
        />
        <Input
          label='Código EAN o IAC'
          type='text'
          autoComplete='off'
          value={datosConvenio.codigo_ean_iac}
          disabled
        />
        <Input
          label='Nombre de convenio'
          type='text'
          autoComplete='off'
          value={datosConvenio.nombre_convenio}
          disabled
        />
        {[1, 2, 3]
          .filter((ref) => datosConvenio[`referencia_${ref}`])
          .map((ref, index) => (
            <Input
              key={ref}
              id={`referencia_${ref}`}
              label={datosConvenio[`referencia_${ref}`]}
              name={`referencia_${ref}`}
              type='text'
              maxLength='19'
              autoComplete='off'
              value={userReferences?.[`referencia_${ref}`] ?? ""}
              onInput={(ev) =>
                setUserReferences((old) => ({
                  ...old,
                  [ev.target.name]: onChangeNumber(ev),
                }))
              }
              readOnly={disableRefs?.[index]}
              required
            />
          ))}
        {(datosConvenio.fk_tipo_valor === 1 || valTrxRecaudo) && !validacionPago?.trueCodbarras ? (
          <Input
            id='valor'
            name='valor'
            label='Valor a pagar'
            autoComplete='off'
            type='tel'
            minLength={"5"}
            maxLength={"10"}
            value={valTrxRecaudo ? formatMoney.format(valTrxRecaudo) : ""}
            onInput={(ev) => setValTrxRecaudo(onChangeMoney(ev))}
            readOnly={valTrxRecaudo && datosConvenio.fk_tipo_valor !== 1}
            required
          />
        ) : (
          ""
        )}
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} disabled={loadingInquiry}>
            Realizar {!inquiryStatus ? "consulta" : "recaudo"}
          </Button>
        </ButtonBar>
      </Form>
      <ScreenBlocker show={loadingInquiry} />
      <Modal
        show={inquiryStatus}
        handleClose={loadingSell ? () => {} : handleClose}>
        {validacionPago?.peticion === 2 && (
          <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
            <TicketColpatria refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
        {validacionPago?.peticion === 1 && ( 
          <form onSubmit={onMakePayment}>
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button type='submit' disabled={loadingSell} onClick={(e) => {
                if (datosConvenio?.fk_tipo_valor !== 3 && validacionPago?.trueCodbarras){
                  setValTrxRecaudo(0);
                  setValidacionPago((old) => ({
                    ...old,
                    peticion: 3,
                  }));
                }
              }}>
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingSell}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        </form>
        )}
        {validacionPago?.peticion === 3 && (
          <>
            <h1 className='text-2xl text-center mb-2 font-semibold'>
              ¿Esta seguro de realizar el pago?
            </h1>
            <h2 className='text-xl text-center mb-3 font-semibold'>
              {`Valor a pagar: ${formatMoney.format(
                      validacionPago?.valorSinModificar
                    )} `}
            </h2>
            <h2 className='text-base text-center font-semibold'>
              Por favor ingresar el valor a pagar para confirmar la transacción
            </h2>
            <Form grid onSubmit={onMakePayment}>
              <MoneyInput
                id='valor'
                name='valor'
                label='Validación valor'
                autoComplete='off'
                type='tel'
                minLength={"5"}
                maxLength={"12"}
                min={limitesMontos?.min}
                max={limitesMontos?.max}
                equalError={false}
                equalErrorMin={false}
                value={valTrxRecaudo ?? ""}
                onInput={(ev, val) => {
                  if (!isNaN(val)){
                    const num = val;
                    setValTrxRecaudo(num);
                  }
                }}
                required
              />
              <ButtonBar>
              <Button onClick={handleClose} disabled={loadingSell}>
                  Cancelar
                </Button>
                <Button type='submit'>Realizar pago</Button>
              </ButtonBar>
            </Form>
          </>
        )}
      </Modal>
    </Fragment>
  );
};

export default TrxRecaudo;
