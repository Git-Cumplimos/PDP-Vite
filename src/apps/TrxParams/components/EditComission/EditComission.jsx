import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import {
  fetchComissions,
  putComissions,
} from "../../utils/fetchRevalComissions";
import { fetchConveniosUnique } from "../../utils/fetchRevalConvenios";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import FormComission from "../FormComission/FormComission";
import Button from "../../../../components/Base/Button/Button";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";

const EditComission = () => {
  const navigate = useNavigate();

  const [
    {
      id_tipo_trx,
      comercios_id_comercio,
      convenios_id_convenio,
      autorizador_id_autorizador,
      nombre_autorizador,
    },
    setQuery,
  ] = useQuery();

  const [editedComission, setEditedComission] = useState(null);
  const [labelInputs, setLabelInputs] = useState([]);

  const argsCom = useMemo(() => {
    let args = {};
    if (id_tipo_trx) {
      args = { ...args, id_tipo_trx };
    }
    if (comercios_id_comercio) {
      args = { ...args, comercios_id_comercio };
    }
    if (convenios_id_convenio) {
      args = { ...args, convenios_id_convenio };
    }
    if (autorizador_id_autorizador) {
      args = { ...args, autorizador_id_autorizador };
    }
    return Object.keys(args).length > 0 ? args : null;
  }, [
    id_tipo_trx,
    comercios_id_comercio,
    convenios_id_convenio,
    autorizador_id_autorizador,
  ]);

  const consultLabels = useCallback(async () => {
    try {
      let inputs = [];
      if (convenios_id_convenio) {
        const resConv = await fetchConveniosUnique(convenios_id_convenio);
        inputs.push(["Convenio", resConv?.results?.[0]?.nombre_convenio]);
      }
      if (comercios_id_comercio) {
        inputs.push(["Comercio", comercios_id_comercio]);
      }
      if (nombre_autorizador) {
        inputs.push(["Autorizador", nombre_autorizador]);
      }
      return inputs;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [comercios_id_comercio, convenios_id_convenio, nombre_autorizador]);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = editedComission?.ranges?.length === 0;

      if (errRang) {
        notifyError("Se debe agregar al menos una comision");
        return;
      }

      editedComission?.ranges.reduce((prev, curr, indexR) => {
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

      putComissions(argsCom, {
        ...editedComission,
        ranges: editedComission?.ranges.map(
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
    [argsCom, editedComission, navigate]
  );

  useEffect(() => {
    if (argsCom) {
      let args = { ...argsCom };
      fetchComissions(args)
        .then((res) => {
          setEditedComission(res?.results);
          if (res?.info === "comisiónXconvenio") {
            if (args?.comercios_id_comercio) {
              delete args.comercios_id_comercio;
              setQuery(args, { replace: true }, ["comercios_id_comercio"]);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }, [argsCom, setQuery]);

  useEffect(() => {
    consultLabels().then((res) => setLabelInputs(res));
  }, [consultLabels]);

  return (
    <Fragment>
      <h1 className="text-3xl">Editando comisiones de:</h1>
      <Form grid>
        {labelInputs.map(([key, val]) => (
          <Input
            type={"text"}
            key={key}
            label={key}
            value={val}
            readOnly
            disabled
          />
        ))}
        {labelInputs.length === 1 ? <ButtonBar></ButtonBar> : ""}
      </Form>
      <h1 className="text-3xl">Comision</h1>
      <FormComission
        outerState={[editedComission, setEditedComission]}
        onSubmit={onSubmit}
      >
        <Button type="submit">Actualizar rangos</Button>
      </FormComission>
    </Fragment>
  );
};

export default EditComission;