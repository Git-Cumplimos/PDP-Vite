import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Button from "../../../../components/Base/Button";
import MultipleSelect from "../../../../components/Base/MultipleSelect";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Select from "../../../../components/Base/Select";
import { fetchConveniosMany } from "../../utils/fetchRevalConvenios";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import { postComisionesCobrar } from "../../utils/fetchComisionesCobrar";
import { fetchTrxTypesPages } from "../../utils/fetchTiposTransacciones";

const initComissionData = {
  type: "",
  ranges: [
    {
      "Rango minimo": 0,
      "Rango maximo": "",
      "Comision porcentual": 0,
      "Comision fija": 0,
    },
  ],
};

const CreateComisionCobrada = () => {
  const navigate = useNavigate();

  const [{ comercios_id_comercio, convenios_id_convenio, comercio }, setQuery] =
    useQuery();

  const [selectecConv, setSelectecConv] = useState(null);
  const [comissionData, setComissionData] = useState(initComissionData);
  const [newComision, setNewComision] = useState([]);
  const [autorizadores, setAutorizadores] = useState([]);
  const [convenios, setConvenios] = useState([]);

  const onSelectItem = useCallback(
    (selected) => setSelectecConv(selected.Convenio),
    []
  );

  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;

      if (!newComision["Convenio"] && !newComision["Tipo de transaccion"]) {
        notifyError(
          "Se debe agregar al menos un convenio o un tipo de transaccion"
        );
        return;
      }
      if (!newComision["Autorizador"]) {
        notifyError("Se debe agregar el autorizador");
        return;
      }

      if (errRang) {
        notifyError("Se debe agregar al menos una comision");
        return;
      }

      comissionData?.ranges.reduce((prev, curr, indexR) => {
        if (prev?.["Rango maximo"] > curr?.["Rango minimo"]) {
          notifyError(`El rango maximo de un rango comision no puede 
            ser mayor al rango minimo del siguiente 
            rango de comision (Rango ${indexR} - Rango ${indexR + 1})`);
          errRang = true;
        }
        return curr;
      });

      if (errRang) {
        return;
      }
      let obj = {};
      if (parseInt(newComision["Convenio"])) {
        obj["id_convenio"] = parseInt(newComision["Convenio"]);
      }
      if (parseInt(newComision["Tipo de transaccion"])) {
        obj["id_tipo_op"] = parseInt(newComision["Tipo de transaccion"]);
      }
      if (parseInt(newComision["Autorizador"])) {
        obj["id_autorizador"] = parseInt(newComision["Autorizador"]);
      }
      postComisionesCobrar({
        ...obj,
        comisiones: {
          ...comissionData,
          ranges: comissionData?.ranges.map(
            ({
              "Rango minimo": Minimo,
              "Rango maximo": Maximo,
              "Comision porcentual": Porcentaje,
              "Comision fija": Fija,
            }) => {
              return {
                Minimo,
                Maximo: !Maximo ? -1 : Maximo,
                Porcentaje: Porcentaje / 100,
                Fija,
              };
            }
          ),
        },
      })
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            navigate(-1, { replace: true });
          } else {
            notifyError(res?.msg);
          }
        })
        .catch((err) => console.error(err));
    },
    [comissionData, newComision, navigate]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["Convenio", "Tipo de transaccion", "Autorizador", "Enlazado"].forEach(
      (col) => {
        let data = null;
        data = formData.get(col);
        newData.push([col, data]);
      }
    );
    let obj = Object.fromEntries(newData);
    if (obj["Enlazado"] === 1) {
      obj["Tipo de transaccion"] = "";
    } else if (obj["Enlazado"] === 2) {
      obj["Convenio"] = "";
    }
    setNewComision((old) => ({
      ...obj,
    }));
  }, []);
  useEffect(() => {
    fetchAutorizadoresFunc();
    fetchConveniosFunc();
    fetchTiposTransaccionFunc();
  }, []);
  const fetchAutorizadoresFunc = () => {
    fetchAutorizadores({})
      .then((res) => {
        let obj = { "": "" };
        [...res?.results].map(({ id_autorizador, nombre_autorizador }) => {
          obj[nombre_autorizador] = id_autorizador;
          return {
            nombre_autorizador: nombre_autorizador,
          };
        });
        setAutorizadores(obj);
      })
      .catch((err) => console.error(err));
  };
  const fetchConveniosFunc = () => {
    fetchConveniosMany("")
      .then((res) => {
        let obj = { "": "" };
        [...res?.results].map(({ id_convenio, nombre_convenio }) => {
          obj[nombre_convenio] = id_convenio;
          return {
            nombre_convenio: nombre_convenio,
          };
        });
        setConvenios(obj);
      })
      .catch((err) => console.error(err));
  };
  const fetchTiposTransaccionFunc = () => {
    fetchTrxTypesPages("", 1)
      .then((res) => {
        console.log(res);
        // let obj = { "": "" };
        // [...res?.results].map(({ id_convenio, nombre_convenio }) => {
        //   obj[nombre_convenio] = id_convenio;
        //   return {
        //     nombre_convenio: nombre_convenio,
        //   };
        // });
        // setConvenios(obj);
      })
      .catch((err) => console.error(err));
  };
  return (
    <Fragment>
      {/* <SearchComissions comissionFace="pay" onSelectItem={onSelectItem} /> */}
      {selectecConv ? (
        <Fragment>
          <MultipleSelect
            options={{
              [`Convenio: ${selectecConv[0]}) ${selectecConv[1]}`]: true,
            }}
            disabled
          />
        </Fragment>
      ) : (
        ""
      )}
      <Form onChange={onChangeNewComision} grid>
        <Select
          id="Autorizador"
          name="Autorizador"
          label="Autorizador"
          options={autorizadores}
          defaultValue={newComision?.["Autorizador"]}
        />
        <Select
          id="Enlazado"
          name="Enlazado"
          label="Enlazado con:"
          options={{ "": "", Convenio: 1, "Tipo de transaccion": 2 }}
          defaultValue={newComision?.["Enlazado"]}
          required
        />
        {newComision?.["Enlazado"] == 1 && (
          <Select
            id="Convenio"
            name="Convenio"
            label="Convenio"
            options={convenios}
            defaultValue={newComision?.["Convenio"]}
            required
          />
        )}
        {newComision?.["Enlazado"] == 2 && (
          <Select
            id="Tipo de transaccion"
            name="Tipo de transaccion"
            label="Tipo de transaccion"
            options={{ "": "", Transacciones: 1, Monto: 2 }}
            defaultValue={newComision?.["Tipo de transaccion"]}
            required
          />
        )}
      </Form>
      <FormComission outerState={[comissionData, setComissionData]}>
        <Button type="submit" onClick={createComission}>
          Crear comision
        </Button>
      </FormComission>
    </Fragment>
  );
};

export default CreateComisionCobrada;
