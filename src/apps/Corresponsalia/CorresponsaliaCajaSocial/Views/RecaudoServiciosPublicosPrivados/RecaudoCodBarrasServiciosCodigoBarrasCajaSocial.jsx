import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCajaSocial";
import Button from "../../../../../components/Base/Button";
import BarcodeReader from "../../../../../components/Base/BarcodeReader";
import { notifyPending } from "../../../../../utils/notify";
import Form from "../../../../../components/Base/Form";
import PagoRecaudoServiciosCajaSocial from "../../components/PagoRecaudoServiciosCajaSocial";
const URL_CONSULTA_CONVENIO = `${import.meta.env.VITE_URL_CORRESPONSALIA_CAJA_SOCIAL}/recaudo-servicios-caja-social/consulta-codigo-barras`;
const DATA_CONVENIOS_INIT = {
  data_codigo_barras: {
    codigo_ean: "",
    codigos_referencia: [],
    fecha_caducidad: [],
    pago: [],
  },
  data_convenios: [],
};
const RecaudoCodBarrasServiciosCodigoBarrasCajaSocial = () => {
  const validNavigate = useNavigate();
  const [dataConvenio, setDataConvenio] = useState(DATA_CONVENIOS_INIT);
  const [codigoBarrasData, setCodigoBarrasData] = useState("");
  const buttonDelete = useRef(null);
  const [
    loadingPeticionConsultaConvenioCodigoBarras,
    peticionConsultaConvenioCodigoBarras,
  ] = useFetch(fetchCustom(URL_CONSULTA_CONVENIO, "POST", "Consulta titular"));

  const consultaCodigoBarras = useCallback((codigoBarras) => {
    setCodigoBarrasData(codigoBarras);
    const data = {
      codigo_barras: codigoBarras,
    };
    notifyPending(
      peticionConsultaConvenioCodigoBarras({}, data),
      {
        render: () => {
          return "Procesando consulta";
        },
      },
      {
        render: ({ data: res }) => {
          setDataConvenio(res.obj ?? []);
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
      {dataConvenio.data_convenios.length === 0 ? (
        <Form
          onSubmit={() => {}}
          className=" flex flex-col content-center items-center"
          grid={false}
        >
          <>
            <BarcodeReader
              onSearchCodigo={consultaCodigoBarras}
              disabled={loadingPeticionConsultaConvenioCodigoBarras}
            />
            <div ref={buttonDelete}>
              <Button
                type="reset"
                disabled={loadingPeticionConsultaConvenioCodigoBarras}
              >
                Volver a ingresar el código de barras
              </Button>
            </div>
          </>
        </Form>
      ) : (
        <PagoRecaudoServiciosCajaSocial
          convenio={dataConvenio.data_convenios[0]}
          dataCodigoBarras={dataConvenio.data_codigo_barras}
          codigoBarras={codigoBarrasData}
          tipoRecaudo="codigoBarras"
        />
      )}
    </>
  );
};

export default RecaudoCodBarrasServiciosCodigoBarrasCajaSocial;
