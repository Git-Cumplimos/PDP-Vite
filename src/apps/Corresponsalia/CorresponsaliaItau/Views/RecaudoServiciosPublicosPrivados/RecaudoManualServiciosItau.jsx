import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetch } from "../../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchItau";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import Input from "../../../../../components/Base/Input";
import { notifyError, notifyPending } from "../../../../../utils/notify";
import useDelayedCallback from "../../../../../hooks/useDelayedCallback";
import PagoRecaudoServiciosItau from "../../components/PagoRecaudoServiciosItau";

const URL_CONSULTA_CONVENIO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/recaudo-servicios-itau/consulta-convenios`;

const RecaudoManualServiciosItau = () => {
  const validNavigate = useNavigate();
  const { state } = useLocation();
  const [dataConvenio, setDataConvenio] = useState([]);
  const [loadingPeticionConsultaConvenio, peticionConsultaConvenio] = useFetch(
    fetchCustom(URL_CONSULTA_CONVENIO, "POST", "Consulta")
  );

  useEffect(() => {
    if (state?.convenio.length !== 0) {
      setDataConvenio(state?.convenio ?? []);
    } else if (state?.id) {
      consultaConveniosItau();
    } else {
      validNavigate("../");
    }
  }, [state?.id, state?.convenio]);

  const consultaConveniosItau = useCallback((ev) => {
    let obj = {
      codigo_convenio: state?.id,
      sortBy: "codigo_convenio",
      sortDir: "DESC",
    };
    notifyPending(
      peticionConsultaConvenio({}, obj),
      {
        render: () => {
          return "Procesando consulta";
        },
      },
      {
        render: ({ data: res }) => {
          setDataConvenio(res.obj.results ?? []);
          return res?.msg ?? "Consulta satisfactoria";
        },
      },
      {
        render: ({ data: error }) => {
          validNavigate(-1);
          return error?.message ?? "Consulta fallida";
        },
      },
      { toastId: "1" }
    );
  }, []);

  return (
    <>
      <h1 className="text-3xl mt-10">Recaudo Servicios Públicos y Privados</h1>
      {dataConvenio.length === 0 ? (
        <h1 className="text-3xl mt-10">Cargando información convenio...</h1>
      ) : (
        <PagoRecaudoServiciosItau convenio={dataConvenio[0]} />
      )}
    </>
  );
};

export default RecaudoManualServiciosItau;
