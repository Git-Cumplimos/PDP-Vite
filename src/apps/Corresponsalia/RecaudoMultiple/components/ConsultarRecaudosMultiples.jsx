import { useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import LoadingIcon from "../../../../components/Base/LoadingIcon";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { notify, notifyError } from "../../../../utils/notify";
import {
  postConsultaEstadoRecaudoMultiple,
  reporteTransaccionesRecaudoMultiple,
  postConsultaReferencia,
  postDescargarTickets,
} from "../utils/fetchRecaudoMultiple";

const ConsultarRecaudosMultiples = ({ uuid, roleInfo, pdpUser }) => {
  const [estadoTrx, setEstadoTrx] = useState(false);
  const [consultaRecaudo, setConsultaRecaudo] = useState({
    transacciones_contadas: 0,
    total_transacciones: 0,
    finalizo: false,
    exist: false,
  });
  const [intervalId, setIntervalId] = useState(null);
  const [consultaReferencia, setConsultaReferencia] = useState([]);

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    if (uuid && uuid !== "") {
      firstFecthEstadoRecaudoMultiple();
      fetchConsultaReferencia();
      const intervalId = setInterval(() => {
        fecthEstadoRecaudoMultiple();
        fetchConsultaReferencia();
      }, 15000);
      setIntervalId(intervalId);
      return () => clearInterval(intervalId);
    }
  }, [uuid]);
  useEffect(() => {
    if (consultaRecaudo.finalizo) clearInterval(intervalId);
  }, [consultaRecaudo.finalizo]);

  const fecthEstadoRecaudoMultiple = () => {
    let obj = {
      uuid,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname,
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      },
      ubicacion: {
        address: roleInfo?.direccion,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
      },
    };
    postConsultaEstadoRecaudoMultiple(obj)
      .then((res) => {
        if (!res?.status) {
          return notifyError(res?.msg);
        }
        setConsultaRecaudo({
          transacciones_contadas: res.obj?.transacciones_contadas ?? 0,
          total_transacciones: res.obj?.total_transacciones ?? 0,
          finalizo: res.obj?.finalizo ?? false,
          exist: true,
        });
        notify(res?.msg);
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        console.error(err);
      });
  };
  const firstFecthEstadoRecaudoMultiple = () => {
    setEstadoTrx(true);
    let obj = {
      uuid,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname,
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      },
      ubicacion: {
        address: roleInfo?.direccion,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
      },
    };
    postConsultaEstadoRecaudoMultiple(obj)
      .then((res) => {
        if (!res?.status) {
          setEstadoTrx(false);
          return notifyError(res?.msg);
        }
        setConsultaRecaudo({
          transacciones_contadas: res.obj?.transacciones_contadas ?? 0,
          total_transacciones: res.obj?.total_transacciones ?? 0,
          finalizo: res.obj?.finalizo ?? false,
          exist: true,
        });
        setEstadoTrx(false);
        notify(res?.msg);
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setEstadoTrx(false);
        console.error(err);
      });
  };
  
  const fetchConsultaReferencia = () => {
    let obj = {
      uuid
    };
    postConsultaReferencia(obj)
      .then((res) => {
        if (!res?.status) {
          return notifyError(res?.msg);
        }
        setConsultaReferencia(res?.obj?.data ?? []);
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setEstadoTrx(false);
        console.error(err);
      });
  };

  const fecthArchivoEstadoRecaudoMultiple = () => {
    setEstadoTrx(true);
    let obj = {
      uuid,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname,
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      },
      ubicacion: {
        address: roleInfo?.direccion,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
      },
    };
    reporteTransaccionesRecaudoMultiple(obj)
      .then((res) => {
        if (res?.status) {
          notify(res?.msg);
          window.open(res?.obj?.url);
          setEstadoTrx(false);
        } else {
          notifyError(res?.msg);
          setEstadoTrx(false);
        }
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setEstadoTrx(false);
        console.error(err);
      });
  };

  const fecthDescargarTickets = () => {
    setEstadoTrx(true);
    let obj = {
      uuid,
    };
    postDescargarTickets(obj)
      .then((res) => {
        if (res?.status) {
          notify(res?.msg);
          window.open(res?.obj?.data);
          setEstadoTrx(false);
        } else {
          notifyError(res?.msg);
          setEstadoTrx(false);
        }
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setEstadoTrx(false);
        console.error(err);
      });
  };
  
  return (
    <>
      <SimpleLoading show={estadoTrx} />
      <Fieldset legend='Consulta del estado del Recaudo Múltiple'>
        {!consultaRecaudo?.exist ? (
          <h1 className='text-3xl text-center mb-2 mt-5'>
            No existe operación de recaudo con el Id indicado
          </h1>
        ) : (
          <>
            {!consultaRecaudo?.finalizo ? (
              <h1 className='text-3xl text-center mb-2 mt-2'>
                Procesando recaudos <LoadingIcon />
              </h1>
            ) : (
              <h1 className='text-3xl text-center mb-2 mt-2'>
                El proceso ha terminado
              </h1>
            )}
            <h1 className='text-xl text-center mb-10 mt-5'>
              {`Cantidad de transacciones ingresadas: ${consultaRecaudo?.total_transacciones}`}
            </h1>
            <h1 className='text-xl text-center mb-10 mt-5'>
              {`Cantidad de transacciones realizadas: ${consultaRecaudo?.transacciones_contadas}`}
            </h1>
            {!consultaRecaudo?.finalizo && consultaReferencia.length > 0? 
              (
                <Fieldset legend='Transacciones en proceso'>
                  <table style={{ border: '1px solid black' }} >
                  <thead>
                    <tr style={{ border: '1px solid black' }}>
                      <th>Número Referencia</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultaReferencia.map((subArray, index) => (
                      <tr key={index} >
                        {subArray.map((element, subIndex) => (
                          <td key={subIndex}>{subIndex === 1 ? formatMoney.format(element) : element}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </Fieldset>
              ) : 
              (<></>)}
            {consultaRecaudo?.transacciones_contadas > 0 && (
              <ButtonBar>
                <Button onClick={fecthArchivoEstadoRecaudoMultiple}>
                  Descargar extracto de transacciones
                </Button>
              </ButtonBar>
            )}
            {consultaRecaudo?.finalizo && (
              <ButtonBar>
                <Button onClick={fecthDescargarTickets}>
                  Descargar ticket de transacciones
                </Button>
              </ButtonBar>
            )}
          </>
        )}
      </Fieldset>
    </>
  );
};

export default ConsultarRecaudosMultiples;
