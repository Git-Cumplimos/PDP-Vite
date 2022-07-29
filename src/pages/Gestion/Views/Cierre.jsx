import { useCallback, useState } from "react";
import Fieldset from "../../../components/Base/Fieldset";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notify } from "../../../utils/notify";
import { confirmaCierre } from "../utils/fetchCaja";
import { useAuth } from "../../../hooks/AuthHooks";

const Cierre = ({
  respuestaComprobante,
  arqueo,
  caja,
  roleInfo,
  setEstado,
  setCierre,
  sobra,
  falta,
}) => {
  const { signOut } = useAuth();
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const [trans, setTrans] = useState("");
  /*const urls = {
    cierreCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
  };*/

  const confirmCierre = useCallback(async () => {
    const body = {
      id_arqueo_caja: arqueo?.id_arqueo,
      id_usuario: String(roleInfo?.id_usuario),
      id_comercio: String(roleInfo?.id_comercio),
      id_terminal: String(roleInfo?.id_dispositivo),
      total_caja: caja?.obj?.actual_caja,
      sobrante: sobra,
      faltante: falta + trans,
      transportadora: trans,
    };
    confirmaCierre(body)
      .then((res) => {
        if (res) {
          notify(res?.msg);
          setEstado(false);
          setCierre(false);
          signOut();
        }
      })
      .catch((err) => {
        throw err;
      });
  });

  /*
  const sumatoria = () => {
    let arr = respuestaComprobante.map((row) => row.valor);
    function add(accumulator, a) {
      return accumulator + a;
    }
    const sum = arr.reduce(add, 0);
    setTrans(sum);
  };

  useEffect(() => {
    sumatoria();
  });
  */
  return (
    <div>
      <Fieldset legend={"Registro cierre de caja"}>
        <h1 className="text-lg text-center">Cierre de caja</h1>
        <div className="col-span-2">
          <span>Total movimientos hasta la fecha: </span>
          <span className="text-right">
            {formatMoney.format(caja?.obj?.actual_caja)}
          </span>
          <br />
          <div class="text-center mb-0 mt-5"><strong>Reporte en el arqueo</strong></div>
          <br />
          <span>Sobrante: </span>
          <span className="text-right">{formatMoney.format(sobra)}</span>
          <br />
          <span>Faltante: </span>
          <span className="text-right">
            {formatMoney.format(falta + trans)}
          </span>
          <br />
          <span>Dinero reportado a transportadora: </span>
          <span className="text-right">{formatMoney.format(trans)}</span>
        </div>
        <ButtonBar>
          <Button type="button" onClick={() => confirmCierre()}>
            Cerrar Sesión
          </Button>
        </ButtonBar>
      </Fieldset>
    </div>
  );
};

export default Cierre;
