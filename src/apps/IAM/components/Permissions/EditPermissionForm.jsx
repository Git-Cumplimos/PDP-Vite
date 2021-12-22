import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import Table from "../../../../components/Base/Table/Table";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";

const url_iam = process.env.REACT_APP_URL_IAM_PDP;

const url_types = process.env.REACT_APP_URL_TRXS_TIPOS;

const url_aliados = process.env.REACT_APP_URL_TRXS_ALIADOS;

const EditPermissionForm = ({ selected, onCloseModal }) => {
  const [typesByPermissions, setTypesByPermissions] = useState({});
  const [typesDB, setTypesDB] = useState([]);

  const searchTypes = useCallback(async (email, uname) => {
    const queries = {};
    if (email && email !== "") {
      queries.email = email;
    }
    if (uname && uname !== "") {
      queries.uname = uname;
    }
    // if (Object.keys(queries).length === 0) {
    //   return [];
    // }
    try {
      const res = await fetchData(`${url_types}`, "GET", {});
      if (res?.status) {
        res.obj = await Promise.all(
          res?.obj.map(async (type) => {
            const _resAliados = await fetchData(`${url_aliados}`, "GET", {
              aliado: type.Aliado,
            });
            if (_resAliados?.status) {
              type.Aliado = _resAliados?.obj[0].nombre;
              type.Aliado_corto = _resAliados?.obj[0].nombre_corto;
            }
            return type;
          })
        );
        return res?.obj;
      }
      return [];
    } catch (err) {
      notifyError(err);
    }
  }, []);

  const searchTypesByPermission = useCallback(async (id_permission) => {
    const temp_res = {};
    try {
      const typesOpPermission = await fetchData(
        `${url_iam}/permissions-opstrx`,
        "GET",
        {
          Permissions_id_permission: id_permission ?? 0,
        }
      );
      if (typesOpPermission?.status) {
        for (const typeOpPermission of typesOpPermission?.obj) {
          try {
            const typeOp = await fetchData(`${url_types}`, "GET", {
              tipo_op: typeOpPermission.Tipos_operaciones_id_tipo_op,
            });
            if (typeOp?.status) {
              typeOp.obj = await Promise.all(
                typeOp?.obj.map(async (type) => {
                  const _resAliados = await fetchData(`${url_aliados}`, "GET", {
                    aliado: type.Aliado,
                  });
                  if (_resAliados?.status) {
                    type.Aliado = _resAliados?.obj[0].nombre;
                    type.Aliado_corto = _resAliados?.obj[0].nombre_corto;
                  }
                  return type;
                })
              );
              for (const {
                id_tipo_operacion,
                Nombre,
                Aliado_corto,
              } of typeOp?.obj) {
                temp_res[
                  `${id_tipo_operacion}) ${Nombre} (${Aliado_corto})`
                ] = true;
              }
            }
          } catch (_err) {}
        }
        return temp_res;
      } else {
        notifyError(typesOpPermission?.msg);
      }
    } catch (err) {
      notifyError(err);
    }
  }, []);

  useEffect(() => {
    searchTypesByPermission(selected?.edit?.id_permission).then((res) => {
      setTypesByPermissions(res);
    });
  }, [searchTypesByPermission, selected?.edit?.id_permission]);

  // const onChange = (e) => {
  //   const form = refFrom.current;
  //   const formData = new FormData(form);

  //   searchTypes(formData.get("userEmail_edit"))
  //     .then((res) => setTypesDB(res))
  //     .catch((err) => {});
  // };

  useEffect(() => {
    searchTypes()
      .then((res) => setTypesDB(res))
      .catch((err) => {});
  }, [searchTypes]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const relations = Object.entries(typesByPermissions);

    let edited = 0;
    let allToEdit = 0;

    for (const [key, value] of relations) {
      try {
        const [id_tipo_operacion] = key.split(") ");
        if (value) {
          const usersGroups = await fetchData(
            `${url_iam}/permissions-opstrx`,
            "GET",
            {
              Permissions_id_permission: selected?.edit?.id_permission,
              Tipos_operaciones_id_tipo_op: id_tipo_operacion,
            }
          );
          if (usersGroups?.status) {
            if (
              Array.isArray(usersGroups?.obj) &&
              usersGroups?.obj.length > 0
            ) {
            } else {
              allToEdit++;
              const addUser2Group = await fetchData(
                `${url_iam}/permissions-opstrx`,
                "POST",
                {},
                {
                  Permissions_id_permission: selected?.edit?.id_permission,
                  Tipos_operaciones_id_tipo_op: id_tipo_operacion,
                }
              );
              if (addUser2Group?.status) {
                edited++;
              }
            }
          }
        } else {
          const usersGroups = await fetchData(
            `${url_iam}/permissions-opstrx`,
            "GET",
            {
              Permissions_id_permission: selected?.edit?.id_permission,
              Tipos_operaciones_id_tipo_op: id_tipo_operacion,
            }
          );
          if (usersGroups?.status) {
            if (
              Array.isArray(usersGroups?.obj) &&
              usersGroups?.obj.length > 0
            ) {
              allToEdit++;
              const addUser2Group = await fetchData(
                `${url_iam}/permissions-opstrx`,
                "DELETE",
                {
                  Permissions_id_permission: selected?.edit?.id_permission,
                  Tipos_operaciones_id_tipo_op: id_tipo_operacion,
                }
              );
              if (addUser2Group?.status) {
                edited++;
              }
            }
          }
        }
      } catch (err) {
        notifyError(err);
      }
    }

    if (allToEdit === 0) {
      notifyError("No hay tipos seleccionados para editar en el permiso");
    } else {
      notify(
        `Se han editado ${edited} de ${allToEdit} tipos de operacion a editar en el permiso`
      );
      onCloseModal?.();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto">
      <h1 className="text-2xl my-4">
        Editar transacciones visibles para el permiso
      </h1>
      {Object.entries(selected).map(([key, val]) => {
        return key !== "edit" ? (
          <div
            className="flex flex-row justify-between text-lg font-medium w-3/4"
            key={key}
          >
            <h1>{key}:</h1>
            <h1>{val}</h1>
          </div>
        ) : (
          ""
        );
      })}
      <Form onSubmit={onSubmit} grid>
        {Array.isArray(Object.keys(typesByPermissions)) &&
        Object.keys(typesByPermissions).length > 0 ? (
          <MultipleSelect
            label={"Transacciones visibles para el permiso"}
            options={typesByPermissions}
            onChange={setTypesByPermissions}
          />
        ) : (
          ""
        )}
        {Array.isArray(typesDB) && typesDB.length > 0 ? (
          <Table
            headers={["Id", "Nombre operacion", "Aliado"]}
            data={typesDB.map(({ id_tipo_operacion, Nombre, Aliado }) => {
              return { id_tipo_operacion, Nombre, Aliado };
            })}
            onSelectRow={(e, i) => {
              const { id_tipo_operacion, Nombre, Aliado_corto } = typesDB[i];
              const copy = { ...typesByPermissions };
              copy[`${id_tipo_operacion}) ${Nombre} (${Aliado_corto})`] = true;
              setTypesByPermissions({ ...copy });
              // setTypesDB([]);
            }}
          />
        ) : (
          ""
        )}
        <ButtonBar>
          <Button type={"submit"}>Actualizar permiso</Button>
        </ButtonBar>
      </Form>
    </div>
  );
};

export default EditPermissionForm;
