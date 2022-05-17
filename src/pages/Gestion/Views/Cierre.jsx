import { useCallback } from "react";
import Fieldset from "../../../components/Base/Fieldset";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import fetchData from "../../../utils/fetchData";
import { notify } from "../../../utils/notify";
import { confirmaCierre } from "../utils/fetchCaja";

const Cierre = ({
  arqueo,
  caja,
  roleInfo,
  setEstado,
  setCierre,
  sobra,
  falta,
}) => {
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const urls = {
    cierreCaja: `${process.env.REACT_APP_URL_CAJA}cash`,
  };

  const confirmCierre = useCallback(async () => {
    const body = {
      id_arqueo_caja: arqueo?.id_arqueo,
      id_usuario: String(roleInfo?.id_usuario),
      id_comercio: String(roleInfo?.id_comercio),
      id_terminal: String(roleInfo?.id_dispositivo),
      total_caja: caja?.obj?.actual_caja,
      sobrante: sobra,
      faltante: falta,
    };
    confirmaCierre(body)
      .then((res) => {
        if (res) {
          notify(res?.msg);
          setEstado(false);
          setCierre(false);
        }
      })
      .catch((err) => {
        throw err;
      });
  });

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
          <span>Reporte en el arqueo </span>
          <br />
          <span>Sobrante: </span>
          <span className="text-right">{formatMoney.format(sobra)}</span>
          <br />
          <span>Faltante: </span>
          <span className="text-right">{formatMoney.format(falta)}</span>
        </div>
        <ButtonBar>
          <Button type="button" onClick={() => confirmCierre()}>
            Confirmar cierre
          </Button>
        </ButtonBar>
      </Fieldset>
    </div>
  );
};

export default Cierre;
