import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import TablaParametrizacionCodBarrasConvenios from "../components/ParametrizacionCodBarrasConvenios";
import UpdateParametrizacionCodBarrasConvenios from "../components/UpdateParametrizacionCodBarrasConvenios";
import CrearParametrizacionCodBarrasConveniosMasivo from "../components/CrearParametrizacionCodBarrasConveniosMasivo";

type StrNumber = `${number}` | number;
type StrNumberOptional = StrNumber | "" | undefined;

type DataParametrizacionCodBarrasConveniosPDP = {
  pk_codigo_convenio: StrNumberOptional;
  pk_id_autorizador: StrNumberOptional;
  cantidad_referencias: number;
  contiene_fecha_maxima: boolean | null;
  contiene_valor_pagar: boolean | null;
  longitud_fecha: StrNumberOptional;
  longitud_referencia_1: StrNumberOptional;
  longitud_referencia_2: StrNumberOptional;
  longitud_referencia_3: StrNumberOptional;
  longitud_valor: StrNumberOptional;
  nombre_autorizador: StrNumberOptional;
  posicion_inicial_fecha: StrNumberOptional;
  posicion_inicial_referencia_1: StrNumberOptional;
  posicion_inicial_referencia_2: StrNumberOptional;
  posicion_inicial_referencia_3: StrNumberOptional;
  posicion_inicial_valor: StrNumberOptional;
};

enum enumEstadoProceso {
  consulta = "CONSULTA",
  creacion = "CREACION",
  actualizacion = "ACTUALIZACION",
}

const DATA_INIT_PARAMETRIZACION: DataParametrizacionCodBarrasConveniosPDP = {
  pk_codigo_convenio: "",
  pk_id_autorizador: "",
  cantidad_referencias: 1,
  contiene_fecha_maxima: false,
  contiene_valor_pagar: false,
  longitud_fecha: "",
  longitud_referencia_1: "",
  longitud_referencia_2: "",
  longitud_referencia_3: "",
  longitud_valor: "",
  nombre_autorizador: "",
  posicion_inicial_fecha: "",
  posicion_inicial_referencia_1: "",
  posicion_inicial_referencia_2: "",
  posicion_inicial_referencia_3: "",
  posicion_inicial_valor: "",
};

const ParametrizacionCodBarrasConvenio = () => {
  // const navigate = useNavigate();
  const [conveniosPdp, setConveniosPdp] =
    useState<DataParametrizacionCodBarrasConveniosPDP>(
      DATA_INIT_PARAMETRIZACION
    );
  const [estadoProceso, setEstadoProceso] = useState<enumEstadoProceso>(
    enumEstadoProceso.consulta
  );
  const [showMassive, setShowMassive] = useState<boolean>(false);
  return (
    <>
      {estadoProceso === enumEstadoProceso.consulta ? (
        <>
          <ButtonBar>
            <Button
              type="submit"
              onClick={() => {
                setEstadoProceso(enumEstadoProceso.creacion);
              }}
            >
              Crear parametrización
            </Button>
            <Button type="submit" onClick={() => setShowMassive(true)}>
              Cargar parametrizaciones masivamente
            </Button>
          </ButtonBar>
          <TablaParametrizacionCodBarrasConvenios
            onSelect={(selected) => {
              setConveniosPdp(selected);
              setEstadoProceso(enumEstadoProceso.actualizacion);
            }}
          />
          <CrearParametrizacionCodBarrasConveniosMasivo
            showMassive={showMassive}
            setShowMassive={setShowMassive}
            // searchCommercesFn={searchCommercesFn}
          />
        </>
      ) : (
        <UpdateParametrizacionCodBarrasConvenios
          estadoProceso={estadoProceso}
          dataParametrizacionCodBarras={conveniosPdp}
        />
      )}
    </>
  );
};

export default ParametrizacionCodBarrasConvenio;
