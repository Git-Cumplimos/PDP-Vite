import React, { useCallback, } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { useState, useEffect, useMemo } from "react";
import { useLoteria } from "../../utils/LoteriaHooks";
import { notify, notifyError } from "../../../../utils/notify";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const SendForm = ({
  sorteo,
  selecFrac,
  setSelecFrac,
  selected,
  setSelected,
  customer: { fracciones, phone, doc_id, email },
  setCustomer,
  closeModal,
  handleSubmit,
  tipoPago,
  setTipoPago,
}) => {
  const details = {
    "Valor por fracción": selected
      ? formatMoney.format(selected.Valor_fraccion)
      : "",
    "Número": selected ? selected.Num_billete : "",
    Serie: selected ? selected.serie : "",
    "Fracciones disponibles": selected ? selected.Fracciones_disponibles : "",
  };
  const { tiposOperaciones } = useLoteria();
  const operacion = useMemo(() => {
    return tiposOperaciones;
  }, [tiposOperaciones]);

  const [checkedState, setCheckedState] = useState([]);
  const [flagFraccionV, setFlagFraccionV] = useState([]);

  useEffect(() => {
    const copy = [];
    selected?.Fracciones?.forEach(() => {
      copy.push(false);
    });
    setCheckedState([...copy]);
    setFlagFraccionV([...copy]);
  }, [selected]);

  const [disabledBtns, setDisabledBtns] = useState(false);

  const handleOnChange = (position) => {
    selecFrac.length = 0;
    const updatedCheckedState = checkedState.map((item, frac) =>
      frac === position ? !item : item
    );
    setCheckedState(updatedCheckedState);
    setFlagFraccionV(updatedCheckedState);
    for (var i = 0; i < selected?.Fracciones?.length; i++) {
      if (updatedCheckedState[i] === true) {
        selecFrac.push(selected.Fracciones[i]);
      }
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (selecFrac.length == "0") {
      if (sorteo.split("-")[1] === "true") {
        notifyError("Seleccione la(s) fraccion(es) a vender");
      }
      else {
        notifyError("Seleccione la fracción a vender");
      }
    }
    else if(tipoPago == null) {
      notifyError("Seleccione método de pago");
    }
    else if(tipoPago == operacion?.Venta_Intercambio & selecFrac.length > 1) {
      notifyError("El método de pago por bono aplica para una única fracción");
    }
     else {
      setDisabledBtns(true);
      handleSubmit();
    }
  };

  const handleCloseCancelar = useCallback(() => {
    notifyError("Venta de lotería cancelada");
  })

  // const formPago = (value) => {
  //   setTipoPago(operacion?.Venta_Fisica);
  // };

  useEffect(() => {
    setTipoPago(operacion?.Venta_Fisica);
    const cus = { fracciones, phone, doc_id, email };
    cus.fracciones = "1";
    setCustomer({ ...cus });
  }, [fracciones,sorteo])

  return (
    <>
      <div className="flex flex-col w-1/2 mx-auto">
        {Object.entries(details).map(([key, val]) => {
          return (
            <div
              className="flex flex-row justify-between text-lg font-medium"
              key={key}
            >
              <h1>{key}</h1>
              <h1>{val}</h1>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form onSubmit={onSubmit} grid>
          {sorteo.split("-")[1] === "true" ? (
            <>
              {selected?.Fracciones?.map((frac, index) => {
                return (
                  <Input
                    id={frac}
                    label={`Fracción ${frac}:`}
                    type="checkbox"
                    value={frac}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(index)}
                  />
                  );
                })}
            </>
          ) : (
            <>
              <Input
                id="cantFrac"
                label="Fracciones a comprar"
                type="number"
                max={selected ? `${selected.Fracciones_disponibles}` : "3"}
                min="1"
                value={fracciones}
                required={true}
                disabled
              />
              {selected?.Fracciones?.map((frac, index) => {
                return (
                  <Input
                    id={frac}
                    label={`Fracción ${frac}:`}
                    type="checkbox"
                    value={frac}
                    checked={checkedState[index]}
                    disabled={flagFraccionV[index]}
                    onChange={() => {
                      handleOnChange(index)
                      if (!checkedState[index]){
                        const updatedCheckedState = checkedState.map((item, frac) =>
                          frac === index ? item : !item
                        );
                        setFlagFraccionV(updatedCheckedState);
                      }
                    }}
                  />
                );
              })}
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                minLength="5"
                maxLength="70"
                required={true}
                onChange={(e) => {
                  const cus = { fracciones, phone, doc_id, email };
                  cus.email = e.target.value;
                  setCustomer({ ...cus });
                }}
              />
            </>
          )}
          <Input
            id="numCel"
            label="Celular"
            type="tel"
            minLength="10"
            maxLength="10"
            value={phone}
            required={true}
            onInput={(e) => {
              if (
                (String(e.target.value).length > 0) &
                (String(e.target.value).slice(0, 1) !== "3")
              ) {
                notifyError("El número de celular debe iniciar por 3");
                const cus = { fracciones, phone, doc_id, email };
                cus.phone = "";
                setCustomer({ ...cus });
              } else {
                const cus = { fracciones, phone, doc_id, email };
                cus.phone = e.target.value;
                setCustomer({ ...cus });
              }
            }}
          />
          <Input
            id="num_id"
            label="Documento de identidad"
            type="text"
            value={doc_id}
            minLength="5"
            maxLength="12"
            required={true}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const cus = { fracciones, phone, doc_id, email };
                cus.doc_id = e.target.value;
                setCustomer({ ...cus });
              }
            }}
          />
          {/* <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
            Efectivo
            <input
              id="Efectivo"
              value={operacion?.Venta_Fisica}
              name="pago"
              type="radio"
              onChange={(e) => formPago(e.target.value)}
            />
            Bono
            <input
              id="Bono"
              value={operacion?.Venta_Fisica}
              data-alt-value={operacion?.Venta_Intercambio}
              name="pago"
              type="radio"
              // onChange={(e) => formPago(e.target.value)}
              onChange={(e) => formPago(e.target.getAttribute('data-alt-value'))}
            />
          </div> */}
          <ButtonBar>
            <Button type="submit" disabled={disabledBtns}>
              Aceptar
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleCloseCancelar();
                closeModal();
                setCustomer({ fracciones: "", phone: "", doc_id: "", email: "" });
                setCheckedState(
                  new Array(selected?.Fracciones?.length).fill(false)
                );
                setSelected(null);
                setSelecFrac([]);
                setDisabledBtns(false);
              }}
            >
              {" "}
              Cancelar
            </Button>
          </ButtonBar>
        </Form>
      </div>
    </>
  );
};

export default SendForm;