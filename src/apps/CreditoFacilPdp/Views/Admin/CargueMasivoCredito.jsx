import { useState, useEffect, useCallback } from "react";
import { notifyError } from "../../../../utils/notify";
import { postConsultaCreditosPendienteDesembolsar } from "../../hooks/fetchCreditoFacil";
import TablaListadoCreditosCEACRC from "../../components/TablaListadoCreditosCEACRC";
import FormCargaMasivaCreditos from "../../components/FormCargaMasivaCreditos";

const CargueMasivoCredito = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [listadoCreditos, setListadoCreditos] = useState([]);
  const [dataCredito, setDataCredito] = useState({});

  useEffect(() => {
    consultaCreditos();
  }, []);

  const consultaCreditos = useCallback(() => {
    postConsultaCreditosPendienteDesembolsar().then((res) => {
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setListadoCreditos(res?.obj?.data);
      }
    });
  }, []);

  return (
    <>
      {!isModalOpen ? (
        <TablaListadoCreditosCEACRC
          listadoCreditos={listadoCreditos}
          dataCredito={dataCredito}
          setDataCredito={setDataCredito}
          setModalOpen={setModalOpen}
          consultaCreditos={consultaCreditos}
        />
      ) : (
        <FormCargaMasivaCreditos
          setModalOpen={setModalOpen}
          consultaCreditos={consultaCreditos}
        />
      )}
    </>
  );
};

export default CargueMasivoCredito;
