import { Fragment, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import InputSuggestions from "../../../../components/Base/InputSuggestions";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError } from "../../../../utils/notify";
import { searchConveniosPinesList } from "../../utils/fetchFunctions";

const ConsultaPines = () => {
  const { roleInfo } = useAuth();

  const [foundConv, setFoundConv] = useState([]);

  const mapSuggestions = useMemo(() => {
    return foundConv.map(({ pk_codigo_convenio, codigo_pin, nombre_convenio }) => {
      return (
        <Link to={`/corresponsalia/colpatria/pines/venta/${pk_codigo_convenio}`}>
          <div className="grid grid-cols-1 place-items-center px-4 py-2">
            <h1 className="text-lg">{pk_codigo_convenio} | {codigo_pin} | {nombre_convenio}</h1>
          </div>
        </Link>
      );
    });
  }, [foundConv]);

  const searchConvenios = useCallback((e) => {
    const _consulta = e.target.value;
    if (_consulta.length > 1) {
      searchConveniosPinesList({
        consulta: _consulta,
        limit: 5,
      })
        .then((res) => {
          if (Array.isArray(res?.obj)) {
            setFoundConv(res?.obj);
            if (res?.obj.length === 0) {
              notifyError("No se encontradon datos de convenio");
            }
            return
          }
          throw new Error("Objeto recibido erroneo");
        })
        .catch((error) => {
          if (error?.cause === "custom") {
            notifyError(error?.message);
            return;
          }
          console.error(error?.message);
          notifyError("Busqueda fallida");
        });
    } else {
      setFoundConv([]);
    }
  }, []);

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
      <h1 className="text-3xl mt-6">Venta de Pines Colpatria</h1>
      <Form
        onSubmit={(ev) => {
          ev.preventDefault();
        }}
        grid
      >
        <InputSuggestions
          id={"searchConv"}
          label={"Buscar convenio"}
          type={"search"}
          autoComplete="off"
          suggestions={mapSuggestions || []}
          onLazyInput={{
            callback: searchConvenios,
            timeOut: 500,
          }}
        />
        <InputSuggestions
          id={"searchConv2"}
          label={"Buscar convenio"}
          type={"search"}
          autoComplete="off"
          suggestions={mapSuggestions || []}
          onLazyInput={{
            callback: searchConvenios,
            timeOut: 500,
          }}
        />
        <InputSuggestions
          id={"searchConv3"}
          label={"Buscar convenio"}
          type={"search"}
          autoComplete="off"
          suggestions={mapSuggestions || []}
          onLazyInput={{
            callback: searchConvenios,
            timeOut: 500,
          }}
        />
        <ButtonBar></ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ConsultaPines;
