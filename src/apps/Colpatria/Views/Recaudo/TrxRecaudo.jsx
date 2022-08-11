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
import Tickets from "../../../../components/Base/Tickets";
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
  // onChangeNumber,
} from "../../../../utils/functions";
import fetchData from "../../../../utils/fetchData";

const formatMoney = makeMoneyFormatter(2);

const TrxRecaudo = () => {
  const navigate = useNavigate();

  const { id_convenio_pin } = useParams();

  const { roleInfo, infoTicket } = useAuth();

  const [searchingConvData, setSearchingConvData] = useState(false);
  const [datosConvenio, setDatosConvenio] = useState(null);
  const [userReferences, setUserReferences] = useState({});
  const [userAddress /* , setUserAddress */] = useState(
    roleInfo?.direccion ?? ""
  );
  const [valTrxRecaudo, setValTrxRecaudo] = useState(0);

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const [showModal, setShowModal] = useState(false);
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
          `Referencia ${index + 1}`,
          val,
        ])
      ),
      "Valor de deposito": formatMoney.format(valTrxRecaudo),
      // "Valor de la comision": formatMoney.format(valorComision),
      // "Valor total": formatMoney.format(valor + valorComision),
    }),
    [userReferences, valTrxRecaudo]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onMakeInquiry = useCallback(
    (ev) => {
      ev.preventDefault();

      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia: roleInfo?.tipo_comercio === "OFICINA PROPIA",
        valor_total_trx: valTrxRecaudo,

        // Datos trx colpatria
        colpatria: {
          ...userReferences,
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 8),
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
            setInquiryStatus(res);
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingInquiry(false);
            if (error?.cause === "custom") {
              return error?.message;
            }
            console.error(error?.message);
            return "Consulta fallida";
          },
        }
      );
    },
    [userReferences, userAddress, valTrxRecaudo, roleInfo]
  );

  const onMakePayment = useCallback(
    (ev) => {
      const data = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        oficina_propia: roleInfo?.tipo_comercio === "OFICINA PROPIA",
        valor_total_trx: valTrxRecaudo,

        // Datos trx colpatria
        colpatria: {
          location: {
            address: userAddress,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 8),
          },
        },
      };

      notifyPending(
        makeSellRecaudo(data),
        {
          render: () => {
            setLoadingSell(true);
            return "Procesando transaccion";
          },
        },
        {
          render: ({ data: res }) => {
            setLoadingSell(false);
            const trx_id = res?.obj?.id_trx ?? 0;
            const id_type_trx = res?.obj?.id_type_trx ?? 0;
            const codigo_autorizacion = res?.obj?.codigo_autorizacion ?? 0;
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
                ["Id Trx", trx_id],
                ["codigo autorizacion", codigo_autorizacion],
                // ["Id Transacción", res?.obj?.IdTransaccion],
              ],
              commerceName: "Colpatria",
              trxInfo: [
                ["Valor de deposito", formatMoney.format(valTrxRecaudo)],
                ["", ""],
              ],
              disclamer: "Para quejas o reclamos comuniquese al *num PDP*",
            };
            setPaymentStatus(tempTicket);
            infoTicket(trx_id, id_type_trx, tempTicket)
              .then((resTicket) => {
                console.log(resTicket);
              })
              .catch((err) => {
                console.error(err);
                notifyError("Error guardando el ticket");
              });
            return "Transaccion satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            setLoadingSell(false);
            if (error?.cause === "custom") {
              return error?.message;
            }
            console.error(error?.message);
            return "Transaccion fallida";
          },
        }
      );
    },
    [userAddress, valTrxRecaudo, roleInfo, infoTicket]
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
        notifyError("Error consultando parametros de la transaccion");
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
      "El usuario no cuenta con datos de comercio, no se permite la transaccion"
    );
    return <Navigate to={"/"} replace />;
  }

  if (searchingConvData || !(searchingConvData || datosConvenio)) {
    return (
      <Fragment>
        <h1 className="text-3xl mt-6">Recaudo PSP Manual en Efectivo</h1>
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
      <h1 className="text-3xl mt-6">Recaudo PSP Manual en Efectivo</h1>
      <Form
        onSubmit={
          inquiryStatus
            ? (ev) => {
                ev.preventDefault();
                setShowModal(true);
              }
            : onMakeInquiry
        }
        grid
      >
        <Input
          label="Numero de convenio"
          type="text"
          autoComplete="off"
          value={datosConvenio.pk_codigo_convenio}
          disabled
        />
        <Input
          label="Codigo ean o iac"
          type="text"
          autoComplete="off"
          value={datosConvenio.codigo_ean_iac}
          disabled
        />
        <Input
          label="Nombre de convenio"
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
              value={userReferences?.[`referencia_${ref}`] ?? ""}
              onInput={(ev) =>
                setUserReferences((old) => ({
                  ...old,
                  [ev.target.name]: ev.target.value,
                }))
              }
              required
            />
          ))}
        {datosConvenio.fk_tipo_valor === 1 || inquiryStatus ? (
          <Input
            id="valor"
            name="valor"
            label="Valor a pagar"
            autoComplete="off"
            type="tel"
            minLength={"5"}
            maxLength={"10"}
            onInput={(ev) => setValTrxRecaudo(onChangeMoney(ev))}
            readOnly={inquiryStatus && datosConvenio.fk_tipo_valor !== 3}
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
      <Modal
        show={showModal}
        handleClose={paymentStatus || loadingSell ? () => {} : handleClose}
      >
        {paymentStatus ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <Tickets refPrint={printDiv} ticket={paymentStatus} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={() => navigate("/colpatria")}>Cerrar</Button>
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

export default TrxRecaudo;
