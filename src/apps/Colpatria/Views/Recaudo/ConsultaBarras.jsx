import { Fragment, useCallback, useMemo, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { searchConveniosRecaudoBarras } from "../../utils/fetchFunctions";
import Button from "../../../../components/Base/Button";
import BarcodeReader from "../../../../components/Base/BarcodeReader";

const ConsultaBarras = () => {
  const { roleInfo } = useAuth();
  const navigate = useNavigate();

  const formRef = useRef(null);

  const [searchingData, setSearchingData] = useState(false);

  const searchCodigo = useCallback(
    (info) => {
      notifyPending(
        searchConveniosRecaudoBarras(info),
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
              Object.entries(res?.obj?.barcode ?? {}).filter(([key]) =>
                key.includes("referencia_")
              )
            );

            const builderSP = new URLSearchParams();
            builderSP.append("refs", JSON.stringify(refs));
            builderSP.append("valor", res?.obj?.barcode?.valor ?? "0");

            const pk_codigo_convenio =
              res?.obj?.convenio?.pk_codigo_convenio ?? "";
            navigate(
              `/corresponsalia/colpatria/recaudo/${pk_codigo_convenio}?${builderSP.toString()}`
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
    [navigate]
  );

  /**
   * Check if has commerce data
   */

  const hasData = useMemo(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      return false;
    }
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
      "codigo_dane",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        return false;
      }
    }
    return true;
  }, [roleInfo]);

  if (!hasData) {
    notifyError(
      "El usuario no cuenta con datos de comercio, no se permite la transaccion"
    );
    return <Navigate to={"/"} replace />;
  }

  return (
    <Fragment>
      <h1 className='text-3xl mt-6'>Consulta recaudo código de barras</h1>
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
        <ButtonBar className='lg:col-span-2'>
          <Button type='reset' disabled={searchingData}>
            Volver a ingresar código de barras
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ConsultaBarras;
