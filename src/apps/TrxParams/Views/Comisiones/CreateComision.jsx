import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import SearchComissions from "../../components/SearchComissions/SearchComissions";
import Button from "../../../../components/Base/Button/Button";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import { postComission } from "../../utils/fetchRevalComissions";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form/Form";
import Select from "../../../../components/Base/Select/Select";
import Input from "../../../../components/Base/Input/Input";
import { fetchTiposContratosComisiones } from "../../utils/fetchTiposContratosComisiones";
import { fetchConveniosMany } from "../../utils/fetchRevalConvenios";
import { postComisionesPagar } from "../../utils/fetchComisionesPagar";

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

const CreateComision = () => {
  const navigate = useNavigate();

  const [{ comercios_id_comercio, convenios_id_convenio, comercio }, setQuery] =
    useQuery();

  const [selectecConv, setSelectecConv] = useState(null);
  const [comissionData, setComissionData] = useState(initComissionData);
  const [newComision, setNewComision] = useState([]);
  const [tiposContratosComisiones, setTiposContratosComisiones] = useState([]);

  const onSelectItem = useCallback(
    (selected) => setSelectecConv(selected.Convenio),
    []
  );

  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;

      if (
        !newComision["Convenio"] &&
        !newComision["Tipo de transaccion"] &&
        !newComision["Id comercio"]
      ) {
        notifyError(
          "Se debe agregar al menos un convenio o un tipo de transaccion o un id de comercio"
        );
        return;
      }
      if (!newComision["Tipo contrato"]) {
        notifyError("Se debe agregar el tipo de contrato");
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
      if (parseInt(newComision["Id comercio"])) {
        obj["id_comercio"] = parseInt(newComision["Id comercio"]);
      }
      if (parseInt(newComision["Convenio"])) {
        obj["id_convenio"] = parseInt(newComision["Convenio"]);
      }
      if (parseInt(newComision["Tipo de transaccion"])) {
        obj["id_tipo_op"] = parseInt(newComision["Tipo de transaccion"]);
      }
      if (parseInt(newComision["Tipo contrato"])) {
        obj["id_tipo_contrato"] = parseInt(newComision["Tipo contrato"]);
      }
      if (newComision["Fecha inicio"] !== "") {
        obj["fecha_inicio"] = newComision["Fecha inicio"];
      }
      if (newComision["Fecha fin"] !== "") {
        obj["fecha_fin"] = newComision["Fecha fin"];
      }
      postComisionesPagar({
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
    [
      "Convenio",
      "Tipo de transaccion",
      "Tipo contrato",
      "Id comercio",
      "Fecha inicio",
      "Fecha fin",
    ].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    setNewComision((old) => ({
      ...Object.fromEntries(newData),
    }));
  }, []);
  // useEffect(() => {
  //   if (comercio && selectecConv) {
  //     const _id_comercio = parseInt(comercio) ?? 0;
  //     const _id_convenio = selectecConv[0];
  //     setQuery(
  //       {
  //         comercios_id_comercio: _id_comercio,
  //         convenios_id_convenio: _id_convenio,
  //       },
  //       { replace: true }
  //     );
  //   } else if (comercio) {
  //     const _id_comercio = parseInt(comercio) ?? 0;
  //     setQuery(
  //       {
  //         comercios_id_comercio: _id_comercio,
  //       },
  //       { replace: true },
  //       ["convenios_id_convenio"]
  //     );
  //   } else if (selectecConv) {
  //     const _id_convenio = selectecConv[0];
  //     setQuery(
  //       {
  //         convenios_id_convenio: _id_convenio,
  //       },
  //       { replace: true },
  //       ["comercios_id_comercio"]
  //     );
  //   }
  // }, [selectecConv, comercio, setQuery]);

  useEffect(() => {
    fetchTiposContratosComisionesFunc();
    // fetchConveniosFunc();
  }, []);
  const fetchTiposContratosComisionesFunc = () => {
    fetchTiposContratosComisiones({})
      .then((res) => {
        let obj = { "": "" };
        [...res?.results].map(({ id_tipo_contrato, nombre_contrato }) => {
          obj[nombre_contrato] = id_tipo_contrato;
          return {
            nombre_contrato: nombre_contrato,
          };
        });
        setTiposContratosComisiones(obj);
      })
      .catch((err) => console.error(err));
  };
  const fetchConveniosFunc = () => {
    fetchConveniosMany("")
      .then((res) => {
        let obj = { "": "" };
        console.log(res);
        // [...res?.results].map(({ id_tipo_contrato, nombre_contrato }) => {
        //   obj[nombre_contrato] = id_tipo_contrato;
        //   return {
        //     nombre_contrato: nombre_contrato,
        //   };
        // });
        // setTiposContratosComisiones(obj);
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
          id='Convenio'
          name='Convenio'
          label='Convenio'
          options={{ "": "", Transacciones: 1, Monto: 2 }}
          defaultValue={newComision?.["Convenio"]}
          required
        />
        <Select
          id='Tipo de transaccion'
          name='Tipo de transaccion'
          label='Tipo de transaccion'
          options={{ "": "", Transacciones: 1, Monto: 2 }}
          defaultValue={newComision?.["Tipo de transaccion"]}
          required
        />
        <Select
          id='Tipo contrato'
          name='Tipo contrato'
          label='Tipo contrato'
          options={tiposContratosComisiones}
          defaultValue={newComision?.["Tipo contrato"]}
        />
        <Input
          id='Id comercio'
          name='Id comercio'
          label={"Id comercio"}
          type='text'
          autoComplete='off'
          defaultValue={newComision?.["Id comercio"]}
        />
        <Input
          id='Fecha inicio'
          name='Fecha inicio'
          label={"Fecha inicio"}
          type='date'
          autoComplete='off'
          defaultValue={newComision?.["Fecha inicio"]}
        />
        <Input
          id='Fecha fin'
          name='Fecha fin'
          label={"Fecha fin"}
          type='date'
          autoComplete='off'
          defaultValue={newComision?.["Fecha fin"]}
        />
      </Form>
      <FormComission outerState={[comissionData, setComissionData]}>
        <Button type='submit' onClick={createComission}>
          Crear comision
        </Button>
      </FormComission>
    </Fragment>
  );
};

export default CreateComision;
