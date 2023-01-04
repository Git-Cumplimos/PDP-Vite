import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Button from "../../../../components/Base/Button";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { fetchConveniosUnique } from "../../utils/fetchRevalConvenios";
import {
  getComisionesPlanes,
  postComisionesPlan,
} from "../../utils/fetchComisionesPlanes";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import Modal from "../../../../components/Base/Modal";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { fetchTrxTypesPages } from "../../utils/fetchTiposTransacciones";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import TagsAlongSide from "../../../../components/Base/TagsAlongSide";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const CreatePlanComision = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [comissionData, setComissionData] = useState({
    type: "trx",
    ranges: [
      {
        "Rango minimo": 0,
        "Rango maximo": 0,
        "Comision porcentual": 0,
        "Comision fija": 0,
      },
    ],
  });
  const [newComision, setNewComision] = useState({
    tipo_comision: "COBRAR",
    nombre_plan_comision: "",
  });
  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;

      comissionData?.ranges.reduce((prev, curr, indexR) => {
        if (
          !(parseInt(prev?.["Rango maximo"]) + 1 === curr?.["Rango minimo"])
        ) {
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
      setIsUploading(true);
      postComisionesPlan({
        tipo_comision: newComision["tipo_comision"],
        nombre_plan_comision: newComision["nombre_plan_comision"],
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
          setIsUploading(false);
        })
        .catch((err) => {
          notifyError(err);
          setIsUploading(false);
          console.error(err);
        });
    },
    [comissionData, newComision, navigate]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["nombre_plan_comision", "tipo_comision"].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    setNewComision((old) => ({
      ...old,
      ...Object.fromEntries(newData),
    }));
  }, []);
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Crear plan de comisión:</h1>
      <Form onChange={onChangeNewComision} grid>
        <Input
          id='nombre_plan_comision'
          name='nombre_plan_comision'
          label={"Nombre plan de comisión"}
          type='text'
          autoComplete='off'
          value={newComision?.["nombre_plan_comision"]}
          onChange={() => {}}
        />
        <Select
          name='tipo_comision'
          label='Tipo de comisión'
          options={{ Cobrar: "COBRAR", Pagar: "PAGAR" }}
          value={newComision?.["tipo_comision"]}
          onChange={() => {}}
          // defaultValue={""}
        />
      </Form>
      {/* {JSON.stringify(newComision)} */}
      <FormComission outerState={[comissionData, setComissionData]}>
        <Button type='submit' onClick={createComission}>
          Crear comision
        </Button>
      </FormComission>
    </Fragment>
  );
};

export default CreatePlanComision;
