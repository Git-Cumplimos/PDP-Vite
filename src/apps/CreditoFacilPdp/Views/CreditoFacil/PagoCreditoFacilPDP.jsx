import { useCallback, useRef, useState, useEffect, useMemo } from "react";
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
  useFetchCreditoFacil,
  postDescargarSimulacion,
  postTerminosCondiciones,
  postEnviarCodigoOtp,
} from "../../hooks/fetchCreditoFacil";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import TablaCreditos from "../../components/TablaCreditos";

const URL_CONSULTA_CREDITO = `http://127.0.0.0:5000/pago-credito-facil/consulta-credito`;
// const URL_CONSULTA_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/pago-credito-facil/consulta-credito`;

const PagoCreditoFacilPDP = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [dataCreditos, setDataCreditos] = useState([]);
  const [estadoProceso, setEstadoProceso] = useState("consulta");
  const [loadingPeticionConsultaCredito, peticionConsultaCredito] = useFetch(
    fetchCustom(URL_CONSULTA_CREDITO, "POST", "Consultar credito")
  );
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
      id_comercio: 10106,
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
          console.log(res);
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
      {estadoProceso === "consulta" ? (
        <h1 className="text-3xl">Consulta de creditos en proceso...</h1>
      ) : estadoProceso === "inicio" ? (
        <TablaCreditos dataCreditos={dataCreditos} />
      ) : (
        <></>
      )}
    </>
  );
};

export default PagoCreditoFacilPDP;
