import { Fragment, useCallback } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import BarcodeReader from "../../../components/Base/BarcodeReader";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";

const url = process.env.REACT_APP_URL_RECAUDO_GENERICO;

const RecaudoCodigo = () => {
  const navigate = useNavigate();

  const navigateRecaudo = useCallback(
    (codigo_barras) => {
      const data = {
        codigo_barras: codigo_barras,
      };
      fetchData(
        `${url}/backend/recaudo-generico/convenios/consultar-convenios-codigo-barras`,
        "POST",
        {},
        data
      )
        .then((res) => {
          if (res?.status) {
            navigate("../recaudo-generico/trx", {
              state: {
                id_pdp_convenio: res?.obj?.result?.id_pdp_convenio,
                name_pdp_convenio: res?.obj?.result?.name_pdp_convenio,
                referencia: res?.obj?.result?.codigos_referencia[0],
                datos_adicionales: res?.obj?.result,
              },
            });
          } else {
            console.error(res?.msg);
            notifyError(`${res?.msg}`, 5000, {
              toastId: "notify-error",
            });
            navigate("../recaudo-generico");
          }
        })
        .catch(() => {});
    },
    [navigate]
  );

  return (
    <Fragment>
      <Form grid={false} formDir="col">
        <BarcodeReader onSearchCodigo={navigateRecaudo} />
        <ButtonBar className="lg:col-span-2">
          <Button type="reset">Volver a ingresar código de barras</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default RecaudoCodigo;
