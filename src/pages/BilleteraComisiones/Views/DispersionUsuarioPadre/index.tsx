import React, {
  ChangeEvent,
  Fragment,
  ReactText,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import Form from "../../../../components/Base/Form";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Select from "../../../../components/Base/Select";
import Button from "../../../../components/Base/Button";
import DispersionButtons from "./Buttons";
import Modal from "../../../../components/Base/Modal";
import {
  NumberString,
  initialCommercesDispersion,
  reducerComision,
} from "./state/dispersion";
import { useNavigate } from "react-router-dom";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import useInterval from "./hooks/useInterval";
import { toast } from "react-toastify";
import useTimeout from "./hooks/useTimeout";
import { notifyError } from "../../../../utils/notify";

type Props = {};

const toastIdLoading = "progress-trx-123";
const limite_maximo_dispersion = 10_000_000;

// const urlComisiones = process.env.REACT_APP_URL_COMISIONES;
const urlComisiones = "http://localhost:5000";
const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;

const DispersionUsuarioPadre = (props: Props) => {
  const { pdpUser } = useAuth();
  const navigate = useNavigate();

  const [comercios, setComercios] = useState<any[]>([]);
  const [comerciosDispersion, dispatch] = useReducer(
    reducerComision,
    initialCommercesDispersion
  );

  const [showModal, setShowModal] = useState(false);
  const [trxState, setTrxState] = useState<boolean | undefined>();

  const [getDispersionData, setGetDispersionData] = useState<{
    url: string;
    method: string;
  } | null>(null);
  const [intervalDelay, setIntervalDelay] = useState<number | undefined>();
  const [timeoutDelay, setTimeoutDelay] = useState<number | undefined>();

  const handleCloseModal = useCallback(() => setShowModal(false), []);
  const handleEndConsulta = useCallback((endLoading?: boolean) => {
    toast.done(toastIdLoading);
    setIntervalDelay(undefined);
    setTimeoutDelay(undefined);
  }, []);

  const tsPdpUser = useMemo(
    () => pdpUser ?? { uuid: 0, saldo: "0", uname: "" },
    [pdpUser]
  );
  const uuid = useMemo(() => tsPdpUser?.uuid ?? 0, [tsPdpUser]);
  const saldoWalletUser = useMemo(
    () => parseFloat(tsPdpUser?.saldo) ?? 0,
    [tsPdpUser]
  );

  useFetchDebounce(
    {
      url: useMemo(
        () => `${urlComercios}/comercios/usuario-padre?fk_id_user=${uuid}`,
        [uuid]
      ),
    },
    {
      onSuccess: useCallback(
        (res) => setComercios(res?.obj?.results ?? []),
        []
      ),
      onError: useCallback((error) => console.error(error), []),
    },
    undefined,
    !(uuid == null)
  );

  const allCommerces = useMemo(
    () =>
      comercios.map(({ pk_comercio, nombre_comercio }) => ({
        value: pk_comercio,
        label: nombre_comercio,
      })),
    [comercios]
  );

  const summary = useMemo(
    () =>
      Object.fromEntries(
        comerciosDispersion.map(({ commerce_name, value }) => [
          commerce_name,
          formatMoney.format(value),
        ])
      ),
    [comerciosDispersion]
  );

  const sumaDispersion = useMemo(
    () =>
      comerciosDispersion
        .map(({ value }) => value)
        .reduce((prev, curr) => prev + curr, 0),
    [comerciosDispersion]
  );

  const existeDispersion = useCallback(
    (value: number) =>
      comerciosDispersion.map(({ pk_commerce }) => pk_commerce).includes(value),
    [comerciosDispersion]
  );

  const filterCommerces = useCallback(
    (pk_commerce: NumberString) =>
      allCommerces.filter(
        ({ value }) =>
          !existeDispersion(value) ||
          (existeDispersion(value) && pk_commerce === value)
      ),
    [allCommerces, existeDispersion]
  );

  const [loadingMakeDispersion, , makeDispersion] = useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlComisiones}/servicio-wallet-comisiones/transferencia-wallet-usuario-padre-cupo`,
        []
      ),
      options: useMemo(() => {
        const data = {
          uuid,
          saldos_comercios: Object.fromEntries(
            comerciosDispersion.map(({ pk_commerce, commerce_name, value }) => [
              pk_commerce,
              {
                nombre_comercio: commerce_name,
                valor: value,
              },
            ])
          ),
        };
        return {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        };
      }, [uuid, comerciosDispersion]),
    },
    {
      onPending: useCallback(() => {
        return "Procesando transaccion";
      }, []),
      onSuccess: useCallback((res) => {
        setTrxState(true);
        setGetDispersionData(res?.obj?.actions?.consulta_estado);
        // toastIdLoading.current = toast("Transferencia en progreso", {
        //   progress: 0.01,
        //   closeOnClick: false,
        // });
        setIntervalDelay(1000 * 5);
        setTimeoutDelay(1000 * 60);
        return res?.msg;
      }, []),
      onError: useCallback((error) => {
        setTrxState(false);
        if (error?.cause === "custom") {
          return <p style={{ whiteSpace: "pre-wrap" }}>{error?.message}</p>;
        }
        console.error(error?.message);
        return "Transaccion fallida";
      }, []),
    },
    { notify: true },
    false
  );

  const [, , consultarDispersion] = useFetchDebounce(
    {
      url: useMemo(
        () => `${urlComisiones}${getDispersionData?.url}`,
        [getDispersionData?.url]
      ),
      options: useMemo(
        () => ({
          method: getDispersionData?.method,
        }),
        [getDispersionData?.method]
      ),
    },
    {
      onSuccess: useCallback(
        (res) => {
          const totalDispersion = res?.obj?.total ?? 1;
          const totalExitosas = res?.obj?.total_finalizadas_ok ?? 0;
          const totalFallidas = res?.obj?.total_finalizadas_error ?? 0;
          const totalProcesando = res?.obj?.total_procesando ?? 0;
          const progreso =
            (totalExitosas + totalFallidas + totalProcesando * 0.25) /
            totalDispersion;

          // toast.info("Transferencia en progreso", {
          //   progress: progreso || 0.01,
          //   closeOnClick: false,
          //   toastId: toastIdLoading
          // });
          toast.update(toastIdLoading, {
            type: toast.TYPE.INFO,
            render: "Transferencia en progreso",
            progress: progreso || 0.01,
          });
          if (progreso >= 1) {
            handleEndConsulta();
          }
        },
        [handleEndConsulta]
      ),
      onError: useCallback((error) => console.error(error?.message), []),
    },
    { delay: 50 },
    false
  );

  useInterval(
    useCallback(() => {
      consultarDispersion();
    }, [consultarDispersion]),
    intervalDelay
  );

  useTimeout(
    useCallback(() => {
      handleEndConsulta(true);
      notifyError("Timeout en consulta");
    }, [handleEndConsulta]),
    timeoutDelay
  );

  console.log(!loadingMakeDispersion || !trxState);
  console.log(!loadingMakeDispersion || !trxState);

  return (
    <Fragment>
      <h1 className="text-3xl mb-10 text-center">
        Movimiento billetera comisiones al cupo PDP
      </h1>
      <Form grid>
        <MoneyInput
          id="comisionActual"
          name="comisionActual"
          label="Saldo comisión Actual"
          autoComplete="off"
          maxLength={15}
          value={saldoWalletUser}
          disabled
        />
        <ButtonBar children={false} />
      </Form>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
          setShowModal(true);
        }}
        grid
      >
        <Fieldset legend={"Dispersion"} className={"lg:col-span-2"}>
          {comerciosDispersion.map(({ pk_commerce, value }, index) => (
            <Fragment key={index}>
              <Select
                label={"Comercio seleccionado"}
                options={[
                  { value: "", label: "" },
                  ...filterCommerces(pk_commerce),
                ]}
                value={pk_commerce}
                onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
                  dispatch({
                    type: "UPDATE_COMMERCE_ID",
                    payload: {
                      index,
                      pk_commerce: parseInt(ev.target.value) ?? "",
                      commerce_name: allCommerces
                        .filter(
                          ({ value }) =>
                            value === parseInt(ev.target.value) ?? ""
                        )
                        .map(({ label }) => label)
                        .join(""),
                    },
                  })
                }
                required
              />
              <MoneyInput
                label="Valor a transferir"
                autoComplete="off"
                maxLength={15}
                value={value}
                max={Math.min(limite_maximo_dispersion, saldoWalletUser)}
                onChange={(_, valor) =>
                  dispatch({
                    type: "UPDATE_COMMERCE_MONEY",
                    payload: { index, value: valor },
                  })
                }
                required
              />
              <ButtonBar className="lg:col-span-2">
                <DispersionButtons
                  type="dash"
                  callback={() =>
                    dispatch({
                      type: "REMOVE_COMMERCE",
                      payload: index,
                    })
                  }
                />
              </ButtonBar>
            </Fragment>
          ))}
          <ButtonBar className="lg:col-span-2">
            {comerciosDispersion.length !== comercios.length && (
              <DispersionButtons
                type="plus"
                callback={() =>
                  dispatch({
                    type: "ADD_COMMERCE",
                    payload: {
                      pk_commerce: "",
                      commerce_name: "",
                    },
                  })
                }
              />
            )}
          </ButtonBar>
        </Fieldset>
        <MoneyInput
          label="Valor total a transferir"
          autoComplete="off"
          maxLength={15}
          value={sumaDispersion}
          max={saldoWalletUser}
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">Aplicar dispersion</Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={
          !trxState && !loadingMakeDispersion ? handleCloseModal : () => {}
        }
      >
        {!trxState && (
          <PaymentSummary summaryTrx={summary}>
            <ButtonBar>
              <Button
                type="submit"
                onClick={() => makeDispersion()}
                disabled={loadingMakeDispersion}
              >
                Aceptar
              </Button>
              <Button
                onClick={handleCloseModal}
                disabled={loadingMakeDispersion}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </PaymentSummary>
        )}
        {!!trxState && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <ButtonBar>
              <Button onClick={() => navigate("/billetera-comisiones")}>
                Revisar transferencia
              </Button>
              <Button onClick={() => navigate("/billetera-comisiones")}>
                Cerrar
              </Button>
            </ButtonBar>
          </div>
        )}
      </Modal>
    </Fragment>
  );
};

export default DispersionUsuarioPadre;
