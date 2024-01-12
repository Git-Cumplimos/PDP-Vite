import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError} from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import FormDecisorRealizarCredito from "../../components/FormDecisorRealizarCredito";
import ModalSimulacionCredito from "../../components/ModalSimulacionCredito";
import TableSimulacionCredito from "../../components/TableSimulacionCredito";
import FormAceptarTerminos from "../../components/FormAceptarTerminos";
import ModalDesembolso from "../../components/ModalDesembolso";

const RealizarCreditoFacil = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();
  const [listadoCuotas, setListadoCuotas] = useState([]);
  const [dataCredito, setDataCredito] = useState({
    valorPreaprobado: 0,
    valorSimulacion: 0,
    validacionValor: false,
    consultDecisor: {
      plazo: "",
      fecha_preaprobado: "",
    },
    consultSiian: {},
    estadoPeticion: 0,
    formPeticion: 0,
    showModal: false,
    showModalOtp: false,
    cosultEnvioOtp: {},
  });

  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
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
    }
  }, [roleInfo, navigate]);

  return (
    <>
      {dataCredito?.formPeticion === 0 ? (
        <>
          <h1 className="text-3xl">Crédito Fácil</h1>
          <FormDecisorRealizarCredito
            dataCredito={dataCredito}
            setDataCredito={setDataCredito}
          />
          <ModalSimulacionCredito
            dataCredito={dataCredito}
            setDataCredito={setDataCredito}
            setListadoCuotas={setListadoCuotas}
          />
        </>
      ) : dataCredito?.formPeticion === 1 ? (
        <>
          <TableSimulacionCredito
            dataCredito={dataCredito}
            setDataCredito={setDataCredito}
            listadoCuotas={listadoCuotas}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col justify-center ">
            <h1 className="text-4xl text-center">Desembolso de Crédito</h1>
            <br />
            <FormAceptarTerminos
              dataCredito={dataCredito}
              setDataCredito={setDataCredito}
            />
            {dataCredito?.showModalOtp && (
              <>
                <ModalDesembolso dataCredito={dataCredito} />
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default RealizarCreditoFacil;
