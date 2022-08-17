import { Fragment, useCallback, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { searchConveniosRecaudoBarras } from "../../utils/fetchFunctions";
import TextArea from "../../../../components/Base/TextArea";
import Button from "../../../../components/Base/Button";

const ConsultaBarras = () => {
  const { roleInfo } = useAuth();
  const navigate = useNavigate();

  const [searchingData, setSearchingData] = useState(false);

  const searchCodigo = useCallback((ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    notifyPending(
      searchConveniosRecaudoBarras(Object.fromEntries(formData)),
      {
        render: () => {
          setSearchingData(true);
          return "Buscando informacion";
        },
      },
      {
        render: ({ data: res }) => {
          setSearchingData(false);
          console.log(res?.obj);

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
  }, [navigate]);

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
      <h1 className="text-3xl mt-6">Consulta recaudo codigo de barras</h1>
      <Form onSubmit={searchCodigo} grid>
        <TextArea
          label={"Codigo de barras"}
          name="codigo_barras"
          // onLazyInput={{ callback: () => {}, timeOut: 500 }}
          className={"place-self-stretch w-full"}
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={searchingData}>
            Consultar codigo de barras
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ConsultaBarras;
