import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Select from "../../../../components/Base/Select/Select";

const initComission = {
  type: "trx",
  ranges: [
    {
      "Rango minimo": 0,
      "Rango maximo": 1000,
      "Comision porcentual": 1.2,
      "Comision fija": 2000,
    },
    {
      "Rango minimo": 1001,
      "Rango maximo": 2000,
      "Comision porcentual": 1.5,
      "Comision fija": 3000,
    },
  ],
};

const EditComission = () => {
  const [{ id_tipo_trx, id_comercio, id_convenio, id_autorizador }] =
    useQuery();

  const [editedComission, setEditedComission] = useState(null);

  const onChange = useCallback((ev) => {
    if (ev.target.name === "comissionType") {
      setEditedComission((oldComission) => {
        return { ...oldComission, type: ev.target.value };
      });
    } else {
      setEditedComission((oldComission) => {
        const name = ev.target.name.split("|")[0];
        const ind = parseInt(ev.target.name.split("|")[1]);
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
  }, []);

  const onSubmit = useCallback((ev) => {
    ev.preventDefault();
    // Subir comisiones nuevas
  }, []);

  useEffect(() => {
    if (id_tipo_trx || id_comercio || id_convenio || id_autorizador) {
      let args = {};
      if (id_tipo_trx) {
        args = { ...args, id_tipo_trx };
      }
      if (id_comercio) {
        args = { ...args, id_comercio };
      }
      if (id_convenio) {
        args = { ...args, id_convenio };
      }
      if (id_autorizador) {
        args = { ...args, id_autorizador };
      }
      setEditedComission(initComission);
      // fetchData("", "GET", args)
      //   .then((res) => {
      //     if (res?.status) {
      //       setInputData({});
      //       setComissions(res?.obj);
      //     } else {
      //       console.error(res?.msg);
      //     }
      //   })
      //   .catch((err) => console.error(err));
    }
  }, [id_tipo_trx, id_comercio, id_convenio, id_autorizador]);
  return (
    <Fragment>
      {editedComission ? (
        <Form onSubmit={onSubmit} onChange={onChange} grid>
          <Select
            id="comissionType"
            name="comissionType"
            label="Tipo de comision"
            options={{ "": "", Transacciones: "trx", Dinero: "dinero" }}
            defaultValue={editedComission?.type}
            required
          />
          {editedComission?.ranges.map((_comission, ind) => {
            return (
              <Fieldset
                legend={`Rango ${ind + 1}`}
                key={ind}
                className="lg:col-span-2"
              >
                {Object.entries(_comission).map(([key, val], idx) => {
                  return (
                    <Input
                      key={idx}
                      label={key}
                      name={`${key}|${ind}`}
                      type={"number"}
                      step={
                        editedComission?.type === "trx" &&
                        ["Rango minimo", "Rango maximo"].includes(key)
                          ? "1"
                          : "0.01"
                      }
                      value={val}
                      onChange={() => {}}
                      autoComplete="off"
                      required
                    />
                  );
                })}
                <ButtonBar className="lg:col-span-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setEditedComission((oldComission) => {
                        const copy = { ...oldComission };
                        copy?.ranges.splice(ind, 1);
                        return { ...copy };
                      });
                    }}
                  >
                    Eliminar rango
                  </Button>
                </ButtonBar>
              </Fieldset>
            );
          })}

          <ButtonBar className="lg:col-span-2">
            <Button
              type="button"
              onClick={() => {
                setEditedComission((oldComission) => {
                  const copy = { ...oldComission };
                  const last = copy?.ranges.at(-1);
                  copy?.ranges.push({
                    "Rango minimo": last?.["Rango maximo"] + 1,
                    "Rango maximo": 0,
                    "Comision porcentual": 0,
                    "Comision fija": 0,
                  });
                  return { ...copy };
                });
              }}
            >
              Agregar rango
            </Button>
            <Button type="submit">Actualizar rangos</Button>
          </ButtonBar>
        </Form>
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default EditComission;
