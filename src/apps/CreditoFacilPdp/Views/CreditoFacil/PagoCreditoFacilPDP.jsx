import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending, notify } from "../../../../utils/notify";
import TablaCreditos from "../../components/TablaCreditos";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCreditoFacil";
import Form from "../../../../components/Base/Form";
import Fieldset from "../../../../components/Base/Fieldset";
import Input from "../../../../components/Base/Input";
import FormPagoCreditoPdp from "../../components/FormPagoCreditoPdp";

const URL_CONSULTA_CREDITO = `http://127.0.0.1:5000/pago-credito-facil/consulta-credito`;
// const URL_CONSULTA_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-credito`;

const DATA_CREDITO_UNIQUE_SIIAN_INI = {
  Agrupacion: "",
  Calificacion: "",
  Calificacionactual: "",
  Codigoasesor: "",
  Codigore: "",
  Cuotasmora: 0,
  Cuotaspagadas: 0,
  Diasmoraacumulado: 0,
  Diasmorapromedio: 0,
  Estado: "",
  Fechadesembolso: "",
  Fechadeultimopago: "",
  Fechavencimientoproximo: "",
  Formapago: "",
  Frecuenciapagocapital: "",
  Frecuenciapagointeres: "",
  Id: 0,
  Idsucursal: 0,
  Idtercero: 0,
  Nombreasesor: "",
  Nombrere: "",
  Numeroprestamo: "",
  Saldo: 0,
  Sucursal: "",
  Tasaprestamo: 0,
  Terceroprestamo: "",
  Tipocredito: "",
  Valorcuotaactual: 0,
  Valordecuota: 0,
  Valordesembolso: 0,
  Valorinteresanticipado: 0,
  Valorpagototal: 0,
  Valorpagototalcausado: 0,
  Valorparaestaraldia: 0,
};

const PagoCreditoFacilPDP = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [dataCreditos, setDataCreditos] = useState([]);
  const [dataCreditoUnique, setDataCreditoUnique] = useState(
    DATA_CREDITO_UNIQUE_SIIAN_INI
  );
  const [estadoProceso, setEstadoProceso] = useState("consulta");
  const [loadingPeticionConsultaCredito, peticionConsultaCredito] = useFetch(
    fetchCustom(URL_CONSULTA_CREDITO, "POST", "Consultar credito")
  );
  const closeModule = useCallback(() => {
    setDataCreditoUnique(DATA_CREDITO_UNIQUE_SIIAN_INI);
    setDataCreditos([]);
    notifyError("Pago cancelado por el usuario");
    navigate(-1);
  }, [navigate]);
  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
      fetchComercio();
    }
  }, []);
  const fetchComercio = useCallback(() => {
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
  }, [roleInfo, navigate]);
  const consultaCredito = useCallback(() => {
    const data = {
      // id_comercio: roleInfo?.id_comercio,
      id_comercio: 10166,
    };
    notifyPending(
      peticionConsultaCredito({}, data),
      {
        render: () => {
          return "Procesando consulta";
        },
      },
      {
        render: ({ data: res }) => {
          const dataTemp = res.obj.data;
          if (dataTemp.length === 1) {
            setDataCreditoUnique(dataTemp[0]);
          }
          setDataCreditos(res.obj.data ?? []);
          setEstadoProceso("inicio");
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
  }, [navigate, roleInfo.id_comercio]);
  useEffect(() => {
    consultaCredito();
    return () => {};
  }, []);

  return (
    <>
      <h1 className="text-3xl">Pago de Crédito</h1>
      {estadoProceso === "consulta" ? (
        <h1 className="text-3xl">Consulta de creditos activos...</h1>
      ) : estadoProceso === "inicio" ? (
        <>
          {dataCreditoUnique.Id === 0 ? (
            <TablaCreditos
              dataCreditos={dataCreditos}
              setDataCreditoUnique={setDataCreditoUnique}
            />
          ) : (
            <FormPagoCreditoPdp
              dataCreditoUnique={dataCreditoUnique}
              closeModule={closeModule}
            />
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default PagoCreditoFacilPDP;
