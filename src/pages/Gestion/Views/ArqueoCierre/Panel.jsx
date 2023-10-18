import { useState, useEffect, Fragment, useCallback, useMemo, useRef} from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import { useAuth } from "../../../../hooks/AuthHooks";
import { searchCierre, confirmaCierre, buscarPlataformaExt} from "../../utils/fetchCaja";
import { notifyError,notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset";
import Input from "../../../../components/Base/Input";
import { makeMoneyFormatter, onChangeNumber} from "../../../../utils/functions";
import ButtonBar from "../../../../components/Base/ButtonBar";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useReactToPrint } from "react-to-print";
import TicketCierre from "./TicketCierre";
import { useNavigate } from "react-router-dom";
import MoneyInput from "../../../../components/Base/MoneyInput";

const formatMoney = makeMoneyFormatter(0);

const tiposOficinas = ["OFICINAS PROPIAS", "KIOSCO"];
let Num = 0;


const Panel = () => {
  const navigate = useNavigate();
  const { roleInfo, userInfo, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState(true);
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
  const [next, setNext] = useState(0);
  const [dataPlfExt, setDataPlfExt] = useState(null);

  const nombreComercio = useMemo(
    () => roleInfo?.["nombre comercio"],
    [roleInfo]
  );

  const totalArqueo = useMemo(
    () => denominaciones.reduce((prev, [key, val]) => prev + key * val, 0),
    [denominaciones]
  );

  const validTipoComercio = useMemo(
    () => tiposOficinas.includes(roleInfo?.tipo_comercio),
    [roleInfo?.tipo_comercio]
  );

  useEffect(() => {
    const conditions = [
      validTipoComercio,
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
            buscarPlataforma()
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
  }, [nombreComercio, roleInfo, userInfo?.attributes?.name, validTipoComercio]);

  const buscarPlataforma = useCallback(() => {
    buscarPlataformaExt({totaldata: '1'})
      .then((res) => {
        const listValue = [];
        res?.obj?.results.map(function(element){
            const inputValue = element
            inputValue['valor'] = 0
            listValue.push(inputValue)
        })
      setDataPlfExt(listValue);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  },[dataPlfExt]);

  const closeModalFunction = useCallback(() => {
    navigate(-1);
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
    Num = 0
  }, [navigate]);

  const cierreCaja = useCallback((dataPlfExt) => {
    dataPlfExt.map((elemento) => Num=Num+elemento.valor)
    notifyPending(
      confirmaCierre({
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        id_usuario: roleInfo?.id_usuario,
        nombre_comercio: nombreComercio,
        nombre_usuario: userInfo?.attributes?.name,
        direccion_comercio: roleInfo?.direccion,
        arqueo: Object.fromEntries(denominaciones),
        entidades_externas: {'data':dataPlfExt}
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
            title: "Cierre de caja",
            timeInfo: {
              "Fecha de pago": Intl.DateTimeFormat("es-CO", {
                year: "numeric",
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
              ["Id Cierre", cierre?.pk_id_cierre],
              ["Comercio", nombreComercio],
              ["Cajero",cierre?.nombre_usuario],
              ["", ""],
            ],
            cajaInfo: [
              [
                "Movimientos del día",
                formatMoney.format(cierre?.total_movimientos),
              ],
              ["", ""],
              [
                "Efectivo cierre día anterior",
                formatMoney.format(cierre?.total_efectivo_cierre_día_anterior),
              ],
              ["", ""],
              [
                "Efectivo en caja PDP",
                formatMoney.format(cierre?.total_efectivo_en_caja),
              ],
              ["", ""],
              [
                "Efectivo en caja PDP + Externos",
                formatMoney.format(Num+cierre?.total_efectivo_en_caja),
              ],
              ["", ""],
            ],
            trxInfo: [
              ["Sobrante", formatMoney.format(cierre?.total_sobrante)],
              ["", ""],
              ["Faltante", formatMoney.format(cierre?.total_faltante)],
              ["", ""],
              [
                "Estimación faltante",
                formatMoney.format(cierre?.total_estimacion_faltante),
              ],
              ["", ""],
              [
                "Consignaciones bancarias",
                formatMoney.format(cierre?.total_consignaciones),
              ],
              ["", ""],
              [
                "Entregado a transportadora",
                formatMoney.format(cierre?.total_entregado_transportadora),
              ],
              ["", ""],
              [
                "Recibido de transportadora",
                formatMoney.format(cierre?.total_recibido_transportadora),
              ],
              ["", ""],
              [
                "Notas débito o crédito",
                formatMoney.format(cierre?.total_notas),
              ],
              ["", ""],
            ],
          };
          dataPlfExt.map((elemento) => 
            tempTicket.trxInfo.push([
              elemento.pk_nombre_plataforma,
              formatMoney.format(elemento.valor)],["", ""])
          )
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

  const handleChangeCurrenci = (e,valor) => {
    dataPlfExt.map(function (elemento, indice) {
      if(elemento.pk_nombre_plataforma === e.target.name){
        dataPlfExt[indice]['valor']= valor
      }
    })
  };

  return (
    validTipoComercio && (
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
              next === 0 ?(
              <Fragment>
                <Fieldset className="col-span-2" legend={"Arqueo de caja"}>
                  {dataPlfExt?.map((key) => (
                    <MoneyInput
                      key={key.pk_nombre_plataforma}
                      name={key.pk_nombre_plataforma}
                      label={key.pk_nombre_plataforma}
                      onChange={handleChangeCurrenci}
                      placeholder="$0"
                      maxLength={12}
                      autoComplete='off'
                    />
                  ))}
                </Fieldset>
                <ButtonBar>
                  <Button type="submit" onClick={() => setNext(1)} disabled={loading} >
                    Siguiente
                  </Button>
                </ButtonBar>
              </Fragment>
              ):(
              <Fragment>
                <Fieldset className="col-span-2" legend={"Arqueo de caja"}>
                  {denominaciones.map(([key, val]) => (
                    <Input
                      key={key}
                      name={key}
                      label={formatMoney.format(key)}
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
              )
            ) : (
              <PaymentSummary
                title="¿Está seguro de los datos para el arqueo? Una vez confirmados no podrá modificarlos."
                subtitle={`Total arqueo: ${formatMoney.format(totalArqueo)}`}
              >
                <ButtonBar>
                  <Button
                    type="submit"
                    onClick={() => cierreCaja(dataPlfExt)}
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
                <Button
                  onClick={() => {
                    navigate("/");
                    signOut();
                  }}
                >
                  Cerrar sesión
                </Button>
              </ButtonBar>
            </div>
          )}
        </Modal>
      </Fragment>
    )
  );
};

export default Panel;
