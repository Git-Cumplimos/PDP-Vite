import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import { useState, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input";
import fetchData from "../../../../utils/fetchData";
import MoneyInput from "../../../../components/Base/MoneyInput/MoneyInput";
import { notify, notifyError } from "../../../../utils/notify";
import { queries } from "@testing-library/react";
//import { useAuth } from "../../../../hooks/AuthHooks";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const url_cambioParams = `${import.meta.env.VITE_URL_LOTERIAS}/cambio_params`;

const ParamsForm = ({ closeModal, params, setParams }) => {
  const cambio_params = useCallback(async (uvt, max_pago) => {
    const query = { params: `{"uvt":${uvt},"tipo":"4","max_pago":${max_pago}}` };

    try {
      const res = await fetchData(url_cambioParams, "GET", query);

      return res;
    } catch (err) {
      console.error(err);
    }
    setMax_pago(null);
    setUvt(null);
  }, []);

  const [uvt, setUvt] = useState(null);
  const [max_pago, setMax_pago] = useState(null);
  const [disabledBtns, setDisabledBtns] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    cambio_params(uvt, max_pago).then((res) => {
      if ("msg" in res) {
        notifyError(res.msg);
        setDisabledBtns(true);
      } else {
        notify("Modificado");

      }
    });
    closeModal();
    setParams(null);
    setUvt(null);
    setMax_pago(null);
  };

  useEffect(() => {
    setUvt(params?.uvt);
    setMax_pago(params?.max_pago);
    setDisabledBtns(false);
  }, [params]);

  const onChange = useCallback(
    (e) => {
      const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
      if (valueInput>0){
        setMax_pago(valueInput);
      } else{
        notifyError("Valor de UVT máximo para pagos debe ser mayor a cero")
      }
    },
    [setMax_pago]
  );

  const onMoneyChange2 = useCallback(
    (e, uvt) => {
      setUvt(uvt);
    },
    [setUvt, uvt]
  );

  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container ">
        <Form onSubmit={onSubmit} grid>
          <div className="flex flex-col justify-center items-center mx-auto container grid">
            <h1 className="text-3xl font-semibold my-4">
              ¿Desea cambiar algún parámetro?
            </h1>
            <h1 className="text-2xl font-semibold">UVT</h1>
            <Input
              className="mt-4 mx-4"
              id="uvt"
              label="UVT"
              type="text"
              autoComplete="off"
              required="true"
              value={formatMoney.format(params?.uvt)}
            />
            <MoneyInput
              className="mt-4 mx-4"
              id="_uvt"
              name="_uvt"
              label="Nuevo UVT"
              autoComplete="off"
              max={10000000}
              value={uvt}
              onInput={onMoneyChange2}
              required="true"
            />
            <h1 className="text-2xl font-semibold mt-4 mx-4">Cantidad UVT para máximo de pago</h1>
            <Input
              className="mt-4 mx-4"
              id="max_pago"
              label="Valor actual"
              type="text"
              autoComplete="off"
              required="true"
              value={params?.max_pago}
            />
            <Input
              className="mt-4 mx-4"
              id="valor"
              name="valor"
              label="Nuevo valor"
              type="text"
              autoComplete="off"
              minLength={"1"}
              maxLength={"3"}
              value={max_pago}
              onInput={onChange}
              required="true"
            />

            <ButtonBar>
              <Button type="submit" disabled={disabledBtns}>
                Cambiar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setDisabledBtns(false);
                  setMax_pago(null);
                  setUvt(null);
                  setParams(null);
                  closeModal();
                }}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </div>
        </Form>
      </div>
    </>
  );
};

export default ParamsForm;
