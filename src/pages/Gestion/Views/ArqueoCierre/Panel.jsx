import {
  useState,
  useEffect,
  Fragment,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import { useAuth } from "../../../../hooks/AuthHooks";
import { searchCierre, confirmaCierre } from "../../utils/fetchCaja";
import { notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset";
import Input from "../../../../components/Base/Input";
import {
  makeMoneyFormatter,
  onChangeNumber,
} from "../../../../utils/functions";
import ButtonBar from "../../../../components/Base/ButtonBar";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useReactToPrint } from "react-to-print";
import TicketCierre from "./TicketCierre";
import ButtonLink from "../../../../components/Base/ButtonLink";

const formatMoney = makeMoneyFormatter(0);

const Panel = () => {
  const { roleInfo, userInfo, signOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState(false);
  const [totalCierres, setTotalCierres] = useState(false);
  const [denominaciones, setDenominaciones] = useState([
    [100000, 0],
    [50000, 0],
    [20000, 0],
    [10000, 0],
    [5000, 0],
    [2000, 0],
    [1000, 0],
    [500, 0],
    [200, 0],
    [100, 0],
    [50, 0],
  ]);
  const [confirmarArqueo, setConfirmarArqueo] = useState(false);
  const [resumenCierre, setResumenCierre] = useState(null);

  const nombreComercio = useMemo(
    () => roleInfo?.["nombre comercio"],
    [roleInfo]
  );

  const totalArqueo = useMemo(
    () => denominaciones.reduce((prev, [key, val]) => prev + key * val, 0),
    [denominaciones]
  );

  useEffect(() => {
    const conditions = [
      roleInfo?.tipo_comercio === "OFICINAS PROPIAS",
      roleInfo?.id_usuario !== undefined,
      roleInfo?.id_comercio !== undefined,
      roleInfo?.id_dispositivo !== undefined,
    ];
    if (conditions.every((val) => val)) {
      notifyPending(
        searchCierre({
          id_usuario: roleInfo?.id_usuario,
          id_comercio: roleInfo?.id_comercio,
          id_terminal: roleInfo?.id_dispositivo,
          nombre_comercio: nombreComercio,
          nombre_usuario: userInfo?.attributes?.name,
          direccion_comercio: roleInfo?.direccion,
        }),
        {
          render: () => {
            setLoading(true);
            return "Consultando cierre de caja";
          },
        },
        {
          render: ({ data: res }) => {
            setLoading(false);
            setTotalCierres(res?.obj);
            return res?.msg;
          },
        },
        {
          render: ({ data: error }) => {
            setLoading(false);
            if (error?.cause === "custom") {
              return error?.message;
            }
            console.error(error?.message);
            return "Busqueda fallida";
          },
        },
        { toastId: "busqueda-cierre-123" }
      );
    }
  }, [nombreComercio, roleInfo, userInfo?.attributes?.name]);

  const closeModalFunction = useCallback(() => {
    setEstado(false);
    setTotalCierres(false);
    setDenominaciones([
      [100000, 0],
      [50000, 0],
      [20000, 0],
      [10000, 0],
      [5000, 0],
      [2000, 0],
      [1000, 0],
      [500, 0],
      [200, 0],
      [100, 0],
      [50, 0],
    ]);
    setConfirmarArqueo(false);
  }, []);

  const cierreCaja = useCallback(() => {
    notifyPending(
      confirmaCierre({
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        id_usuario: roleInfo?.id_usuario,
        nombre_comercio: nombreComercio,
        nombre_usuario: userInfo?.attributes?.name,
        direccion_comercio: roleInfo?.direccion,
        arqueo: Object.fromEntries(denominaciones),
      }),
      {
        render: () => {
          setLoading(true);
          return "Procesando peticion";
        },
      },
      {
        render: ({ data: res }) => {
          setLoading(false);
          const cierre = res?.obj;
          const tempTicket = {
            title: "Cierre de caja y arqueo",
            timeInfo: {
              "Fecha de cierre": Intl.DateTimeFormat("es-CO", {
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
              ["Id Comercio", cierre?.id_comercio],
              ["No. terminal", cierre?.id_terminal],
              ["Id usuario", cierre?.id_usuario],
              ["", ""],
              ["Nombre comercio", nombreComercio],
              ["", ""],
            ],
            cajaInfo: [
              [
                "Total movimientos del día",
                formatMoney.format(cierre?.total_movimientos),
              ],
              ["", ""],
              [
                "Total efectivo cierre día anterior",
                formatMoney.format(cierre?.total_efectivo_cierre_día_anterior),
              ],
              ["", ""],
              [
                "Total efectivo en caja",
                formatMoney.format(cierre?.total_efectivo_en_caja),
              ],
              ["", ""],
            ],
            trxInfo: [
              ["Total sobrante", formatMoney.format(cierre?.total_sobrante)],
              ["", ""],
              ["Total faltante", formatMoney.format(cierre?.total_faltante)],
              ["", ""],
              [
                "Total estimación faltantes",
                formatMoney.format(cierre?.total_estimacion_faltante),
              ],
              ["", ""],
              [
                "Total movimientos pendiente aprobación",
                formatMoney.format(cierre?.total_comprobantes_pendientes),
              ],
              ["", ""],
              ["Total arqueo", formatMoney.format(cierre?.total_arqueo)],
              ["", ""],
              [
                "Total entrega transportadora",
                formatMoney.format(cierre?.total_entregado_transportadora),
              ],
              ["", ""],
              [
                "Total recibido transportadora",
                formatMoney.format(cierre?.total_recibido_transportadora),
              ],
              ["", ""],
              [
                "Total consignaciones bancarias",
                formatMoney.format(cierre?.total_consignaciones),
              ],
              ["", ""],
              [
                "Total transferencia entre cajeros",
                formatMoney.format(cierre?.total_transferencias),
              ],
              ["", ""],
              [
                "Total notas débito o crédito",
                formatMoney.format(cierre?.total_notas),
              ],
              ["", ""],
            ],
          };
          setResumenCierre(tempTicket);
          return res?.msg;
        },
      },
      {
        render: ({ data: error }) => {
          setLoading(false);
          if (error?.cause === "custom") {
            return error?.message;
          }
          console.error(error?.message);
          return "Busqueda fallida";
        },
      },
      { toastId: "busqueda-cierre-123" }
    );
  }, [denominaciones, nombreComercio, roleInfo, userInfo?.attributes?.name]);

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    roleInfo?.tipo_comercio === "OFICINAS PROPIAS" && (
      <Fragment>
        {totalCierres === 2 ? (
          <h1 className="text-3xl mt-6">
            Señor usuario la caja ya fue cerrada el día de hoy
          </h1>
        ) : totalCierres === 3 || totalCierres === 1 || true ? (
          <ButtonBar>
            <Button
              type="submit"
              onClick={() => setEstado(true)}
              disabled={loading}
            >
              Arqueo y cierre de caja
            </Button>
            <ButtonLink to={"/gestion/arqueo/arqueo-cierre/reporte"}>
              Ver reporte de transacciones
            </ButtonLink>
          </ButtonBar>
        ) : (
          <h1 className="text-3xl mt-6">Cargando...</h1>
        )}
        <Modal
          show={estado}
          handleClose={loading || resumenCierre ? () => {} : closeModalFunction}
        >
          {!resumenCierre ? (
            !confirmarArqueo ? (
              <Fragment>
                <Fieldset className="col-span-2" legend={"Arqueo de caja"}>
                  {denominaciones.map(([key, val]) => (
                    <Input
                      key={key}
                      name={key}
                      label={formatMoney.format(key)}
                      // value={val}
                      onChange={(ev) =>
                        setDenominaciones((old) => {
                          const copy = new Map(old);
                          copy.set(
                            key,
                            isNaN(parseInt(onChangeNumber(ev)))
                              ? 0
                              : parseInt(onChangeNumber(ev))
                          );
                          return Array.from(copy);
                        })
                      }
                      type="tel"
                      maxLength="4"
                      info={formatMoney.format(key * val)}
                    />
                  ))}
                </Fieldset>
                <Fieldset legend={"Saldos"}>
                  <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                    <div>
                      <h1 className="text-2xl font-semibold">
                        Total arqueo:&nbsp;
                        {formatMoney.format(totalArqueo)}
                      </h1>
                    </div>
                  </div>
                  <ButtonBar>
                    <Button
                      type="submit"
                      onClick={() => setConfirmarArqueo(true)}
                    >
                      Confirmar arqueo
                    </Button>
                  </ButtonBar>
                </Fieldset>
              </Fragment>
            ) : (
              <PaymentSummary
                title="¿Está seguro de los datos para el arqueo? Una vez confirmados no podrá modificarlos."
                subtitle={`Total arqueo: ${formatMoney.format(totalArqueo)}`}
              >
                <ButtonBar>
                  <Button
                    type="submit"
                    onClick={() => cierreCaja()}
                    disabled={loading}
                  >
                    Aceptar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setConfirmarArqueo(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </ButtonBar>
              </PaymentSummary>
            )
          ) : (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <TicketCierre refPrint={printDiv} ticket={resumenCierre} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={() => signOut()}>Cerrar sesión</Button>
              </ButtonBar>
            </div>
          )}
        </Modal>
      </Fragment>
    )
  );
};

export default Panel;
