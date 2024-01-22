import { useState, useEffect, useCallback } from "react";
import { notifyError } from "../../../../utils/notify";
import { postConsultaCreditosPendienteDesembolsar } from "../../hooks/fetchCreditoFacil";
import TablaListadoCreditosCEACRC from "../../components/TablaListadoCreditosCEACRC";
import FormCargaMasivaCreditos from "../../components/FormCargaMasivaCreditos";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";

const CargueMasivoCredito = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [listadoCreditos, setListadoCreditos] = useState([]);
  const [dataCredito, setDataCredito] = useState({});
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);

  // useEffect(() => {
  //   consultaCreditos();
  // }, []);

  // const consultaCreditos = useCallback(() => {
  //   const body ={
  //     limit: 10,
  //     page: 1
  //   }
  //   postConsultaCreditosPendienteDesembolsar(body).then((res) => {
  //     if (!res?.status) {
  //       notifyError(res?.msg);
  //     } else {
  //       setListadoCreditos(res?.obj);
  //     }
  //   });
  // }, []);
  

  return (
    <>
      {!isModalOpen ? (
        <TablaListadoCreditosCEACRC
          listadoCreditos={listadoCreditos}
          dataCredito={dataCredito}
          setDataCredito={setDataCredito}
          setModalOpen={setModalOpen}
          // setMaxPages = {setMaxPages}
          // setPageData = {setPageData}
          // maxPages = {maxPages}
        />
      ) : (
        <FormCargaMasivaCreditos
          setModalOpen={setModalOpen}
          // consultaCreditos={consultaCreditos}
        />
      )}
    </>
  );
};

export default CargueMasivoCredito;
