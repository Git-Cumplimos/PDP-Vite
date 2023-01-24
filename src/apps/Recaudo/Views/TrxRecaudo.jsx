import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useQuery from "../../../hooks/useQuery";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import useDelayedCallback from "../../../hooks/useDelayedCallback";
import { notifyPending, notifyError } from "../../../utils/notify";

import {
  consultarConvenio,
  consultarConvenioBarras,
  consultarRecaudo,
  transaccionConvenio,
} from "./utils";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useReactToPrint } from "react-to-print";
import TicketAuths, { buildTicket } from "../components/TicketAuths";
import { useAuth } from "../../../hooks/AuthHooks";
import { makeMoneyFormatter } from "../../../utils/functions";
import MoneyInput from "../../../components/Base/MoneyInput";
import { useNavigate } from "react-router-dom";
import ButtonLink from "../../../components/Base/ButtonLink";

const formatMoney = makeMoneyFormatter(0);

const TrxRecaudo = () => {
  const [{ id_convenio, codigo }] = useQuery();

  const navigate = useNavigate();

  const { roleInfo, infoTicket } = useAuth();

  const [searchingConvData, setSearchingConvData] = useState(false);

  const [dataConvenio, setDataConvenio] = useState(null);
  const [datosConsulta, setDatosConsulta] = useState(null);
  const [datosTrx, setDatosTrx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userInputData, setUserInputData] = useState({
    referencias: [],
    valorTrx: "0",
    valorTrxOriginal: null,
  });
  const [isCodigoBarras, setIsCodigoBarras] = useState(null);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const isConsulta = useMemo(
    () => !datosConsulta && dataConvenio?.realizar_consulta,
    [datosConsulta, dataConvenio]
  );

  const modificarValor = useMemo(
    () => !isConsulta && dataConvenio?.modificar_valor /* &&
      (dataConvenio?.valor_mayor || dataConvenio?.valor_menor) */,
    [dataConvenio, isConsulta]
  );

  const summary = useMemo(
    () => ({
      "Nombre del convenio": dataConvenio?.nom_convenio,
      ...Object.fromEntries(
        userInputData?.referencias?.map((val, ind) => [
          dataConvenio?.referencias?.[ind]?.nom_ref,
          val,
        ])
      ),
      ...Object.fromEntries(
        [["Valor total", formatMoney.format(userInputData?.valorTrx)]].filter(
          () => !isConsulta
        )
      ),
    }),
    [userInputData, dataConvenio, isConsulta]
  );

  const searchConvenios = useDelayedCallback(
    useCallback(() => {
      if (id_convenio || codigo) {
        setSearchingConvData(true);
        const bodyData = {
          comercio: {
            id_comercio: roleInfo?.id_comercio,
            id_usuario: roleInfo?.id_usuario,
            id_terminal: roleInfo?.id_dispositivo,
            nombre_comercio: roleInfo?.["nombre comercio"],
          },
          ubicacion: {
            address: roleInfo?.direccion,
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.ciudad.substring(0, 7),
          },
          info_transaccion: {},
        };
        let peticionConsultaConvenio;
        if (id_convenio) {
          bodyData.info_transaccion.convenio = id_convenio;
          bodyData.info_transaccion.valor_transaccion = 20000;
          peticionConsultaConvenio = consultarConvenio(bodyData);
          setIsCodigoBarras(false);
        } else if (codigo) {
          bodyData.info_transaccion.codigo_barras = codigo;
          peticionConsultaConvenio = consultarConvenioBarras(bodyData);
          setIsCodigoBarras(true);
        }
        peticionConsultaConvenio
          .then((res) => {
            if (res?.status) {
              setDataConvenio(res?.obj);
              setUserInputData((old) => {
                if (id_convenio) {
                  return {
                    ...old,
                    referencias: new Array(res?.obj?.referencias?.length).fill(
                      ""
                    ),
                  };
                }
                if (codigo) {
                  return {
                    ...old,
                    referencias:
                      res?.obj?.datos_adicionales?.data_codigo_barras
                        ?.codigosReferencia ??
                      new Array(res?.obj?.referencias?.length).fill(""),
                    valorTrx:
                      res?.obj?.datos_adicionales?.data_codigo_barras?.pago,
                    valorTrxOriginal:
                      res?.obj?.datos_adicionales?.data_codigo_barras?.pago,
                  };
                }
                return { ...old };
              });
            } else {
              console.error(res?.msg);
            }
          })
          .catch(() => {})
          .finally(() => setSearchingConvData(false));
      }
    }, [id_convenio, codigo, roleInfo]),
    300
  );

  useEffect(() => {
    searchConvenios();
  }, [searchConvenios]);

  const openModal = useCallback((ev) => {
    ev.preventDefault();
    setShowModal(true);
  }, []);

  const handleClose = useCallback((ev) => {
    setShowModal(false);
    if (isCodigoBarras) {
      navigate("/recaudo/codigo");
      return;
    }
    setUserInputData((old) => ({
      ...old,
      referencias: old.referencias.fill(""),
      valorTrx: "0",
    }))
  }, [isCodigoBarras, navigate]);

  const submitTrx = useCallback(
    (ev) => {
      ev.preventDefault();
      const objCopy = {
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          nombre_comercio: roleInfo?.["nombre comercio"],
        },
        ubicacion: {
          address: roleInfo?.direccion,
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.ciudad.substring(0, 7),
        },
        info_transaccion: {
          autorizador: dataConvenio?.id_autorizador,
          ...Object.fromEntries(
            userInputData?.referencias?.map((val, ind) => [
              `valReferencia${ind + 1}`,
              val,
            ])
          ),
          valor_transaccion: userInputData?.valorTrx,
        },
      };
      if (isConsulta) {
        objCopy.info_transaccion.convenio = dataConvenio?.cod_convenio;
      }
      if (!isConsulta) {
        objCopy.info_transaccion.nom_convenio = dataConvenio?.nom_convenio;
        objCopy.info_transaccion.cod_convenio = dataConvenio?.cod_convenio;
        objCopy.info_transaccion.datos_adicionales = structuredClone(
          dataConvenio?.datos_adicionales
        );
      }
      notifyPending(
        isConsulta ? consultarRecaudo(objCopy) : transaccionConvenio(objCopy),
        {
          render: () => {
            setLoading(true);
            return `${isConsulta ? "Creando" : "Actualizando"} convenio`;
          },
        },
        {
          render: ({ data: res }) => {
            setLoading(false);
            isConsulta && handleClose();
            if (isConsulta) {
              setDatosConsulta(res?.obj);
              setUserInputData((old) => ({
                ...old,
                valorTrx: res?.obj?.valor_transaccion ?? "",
              }));
            } else {
              setDatosTrx(res?.obj);
              const trx_id = res?.obj?.id_transaccion;
              const id_type_trx = dataConvenio?.id_tipo_transaccion;
              const ticket = buildTicket(
                dataConvenio?.id_autorizador,
                {
                  ...structuredClone(res?.obj),
                  valor: userInputData?.valorTrx,
                },
                roleInfo,
                {
                  nombre: dataConvenio?.nom_convenio,
                  codigo: dataConvenio?.cod_convenio,
                },
                userInputData?.referencias?.map((val, ind) => [
                  dataConvenio?.referencias?.[ind]?.nom_ref,
                  val,
                ])
              );
              infoTicket(trx_id, id_type_trx, ticket)
                .then((resTicket) => {
                  console.log(resTicket);
                })
                .catch((err) => {
                  console.error(err);
                  notifyError("Error guardando el ticket");
                });
            }
            return res?.msg;
          },
        },
        {
          render: ({ data: err }) => {
            setLoading(false);
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return `${isConsulta ? "Creacion" : "Actualizacion"} fallida`;
          },
        }
      );
    },
    [isConsulta, handleClose, dataConvenio, userInputData, roleInfo, infoTicket]
  );

  if (searchingConvData || !(searchingConvData || dataConvenio)) {
    return (
      <Fragment>
        <h1 className="text-3xl mt-6">Recaudo en Efectivo</h1>
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
      <h1 className="text-3xl mt-6 mb-10">Recaudo en Efectivo</h1>
      {"nom_convenio" in dataConvenio ? (
        <h1 className="text-2xl mt-6">
          Convenio: {dataConvenio?.nom_convenio}
        </h1>
      ) : (
        ""
      )}
      <Form
        onSubmit={openModal}
        grid={dataConvenio?.referencias?.length > 1 || !isConsulta}
      >
        {dataConvenio?.referencias?.map(
          ({ nom_ref, longitud_min_ref, longitud_max_ref }, index) => (
            <Input
              id={`valReferencia${index + 1}`}
              label={nom_ref}
              name={`valReferencia${index + 1}`}
              key={index}
              type="text"
              autoComplete="off"
              minLength={longitud_min_ref}
              maxLength={longitud_max_ref}
              value={userInputData?.referencias?.[index]}
              onChange={(ev) =>
                setUserInputData((old) => {
                  const copy = structuredClone(old);
                  copy.referencias[index] = ev.target.value;
                  return copy;
                })
              }
              required
            />
          )
        )}
        {!isConsulta && (
          <Fragment>
            {userInputData?.valorTrxOriginal && modificarValor && (
              <MoneyInput
                id="valor_original"
                name="valor_original"
                label="Valor a pagar original"
                value={userInputData?.valorTrxOriginal}
                readOnly
                disabled
              />
            )}
            <MoneyInput
              id="valor"
              name="valor"
              label="Valor a pagar"
              autoComplete="off"
              minLength={"5"}
              maxLength={"15"}
              value={userInputData?.valorTrx}
              onInput={(_, val) =>
                setUserInputData((old) => ({
                  ...old,
                  valorTrx: val,
                }))
              }
              readOnly={!modificarValor}
              required
            />
          </Fragment>
        )}
        <ButtonBar
          className={
            dataConvenio?.referencias?.length > 1 || !isConsulta
              ? "lg:col-span-2"
              : ""
          }
        >
          {isCodigoBarras && (
            <ButtonLink type="button" to="/recaudo/codigo">
              Volver a ingresar código de barras
            </ButtonLink>
          )}
          <Button type="submit">
            {isConsulta ? "Realizar consulta" : "Realizar pago"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        {datosTrx ? (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <TicketAuths
              id_autorizador={dataConvenio?.id_autorizador}
              printDiv={printDiv}
              paymentInfo={{
                ...structuredClone(datosTrx),
                valor: userInputData?.valorTrx,
              }}
              infoConvenio={{
                nombre: dataConvenio?.nom_convenio,
                codigo: dataConvenio?.cod_convenio,
              }}
              referencias={userInputData?.referencias?.map((val, ind) => [
                dataConvenio?.referencias?.[ind]?.nom_ref,
                val,
              ])}
            />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={() => navigate("/recaudo")}>Cerrar</Button>
            </ButtonBar>
          </div>
        ) : (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button type="submit" onClick={submitTrx} disabled={loading}>
                {isConsulta ? "Realizar consulta" : "Realizar pago"}
              </Button>
              <Button onClick={handleClose} disabled={loading}>
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
