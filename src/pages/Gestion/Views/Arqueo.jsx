import { useState, useEffect, useCallback } from "react";
import useFormNumbers from "../../../hooks/useFormNumbers";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { confirmaArqueo } from "../utils/fetchCaja";

const Arqueo = ({
  caja,
  respuestaComprobante,
  setCierre,
  setResArqueo,
  setSobrante,
  setFaltante,
}) => {
  const [total, setTotal] = useState("");
  const [trans, setTrans] = useState("");
  const [confirmarArqueo, setConfirmarArqueo] = useState(false);
  const [denominaciones, handleChange] = useFormNumbers({
    cienmil: "",
    cincuentamil: "",
    veintemil: "",
    diezmil: "",
    cincomil: "",
    dosmil: "",
    mil: "",
    quinientos: "",
    doscientos: "",
    cien: "",
    cincuenta: "",
  });

  const sumatoria = () => {
    let arr = respuestaComprobante.map((row) => row.valor);
    console.log(arr);
    function add(accumulator, a) {
      return accumulator + a;
    }
    const sum = arr.reduce(add, 0);
    setTrans(sum);
  };

  useEffect(() => {
    sumatoria();
  });

  console.log(trans);
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  useEffect(() => {
    setTotal(
      100000 * denominaciones?.cienmil +
        50000 * denominaciones?.cincuentamil +
        20000 * denominaciones?.veintemil +
        10000 * denominaciones?.diezmil +
        5000 * denominaciones?.cincomil +
        2000 * denominaciones?.dosmil +
        1000 * denominaciones?.mil +
        500 * denominaciones?.quinientos +
        200 * denominaciones?.doscientos +
        100 * denominaciones?.cien +
        50 * denominaciones?.cincuenta
    );
  }, [denominaciones]);

  const confirmArqueo = useCallback(async () => {
    setSobrante(
      caja?.obj?.actual_caja - total < 0
        ? parseInt(total - caja?.obj?.actual_caja)
        : parseInt(0)
    );
    setFaltante(
      caja?.obj?.actual_caja - total > 0
        ? parseInt(total - caja?.obj?.actual_caja)
        : parseInt(0)
    );
    const body = {
      denominaciones: denominaciones,
      saldo_total: total,
    };
    confirmaArqueo(body)
      .then((res) => {
        console.log(res);
        if (res?.status) {
          setResArqueo(res);
          setCierre(true);
        }
      })
      .catch((err) => {
        throw err;
      });
  });

  return (
    <>
      <Form>
        {!confirmarArqueo ? (
          <>
            <Fieldset className="col-span-2" legend={"Arqueo de caja"}>
              <Input
                name="cienmil"
                value={denominaciones?.cienmil}
                label="$100.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.cienmil * 100000)}
              ></Input>
              <Input
                name="cincuentamil"
                value={denominaciones.cincuentamil}
                label="$50.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.cincuentamil * 50000)}
              ></Input>
              <Input
                name="veintemil"
                value={denominaciones.veintemil}
                label="$20.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.veintemil * 20000)}
              ></Input>
              <Input
                name="diezmil"
                value={denominaciones.diezmil}
                label="$10.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.diezmil * 10000)}
              ></Input>
              <Input
                name="cincomil"
                value={denominaciones.cincomil}
                label="$5.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.cincomil * 5000)}
              ></Input>
              <Input
                name="dosmil"
                value={denominaciones.dosmil}
                label="$2.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.dosmil * 2000)}
              ></Input>
              <Input
                name="mil"
                value={denominaciones.mil}
                label="$1.000"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.mil * 1000)}
              ></Input>
              <Input
                name="quinientos"
                value={denominaciones.quinientos}
                label="$500"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.quinientos * 500)}
              ></Input>
              <Input
                name="doscientos"
                value={denominaciones.doscientos}
                label="$200"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.doscientos * 200)}
              ></Input>
              <Input
                name="cien"
                value={denominaciones.cien}
                label="$100"
                onChange={handleChange}
                type="text"
                info={formatMoney.format(denominaciones?.cien * 100)}
              ></Input>
              <Input
                name="cincuenta"
                value={denominaciones.cincuenta}
                label="$50"
                onChange={handleChange}
                type="text"
                step="1"
                info={formatMoney.format(denominaciones?.cincuenta * 50)}
              ></Input>
            </Fieldset>

            <Fieldset legend={"Saldos"}>
              <h1>
                Total arqueo:
                {formatMoney.format(total)}
              </h1>
              <h1>
                Sobrantes:
                {caja?.obj?.actual_caja - total < 0
                  ? formatMoney.format(total - caja?.obj?.actual_caja)
                  : formatMoney.format(0)}
              </h1>
              <h1>
                Faltantes:
                {caja?.obj?.actual_caja - total > 0
                  ? formatMoney.format(total - caja?.obj?.actual_caja + trans)
                  : formatMoney.format(0)}
              </h1>
              <h1>
                Dinero transportadora:
                {trans}
              </h1>
              <ButtonBar>
                <Button type="button" onClick={() => setConfirmarArqueo(true)}>
                  Confirmar arqueo
                </Button>
              </ButtonBar>
            </Fieldset>
          </>
        ) : (
          <Fieldset legend={"Confirmación arqueo"}>
            <h1 className="text-lg">
              ¿Esta seguro de los datos para el arqueo, no podra modificarlos?
            </h1>
            <ButtonBar>
              <Button type="button" onClick={() => setConfirmarArqueo(false)}>
                Volver
              </Button>
              <Button type="button" onClick={() => confirmArqueo()}>
                Confirmar arqueo
              </Button>
            </ButtonBar>
          </Fieldset>
        )}
      </Form>
    </>
  );
};

export default Arqueo;
