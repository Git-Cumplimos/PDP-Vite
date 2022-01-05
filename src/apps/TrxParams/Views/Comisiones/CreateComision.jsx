import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import SearchComissions from "../../components/SearchComissions/SearchComissions";
import Button from "../../../../components/Base/Button/Button";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import { postComission } from "../../utils/fetchRevalComissions";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";

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

  const onSelectItem = useCallback(
    (selected) => setSelectecConv(selected.Convenio),
    []
  );

  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;

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

      if (!comercios_id_comercio) {
        notifyError("Se debe seleccionar el comercio para la comision");
        return;
      }
      if (!convenios_id_convenio) {
        notifyError("Se debe seleccionar el convenio para la comision");
        return;
      }

      if (!comissionData?.type) {
        notifyError("Se debe seleccionar el tipo de comision");
        return;
      }

      postComission({
        convenios_id_convenio,
        comercios_id_comercio,
        comision_pagada: {
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
    [comissionData, comercios_id_comercio, convenios_id_convenio, navigate]
  );

  useEffect(() => {
    if (comercio && selectecConv) {
      const _id_comercio = parseInt(comercio) ?? 0;
      const _id_convenio = selectecConv[0];
      setQuery(
        {
          comercios_id_comercio: _id_comercio,
          convenios_id_convenio: _id_convenio,
        },
        { replace: true }
      );
    } else if (comercio) {
      const _id_comercio = parseInt(comercio) ?? 0;
      setQuery(
        {
          comercios_id_comercio: _id_comercio,
        },
        { replace: true },
        ["convenios_id_convenio"]
      );
    } else if (selectecConv) {
      const _id_convenio = selectecConv[0];
      setQuery(
        {
          convenios_id_convenio: _id_convenio,
        },
        { replace: true },
        ["comercios_id_comercio"]
      );
    }
  }, [selectecConv, comercio, setQuery]);

  return (
    <Fragment>
      <SearchComissions comissionFace="pay" onSelectItem={onSelectItem} />
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
      <FormComission outerState={[comissionData, setComissionData]}>
        <Button type="submit" onClick={createComission}>
          Crear comision
        </Button>
      </FormComission>
    </Fragment>
  );
};

export default CreateComision;
