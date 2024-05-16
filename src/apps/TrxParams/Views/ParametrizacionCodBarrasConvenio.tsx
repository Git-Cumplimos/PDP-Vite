import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import TablaParametrizacionCodBarrasConvenios from "../components/ParametrizacionCodBarrasConvenios";
import UpdateParametrizacionCodBarrasConvenios from "../components/UpdateParametrizacionCodBarrasConvenios";

type DataParametrizacionCodBarrasConveniosPDP = {
  pk_codigo_convenio: number | null;
  pk_id_autorizador: number | null;
  cantidad_referencias: number;
  contiene_fecha_maxima: boolean | null;
  contiene_valor_pagar: boolean | null;
  longitud_fecha: number | null;
  longitud_referencia_1: number;
  longitud_referencia_2: number | null;
  longitud_referencia_3: number | null;
  longitud_valor: number | null;
  nombre_autorizador: string;
  posicion_inicial_fecha: number | null;
  posicion_inicial_referencia_1: number;
  posicion_inicial_referencia_2: number | null;
  posicion_inicial_referencia_3: number | null;
  posicion_inicial_valor: number | null;
};

enum enumEstadoProceso {
  consulta = "CONSULTA",
  creacion = "CREACION",
  actualizacion = "ACTUALIZACION",
}

const DATA_INIT_PARAMETRIZACION = {
  pk_codigo_convenio: 0,
  pk_id_autorizador: 0,
  cantidad_referencias: 1,
  contiene_fecha_maxima: false,
  contiene_valor_pagar: false,
  longitud_fecha: null,
  longitud_referencia_1: 1,
  longitud_referencia_2: null,
  longitud_referencia_3: null,
  longitud_valor: null,
  nombre_autorizador: "",
  posicion_inicial_fecha: null,
  posicion_inicial_referencia_1: 0,
  posicion_inicial_referencia_2: null,
  posicion_inicial_referencia_3: null,
  posicion_inicial_valor: null,
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
          </ButtonBar>
          <TablaParametrizacionCodBarrasConvenios
            onSelect={(selected) => {
              setConveniosPdp(selected);
              setEstadoProceso(enumEstadoProceso.actualizacion);
            }}
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
