import { Fragment, useCallback, useMemo, useState, useRef } from "react";
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
  const isAlt = useRef("");

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
      <h1 className="text-3xl mt-6">Consulta recaudo código de barras</h1>
      <Form onSubmit={searchCodigo} formDir="col">
        <TextArea
          label={"Código de barras"}
          name="codigo_barras"
          // onLazyInput={{ callback: () => {}, timeOut: 500 }}
          // onChange={(ev) => {
          //   console.log(ev.target.value.at(-1));
          //   console.log(ev.target.value.charAt(ev.target.value.length-1));
          //   console.log(ev.target.value.charCodeAt(ev.target.value.length-1));
          //   console.log(String.fromCharCode(ev.target.value.charCodeAt(ev.target.value.length-1)));
          //   if (ev.target.value.at(-1) === "\u001d") {
          //     ev.target.value += "\u001d"
          //   }
          // }}
          className={"place-self-stretch w-full"}
          onKeyDown={(ev) => {
            if (ev.altKey) {
              if (ev.keyCode !== 18) {
                isAlt.current += ev.key;
              }
            }
          }}
          onKeyUp={(ev) => {
            if (ev.altKey === false && isAlt.current !== "") {
              let value = String.fromCharCode(parseInt(isAlt.current));
              isAlt.current = "";
              if (value === "\u001d") {
                ev.target.value += "\u001d"
              }
            }
          }}
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={searchingData}>
            Consultar código de barras
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ConsultaBarras;
