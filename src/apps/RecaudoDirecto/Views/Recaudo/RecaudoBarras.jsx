import { Fragment, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notifyPending } from "../../../../utils/notify";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Button from "../../../../components/Base/Button";
import BarcodeReader from "../../../../components/Base/BarcodeReader";
import { decoCodigoBarras } from "../../utils/fetchFunctions"

const RecaudoBarras = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [searchingData, setSearchingData] = useState(false);

  const searchCodigo = useCallback(
    (info) => {
      notifyPending(
        decoCodigoBarras(info),
        {
          render: () => {
            setSearchingData(true);
            return "Buscando informacion";
          },
        },
        {
          render: ({ data: res }) => {
            setSearchingData(false);

            const refs = Object.fromEntries(
              Object.entries(res?.obj ?? {}).filter(([key]) =>
                key.includes("referencia")
              )
            );

            const builderSP = new URLSearchParams();
            builderSP.append("refs", JSON.stringify(refs));;

            const pk_id_convenio = res?.obj?.pk_id_convenio;

            navigate(
              `/recaudo-directo/recaudo/${pk_id_convenio}?${builderSP.toString()}`
            );
            return "Consulta exitosa";
          },
        },
        {
          render: ({ data: error }) => {
            setSearchingData(false);
            if (error?.cause === "custom") {
              return error?.message;
            }
            console.error(error?.message);
            return "Consulta fallida";
          },
        }
      );
    },
    []
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta recaudo código de barras</h1>
      <Form
       onSubmit={(ev) => {
        ev.preventDefault();
        const formData = new FormData(ev.target);
        searchCodigo(Object.fromEntries(formData));
      }}
      formDir='col'
      ref={formRef}>
        <BarcodeReader
          onSearchCodigo={(codigo) => searchCodigo({ codigo_barras: codigo })}
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="reset" disabled={searchingData}>
            Volver a ingresar código de barras
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default RecaudoBarras;
