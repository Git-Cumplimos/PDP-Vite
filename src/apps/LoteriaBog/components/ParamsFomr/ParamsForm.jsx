import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import { useState, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input/Input";
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

const url_cambioParams=`http://127.0.0.1:5000/cambio_params`;

const ParamsForm = ({

  closeModal,
  params,
  setParams
}) => {

  const cambio_params = useCallback(async (uvt, max_pago) => {
    const query={params:`{"uvt":${uvt},"max_pago":${max_pago}}`}
    console.log(query)
    try {     
      const res = await fetchData(url_cambioParams, "GET", query );
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
    setMax_pago(null)
    setUvt(null)
  }, []);

  const [uvt, setUvt] = useState(null)
  const [max_pago, setMax_pago] = useState(null)
  const [disabledBtns, setDisabledBtns] = useState(false)
  
  const onSubmit = (e) => {
    e.preventDefault();
    cambio_params(uvt,max_pago).then((res) => {
      if ("msg" in res) {
        notifyError(res.msg);
        setDisabledBtns(true);
      } else {
        console.log(res);
      }
    });
    closeModal();
    setParams(null);
    setUvt(null);
    setMax_pago(null);

    
  };
 
  useEffect(() => {    
    setUvt(params?.uvt);
    setMax_pago(params?.max_pago)  ;
    setDisabledBtns(false);
  }, [params])

  const onMoneyChange = useCallback(
    (e, max_pago) => {
      setMax_pago(max_pago);
    },
    [setMax_pago,max_pago]
  );

  const onMoneyChange2 = useCallback(
    (e, uvt) => {
      setUvt(uvt);
    },
    [setUvt,uvt]
  );

  
  console.log(max_pago,uvt)
  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form  onSubmit={onSubmit} grid>
          <div
              className="flex flex-col justify-center items-center mx-auto container grid"
          >
          <h1 className="text-3xl font-semibold my-4">¿Desea cambiar algún parametro?</h1>               
          <h1 className="text-2xl font-semibold">UVT</h1> 
          <Input
            id="uvt"
            label="UVT"
            type="text"
            autoComplete="off"
            required='true'
            value={formatMoney.format(params?.uvt)}
          />
          <MoneyInput
            id="_uvt"
            name="_uvt"
            label="Nuevo UVT"
            autoComplete="off"
            max={10000000}
            onInput={onMoneyChange2}
            required='true'
          />
          <h1 className="text-2xl font-semibold">Valor maximo de pago</h1>  
          <Input
            id="max_pago"
            label="Valor actual"
            type="text"
            autoComplete="off"
            required='true'
            value={formatMoney.format(params?.max_pago)}                
          /> 
          <MoneyInput
            id="valor"
            name="valor"
            label="Nuevo valor"
            autoComplete="off"
            max={10000000}
            value={max_pago}
            onInput={onMoneyChange}
            required='true'
          />
        
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>Cambiar</Button>
            <Button
              type="button"
              onClick={() => {
                setDisabledBtns(false)
                setMax_pago(null)
                setUvt(null)
                setParams(null)
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
