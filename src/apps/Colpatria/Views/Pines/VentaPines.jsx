import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../hooks/AuthHooks";
import useMoney from "../../../../hooks/useMoney";
import {
  makeSellPin,
  searchConveniosPinesList,
  makeInquiryPin,
} from "../../utils/fetchFunctions";

import { notifyError, notifyPending } from "../../../../utils/notify";
import { makeMoneyFormatter } from "../../../../utils/functions";
import fetchData from "../../../../utils/fetchData";
import ScreenBlocker from "../../components/ScreenBlocker";
import TicketColpatria from "../../components/TicketColpatria";
import { buildTicket, decryptPin } from "../../utils/functions";

const formatMoney = makeMoneyFormatter(2);

const VentaPines = () => {
  const navigate = useNavigate();

  const { id_convenio_pin } = useParams();

  const { roleInfo, pdpUser, infoTicket } = useAuth();

  const [searchingConvData, setSearchingConvData] = useState(false);
  const [datosConvenio, setDatosConvenio] = useState(null);
  const [userReferences, setUserReferences] = useState({});
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [valVentaPines, setValVentaPines] = useState(0);

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
          formatMoney.format(valVentaPines)
        ) : (
          <Input
            id="valor"
            name="valor"
            // label="Valor a pagar"
            autoComplete="off"
            type="tel"
            minLength={"5"}
            maxLength={"10"}
            value={formatMoney.format(valVentaPines)}
            onInput={(ev) => setValVentaPines(onChangeMoney(ev))}
            required
          />
        ),
      // "Valor": formatMoney.format(valVentaPines),
      // "Valor de la comision": formatMoney.format(valorComision),
      // "Valor total": formatMoney.format(valor + valorComision),
    }),
    [userReferences, datosConvenio, valVentaPines, onChangeMoney]
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

      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS",
        valor_total_trx: valVentaPines,
        nombre_usuario: pdpUser?.uname ?? "",

        // Datos trx colpatria
        colpatria: {
          codigo_convenio: datosConvenio?.pk_codigo_convenio,
          codigo_pin: datosConvenio?.codigo_pin,
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };

      notifyPending(
        makeInquiryPin(data),
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
            setValVentaPines(res?.obj?.valor);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingInquiry(false);
            navigate("/corresponsalia/colpatria", { replace: true });
            if (error?.cause === "custom") {
              return error?.message;
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
      valVentaPines,
      roleInfo,
      pdpUser?.uname,
      navigate,
    ]
  );

  const onMakePayment = useCallback(
    (ev) => {
      if (valVentaPines <= 0) {
        notifyError("El valor del pin debe ser mayor a cero");
        return;
      }
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia: roleInfo?.tipo_comercio === "OFICINAS PROPIAS",
        valor_total_trx: valVentaPines,
        nombre_usuario: pdpUser?.uname ?? "",

        id_trx: inquiryStatus?.id_trx,
        // Datos trx colpatria
        colpatria: {
          codigo_convenio: datosConvenio?.pk_codigo_convenio,
          codigo_pin: datosConvenio?.codigo_pin,
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
        },
      };

      notifyPending(
        makeSellPin(data),
        {
          render: () => {
            setLoadingSell(true);
            return "Procesando transacción";
          },
        },
        {
          render: ({ data: res }) => {
            setLoadingSell(false);
            const trx_id = res?.obj?.id_trx ?? 0;
            const id_type_trx = res?.obj?.id_type_trx ?? 0;
            const codigo_autorizacion = res?.obj?.codigo_autorizacion ?? 0;
            const pin_encriptado = res?.obj?.pin_encriptado ?? "";
            const pin_desencriptado = decryptPin(pin_encriptado);
            const tempTicket = buildTicket(
              roleInfo,
              trx_id,
              codigo_autorizacion,
              "Recaudo Pin",
              [
                ["Convenio", datosConvenio?.nombre_convenio],
                ["No. Pin", pin_desencriptado],
                ...Object.entries(userReferences).map(([, val], index) => [
                  datosConvenio[`referencia_${index + 1}`],
                  val,
                ]),
                ["Valor", formatMoney.format(valVentaPines)],
              ].reduce((list, elem, i) => {
                list.push(elem);
                if ((i + 1) % 1 === 0) list.push(["", ""]);
                return list;
              }, [])
            );
            setPaymentStatus(tempTicket);
            infoTicket(trx_id, id_type_trx, tempTicket)
              .then((resTicket) => {
                console.log(resTicket);
              })
              .catch((err) => {
                console.error(err);
                notifyError("Error guardando el ticket");
              });
            return "Transacción satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingSell(false);
            navigate("/corresponsalia/colpatria", { replace: true });
            if (error?.cause === "custom") {
              return error?.message;
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
      valVentaPines,
      inquiryStatus,
      roleInfo,
      pdpUser?.uname,
      infoTicket,
      navigate,
    ]
  );

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_TRXS_TRX}/tipos-operaciones`,
      "GET",
      { tipo_op: 73 }
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
    searchConveniosPinesList({
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
        <h1 className="text-3xl mt-6">Venta de Pines de Recaudo</h1>
        <h1 className="text-xl mt-6">
          {searchingConvData
            ? "Buscando infomacion de convenio ..."
            : "No se ha encontrado informacion del convenio"}
        </h1>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <h1 className="text-3xl mt-6 mb-10">Venta de Pines de Recaudo</h1>
      <Form
        onSubmit={inquiryStatus ? (ev) => ev.preventDefault() : onMakeInquiry}
        grid
      >
        <Input
          label="Número de convenio pin"
          type="text"
          autoComplete="off"
          value={datosConvenio.pk_codigo_convenio}
          disabled
        />
        <Input
          label="Número de pin"
          type="text"
          autoComplete="off"
          value={datosConvenio.codigo_pin}
          disabled
        />
        <Input
          label="Nombre de convenio pin"
          type="text"
          autoComplete="off"
          value={datosConvenio.nombre_convenio}
          disabled
        />
        {[1, 2, 3, 4, 5]
          .filter((ref) => datosConvenio[`referencia_${ref}`])
          .map((ref) => (
            <Input
              key={ref}
              id={`referencia_${ref}`}
              label={datosConvenio[`referencia_${ref}`]}
              name={`referencia_${ref}`}
              type="text"
              autoComplete="off"
              maxLength="19"
              value={userReferences?.[`referencia_${ref}`] ?? ""}
              onInput={(ev) =>
                setUserReferences((old) => ({
                  ...old,
                  [ev.target.name]: ev.target.value,
                }))
              }
              readOnly={inquiryStatus}
              required
            />
          ))}
        {datosConvenio.fk_tipo_valor === 1 ? (
          <Input
            id="valor"
            name="valor"
            label="Valor a pagar"
            autoComplete="off"
            type="tel"
            minLength={"5"}
            maxLength={"10"}
            onInput={(ev) => setValVentaPines(onChangeMoney(ev))}
            required
          />
        ) : (
          ""
        )}
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} disabled={loadingInquiry}>
            Realizar {!inquiryStatus ? "consulta" : "venta de pin"}
          </Button>
        </ButtonBar>
      </Form>
      <ScreenBlocker show={loadingInquiry} />
      <Modal
        show={inquiryStatus}
        handleClose={loadingSell ? () => {} : handleClose}
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <TicketColpatria refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="submit"
                onClick={onMakePayment}
                disabled={loadingSell}
              >
                Aceptar
              </Button>
              <Button onClick={handleClose} disabled={loadingSell}>
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
      </Modal>
    </Fragment>
  );
};

export default VentaPines;
