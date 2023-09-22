import { Fragment, useCallback } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Select from "../../../../components/Base/Select";
import { notifyError } from "../../../../utils/notify";

const FormComission = ({
  outerState,
  onSubmit,
  children,
  disabledState = false,
}) => {
  const [comissionData, setComissionData] = outerState;

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name === "comissionType") {
        const copy = { ...comissionData };
        copy.type = ev.target.value;
        copy.ranges = [copy.ranges[0]];
        setComissionData(copy);
      } else {
        // const name = ev.target.name.split("|")[0];
        // const ind = parseInt(ev.target.name.split("|")[1]) ?? "";
        // if (isNaN(ind)) {
        //   // setComissionData({ ...comissionData })
        //   return;
        // }
        // const copy = { ...comissionData };
        // if (
        //   comissionData?.type === "trx" &&
        //   ["Rango minimo", "Rango maximo"].includes(name)
        // ) {
        //   let valor = ev.target.value;
        //   let num = valor.replace(/[\s.]/g, "");
        //   num = num.replace(/^0$/, "");
        //   if (!isNaN(num)) {
        //     copy.ranges[ind][name] = num;
        //   }
        // } else {
        //   copy.ranges[ind][name] = parseFloat(ev.target.value) ?? "";
        // }
        // setComissionData(copy);
      }
    },
    [setComissionData, comissionData]
  );
  const onClick = useCallback(
    (ev) => {
      const copy = { ...comissionData };
      if (copy?.ranges?.length === 10) {
        notifyError("No se pueden agregar mas rangos");
        return;
      }
      const last = copy?.ranges.at(-1);
      if (
        last?.["Rango maximo"] === 0 ||
        last?.["Rango maximo"] === "" ||
        !last?.["Rango maximo"]
      ) {
        notifyError("Se debe agregar rango máximo de la comisión");
        return;
      }
      if (copy?.ranges.length > 1) {
        if (last?.["Rango maximo"] <= last?.["Rango minimo"]) {
          return notifyError(
            "El valor del Rango máximo debe ser superior al valor del Rango mínimo"
          );
        }
      }
      copy.ranges = [
        ...copy?.ranges,
        {
          "Rango minimo": parseInt(last?.["Rango maximo"]) + 1,
          "Rango maximo": "",
          "Comision porcentual": 0,
          "Comision fija": 0,
        },
      ];

      setComissionData({ ...copy });
    },
    [comissionData, setComissionData]
  );
  const onClickDelete = useCallback(
    (ev, ind) => {
      const copy = { ...comissionData };
      if (copy?.ranges.length <= 1) {
        notifyError("Debe existir por lo menos un rango");
        return;
      }
      copy?.ranges.splice(ind, 1);
      setComissionData({ ...copy });
    },
    [comissionData, setComissionData]
  );

  return (
    <Fragment>
      {comissionData ? (
        <Form onSubmit={onSubmit} onChange={onChange} grid>
          <Select
            id="comissionType"
            name="comissionType"
            label="Tipo de pago de comisión"
            options={{
              "Transacción Escalonada": "trxEsc",
              "Transacción Acumulada": "trx",
              Monto: "monto",
            }}
            value={comissionData?.type}
            onChange={() => {}}
            // defaultValue={comissionData?.type}
            disabled={disabledState}
            required
          />
          {comissionData?.ranges.map((_comission, ind) => {
            return (
              <Fieldset
                legend={`Rango ${ind + 1}`}
                key={ind}
                className="lg:col-span-2"
              >
                {Object.entries(_comission).map(([key, val]) =>
                  key === "Rango minimo" || key === "Rango maximo" ? (
                    comissionData?.type === "trx" ||
                    comissionData?.type === "trxEsc" ? (
                      <Input
                        key={`${key}_${ind}`}
                        id={`${key}_${ind}`}
                        label={
                          key === "Rango minimo"
                            ? "Rango mínimo"
                            : key === "Rango maximo"
                            ? "Rango máximo"
                            : key
                        }
                        name={`${key}|${ind}`}
                        type={"text"}
                        value={val}
                        maxLength={15}
                        onInput={(e) => {
                          let valor = e.target.value;
                          let num = valor.replace(/[\s.-]/g, "");
                          // num = num.replace(/^0[0-9]/, "");
                          if (!isNaN(num)) {
                            let copyData = { ...comissionData };
                            copyData.ranges[ind][key] = !isNaN(parseInt(num))
                              ? parseInt(num)
                              : 0;
                            setComissionData(copyData);
                          }
                        }}
                        autoComplete="off"
                        required={
                          comissionData?.ranges.length === ind + 1 &&
                          key === "Rango maximo"
                            ? false
                            : true
                        }
                        disabled={
                          (key === "Rango minimo"
                            ? true
                            : key === "Rango maximo"
                            ? comissionData?.ranges.length === ind + 1
                              ? false
                              : true
                            : true) || disabledState
                        }
                      />
                    ) : (
                      <MoneyInput
                        id={`${key}_${ind}`}
                        key={`${key}_${ind}`}
                        name={`${key}|${ind}`}
                        label={
                          key === "Rango minimo"
                            ? "Rango mínimo"
                            : key === "Rango maximo"
                            ? "Rango máximo"
                            : key
                        }
                        type="text"
                        autoComplete="off"
                        maxLength={"15"}
                        value={val}
                        equalErrorMin={false}
                        onInput={(e, valor) => {
                          if (!isNaN(valor)) {
                            const num = valor;
                            const copyData = structuredClone(comissionData);
                            copyData.ranges[ind][key] = num;
                            setComissionData(copyData);
                          }
                        }}
                        required={
                          comissionData?.ranges.length === ind + 1 &&
                          key === "Rango maximo"
                            ? false
                            : true
                        }
                        disabled={disabledState}
                      />
                    )
                  ) : key === "Comision porcentual" ? (
                    <Input
                      key={`${key}_${ind}`}
                      id={`${key}_${ind}`}
                      label={"Comisión porcentual"}
                      name={`${key}|${ind}`}
                      type={"tel"}
                      value={val}
                      // onChange={() => {}}
                      onInput={(e) => {
                        let valor = e.target.value;
                        let num = valor.replace(/[\s-]/g, "");
                        // num = num.replace(/^0[0-9]/, "");
                        if (num > 10) {
                          notifyError(
                            "Está introduciendo un valor porcentual inusualmente alto",
                            false,
                            { toastId: "comision-per-error-high" }
                          );
                        }

                        if (num > 100) {
                          e.target.value = 100;
                          // replace the value with 100
                          let copyData = { ...comissionData };
                          copyData.ranges[ind][key] = 100;
                          return setComissionData(copyData);
                        }
                        if (num < 0) {
                          e.target.value = 0;
                          // replace the value with 0
                          let copyData = { ...comissionData };
                          copyData.ranges[ind][key] = 0;
                          return setComissionData(copyData);
                        }
                        if (!isNaN(num)) {
                          let copyData = { ...comissionData };
                          if (copyData.ranges[ind]["Comision fija"] > 0) {
                            notifyError(
                              "Se esta introduciendo una comisión porcentual teniendo configurado una comisión fija",
                              false,
                              { toastId: "comision-per-error-mix" }
                            );
                          }
                          copyData.ranges[ind][key] =
                            num.slice(-1) === "."
                              ? num
                              : !isNaN(parseFloat(num))
                              ? parseFloat(num)
                              : 0;
                          return setComissionData(copyData);
                        }
                      }}
                      autoComplete="off"
                      required={
                        comissionData?.ranges.length === ind + 1 &&
                        key === "Rango maximo"
                          ? false
                          : true
                      }
                      maxLength={15}
                      disabled={disabledState}
                    />
                  ) : key === "Comision fija" ? (
                    <MoneyInput
                      id={`${key}_${ind}`}
                      key={`${key}_${ind}`}
                      name={`${key}|${ind}`}
                      label={"Comisión fija"}
                      type="tel"
                      autoComplete="off"
                      maxLength={"15"}
                      value={val}
                      max="10000"
                      min="-10000"
                      onInput={(e, valor) => {
                        if (!isNaN(valor)) {
                          const num = valor;
                          const copyData = structuredClone(comissionData);
                          if (copyData.ranges[ind]["Comision porcentual"] > 0) {
                            notifyError(
                              "Se esta introduciendo una comisión fija teniendo configurado una comisión porcentual",
                              false,
                              { toastId: "comision-fix-error-mix" }
                            );
                          }
                          copyData.ranges[ind][key] = num;
                          setComissionData(copyData);
                        }
                        if (Math.abs(valor) >= 2000) {
                          notifyError(
                            "Está introduciendo un valor fijo inusualmente alto",
                            false,
                            { toastId: "comision-fix-error-high" }
                          );
                        }
                      }}
                      required={
                        comissionData?.ranges.length === ind + 1 &&
                        key === "Rango maximo"
                          ? false
                          : true
                      }
                      disabled={disabledState}
                      negativeValues
                    />
                  ) : (
                    ""
                  )
                )}
                <ButtonBar className="lg:col-span-2">
                  {!disabledState &&
                    comissionData?.ranges?.length > 1 &&
                    ind !== 0 && (
                      <Button
                        type="button"
                        onClick={(e) => {
                          onClickDelete(e, ind);
                        }}
                      >
                        Eliminar rango
                      </Button>
                    )}
                </ButtonBar>
              </Fieldset>
            );
          })}
          <ButtonBar className="lg:col-span-2">
            {!disabledState && (
              <Button type="button" onClick={onClick}>
                Agregar rango
              </Button>
            )}
            {children}
          </ButtonBar>
        </Form>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default FormComission;
