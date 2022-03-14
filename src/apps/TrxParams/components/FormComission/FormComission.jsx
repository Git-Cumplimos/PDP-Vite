import { Fragment, useCallback } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import { notifyError } from "../../../../utils/notify";

const FormComission = ({ outerState, onSubmit, children }) => {
  const [comissionData, setComissionData] = outerState;

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name === "comissionType") {
        setComissionData((oldComission) => {
          return { ...oldComission, type: ev.target.value };
        });
      } else {
        setComissionData((oldComission) => {
          const name = ev.target.name.split("|")[0];
          const ind = parseInt(ev.target.name.split("|")[1]) ?? "";
          if (isNaN(ind)) {
            return { ...oldComission };
          }
          const copy = { ...oldComission };
          if (
            oldComission?.type === "trx" &&
            ["Rango minimo", "Rango maximo"].includes(name)
          ) {
            copy.ranges[ind][name] = parseInt(ev.target.value) ?? "";
          } else {
            copy.ranges[ind][name] = parseFloat(ev.target.value) ?? "";
          }
          return { ...copy };
        });
      }
    },
    [setComissionData]
  );
  const onClick = useCallback(
    (ev) => {
      const copy = { ...comissionData };
      const last = copy?.ranges.at(-1);
      if (
        last?.["Rango maximo"] === 0 ||
        last?.["Rango maximo"] === "" ||
        !last?.["Rango maximo"]
      ) {
        notifyError("Se debe agregar rango maximo de la comision");
        return;
      }
      copy.ranges = [
        ...copy?.ranges,
        {
          "Rango minimo": last?.["Rango maximo"] + 1,
          "Rango maximo": "",
          "Comision porcentual": 0,
          "Comision fija": 0,
        },
      ];

      setComissionData({ ...copy });
    },
    [comissionData]
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
    [comissionData]
  );

  return (
    <Fragment>
      {comissionData ? (
        <Form onSubmit={onSubmit} onChange={onChange} grid>
          <Select
            id='comissionType'
            name='comissionType'
            label='Tipo de comision'
            options={{ "": "", Transacciones: "trx", Monto: "monto" }}
            value={comissionData?.type}
            onChange={() => {}}
            // defaultValue={comissionData?.type}
            required
          />
          {comissionData?.ranges.map((_comission, ind) => {
            return (
              <Fieldset
                legend={`Rango ${ind + 1}`}
                key={ind}
                className='lg:col-span-2'>
                {Object.entries(_comission).map(([key, val], idx) => {
                  return (
                    <Input
                      key={`${key}_${ind}`}
                      id={`${key}_${ind}`}
                      label={key}
                      name={`${key}|${ind}`}
                      type={"number"}
                      step={
                        comissionData?.type === "trx" &&
                        ["Rango minimo", "Rango maximo"].includes(key)
                          ? "1"
                          : "0.01"
                      }
                      value={isNaN(val) ? "" : val}
                      onChange={() => {}}
                      autoComplete='off'
                      required={
                        comissionData?.ranges.length === ind + 1 &&
                        key === "Rango maximo"
                          ? false
                          : true
                      }
                    />
                  );
                })}
                <ButtonBar className='lg:col-span-2'>
                  {comissionData?.ranges?.length > 1 && ind !== 0 && (
                    <Button
                      type='button'
                      onClick={(e) => {
                        onClickDelete(e, ind);
                      }}>
                      Eliminar rango
                    </Button>
                  )}
                </ButtonBar>
              </Fieldset>
            );
          })}

          <ButtonBar className='lg:col-span-2'>
            <Button type='button' onClick={(e) => onClick(e)}>
              Agregar rango
            </Button>
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
