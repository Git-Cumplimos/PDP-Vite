import { useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending, notify } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosCreditosPDP } from "../../utils/enumParametrosCreditosPdp";
import { useReactToPrint } from "react-to-print";
import Select from "../../../../components/Base/Select/Select";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCreditoFacil";
import {
  useFetchTuLlave,
  postDescargarSimulacion,
  postTerminosCondiciones,
} from "../../hooks/fetchTuLlave";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

const URL_REALIZAR_CONSULTA_DECISOR = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/consulta-preaprobado-decisor`;
const URL_REALIZAR_SIMULACION_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/simulacion-credito-siian`;
const URL_CONSULTAR_ESTADO_SIMULACION = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/check-estado-credito-facil`;

const RealizarCreditoFacil = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [table, setTable] = useState("");
  const [isChecked, setChecked] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [dataCredito, setDataCredito] = useState({
    valorPreaprobado: 0,
    valorSimulacion: 0,
    validacionValor: false,
    consultDecisor: {},
    consultSiian: {},
    estadoPeticion: 0,
    formPeticion: 0,
    showModal: false,
  });

  const handleClose = useCallback(() => {
    setDataCredito((old) => ({
      ...old,
      showModal: false,
    }));
  }, []);

  const handleCloseDecisor = useCallback(() => {
    setDataCredito({
      valorPreaprobado: 0,
      valorSimulacion: 0,
      validacionValor: false,
      consultDecisor: {},
      consultSiian: {},
      estadoPeticion: 0,
      formPeticion: 0,
      showModal: false,
      plazo: 0,
    });
    navigate(-1);
    notifyError("Transacción cancelada por el usuario");
  }, []);

  const handleCloseSimulacion = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleCloseCancelarSimulacion = useCallback(() => {
    setDataCredito({
      valorPreaprobado: 0,
      valorSimulacion: 0,
      validacionValor: false,
      consultDecisor: {},
      consultSiian: {},
      estadoPeticion: 0,
      formPeticion: 0,
      showModal: false,
      plazo: 0,
    });
    consultaDecisor();
  }, []);

  const consultaDecisor = useCallback(
    (ev) => {
      // ev.preventDefault();
      const data = {
        id_comercio: 10106, //roleInfo?.id_comercio,
      };
      notifyPending(
        peticionConsultaPreaprobado({}, data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            const val = res?.obj?.Respuesta1;
            const cadena = val.split(";");
            const valorFinal = parseInt(cadena[2]);
            setDataCredito((old) => ({
              ...old,
              valorPreaprobado: valorFinal,
              consultDecisor: res?.obj,
            }));
            if (
              valorFinal < enumParametrosCreditosPDP.MINCREDITOPREAPROBADO ||
              valorFinal >= enumParametrosCreditosPDP.MAXCREDITOPREAPROBADO
            ) {
              notifyError("El comercio no dispone de un Crédito Preaprobado");
            } else {
              setDataCredito((old) => ({
                ...old,
                validacionValor: true,
                estadoPeticion: 1,
              }));
            }
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    },
    [navigate, roleInfo]
  );
  const [loadingPeticionConsultaPreaprobado, peticionConsultaPreaprobado] =
    useFetch(
      fetchCustom(
        URL_REALIZAR_CONSULTA_DECISOR,
        "POST",
        "Consultar crédito preaprobado"
      )
    );

  const simulacionCredito = useCallback(
    (ev) => {
      ev.preventDefault();
      let plazo_cuotas = 0;
      const valorCredito = dataCredito?.valorSimulacion;
      if (valorCredito >= enumParametrosCreditosPDP.MONTOMINIMOCAMBIOPLAZO) {
        setDataCredito((old) => ({
          ...old,
          plazo: 90,
        }));
        plazo_cuotas = 90;
      } else {
        setDataCredito((old) => ({
          ...old,
          plazo: 30,
        }));
        plazo_cuotas = 30;
      }
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataCredito?.valorSimulacion,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        Datos: {
          fechaPago: dataCredito?.consultDecisor?.fecha_preaprobado,
          plazo: plazo_cuotas,
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionSimulacionCredito(data, dataAditional),
        {
          render: () => {
            return "Procesando Simulación Crédito";
          },
        },
        {
          render: ({ data: res }) => {
            setDataCredito((old) => ({
              ...old,
              consultSiian: res?.obj,
              formPeticion: 1,
            }));
            const formattedData = res?.obj?.listaCuotas.map((row) => ({
              Cuota: row.cuota,
              FechaPago: new Date(row.fechaPago).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              ValorCuota: formatMoney.format(row?.valorCuota),
              AbonoCapital: formatMoney.format(row?.abonoCapital),
              AbonoInteres: formatMoney.format(row?.abonoIntereses),
              SaldoCapital: formatMoney.format(row?.saldoCapital),
            }));
            setTable(formattedData);
            return "Simulación Crédito satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Simulación Crédito fallida";
          },
        }
      );
    },
    [navigate, roleInfo, pdpUser, dataCredito]
  );
  const [loadingPeticionSimulacionCredito, peticionSimulacionCredito] =
    useFetchTuLlave(
      URL_REALIZAR_SIMULACION_CREDITO,
      URL_CONSULTAR_ESTADO_SIMULACION,
      "Realizar simulación crédito"
    );

  const fecthDescargarSimulacion = () => {
    let obj = {
      response: dataCredito?.consultSiian,
      nombre_comercio: roleInfo?.nombre_comercio,
    };
    postDescargarSimulacion(obj)
      .then(async (res) => {
        if (res?.status) {
          notify(res?.msg);
          window.open(res?.obj?.url);
        }
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        console.error(err);
      });
  };

  const openModal = async () => {
    if (isChecked) {
      setChecked(!isChecked);
    } else {
      postTerminosCondiciones().then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          console.log(res);
          setUrl(res?.obj?.url);
          setModalOpen(true);
        }
      });
    }
  };

  const handleAccept = () => {
    setModalOpen(false);
    setChecked(true);
  };

  useEffect(() => {
    consultaDecisor();
  }, []);

  
  // Calcular número páginas
  const calcularNumeroDePaginas = (
    totalRegistros,
    registrosPorPagina
  ) => {
    return Math.ceil(totalRegistros / registrosPorPagina);
  };

  const registrosPorPaginaPredeterminados = 10;

  //limit y maxPage
  const limit = registrosPorPaginaPredeterminados;
  const maxPage = calcularNumeroDePaginas(table.length, limit);

  return (
    <>
      {dataCredito?.formPeticion === 0 ? (
        <>
          <h1 className="text-3xl">Crédito Fácil</h1>
          <Form
            onSubmit={() => {
              setDataCredito((old) => ({
                ...old,
                showModal: true,
              }));
            }}
            grid
          >
            <Fieldset
              legend="Datos del credito pre aprobado"
              className="lg:col-span-2"
            >
              <Input
                id="idComercio"
                name="idComercio"
                label={"Id comercio"}
                type="text"
                autoComplete="off"
                value={roleInfo?.id_comercio}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="nombreComercio"
                name="nombreComercio"
                label={"Nombre comercio"}
                type="text"
                autoComplete="off"
                value={roleInfo?.["nombre comercio"]}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="valorCredito"
                name="valorCredito"
                label={"Valor del crédito"}
                type="text"
                autoComplete="off"
                value={formatMoney.format(dataCredito?.valorPreaprobado)}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="numeroCuotas"
                name="numeroCuotas"
                label={"No. Cuotas"}
                type="text"
                autoComplete="off"
                value={dataCredito?.consultDecisor?.plazo}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="fechaPreAprobado"
                name="fechaPreAprobado"
                label={"Fecha de Preaprobado"}
                type="text"
                autoComplete="off"
                value={dataCredito?.consultDecisor?.fecha_preaprobado}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="estadoCredito"
                name="estadoCredito"
                label={"Estado"}
                type="text"
                autoComplete="off"
                value={"Preaprobado"}
                onChange={() => {}}
                required
                disabled={true}
              />
            </Fieldset>
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={handleCloseDecisor}
                disabled={loadingPeticionConsultaPreaprobado}
              >
                Cancelar
              </Button>
              {dataCredito?.validacionValor && (
                <ButtonBar>
                  <Button
                    type="submit"
                    disabled={loadingPeticionConsultaPreaprobado}
                  >
                    Simular crédito
                  </Button>
                </ButtonBar>
              )}
            </ButtonBar>
          </Form>
          <Modal
            show={dataCredito?.showModal}
            handleClose={handleClose}
            className="flex align-middle"
          >
            <>
              <Form onSubmit={simulacionCredito}>
                {dataCredito?.estadoPeticion === 1 ? (
                  <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                    <h1 className="text-2xl text-center mb-5 font-semibold">
                      Simulación de Crédito
                    </h1>
                    <MoneyInput
                      id="valor"
                      name="valor"
                      label="Valor a simular"
                      type="text"
                      min={enumParametrosCreditosPDP.MINCREDITOPREAPROBADO}
                      max={dataCredito?.valorPreaprobado}
                      autoComplete="off"
                      maxLength={"12"}
                      value={dataCredito?.valorSimulacion}
                      required
                      onInput={(e, val) => {
                        setDataCredito((old) => ({
                          ...old,
                          valorSimulacion: val,
                        }));
                      }}
                      equalError={false}
                      equalErrorMin={false}
                    />
                    <>
                      <ButtonBar>
                        <Button
                          type="submit"
                          disabled={loadingPeticionSimulacionCredito}
                        >
                          Realizar Simulación
                        </Button>
                      </ButtonBar>
                    </>
                  </div>
                ) : (
                  <></>
                )}
              </Form>
            </>
          </Modal>
        </>
      ) : dataCredito?.formPeticion === 1 ? (
        <>
          <div className="flex flex-col justify-center ">
            <h1 className="text-4xl text-center">Simulación de Crédito</h1>
            <br />
            <div className="grid grid-cols-3 gap-4">
              <h2 className="text-xl ml-10">{`Comercio: ${
                dataCredito?.consultSiian?.nombre ?? ""
              }`}</h2>
              <h2 className="text-xl ml-10">{`Monto del Crédito: ${
                formatMoney.format(dataCredito?.consultSiian?.monto) ?? ""
              }`}</h2>
              <h2 className="text-xl ml-10">{`Plazo Crédito en Días: ${
                dataCredito?.plazo ?? ""
              }`}</h2>
            </div>
            <TableEnterprise
              title=""
              headers={[
                "Cuota",
                "Fecha de Pago",
                "Valor Cuota",
                "Abono Capital",
                "Abono Interés",
                "Saldo Capital",
              ]}
              data={table || []}
              maxPage={maxPage}
              limit={limit}
            ></TableEnterprise>
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={handleCloseCancelarSimulacion}
                disabled={loadingPeticionConsultaPreaprobado}
              >
                Regresar
              </Button>
              <Button type="submit" onClick={fecthDescargarSimulacion}>
                Descargar Simulación
              </Button>
              <Button
                type="submit"
                onClick={() => {
                  setDataCredito((old) => ({
                    ...old,
                    formPeticion: 2,
                  }));
                }}
              >
                Desembolsar
              </Button>
            </ButtonBar>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col justify-center ">
            <h1 className="text-4xl text-center">Desembolso de Crédito</h1>
            <br />
            <Fieldset legend=" Datos del crédito " className="lg:col-span-2">
              <Input
                id="creditoPreaprobado"
                name="idComercio"
                label={"Crédito Preaprobado"}
                type="text"
                autoComplete="off"
                value={formatMoney.format(dataCredito?.valorPreaprobado)}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="numCuotas"
                name="numCuotas"
                label={"No. de Cuotas"}
                type="text"
                autoComplete="off"
                value={dataCredito?.consultSiian?.plazo}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="fechaPreaprobado"
                name="fechaPreaprobado"
                label={"Fecha de Preaprobado"}
                type="text"
                autoComplete="off"
                value={new Date(
                  dataCredito?.consultSiian?.fechaDesembolso
                ).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="estadoCredito"
                name="estadoCredito"
                label={"Estado"}
                type="text"
                autoComplete="off"
                value={"Preaprobado"}
                onChange={() => {}}
                required
                disabled={true}
              />
              <Input
                id="valorSolicitud"
                name="valorSolicitud"
                label={"Valor a solicitar"}
                type="text"
                autoComplete="off"
                value={formatMoney.format(dataCredito?.consultSiian?.monto)}
                onChange={() => {}}
                required
                disabled={true}
              />
            </Fieldset>
            <br />
            <div className="text-center">
              <label className="text-2xl">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onClick={openModal}
                  required
                />
                <span className="ml-2">Acepta Términos y Condiciones</span>
              </label>
            </div>
            {isModalOpen ? (
              <Modal
                show={dataCredito?.showModal}
                handleClose={handleCloseSimulacion}
                className="flex align-middle"
              >
                <iframe
                  title="PDF Viewer"
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    url
                  )}&embedded=true`}
                  style={{
                    width: "100%",
                    height: "530px",
                    border: 0,
                  }}
                ></iframe>
                <ButtonBar>
                  <Button type="submit" onClick={handleAccept}>
                    Aceptar
                  </Button>
                </ButtonBar>
              </Modal>
            ) : (
              <></>
            )}
            <ButtonBar className="lg:col-span-2">
              <Button
                type="button"
                onClick={handleCloseCancelarSimulacion}
                disabled={loadingPeticionConsultaPreaprobado}
              >
                Cancelar
              </Button>
              {isChecked && (
                <ButtonBar>
                  <Button type="submit" onClick={fecthDescargarSimulacion}>
                    Desembolsar Crédito
                  </Button>
                </ButtonBar>
              )}
            </ButtonBar>
          </div>
        </>
      )}
    </>
  );
};

export default RealizarCreditoFacil;
